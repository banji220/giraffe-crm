/**
 * Client-side pricing calculator.
 * Mirrors the SQL calculate_base_price and calculate_anchor_price functions
 * so the quote form shows prices instantly without an API round-trip.
 * The authoritative calculation still runs server-side via the database functions.
 */

import type { ServiceType } from '@/types/database'

const DEFAULT_RATE = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_RATE ?? '7')
const MIN_CHARGE = parseFloat(process.env.NEXT_PUBLIC_MIN_CHARGE ?? '229')
const MIN_ANCHOR = parseFloat(process.env.NEXT_PUBLIC_MIN_ANCHOR ?? '299')

export interface PriceBreakdown {
  /** Formula output: max(windowCount * rate * multiplier, MIN_CHARGE) */
  basePrice: number
  /** What we show the customer as "Normally $X" — at least $299 */
  anchorPrice: number
  /** After discount applied */
  finalPrice: number
  /** The discount amount in dollars */
  discountAmount: number
}

export function calculatePrice(
  windowCount: number,
  serviceTypes: ServiceType[],
  discount?: { type: 'flat' | 'percent' | 'promo'; value: number }
): PriceBreakdown {
  // Base rate multiplier from service types
  let multiplier = 1.0

  if (serviceTypes.includes('interior_exterior')) {
    multiplier *= 1.8
  }
  if (serviceTypes.includes('screens')) {
    multiplier += 0.25
  }
  if (serviceTypes.includes('tracks')) {
    multiplier += 0.15
  }

  // Base price: max(windows * rate * multiplier, floor)
  const calculated = windowCount > 0 ? windowCount * DEFAULT_RATE * multiplier : 0
  const basePrice = Math.max(calculated, MIN_CHARGE)

  // Anchor price: at least $299, always >= base
  const anchorPrice = Math.max(basePrice, MIN_ANCHOR)

  // Apply discount
  let discountAmount = 0
  if (discount) {
    if (discount.type === 'flat') {
      discountAmount = discount.value
    } else if (discount.type === 'percent') {
      discountAmount = Math.round(basePrice * (discount.value / 100) * 100) / 100
    } else if (discount.type === 'promo') {
      // Promo codes map to flat amounts — hardcode common ones here
      // or look up from a future promo table
      discountAmount = discount.value
    }
  }

  const finalPrice = Math.max(basePrice - discountAmount, 0)

  return { basePrice, anchorPrice, finalPrice, discountAmount }
}

/**
 * Format a dollar amount for display.
 * $229.00 → "$229"  |  $229.50 → "$229.50"
 */
export function formatPrice(amount: number): string {
  if (amount % 1 === 0) {
    return `$${amount.toFixed(0)}`
  }
  return `$${amount.toFixed(2)}`
}
