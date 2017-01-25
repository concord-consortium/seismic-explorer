attribute float size;
attribute vec3 customColor;

varying vec4 vColor;

void main() {
    vColor = vec4(0.8,  // R
                  0.1,  // G
                  0.0,  // B
                  0.9); // A
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 40.0;
    gl_Position = projectionMatrix * mvPosition;
}