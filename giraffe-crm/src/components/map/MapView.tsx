'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { reverseGeocode } from '@/lib/geo'
import HouseCard from '@/components/map/HouseCard'
import { type SheetHouse } from '@/components/map/KnockSheet'
import SessionChip from '@/components/auth/SessionChip'
import CaptureFlow, { type CaptureData } from '@/components/capture/CaptureFlow'
import { createCalendarEvent } from '@/lib/google-calendar'
import type { KnockOutcome, HouseStatus } from '@/types/database'

// Pin colors keyed by LAST KNOCK OUTCOME — each disposition gets its own color.
// Palette uses strict 40° hue spacing (360° / 9 outcomes) for maximum perceptual
// distinctness. Every adjacent pair is 40°+ apart — zero clashing hues.
const OUTCOME_COLORS: Record<string, string> = {
  hard_no:         '#DD1111', //   0° RED — permanent dead
  not_interested:  '#EBA313', //  40° ORANGE — soft no
  come_back:       '#91CE16', //  80° CHARTREUSE — asked to return
  closed_on_spot:  '#14B714', // 120° GREEN — WON!
  appointment_set: '#1ABB85', // 160° TEAL — confirmed appointment
  tenant:          '#2496D0', // 200° CYAN — can't decide
  not_home:        '#5858CE', // 240° BLUE — absent, might be home next time
  quoted:          '#A12EDA', // 280° PURPLE — active deal in play
  have_a_guy:      '#D8269D', // 320° MAGENTA — has a provider
  _unknocked:      '#B7B7B7', //       GREY — never knocked
  _avoid:          '#262626', //       BLACK — dangerous/avoid (red stroke)
}

// 1-2 letter abbreviations inside each pin for redundant encoding.
// Lets you identify outcomes even with color blindness or at a glance.
const OUTCOME_LABELS: Record<string, string> = {
  hard_no:         'X',
  not_interested:  'NI',
  come_back:       'CB',
  closed_on_spot:  '$',
  appointment_set: 'AP',
  tenant:          'T',
  not_home:        'NH',
  quoted:          'Q',
  have_a_guy:      'HG',
  _unknocked:      '?',
  _avoid:          '!!',
}

// Determine the right pin color for a house
function getPinColor(house: { last_knock_outcome: KnockOutcome | null; status: HouseStatus | null }): string {
  if (house.status === 'avoid') return OUTCOME_COLORS._avoid
  if (!house.last_knock_outcome) return OUTCOME_COLORS._unknocked
  return OUTCOME_COLORS[house.last_knock_outcome] ?? OUTCOME_COLORS._unknocked
}

// Default center: Newport Beach, CA (Tyler's area)
const DEFAULT_CENTER: [number, number] = [-117.9289, 33.6041]
const DEFAULT_ZOOM = 16

// Owner user ID from schema.sql seed
const OWNER_ID = '00000000-0000-0000-0000-000000000001'

interface MapHouse {
  id: string
  full_address: string
  street_number: string
  street_name: string
  city: string
  status: HouseStatus | null
  dead_until: string | null
  dead_reason: KnockOutcome | null
  notes: string | null
  lat: number
  lng: number
  contact_name: string | null
  contact_phone: string | null
  quoted_price: number | null
  last_knock_outcome: KnockOutcome | null
  last_knock_at: string | null
  next_follow_up_at: string | null
  knock_count: number
}

// Helper: load a CDN script once, return when ready
function loadScript(src: string, globalName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any)[globalName]) {
      resolve((window as any)[globalName])
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve((window as any)[globalName])
    script.onerror = () => reject(new Error(`Failed to load ${globalName}`))
    document.head.appendChild(script)
  })
}

