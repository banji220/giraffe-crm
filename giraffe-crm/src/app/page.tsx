'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TodayPage() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [houseCount, setHouseCount] = useState<number>(0)
  const [leadCount, setLeadCount] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        const supabase = createClient()

        const [housesRes, leadsRes] = await Promise.all([
          supabase.from('houses').select('*', { count: 'exact', head: true }),
          supabase.from('leads').select('*', { count: 'exact', head: true }).in('state', ['new', 'quoted', 'nurture']),
        ])

        if (housesRes.error) {
          setStatus('error')
          setError(housesRes.error.message)
          return
        }

        setStatus('connected')
        setHouseCount(housesRes.count ?? 0)
        setLeadCount(leadsRes.count ?? 0)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="flex flex-col min-h-screen p-6">
      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold text-giraffe-blue">Giraffe CRM</h1>
        <p className="text-gray-500 mt-1">Field sales + service operating system</p>
      </div>

      {/* Connection status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          Database
        </h2>
        {status === 'loading' && (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-gray-600 text-sm">Connecting...</span>
          </div>
        )}
        {status === 'connected' && (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-gray-900 text-sm font-medium">Connected</span>
            <span className="text-gray-400 text-sm ml-auto">{houseCount} houses · {leadCount} active leads</span>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-red-700 text-sm font-medium">Error</span>
            </div>
            <p className="text-xs text-red-600 bg-red-50 rounded p-2">{error}</p>
          </div>
        )}
      </div>

      {/* Quick stats — placeholder until we build the real Today screen */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{houseCount}</p>
          <p className="text-xs text-gray-500 mt-1">Houses Knocked</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{leadCount}</p>
          <p className="text-xs text-gray-500 mt-1">Active Leads</p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Big Map Button — THE primary action */}
      <a
        href="/map"
        className="block w-full bg-blue-600 text-white rounded-2xl py-6 text-center shadow-lg active:bg-blue-700 transition-all mb-6"
      >
        <span className="text-3xl block mb-1">🗺️</span>
        <span className="text-xl font-bold">Knock Territory</span>
        <span className="block text-blue-200 text-sm mt-1">Open the map and start knocking</span>
      </a>

      <p className="text-xs text-gray-400 text-center pb-4">
        v1 — Today screen is a placeholder. The real one comes next.
      </p>
    </div>
  )
}
