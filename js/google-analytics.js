// Simple wrapper that checks if global `ga` function is defined. If not, returns empty function.
const ga = window.ga ? window.ga : function () {}
export default ga
