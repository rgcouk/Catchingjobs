/** @resolution */
uniform vec2 u_resolution;
void main(){vec2 p=vec2(gl_FragCoord.x,u_resolution.y-gl_FragCoord.y);bool mobile=u_resolution.x<600.0;vec2 center=vec2(u_resolution.x*.5,mobile?100.0:140.0);vec2 radius=mobile?vec2(245.0,170.0):vec2(550.0,190.0);float d=length((p-center)/radius);float alpha=.94*(1.0-smoothstep(.3,1.0,d));gl_FragColor=vec4(vec3(1.0,.462745,.019608)*alpha,alpha);}
