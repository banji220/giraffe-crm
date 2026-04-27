'use client'

/**
 * <PageHeader /> — Consistent header across all pages.
 *
 * Layout:
 *   [logo] Giraffe CRM        [optional right slot]
 *          Section Name
 */

import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Section name shown below "Giraffe CRM" */
  section: string
  /** Optional right-side content (e.g. sign out button) */
  right?: ReactNode
}

export default function PageHeader({ section, right }: PageHeaderProps) {
  return (
    <header className="border-b-4 border-foreground px-4 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/logo-dark.png"
            alt=""
            className="w-7 h-7 object-contain shrink-0"
            draggable={false}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-primary">
              Giraffe CRM
            </p>
            <h1 className="text-xl font-bold tracking-tight truncate">
              {section}
            </h1>
          </div>
        </div>
        {right && <div className="shrink-0 ml-2">{right}</div>}
      </div>
    </header>
  )
}
