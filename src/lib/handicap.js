/**
 * WHS differential: (gross - course_rating) * 113 / slope
 */
export function calcDifferential(gross, courseRating, slope) {
  return Math.round(((gross - courseRating) * 113) / slope * 10) / 10
}

/**
 * Tiff handicap from an array of differentials (numbers).
 * Best 8 of last 20, * 0.96. Returns null if fewer than 3 rounds.
 */
export function calcTiffHandicap(differentials) {
  const recent = differentials.slice(-20)
  if (recent.length < 3) return null

  const sorted = [...recent].sort((a, b) => a - b)
  const best = sorted.slice(0, Math.min(8, sorted.length))
  const avg = best.reduce((sum, d) => sum + d, 0) / best.length
  return Math.round(avg * 0.96 * 10) / 10
}

/**
 * Tier label based on number of Tiff rounds available.
 */
export function handicapTier(roundCount) {
  if (roundCount >= 5) return 'tiff_established'
  if (roundCount >= 3) return 'tiff_provisional'
  return 'insufficient'
}

/**
 * Shots received on a single hole.
 * A handicap-13 player gets 1 shot on holes where stroke_index <= 13.
 * If handicap > 18, they get 2 shots on some holes.
 */
export function shotsReceived(playingHandicap, strokeIndex) {
  if (strokeIndex <= Math.floor(playingHandicap)) return 1
  if (playingHandicap > 18 && strokeIndex <= playingHandicap % 18) return 2
  return 0
}
