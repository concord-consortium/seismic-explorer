uniform vec3 color;
uniform sampler2D texture;
varying vec4 vColor;

void main() {
    gl_FragColor = vColor * texture2D(texture, gl_PointCoord);
    if (gl_FragColor.a < ALPHATEST) discard;
}
