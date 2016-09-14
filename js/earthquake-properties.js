export const MIN_TIME = Date.parse('1980')
export const MAX_TIME = Date.parse('2016')

export const TRANSITION_TIME = 750

export function depthToColor(depth) {
  // Depth can be negative (earthquake above the sea level) - use 0-100km range color in this case.
  const depthRange = Math.max(0, Math.floor(depth / 100))
  switch(depthRange) {
    case 0: // above the sea level or 0 - 100
      return 0xFF0A00
    case 1: // 100 - 200
      return 0xFF7A00
    case 2: // 200 - 300
      return 0xFFF700
    case 3: // 300 - 400
      return 0x56AB00
    case 4: // 400 - 500
      return 0x00603F
    default: // > 500
      return 0x0021BC
  }
}

export function magnitudeToRadius(magnitude) {
  return 0.9 * Math.pow(1.5, (magnitude - 1))
}

// Generated using:
// http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
export function easeOutBounce(t) {
  let ts = t * t
  let tc = ts * t
  return 33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t
}
