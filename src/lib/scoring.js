/**
 * Tournament net total compared to par.
 * Uses 72 as par per round (approximation — Tiff 2 used par 70 + par 72 but
 * we standardize on 72 for cross-year comparability).
 *
 * Returns 'E' for even, '+N' or '-N' otherwise. Null inputs return null.
 */
export function vsParStr(netTotal, roundsPlayed) {
  if (netTotal == null || roundsPlayed == null) return null
  const diff = Math.round(Number(netTotal) - roundsPlayed * 72)
  if (diff === 0) return 'E'
  return diff > 0 ? `+${diff}` : String(diff)
}

/**
 * Average vs par across a number of tournaments. Same formatting as vsParStr.
 */
export function fmtAvgVsPar(val) {
  if (val == null || !isFinite(val)) return '—'
  const n = Math.round(val)
  if (n === 0) return 'E'
  return n > 0 ? `+${n}` : String(n)
}

/**
 * Sign-only classification of a vs-par value. Returns 'under' | 'over' | 'even' | null.
 * Useful for CSS color coding.
 */
export function vsParClass(netTotal, roundsPlayed) {
  if (netTotal == null || roundsPlayed == null) return null
  const diff = Number(netTotal) - roundsPlayed * 72
  if (diff < 0) return 'under'
  if (diff > 0) return 'over'
  return 'even'
}

/**
 * Initials from a name string. "Tim Healy" → "TH"
 */
export function initials(str) {
  if (!str) return '?'
  return str.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
