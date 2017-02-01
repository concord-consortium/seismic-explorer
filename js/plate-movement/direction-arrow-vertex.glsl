attribute float size;
attribute float angle;
attribute vec3 customColor;
attribute vec3 direction;

varying float vAngle;
varying vec4 vColor;

void main() {
    vColor = vec4(0.0,  // R
                  0.3,  // G
                  1.0,  // B
                  1.0); // A
    vAngle = angle;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
}