attribute float size;
attribute vec3 customColor;
varying vec4 vColor;

void main() {
  vColor = vec4(customColor, size > 0.0 ? 0.8 : 0.0);
  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position,1.0);

  gl_PointSize = 4.0;
}

float line_distance(vec2 p, vec2 p1, vec2 p2) {
  vec2 center = (p1 + p2) * 0.5;
  float len = length(p2 - p1);
  vec2 dir = (p2 - p1) / len;
  vec2 rel_p = p - center;
  return dot(rel_p, vec2(dir.y, -dir.x));
}
float segment_distance(vec2 p, vec2 p1, vec2 p2) {
    vec2 center = (p1 + p2) * 0.5;
    float len = length(p2 - p1);
    vec2 dir = (p2 - p1) / len;
    vec2 rel_p = p - center;
    float dist1 = abs(dot(rel_p, vec2(dir.y, -dir.x)));
    float dist2 = abs(dot(rel_p, dir)) - 0.5*len;
    return max(dist1, dist2);
}

float arrow_stealth(vec2 texcoord, float body, float head, float linewidth, float antialias) {
  float w = linewidth/2.0 + antialias;
  vec2 start = -vec2(body/2.0, 0.0);
  vec2 end = +vec2(body/2.0, 0.0);
  float height = 0.5;

  // Head : 4 lines
  float d1 = line_distance(texcoord, end-head*vec2(+1.0,-height), end);
  float d2 = line_distance(texcoord, end-head*vec2(+1.0,-height), end-vec2(3.0*head/4.0,0.0));
  float d3 = line_distance(texcoord, end-head*vec2(+1.0,+height), end);
  float d4 = line_distance(texcoord, end-head*vec2(+1.0,+0.5), end-vec2(3.0*head/4.0,0.0));

  // Body : 1 segment
  float d5 = segment_distance(texcoord, start, end - vec2(linewidth,0.0));
  return min(d5, max( max(-d1, d3), - max(-d2,d4)));
}