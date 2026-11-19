const RealDate = Date

// Makes `new Date()` with no arguments return the given moment; returns a function that undoes it.
export default function pinDate (isoString) {
  global.Date = class extends RealDate {
    constructor (...args) {
      if (args.length) return new RealDate(...args)
      return new RealDate(isoString)
    }
  }
  return () => { global.Date = RealDate }
}
