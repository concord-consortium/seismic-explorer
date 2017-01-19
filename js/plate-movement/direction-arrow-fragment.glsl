uniform vec3 color;
uniform sampler2D texture;
varying vec4 vColor;

void main() {
    vec4 solidColor = vec4(0.0,  // R
                      0.0,  // G
                      1.0,  // B
                      1.0); // A

    //gl_FragColor = solidColor;
    // gl_FragColor = vColor * texture2D(texture, gl_PointCoord);

    // if (gl_FragColor.a < ALPHATEST) discard;

    vec2 uv = gl_PointCoord;
    float rot = radians(45.0);

    uv-=.5;

    mat2 m = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
   	uv  = m * uv;

    uv+=.5;

    gl_FragColor = vColor *  texture2D(texture, uv);
}