uniform sampler2D texture;

varying vec4 vColor;
varying float vAngle;

void main() {
    vec2 uv = gl_PointCoord;
    float rot = vAngle;

    uv-=.5;

    mat2 m = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
   	uv  = m * uv;

    uv+=.5;

    gl_FragColor = vColor *  texture2D(texture, uv);
    if (gl_FragColor.a < ALPHATEST) discard;
}