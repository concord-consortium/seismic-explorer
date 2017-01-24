uniform sampler2D texture;
varying vec4 vColor;


void main() {
    vec2 uv = gl_PointCoord;
    gl_FragColor = vColor *  texture2D(texture, uv);
    if (gl_FragColor.a < ALPHATEST) discard;
}