const teal='#16777d', blue='#4b69a9', rust='#ac5232', gray='#79858e', pale='#d5dfe6', violet='#855bb0';
const tau=2*Math.PI;
const line=(p,c=gray,width=1.3,dash=false)=>({p,c,width,dash});
const poly=(p,c='#30818b20',stroke=teal)=>({p,c,stroke});
const dot=(p,c=rust,r=4)=>({p,c,r});
const label=(p,t,c='#263c45')=>({p,t,c});
const add=(a,b)=>a.map((x,i)=>x+b[i]), scale=(a,s)=>a.map(x=>x*s);
const seq=(n,f)=>Array.from({length:n+1},(_,i)=>f(i/n));
const arrow=(a,b,c=teal)=>{
 const ds=b.map((x,i)=>x-a[i]), d=Math.hypot(...ds);
 if(d<1e-5)return [];
 const u=scale(ds,1/d), side=Math.hypot(u[0],u[1])>.1?[-u[1],u[0],0]:[1,0,0];
 const s=scale(side,.105/(Math.hypot(...side)||1)), back=add(b,scale(u,-Math.min(.18,d/2)));
 return [line([a,b],c,2),line([add(back,s),b,add(back,scale(s,-1))],c,2)];
};
const loop=(r,z=0)=>seq(48,t=>[r*Math.cos(t*tau),r*Math.sin(t*tau),z]);
const cube=(r=1.2)=>{const ls=[];for(let a of [-r,r])for(let b of [-r,r])for(let k=0;k<3;k++){const p=[a,b];p.splice(k,0,-r);const q=p.slice();q[k]=r;ls.push(line([p,q],gray));}return ls;};

