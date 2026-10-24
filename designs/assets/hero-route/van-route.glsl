/** @resolution */
uniform vec2 u_resolution;
/** @time */
uniform float u_time;
/** @label Crew van artwork */
uniform sampler2D u_van;
/** @label Van width @default 176 */
uniform float u_vanWidth;
/** @label Journey duration @default 24 */
uniform float u_duration;
/** @label Animate journey @default 1 @range 0, 1 */
uniform float u_motion;
/** @label Parked progress @default 0.38 @range 0, 1 */
uniform float u_progress;
/** @label Route vertical position */
uniform float u_routeY;
/** @label Route bend */
uniform float u_bend;
/** @label Route curves */
uniform float u_waves;

vec2 bez(vec2 a,vec2 b,vec2 c,vec2 d,float t){float u=1.0-t;return u*u*u*a+3.0*u*u*t*b+3.0*u*t*t*c+t*t*t*d;}
vec2 route(float phase){
if(u_resolution.x<600.0){
float v=clamp(phase,0.0,0.999999)*4.0;float t=fract(v);
if(v<1.0)return bez(vec2(-50.0,175.0),vec2(100.0,175.0),vec2(-50.0,390.0),vec2(90.0,390.0),t);
if(v<2.0)return bez(vec2(90.0,390.0),vec2(225.0,390.0),vec2(60.0,210.0),vec2(195.0,210.0),t);
if(v<3.0)return bez(vec2(195.0,210.0),vec2(330.0,210.0),vec2(170.0,390.0),vec2(305.0,390.0),t);
if(v<4.0)return bez(vec2(305.0,390.0),vec2(450.0,390.0),vec2(300.0,675.0),vec2(445.0,675.0),t);
}else{
float v=clamp(phase,0.0,0.999999)*7.0;float t=fract(v);
if(v<1.0)return bez(vec2(-100.0,125.0),vec2(150.0,125.0),vec2(-40.0,480.0),vec2(180.0,480.0),t);
if(v<2.0)return bez(vec2(180.0,480.0),vec2(400.0,480.0),vec2(170.0,310.0),vec2(390.0,310.0),t);
if(v<3.0)return bez(vec2(390.0,310.0),vec2(610.0,310.0),vec2(400.0,505.0),vec2(620.0,505.0),t);
if(v<4.0)return bez(vec2(620.0,505.0),vec2(850.0,505.0),vec2(620.0,310.0),vec2(850.0,310.0),t);
if(v<5.0)return bez(vec2(850.0,310.0),vec2(1080.0,310.0),vec2(870.0,500.0),vec2(1100.0,500.0),t);
if(v<6.0)return bez(vec2(1100.0,500.0),vec2(1320.0,500.0),vec2(1100.0,310.0),vec2(1320.0,310.0),t);
if(v<7.0)return bez(vec2(1320.0,310.0),vec2(1540.0,310.0),vec2(1250.0,670.0),vec2(1540.0,670.0),t);
}return vec2(0.0);}
void main() {
  float phase = mix(u_progress, fract(u_progress + u_time / u_duration), step(0.5, u_motion));
  vec2 p=route(phase);
  vec2 tangent=route(min(0.99999,phase+0.0001))-route(max(0.0,phase-0.0001));
  float angle=-atan(tangent.y,tangent.x);
  vec2 center=vec2(p.x,u_resolution.y-p.y);
  vec2 delta = gl_FragCoord.xy - center;
  float c = cos(angle);
  float s = sin(angle);
  vec2 local = vec2(c * delta.x + s * delta.y, -s * delta.x + c * delta.y);
  vec2 uv = local / vec2(u_vanWidth, u_vanWidth * 0.75) + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0);
  } else {
    vec4 color = texture2D(u_van, uv);
    gl_FragColor = vec4(color.rgb * color.a, color.a);
  }
}