// Load mapbox-gl then geocoder plugin (geocoder depends on mapboxgl global)
async function loadMapboxGL(): Promise<any> {
  const mapboxgl = await loadScript(
    'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js',
    'mapboxgl'
  )
  await loadScript(
    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.3/mapbox-gl-geocoder.min.js',
    'MapboxGeocoder'
  )
  return mapboxgl
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const supabase = useRef(createClient())

  // State
  const [houses, setHouses] = useState<MapHouse[]>([])
  const housesRef = useRef<MapHouse[]>([])
  const [selectedHouse, setSelectedHouse] = useState<SheetHouse | null>(null)
  const [quoteOutcome, setQuoteOutcome] = useState<KnockOutcome | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLng, setUserLng] = useState(DEFAULT_CENTER[0])
  const [userLat, setUserLat] = useState(DEFAULT_CENTER[1])

  // ─── Load houses from Supabase for current viewport ────────────────
  const loadHouses = useCallback(async () => {
    if (!map.current) return

    const bounds = map.current.getBounds()
    const { data, error } = await supabase.current.rpc('get_houses_in_bbox', {
      min_lng: bounds.getWest(),
      min_lat: bounds.getSouth(),
      max_lng: bounds.getEast(),
      max_lat: bounds.getNorth(),
    })

    if (error) {
      console.error('Failed to load houses:', error.message)
      return
    }

    const loaded = (data as MapHouse[]) ?? []
    setHouses(loaded)
    housesRef.current = loaded
  }, [])

  // ─── Update map pins whenever houses change ────────────────────────
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: houses.map(h => {
        const outcome = h.status === 'avoid' ? '_avoid' : (h.last_knock_outcome ?? '_unknocked')
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [h.lng, h.lat] },
          properties: {
            id: h.id,
            outcome,
            color: getPinColor(h),
            label: OUTCOME_LABELS[outcome] ?? '?',
            address: h.full_address ?? '',
            isAvoid: h.status === 'avoid' ? 1 : 0,
          },
        }
      }),
    }

    const source = map.current.getSource('houses')
    if (source) {
      source.setData(geojson)
    }
  }, [houses, mapLoaded])

  // ─── Initialize map ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    let cancelled = false

    // Step 1: Get user's GPS FIRST, then create the map centered on them.
    // Falls back to DEFAULT_CENTER if GPS fails or is denied.
    const initMap = async (mapboxgl: any) => {
      if (cancelled || !mapContainer.current) return

      let startCenter: [number, number] = DEFAULT_CENTER

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,        // don't block more than 5s
            maximumAge: 30000,    // accept cached position up to 30s old
          })
        })
        startCenter = [pos.coords.longitude, pos.coords.latitude]
        setUserLng(pos.coords.longitude)
        setUserLat(pos.coords.latitude)
      } catch {
        // GPS denied or timed out — use default center, no big deal
      }

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

      const m = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: startCenter,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      })

      // ─── Search bar (Geocoder) ─────────────────────────────────────
      const MapboxGeocoder = (window as any).MapboxGeocoder
      let searchMarker: any = null  // track the drop pin so we can remove it

      const removeSearchMarker = () => {
        if (searchMarker) {
          searchMarker.remove()
          searchMarker = null
        }
      }

      if (MapboxGeocoder) {
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          placeholder: 'Search address or neighborhood...',
          proximity: { longitude: startCenter[0], latitude: startCenter[1] },
          countries: 'us',
          types: 'address,neighborhood,locality,place',
          marker: false,          // we handle our own custom drop pin
          flyTo: {
            speed: 2,             // fast fly animation
            zoom: 17,             // zoom in tight on result
          },
        })
        m.addControl(geocoder, 'top-left')

        // When a search result is selected → drop a big visible pin
        geocoder.on('result', (e: any) => {
          // Dismiss mobile keyboard
          const input = document.querySelector('.mapboxgl-ctrl-geocoder input') as HTMLInputElement
          if (input) input.blur()

          // Remove any previous search pin
          removeSearchMarker()

          // Get the result coordinates
          const coords = e.result?.center || e.result?.geometry?.coordinates
          if (!coords) return

          // Build a big red Google-Maps-style drop pin (SVG, not emoji — consistent across all devices)
          const el = document.createElement('div')
          el.className = 'search-drop-pin'
          el.innerHTML = `
            <div class="search-pin-marker">
              <svg viewBox="0 0 36 50" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 32 18 32s18-18.5 18-32C36 8.06 27.94 0 18 0z" fill="#DC2626"/>
                <circle cx="18" cy="18" r="8" fill="white"/>
              </svg>
            </div>
            <div class="search-pin-pulse"></div>
          `

          // Create and add the marker — anchor at bottom center (the pin tip)
          searchMarker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(coords)
            .addTo(m)
        })

        // When the user clears the search → remove the drop pin
        geocoder.on('clear', () => {
          removeSearchMarker()
        })
      }

      // Also remove search pin when user taps the map (they've found their spot)
      m.on('click', () => {
        removeSearchMarker()
      })

      // ─── GPS tracking ─────────────────────────────────────────────
      const geo = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      })
      m.addControl(geo, 'top-right')

      geo.on('geolocate', (e: any) => {
        setUserLng(e.coords.longitude)
        setUserLat(e.coords.latitude)
        // Update geocoder proximity bias to user's current location
        if (MapboxGeocoder) {
          const geocoderCtrl = document.querySelector('.mapboxgl-ctrl-geocoder') as any
          if (geocoderCtrl?._geocoder) {
            geocoderCtrl._geocoder.setProximity({ longitude: e.coords.longitude, latitude: e.coords.latitude })
          }
        }
      })

      m.on('load', () => {
        // Add empty houses source
        m.addSource('houses', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })

        // Pin layer — circles colored by outcome, bigger for thumb taps
        m.addLayer({
          id: 'houses-circles',
          type: 'circle',
          source: 'houses',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              13, 6,    // small when zoomed out
              15, 10,   // medium at street level
              17, 14,   // big when zoomed in tight
            ],
            'circle-color': ['get', 'color'],
            'circle-stroke-width': [
              'case',
              ['==', ['get', 'isAvoid'], 1], 3,  // thick red stroke for avoid
              2,
            ],
            'circle-stroke-color': [
              'case',
              ['==', ['get', 'isAvoid'], 1], '#DC2626',  // red stroke on black = danger
              '#ffffff',
            ],
          },
        })

        // Letter label INSIDE each pin (NH, X, $, etc.)
        m.addLayer({
          id: 'houses-pin-labels',
          type: 'symbol',
          source: 'houses',
          layout: {
            'text-field': ['get', 'label'],
            'text-size': [
              'interpolate', ['linear'], ['zoom'],
              13, 6,
              15, 9,
              17, 11,
            ],
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            'text-anchor': 'center',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': '#ffffff',
          },
        })

        // Street number label BELOW pin for context
        m.addLayer({
          id: 'houses-labels',
          type: 'symbol',
          source: 'houses',
          layout: {
            'text-field': ['slice', ['get', 'address'], 0, 6],
            'text-size': 10,
            'text-offset': [0, 2.2],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#374151',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5,
          },
        })

        // 3D buildings for visual context
        const layers = m.getStyle().layers
        const labelLayer = layers?.find(
          (l: any) => l.type === 'symbol' && l.layout && 'text-field' in l.layout
        )
        if (labelLayer) {
          m.addLayer({
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#e2e8f0',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-opacity': 0.4,
            },
          }, labelLayer.id)
        }

        setMapLoaded(true)
        m.resize()

        // Auto-trigger GPS
        setTimeout(() => geo.trigger(), 500)

        // Load initial houses
        loadHouses()
      })

      // Reload pins on pan/zoom
      m.on('moveend', () => loadHouses())

      // Click on existing pin (circle or label) → open knock sheet
      const handlePinClick = (e: any) => {
        if (!e.features || e.features.length === 0) return
        e.originalEvent.stopPropagation()

        const houseId = e.features[0].properties?.id
        if (!houseId) return

        const house = housesRef.current.find(h => h.id === houseId)
        if (!house) return

        openKnockSheet(house)
      }
      m.on('click', 'houses-circles', handlePinClick)
      m.on('click', 'houses-pin-labels', handlePinClick)

      // Click on empty map → create house and open knock sheet
      m.on('click', async (e: any) => {
        const features = m.queryRenderedFeatures(e.point, { layers: ['houses-circles', 'houses-pin-labels'] })
        if (features.length > 0) return

        await createHouseAndOpenSheet(e.lngLat.lng, e.lngLat.lat)
      })

      // Cursor changes
      m.on('mouseenter', 'houses-circles', () => { m.getCanvas().style.cursor = 'pointer' })
      m.on('mouseleave', 'houses-circles', () => { m.getCanvas().style.cursor = '' })

      map.current = m
    }

    // Step 2: Load Mapbox GL from CDN, then run initMap
    loadMapboxGL().then(initMap).catch(err => {
      console.error('Mapbox GL failed to load:', err)
    })

    return () => {
      cancelled = true
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Create a new house from a map tap ─────────────────────────────
  const createHouseAndOpenSheet = async (lng: number, lat: number) => {
    const { data: nearbyId } = await supabase.current.rpc('find_nearby_house', {
      p_lng: lng,
      p_lat: lat,
    })

    if (nearbyId) {
      const house = housesRef.current.find(h => h.id === nearbyId)
      if (house) {
        openKnockSheet(house)
        return
      }
    }

    // Reverse geocode for the ADDRESS TEXT only — pin goes exactly where user tapped.
    // Do NOT use snapped coordinates. The user knows which house they're at.
    const address = await reverseGeocode(lng, lat)

    const { data: newHouse, error } = await supabase.current
      .from('houses')
      .insert({
        street_number: address?.streetNumber ?? null,
        street_name: address?.streetName ?? null,
        city: address?.city ?? null,
        addr_state: address?.state ?? null,
        postal_code: address?.postalCode ?? null,
        full_address: address?.fullAddress ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        geom: `SRID=4326;POINT(${lng} ${lat})`,
        created_by: OWNER_ID,
      })
      .select()
      .single()

    if (error || !newHouse) {
      console.error('Failed to create house:', error?.message)
      return
    }

    const sheetHouse: SheetHouse = {
      id: newHouse.id,
      fullAddress: newHouse.full_address ?? '',
      status: null,
      lat,
      lng,
    }
    setSelectedHouse(sheetHouse)
    await loadHouses()
  }

  // ─── Open knock sheet for an existing house ────────────────────────
  const openKnockSheet = (house: MapHouse) => {
    setSelectedHouse({
      id: house.id,
      fullAddress: house.full_address ?? '',
      status: house.status,
      deadReason: house.dead_reason,
      deadUntil: house.dead_until,
      lastKnockOutcome: house.last_knock_outcome,
      lastKnockAt: house.last_knock_at,
      contactName: house.contact_name,
      contactPhone: house.contact_phone,
      quotedPrice: house.quoted_price,
      lat: house.lat,
      lng: house.lng,
    })
  }

  // ─── Record a knock (fast dispositions — no quote form) ────────────
  const handleKnock = async (outcome: KnockOutcome, followUpAt?: string) => {
    if (!selectedHouse) return

    const { error } = await supabase.current.from('knocks').insert({
      house_id: selectedHouse.id,
      outcome,
      follow_up_at: followUpAt ?? null,
      created_by: OWNER_ID,
    })

    if (error) {
      console.error('Failed to record knock:', error.message)
      return
    }

    setSelectedHouse(null)
    await loadHouses()
  }

  // ─── Open quote form ───────────────────────────────────────────────
  const handleOpenQuote = (outcome: KnockOutcome) => {
    setQuoteOutcome(outcome)
  }

  // ─── Submit quote form ─────────────────────────────────────────────
  const handleCaptureSubmit = async (data: CaptureData) => {
    if (!selectedHouse) return

    // 1. Record the knock (trigger auto-updates house status)
    const { error: knockError } = await supabase.current.from('knocks').insert({
      house_id: selectedHouse.id,
      outcome: data.outcome,
      follow_up_at: data.scheduledAt,
      created_by: OWNER_ID,
    })

    if (knockError) {
      console.error('Failed to record knock:', knockError.message)
      return
    }

    // 2. Update house with contact + pricing info
    await supabase.current
      .from('houses')
      .update({
        contact_name: data.contactName || null,
        contact_phone: data.contactPhone || null,
        contact_email: data.contactEmail || null,
        notes: data.notes || null,
        window_count: data.windowCount,
        service_types: data.serviceTypes,
        anchor_price: data.anchorPrice,
        quoted_price: data.quotedPrice,
      })
      .eq('id', selectedHouse.id)

    // 3. Create job if closed on spot
    if (data.outcome === 'closed_on_spot' && data.scheduledAt) {
      await supabase.current.from('jobs').insert({
        house_id: selectedHouse.id,
        scheduled_at: data.scheduledAt,
        price: data.quotedPrice,
        service_types: data.serviceTypes,
        window_count: data.windowCount,
        assigned_to: OWNER_ID,
      })
    }

    // 4. Push to Google Calendar (non-blocking — won't break the flow if it fails)
    if (data.scheduledAt) {
      createCalendarEvent({
        houseId: selectedHouse.id,
        contactName: data.contactName,
        phone: data.contactPhone,
        address: selectedHouse.address,
        price: data.quotedPrice,
        date: data.scheduledAt,
        type: data.outcome === 'closed_on_spot' ? 'job' : 'follow_up',
      }).catch(err => console.error('Calendar sync failed:', err))
    }

    setQuoteOutcome(null)
    setSelectedHouse(null)
    await loadHouses()
  }

  // ─── Mark house as avoid ───────────────────────────────────────────
  const handleMarkAvoid = async () => {
    if (!selectedHouse) return

    await supabase.current
      .from('houses')
      .update({ status: 'avoid' })
      .eq('id', selectedHouse.id)

    setSelectedHouse(null)
    await loadHouses()
  }

  // ─── Delete a house pin (and all its knocks/leads via CASCADE) ──────
  const handleDeleteHouse = async () => {
    if (!selectedHouse) return

    const { error } = await supabase.current
      .from('houses')
      .delete()
      .eq('id', selectedHouse.id)

    if (error) {
      console.error('Failed to delete house:', error.message)
      return
    }

    setSelectedHouse(null)
    await loadHouses()
  }

  // ─── FAB: knock at current GPS location ────────────────────────────
  const handleKnockHere = async () => {
    await createHouseAndOpenSheet(userLng, userLat)
  }

  return (
    <div className="fixed inset-0">
      {/* Map */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Top bar: Back button + house count */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
        <SessionChip />
        <a
          href="/"
          className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-xl px-3.5 py-2.5 shadow-lg text-sm font-semibold text-gray-700 active:bg-gray-100 flex-shrink-0"
        >
          ←
        </a>
        <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-full px-3.5 py-2 shadow text-sm text-gray-600 flex-shrink-0">
          {houses.length} pins
        </div>
      </div>

      {/* FAB: Knock Here */}
      <button
        onClick={handleKnockHere}
        className="absolute bottom-8 right-4 z-10 bg-blue-600 text-white rounded-2xl px-6 py-4 shadow-xl text-base font-bold active:bg-blue-700 flex items-center gap-2"
      >
        <span className="text-xl">📍</span>
        Knock Here
      </button>

      {/* Knock bottom sheet */}
      {selectedHouse && !quoteOutcome && (
        <HouseCard
          house={selectedHouse}
          onClose={() => setSelectedHouse(null)}
          onKnock={handleKnock}
          onOpenQuote={handleOpenQuote}
          onMarkAvoid={handleMarkAvoid}
          onDeleteHouse={handleDeleteHouse}
        />
      )}

      {/* Capture flow (multi-step cards) */}
      {selectedHouse && quoteOutcome && (
        <CaptureFlow
          outcome={quoteOutcome}
          address={selectedHouse.fullAddress}
          onSubmit={handleCaptureSubmit}
          onClose={() => setQuoteOutcome(null)}
        />
      )}
    </div>
  )
}
