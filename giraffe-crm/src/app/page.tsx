'use client'

/**
 * Root — redirects to /today (the real home). AuthGate on /today handles
 * the signed-out case by bouncing to /login.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/today')
  }, [router])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0A0A',
      }}
    />
  )
}
