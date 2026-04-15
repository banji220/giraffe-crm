/**
 * Cross-subdomain session beacon.
 *
 * The Loveable landing page at crm.holygiraffe.com and the Next.js app at
 * app.holygiraffe.com can't share Supabase localStorage sessions — they're on
 * different origins. So we drop a tiny cookie on the shared parent domain
 * `.holygiraffe.com` purely as a signal: "this browser is signed in."
 *
 * The cookie holds no secrets. It's just a flag the landing page reads to
 * decide whether to auto-redirect to /today instead of showing marketing.
 * The real auth still happens via Supabase session — this is just UX plumbing.
 */

const COOKIE_NAME = 'giraffe_session'

function parentDomain(): string {
  if (typeof window === 'undefined') return ''
  const host = window.location.hostname
  // localhost / IP → no domain attribute (cookie stays on current host)
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return ''
  // Strip leading subdomain → ".holygiraffe.com"
  const parts = host.split('.')
  if (parts.length < 2) return ''
  return '.' + parts.slice(-2).join('.')
}

export function setSessionBeacon() {
  if (typeof document === 'undefined') return
  const domain = parentDomain()
  const maxAge = 60 * 60 * 24 * 30 // 30 days
  const parts = [
    `${COOKIE_NAME}=1`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `SameSite=Lax`,
    window.location.protocol === 'https:' ? 'Secure' : '',
    domain ? `Domain=${domain}` : '',
  ].filter(Boolean)
  document.cookie = parts.join('; ')
}

export function clearSessionBeacon() {
  if (typeof document === 'undefined') return
  const domain = parentDomain()
  const parts = [
    `${COOKIE_NAME}=`,
    `Path=/`,
    `Max-Age=0`,
    `SameSite=Lax`,
    domain ? `Domain=${domain}` : '',
  ].filter(Boolean)
  document.cookie = parts.join('; ')
}