export const sceneMeta={
 'em-gradient':{page:9,title:'A gradient on the surface and on its contour map',description:'Move the sample around the surface. The arrow on the lower map points uphill across the contours; the lifted line is its tangent on the graph.',parameter:'Sample around the hill',initial:.14},
 'em-sphere':{page:12,title:'Flux through a spherical patch',description:'Change the patch’s polar angle in an upward uniform field. The local normal rotates but the field does not. The sign is the sign of their dot product.',parameter:'Polar angle',initial:.30},
 'em-box':{page:15,title:'Opposite faces of a small volume',description:'The teal arrows show the field entering on one face and leaving through the other. Change the slope of the field Fₓ = 2 + ax rather than the dimensions of the box.',parameter:'Field slope',initial:.76},
 'em-stokes':{page:20,title:'One loop, many spanning surfaces',description:'Raise the cap while leaving its boundary fixed. For F = (−y, x, 0), the curl is vertical and constant; only the surface’s projected area counts in its flux.',parameter:'Cap height',initial:.56},
 'em-pillbox':{page:49,title:'Shrink a Gaussian pillbox across an interface',description:'Move its top and bottom toward the boundary. The side area disappears but the end faces keep their area, leaving the jump in normal electric displacement.',parameter:'Pillbox half-height',initial:.68}
};
export const scenes={
 'em-gradient':v=>{
  const h=(x,y)=>1.65-.27*x*x-.49*y*y, base=-1.5, lines=[],dots=[],labels=[];
  for(let i=-4;i<=4;i++){let a=i*.44;lines.push(line(seq(24,t=>[a,-1.78+3.56*t,h(a,-1.78+3.56*t)]),pale));lines.push(line(seq(24,t=>[-1.78+3.56*t,a,h(-1.78+3.56*t,a)]),blue));}
  for(let r of [.45,.80,1.13,1.47])lines.push(line(seq(60,t=>[r*Math.cos(t*tau),r*Math.sqrt(.27/.49)*Math.sin(t*tau),base]),gray));
  const x=1.45*Math.cos(v*tau),y=1.10*Math.sin(v*tau), g=[-.54*x,-.98*y], a=[x,y,h(x,y)], b=[x,y,base];
  lines.push(line([a,b],gray,1,true),...arrow(b,[x+g[0]*.65,y+g[1]*.65,base],rust),...arrow(a,[x+g[0]*.65,y+g[1]*.65,h(x,y)+.65*(g[0]**2+g[1]**2)],teal));
  dots.push(dot(a,teal),dot(b,rust));labels.push(label([-1.6,-1.7,-1.5],'Contour plane'),label([.25,.15,1.67],'Height f(x,y)'));
  return {lines,dots,labels,status:'At the sample: ∇f = ('+g.map(x=>x.toFixed(2)).join(', ')+').'};
 },
 'em-sphere':v=>{
  const theta=v*Math.PI, phi=.55, r=1.45, ball=(t,p)=>[r*Math.sin(t)*Math.cos(p),r*Math.sin(t)*Math.sin(p),r*Math.cos(t)];
  const lines=[],polys=[],labels=[];
  for(let t of [.4,.8,1.2,1.6,2,2.4,2.8])lines.push(line(seq(50,v=>ball(t,v*tau)),pale,1));
  for(let p=0;p<tau;p+=tau/10)lines.push(line(seq(26,v=>ball(v*Math.PI,p)),pale,1));
  const lo=Math.max(0,theta-.19),hi=Math.min(Math.PI,theta+.19), corners=[...seq(9,t=>ball(lo,phi-.25+t*.5)),...seq(9,t=>ball(hi,phi+.25-t*.5))];polys.push(poly(corners,'#f5ae5688',rust));
  const a=ball(theta,phi), end=scale(a,1.47), field=add(a,[0,0,.76]);lines.push(...arrow(a,end,rust),...arrow(a,field,teal));
  labels.push(label(end,'n',rust),label(field,'F',teal));
  return {lines,polys,dots:[dot(a)],labels,status:'θ = '+Math.round(v*180)+'° · F · n / |F| = '+Math.cos(theta).toFixed(3)};
 },
 'em-box':v=>{
  const a=2*v-1, r=1.15, lines=cube(r),polys=[];
  for(let x of [-r,r]){
   const c=x<0?blue:teal;
   polys.push(poly([[x,-r,-r],[x,r,-r],[x,r,r],[x,-r,r]],x<0?'#7496d636':'#5da7a144',c));
   for(let y of [-.58,.58])for(let z of [-.58,.58])lines.push(...arrow([x-.48,y,z],[x+.17+.22*(2+a*x),y,z],c));
  }
  return {lines,polys,labels:[label([-r,-r,1.6],'Entry',blue),label([r,r,1.6],'Exit',teal)],status:'∇·F = '+a.toFixed(2)+' · Net flux / volume = '+a.toFixed(2)};
 },
 'em-stokes':v=>{
  const r=1.5,h=1.6*v, lines=[line(loop(r),rust,2.4)];
  for(let rr of [.4,.8,1.2])lines.push(line(loop(rr,h*(1-(rr/r)**2)),teal,1.25));
  for(let t=0;t<tau;t+=tau/14)lines.push(line(seq(20,u=>[r*u*Math.cos(t),r*u*Math.sin(t),h*(1-u*u)]),teal,1.25));
  lines.push(...arrow([r,0,0],[r*Math.cos(.46),r*Math.sin(.46),0],rust));
  return {lines,polys:[poly(loop(r),'#526aa622',violet)],labels:[label([0,0,h+.25],'Cap',teal),label([r,0,-.2],'Fixed loop',rust)],status:'Both fluxes = 2πr² = '+(2*Math.PI*r*r).toFixed(2)+' in these units.'};
 },
 'em-pillbox':v=>{
  const h=.06+v*1.18,r=.9, lines=[line(loop(r,h),teal,2),line(loop(r,-h),blue,2)];
  for(let i=0;i<12;i++){const t=i*tau/12,x=r*Math.cos(t),y=r*Math.sin(t);lines.push(line([[x,y,-h],[x,y,h]],gray));}
  lines.push(...arrow([0,0,h],[0,0,h+.77],teal),...arrow([0,0,-h],[0,0,-h-.65],blue));
  return {lines,polys:[poly([[-2,-1.55,0],[2,-1.55,0],[2,1.55,0],[-2,1.55,0]],'#7dbcc740',teal),poly(loop(r,h),'#61aca230',teal),poly(loop(r,-h),'#7397c42e',blue)],labels:[label([.15,0,h+.77],'n₂',teal),label([.15,0,-h-.65],'n₁',blue)],status:'Side area / one end face = '+(4*h/r).toFixed(2)+'. In the zero-height limit, n·(D₂ − D₁) = ρₛ.'};
 }
};
