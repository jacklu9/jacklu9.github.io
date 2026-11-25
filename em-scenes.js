// Spatial companion figures for Electromagnetic Theory, Chapter 1.
// World coordinates are standard right-handed physical x, y, z.
// The four figures use deliberately simple fields or the notes' exact worked example.
const ink='#25313a', quiet='#647380', grid='#a6b1b8', pale='#c7d3d8',
      teal='#086a74', orange='#a74516', blue='#235886';
const TAU=2*Math.PI;
const o=[0,0,0];
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const mul=(a,k)=>a.map(x=>x*k);
const length=a=>Math.hypot(...a);
const unit=a=>mul(a,1/length(a));
const cross=([a,b,c],[d,e,f])=>[b*f-c*e,c*d-a*f,a*e-b*d];
const nice=(x,n=2)=>Math.abs(x)<.5*10**-n?'0.'+'0'.repeat(n):x.toFixed(n).replace('-','−');
const sign=(x,n=2)=>(x>=.5*10**-n?'+':'')+nice(x,n);
const newScene=()=>({lines:[],polys:[],dots:[],labels:[],status:''});
const line=(s,p,c=grid,width=1,dash=undefined)=>s.lines.push({p,c,width,dash});
const poly=(s,p,c,stroke)=>s.polys.push({p,c,stroke});
const dot=(s,p,c,r=3)=>s.dots.push({p,c,r});
const label=(s,p,t,c=ink)=>s.labels.push({p,t,c});
function arrow(s,a,b,c,width=2,size=.13){
  const delta=sub(b,a), mag=length(delta);
  if(mag<1e-5)return;
  const dir=unit(delta);
  const base=sub(b,mul(dir,Math.min(size,mag*.3)));
  const v=unit(cross(dir,Math.abs(dir[2])<.87?[0,0,1]:[0,1,0]));
  const w=unit(cross(dir,v));
  line(s,[a,b],c,width);
  for(const q of [v,w])for(const sg of [-1,1])line(s,[add(base,mul(q,sg*Math.min(size*.36,mag*.12))),b],c,width);
}
const circle=(radius,z,start=0,end=TAU,n=56)=>Array.from({length:n+1},(_,i)=>{
  const a=start+(end-start)*i/n;return [radius*Math.cos(a),radius*Math.sin(a),z];
});
function arcArrow(s,r,z,a,b,c,width=2){
  const p=circle(r,z,a,b,18);line(s,p,c,width);
  arrow(s,p[p.length-4],p[p.length-1],c,width,.17);
}
function axes(s,origin=o,scale=1.75){
  for(let i=0;i<3;i++){
    const tip=[...origin];tip[i]+=scale;
    arrow(s,origin,tip,quiet,1,.10);
    const t=[...tip];t[i]+=.11;label(s,t,['x','y','z'][i],quiet);
  }
}
function vectorField(v){
  const s=newScene();
  const field=([x,y,z])=>[.42-.20*y,.18+.28*x,.48+.16*z];
  // A sparse set of sample values; nothing drawn here is a trajectory.
  for(const z of [-.85,.28,1.10])for(const y of [-.9,.55])for(const x of [-1.25,0,1.25]){
    const q=[x,y,z];
    arrow(s,q,add(q,mul(field(q),.65)),pale,1,.10);
    dot(s,q,pale,1.75);
  }
  axes(s,o,1.65);
  const x=-1.40+2.8*v,p=[x,.55,.45],e=field(p);
  line(s,[[-1.4,.55,.45],[1.4,.55,.45]],grid,1,[3,3]);
  arrow(s,o,p,quiet,2,.13);
  label(s,add(mul(p,.58),[0,-.22,.12]),'rₚ',quiet);
  const tip=add(p,mul(e,1.3));
  arrow(s,p,tip,teal,3,.18);
  dot(s,p,orange,4.6);
  label(s,add(p,[-.08,.13,-.13]),'P',orange);
  label(s,add(tip,[.1,.1,.06]),'E(P)',teal);
  s.status='P = ('+nice(x)+', 0.55, 0.45); E(P) = ('+e.map(n=>nice(n)).join(', ')+'). The gray arrow locates P; the teal one is the field value there.';
  return s;
}
function faraday(v){
  const s=newScene(), r=1.2, rate=2*v-1, emf=-Math.PI*rate;
  const disk=circle(r,0);poly(s,disk,'#dcebed55',grid);
  line(s,disk,quiet,1.2);
  line(s,[[-r,0,0],[r,0,0]],grid,1,[4,4]);
  line(s,[[0,-r,0],[0,r,0]],grid,1,[4,4]);
  for(const a of [.2,2.20,4.2])arcArrow(s,r+.09,0,a,a+.60,ink,1.6);
  arrow(s,[1.57,-.16,0],[1.57,-.16,.72],ink,1.4,.13);
  label(s,[1.59,-.12,.85],'+n (+z)',ink);
  label(s,[-1.48,-.68,0],'C⁺',ink);
  if(Math.abs(rate)>.005){
    for(const [x,y] of [[-.39,-.35],[.40,-.30],[-.18,.44]]){
      arrow(s,[x,y,0],[x,y,Math.sign(rate)*(.19+Math.abs(rate)*.89)],teal,2,.15);
    }
    for(const a of [1.27,3.37,5.47])arcArrow(s,r+.29,.025,a,a-Math.sign(rate)*(.21+.65*Math.abs(rate)),orange,2.4);
    label(s,[-.17,.44,Math.sign(rate)*(.32+Math.abs(rate)*.89)],'∂B/∂t',teal);
    label(s,[1.36,.8,.12],'Induced E',orange);
  }
  const txt=Math.abs(rate)<.005?'No induced circulation.':rate>0?'Induced E is clockwise looking down from +z.':'Induced E is counterclockwise looking down from +z.';
  s.status='For a 1 m radius: dBz/dt = '+sign(rate)+' T/s; emf along C⁺ = '+sign(emf)+' V. '+txt;
  return s;
}
function capacitor(v){
  const s=newScene(), I=2*v,z1=-1.15,top=.10,positive=-.43,negative=.66,inner=1.05,R=1.60,pr=.88;
  const h=r=>r<=inner?top:top+(z1-top)*((r-inner)/(R-inner))**1.12;
  const flat=circle(R,z1);
  poly(s,flat,'#f0e1d34e',null);line(s,flat,quiet,2.0);
  poly(s,circle(pr,positive),'#edcfb77a',orange);
  poly(s,circle(pr,negative),'#d8dde16e',quiet);
  line(s,circle(pr,positive),orange,2.5);
  line(s,circle(pr,negative),quiet,2.2);
  for(const rr of [.35,.69,inner,1.22,1.42,R])line(s,circle(rr,h(rr)),teal,rr===R?1.6:1.0,rr===R?[5,4]:undefined);
  for(let j=0;j<12;j++){
    const a=j*TAU/12;
    const points=Array.from({length:16},(_,i)=>{
      const r=R*i/15;return [r*Math.cos(a),r*Math.sin(a),h(r)];
    });line(s,points,teal,.9);
  }
  line(s,[[0,0,-2.18],[0,0,positive]],ink,2.4);
  line(s,[[0,0,negative],[0,0,1.48]],quiet,1.65);
  if(I>.005){
    arrow(s,[-.17,-.06,-1.93],[-.17,-.06,-1.67+.52*v],orange,2.4,.15);
    for(const [x,y] of [[-.46,-.25],[.36,-.32],[.04,.42]]){
      const low=-.33, high=low+.12+.68*v;arrow(s,[x,y,low],[x,y,high],teal,2.2,.13);
    }
  }
  label(s,[-1.15,-1.12,z1-.18],'C',ink);
  label(s,[1.11,-.20,z1+.1],'S₁',orange);
  label(s,[.92,-.59,.2],'S₂',teal);
  label(s,[-.93,.12,negative+.10],'− plate',quiet);
  label(s,[-.93,.12,positive-.08],'+ plate',orange);
  label(s,[.22,.08,-1.96],'I in the wire',orange);
  s.status='Ideal charging model: S₁ counts '+nice(I)+' A of conduction current; S₂ counts '+nice(I)+' A of displacement current through the gap. Same boundary C, same total.';
  return s;
}
function wavefront(v){
  const s=newScene(), cycle=v, phase=v*TAU;
  // Example 1.18: E₀ = (−2, 2, 1) V/m and k = (1, 2, −2) rad/m.
  const k=unit([1,2,-2]),e=unit([-2,2,1]),b=unit(cross(k,e));
  // Render one wavelength as 1.45 spatial units. The reported field stays in V/m.
  const lambda=1.45;
  const at=(p,u=0,w=0)=>add(mul(k,p),add(mul(e,u),mul(b,w)));
  for(let n=-3;n<=3;n++){
    const p=lambda*(cycle+n);
    if(Math.abs(p)>1.95)continue;
    const corners=[at(p,-.90,-.76),at(p,.90,-.76),at(p,.90,.76),at(p,-.90,.76)];
    poly(s,corners,'#d2e6e954',teal);
    for(const u of [-.45,0,.45])line(s,[at(p,u,-.76),at(p,u,.76)],'#a5ced0',1);
    for(const w of [-.38,0,.38])line(s,[at(p,-.90,w),at(p,.90,w)],'#a5ced0',1);
  }
  arrow(s,mul(k,-2.05),mul(k,2.13),ink,2.2,.18);
  label(s,at(2.13,.17,.11),'+k̂',ink);
  line(s,[at(0,-1.1,0),at(0,1.1,0)],quiet,1,[4,4]);
  label(s,at(0,1.15,.08),'fixed E₀ axis',quiet);
  for(const p of [-1.20,-.66,0,.66,1.20]){
    const c=Math.cos(phase-TAU*p/lambda);
    const a=at(p),tip=at(p,.74*c);
    dot(s,a,p===0?orange:blue,p===0?4.6:2.5);
    arrow(s,a,tip,p===0?orange:blue,p===0?3:1.6,.16);
    if(p===0&&Math.abs(c)>.12)label(s,add(tip,mul(b,.12)),'E(P,t)',orange);
  }
  label(s,at(0,0,.17),'P',orange);
  const amp=3*Math.cos(phase), point=mul(e,amp);
  s.status='t/T = '+nice(cycle)+'; at the fixed point P, E = ('+point.map(n=>nice(n)).join(', ')+') V/m. The phase fronts move along +k̂; E reverses along one fixed transverse axis.';
  return s;
}
export const scenes={ 'em-field-probe':vectorField, 'em-faraday':faraday, 'em-capacitor':capacitor, 'em-wavefront':wavefront };
export const sceneMeta={
  'em-field-probe':{page:4,title:'Move a probe through a vector field',description:'A 3D companion to Figure 1.2. Rotate the view, then move the orange probe along x. The sample arrows are one illustrative snapshot, not paths.',parameter:'Probe position along x',initial:.72},
  'em-faraday':{page:32,title:'Faraday’s law: which way does E circulate?',description:'A 3D companion to Figure 1.18. The black rim arrows fix C⁺ by the +z normal. Change the signed rate of magnetic flux and compare the orange induced circulation; teal arrows show ∂B/∂t, not B itself.',parameter:'Magnetic field change rate',initial:.83},
  'em-capacitor':{page:34,title:'One rim, two spanning surfaces',description:'A 3D companion to Figure 1.19. Rotate the flat disk S₁ and the teal bulged surface S₂. Neither changes the common rim C. Adjust how fast the lower plate charges and compare the two current contributions.',parameter:'Charging current (0–2 A)',initial:.65},
  'em-wavefront':{page:44,title:'Wavefronts travel; a field arrow oscillates',description:'A 3D companion to Figures 1.24–1.25 and Worked Example 1.18. Slide through one period. The parallel planes move along k̂ while the orange field arrow at P lengthens and reverses along its fixed transverse axis.',parameter:'Time within one period',initial:.12},
};
