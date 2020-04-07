import config from './config'
export const TRANSITION_TIME = 750

export function depthToColor (depth) {
  // Depth can be negative (earthquake above the sea level) - use 0-30km range color in this case.
  if (config.quakeColor !== -1) return parseInt(config.quakeColor, 16)
  if (depth <= 30) return 0xFF0A00
  if (depth <= 100) return 0xFF7A00
  if (depth <= 200) return 0xFFF700
  if (depth <= 300) return 0x56AB00
  if (depth <= 500) return 0x00603F
  return 0x0021BC
}

export function magnitudeToRadius (magnitude) {
  return 0.9 * Math.pow(1.5, (magnitude - 1))
}

// Generated using:
// http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
export function easeOutBounce (t) {
  let ts = t * t
  let tc = ts * t
  return 33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t
}
