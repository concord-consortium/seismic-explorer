attribute float size;
attribute vec3 customColor;

varying vec4 vColor;

void main() {
    vColor = vec4(1.0,  // R
                  0.4,  // G
                  0.0,  // B
                  1.0); // A
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 30.0;
    gl_Position = projectionMatrix * mvPosition;
}