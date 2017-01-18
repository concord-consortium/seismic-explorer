uniform vec3 color;
uniform sampler2D texture;
varying vec4 vColor;

void main() {
    vec4 solidColor = vec4(0.0,  // R
                      0.0,  // G
                      1.0,  // B
                      1.0); // A

    //gl_FragColor = solidColor;
    gl_FragColor = solidColor * texture2D(texture, gl_PointCoord);
    //gl_FragColor = vColor * texture2D(texture, gl_PointCoord);
    if (gl_FragColor.a < ALPHATEST) discard;
}