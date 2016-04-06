attribute float size;
attribute vec3 customColor;
varying vec4 vColor;

void main() {
    vColor = vec4(customColor, size > 0.0 ? 1.0 : 0.0);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size; // to scale: * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
