attribute float size;
attribute vec3 customColor;
varying vec4 vColor;

void main() {
    vColor = vec4(customColor, 0.8);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
}