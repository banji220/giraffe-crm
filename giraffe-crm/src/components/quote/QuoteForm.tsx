'use client'

import { useState, useCallback } from 'react'
import { calculatePrice, formatPrice } from '@/lib/pricing'
import type { KnockOutcome, ServiceType } from '@/types/database'

interface QuoteFormProps {
  /** The knock outcome that triggered this form (quoted, appointment_set, closed_on_spot) */
  outcome: KnockOutcome
  /** Address for context in the header */
  address: string
  onSubmit: (data: QuoteData) => Promise<void>
  onClose: () => void
}

export interface QuoteData {
  fullName: string
  phone: string
  windowCount: number
  serviceTypes: ServiceType[]
  basePrice: number
  anchorPrice: number
  finalPrice: number
  discountType: 'flat' | 'percent' | 'promo' | null
  discountValue: number | null
  discountCode: string | null
  outcome: KnockOutcome
  scheduledAt: string | null
}

const SERVICE_OPTIONS: { type: ServiceType; label: string; shortLabel: string }[] = [
  { type: 'exterior',          label: 'Exterior Only',      shortLabel: 'Ext' },
  { type: 'interior_exterior', label: 'Interior + Exterior', shortLabel: 'In+Out' },
  { type: 'screens',           label: 'Screens',            shortLabel: 'Screens' },
  { type: 'tracks',            label: 'Tracks',             shortLabel: 'Tracks' },
]

export default function QuoteForm({ outcome, address, onSubmit, onClose }: QuoteFormProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [windowCount, setWindowCount] = useState(20)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(['exterior'])
  const [priceOverride, setPriceOverride] = useState<number | null>(null)
  const [showPriceEdit, setShowPriceEdit] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [discountType, setDiscountType] = useState<'flat' | 'percent' | 'promo'>('flat')
  const [discountValue, setDiscountValue] = useState(0)
  const [discountCode, setDiscountCode] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('10:00')
  const [loading, setLoading] = useState(false)

  // Calculate live price
  const discount = discountValue > 0 ? { type: discountType, value: discountValue } : undefined
  const pricing = calculatePrice(windowCount, serviceTypes, discount)

  // If user overrode the price, use that as the final
  const effectiveFinal = priceOverride !== null ? priceOverride : pricing.finalPrice
  const effectiveAnchor = Math.max(pricing.anchorPrice, effectiveFinal + 50) // anchor always at least $50 above final

  const toggleService = useCallback((type: ServiceType) => {
    setServiceTypes(prev => {
      // If toggling interior_exterior, remove exterior and vice versa
      if (type === 'interior_exterior') {
        const without = prev.filter(t => t !== 'exterior' && t !== 'interior_exterior')
        return prev.includes(type) ? [...without, 'exterior'] : [...without, type]
      }
      if (type === 'exterior') {
        const without = prev.filter(t => t !== 'exterior' && t !== 'interior_exterior')
        return prev.includes(type) ? without : [...without, type]
      }
      // Screens and tracks are simple toggles
      return prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    })
  }, [])

  const handleSubmit = async () => {
    setLoading(true)

    const scheduledAt = (outcome === 'appointment_set' || outcome === 'closed_on_spot') && scheduledDate
      ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      : null

    await onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      windowCount,
      serviceTypes,
      basePrice: pricing.basePrice,
      anchorPrice: effectiveAnchor,
      finalPrice: effectiveFinal,
      discountType: discountValue > 0 ? discountType : null,
      discountValue: discountValue > 0 ? discountValue : null,
      discountCode: discountType === 'promo' && discountCode ? discountCode : null,
      outcome,
      scheduledAt,
    })

    setLoading(false)
  }

  const submitLabel = outcome === 'closed_on_spot'
    ? 'Close Job!'
    : outcome === 'appointment_set'
    ? 'Set Appointment'
    : 'Save Quote'

  const needsSchedule = outcome === 'appointment_set' || outcome === 'closed_on_spot'

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Form sheet */}
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{submitLabel}</h2>
            <button onClick={onClose} className="text-gray-400 text-2xl leading-none px-2">&times;</button>
          </div>
          <p className="text-sm text-gray-500 truncate">{address}</p>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="First Last"
              autoFocus
              autoCapitalize="words"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(949) 555-1234"
              inputMode="tel"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Window Count — big stepper */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Windows</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setWindowCount(Math.max(1, windowCount - 5))}
                className="w-14 h-14 rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 active:bg-gray-200 flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                value={windowCount}
                onChange={(e) => setWindowCount(Math.max(1, parseInt(e.target.value) || 1))}
                inputMode="numeric"
                className="flex-1 text-center text-3xl font-bold border border-gray-300 rounded-xl py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={() => setWindowCount(windowCount + 5)}
                className="w-14 h-14 rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 active:bg-gray-200 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Service Types — toggle buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Service</label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_OPTIONS.map(({ type, label }) => {
                const active = serviceTypes.includes(type)
                return (
                  <button
                    key={type}
                    onClick={() => toggleService(type)}
                    className={`py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Display — the money shot */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 line-through">
                Normally {formatPrice(effectiveAnchor)}
              </p>
              <p className="text-4xl font-bold text-green-600 mt-1">
                {formatPrice(effectiveFinal)}
              </p>
              {pricing.discountAmount > 0 && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  You save {formatPrice(pricing.discountAmount)}!
                </p>
              )}
            </div>

            {/* Price edit + Discount buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowPriceEdit(!showPriceEdit)}
                className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg active:bg-gray-100"
              >
                Edit Price
              </button>
              <button
                onClick={() => setShowDiscount(!showDiscount)}
                className="flex-1 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg active:bg-blue-50"
              >
                Add Discount
              </button>
            </div>

            {/* Price override input */}
            {showPriceEdit && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-500">$</span>
                  <input
                    type="number"
                    value={priceOverride ?? pricing.basePrice}
                    onChange={(e) => setPriceOverride(parseFloat(e.target.value) || 0)}
                    inputMode="decimal"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-lg focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => { setPriceOverride(null); setShowPriceEdit(false) }}
                    className="text-sm text-gray-400 px-2"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Discount input */}
            {showDiscount && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1">
                  {(['flat', 'percent', 'promo'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setDiscountType(t)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg ${
                        discountType === t
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {t === 'flat' ? '$ Off' : t === 'percent' ? '% Off' : 'Promo'}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === 'percent' ? 'Percent off (e.g. 10)' : 'Amount off'}
                  inputMode="decimal"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:border-blue-500 outline-none"
                />
                {discountType === 'promo' && (
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Promo code name (e.g. MAPLE50)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:border-blue-500 outline-none"
                  />
                )}
              </div>
            )}
          </div>

          {/* Schedule date (for appointment_set and closed_on_spot) */}
          {needsSchedule && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {outcome === 'closed_on_spot' ? 'Job Date' : 'Appointment Date'}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base focus:border-blue-500 outline-none"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-28 border border-gray-300 rounded-xl px-3 py-3 text-base focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-lg font-bold text-white transition-all disabled:opacity-50 ${
              outcome === 'closed_on_spot'
                ? 'bg-green-600 active:bg-green-700'
                : 'bg-blue-600 active:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
