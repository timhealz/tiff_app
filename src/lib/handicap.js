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
 * Full breakdown of a Tiff handicap calculation. Useful for showing a player
 * how their handicap was derived.
 *
 * Input: an ordered list of round objects (oldest → newest). Each round must
 * have a `differential` field (number). Other fields are passed through so the
 * UI can render context (year, course, etc.).
 *
 * Returns:
 *   {
 *     recent:      last-20 rounds (newest at end)
 *     usedKeys:    Set of round keys that contributed to the calc (the lowest N)
 *     avg:         average of the lowest N differentials, or null
 *     handicap:    final HCP (avg × 0.96, rounded to 1 decimal), or null
 *     tier:        'established' | 'provisional' | 'insufficient'
 *     bestCount:   how many differentials were averaged (min(8, recent.length))
 *   }
 *
 * `keyFor(round)` lets callers identify each round uniquely (e.g. by id).
 */
export function calcTiffHandicapBreakdown(rounds, keyFor = (r, i) => i) {
  const valid = rounds.filter(r => r.differential != null)
  const recent = valid.slice(-20)

  const tier =
    recent.length >= 5 ? 'established' :
    recent.length >= 3 ? 'provisional' :
    'insufficient'

  if (recent.length < 3) {
    return { recent, usedKeys: new Set(), avg: null, handicap: null, tier, bestCount: 0 }
  }

  const indexed = recent.map((r, i) => ({ r, key: keyFor(r, i) }))
  const sorted  = [...indexed].sort((a, b) => a.r.differential - b.r.differential)
  const best    = sorted.slice(0, Math.min(8, recent.length))
  const avg     = best.reduce((sum, x) => sum + x.r.differential, 0) / best.length
  const handicap = Math.round(avg * 0.96 * 10) / 10

  return {
    recent,
    usedKeys: new Set(best.map(x => x.key)),
    avg,
    handicap,
    tier,
    bestCount: best.length,
  }
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
