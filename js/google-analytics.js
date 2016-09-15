// Simple wrapper that checks if global `ga` function is defined. If not, returns empty function.
export default ga = window.ga ? window.ga : function () {}
