'use client'

import dynamic from 'next/dynamic'

// mapbox-gl accesses `window` on import — must skip SSR entirely
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading map...</p>
      </div>
    </div>
  ),
})

export default function MapPage() {
  return <MapView />
}
