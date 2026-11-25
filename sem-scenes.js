const C={ink:'#283239',soft:'#829399',grid:'#90a6ab',teal:'#287c80',blue:'#396b9b',red:'#ae563f',gold:'#956b30',white:'#ffffff',faint:'#dce9e9'};
const tau=2*Math.PI;
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const mul=(a,s)=>a.map(x=>x*s);
const len=a=>Math.hypot(...a);
const unit=a=>mul(a,1/len(a));
const dot=(a,b)=>a.reduce((t,x,i)=>t+x*b[i],0);
const cross=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a];
const seq=(n,f)=>Array.from({length:n},(_,i)=>f(i));
const caps=(v)=>Math.max(0,Math.min(1,v));
const scene=()=>({lines:[],polys:[],dots:[],labels:[],status:''});
function ln(s,p,c=C.ink,width=1,dash=false){s.lines.push({p,c,width,dash});}
function poly(s,p,c,stroke=C.soft){s.polys.push({p,c,stroke});}
function pt(s,p,c=C.ink,r=3){s.dots.push({p,c,r});}
function lab(s,p,t,c=C.ink){s.labels.push({p,t,c});}
function arrow(s,a,b,c=C.ink,w=2){const n=unit(b.map((v,i)=>v-a[i])),seed=Math.abs(n[2])>.85?[1,0,0]:[0,0,1],t=mul(unit(cross(n,seed)),.09),h=add(b,mul(n,-.2));ln(s,[a,b],c,w);ln(s,[add(h,t),b,add(h,mul(t,-1))],c,w);}
function axes(s,names,extent=1.65){names.forEach((t,i)=>{if(!t)return;const p=[0,0,0];p[i]=extent;const e=p.slice();e[i]+=0.12;arrow(s,[0,0,0],p,C.soft,1);lab(s,e,t,C.ink);})}
function ring(o,a,b,r,n=40){return seq(n+1,i=>add(o,add(mul(a,r*Math.cos(tau*i/n)),mul(b,r*Math.sin(tau*i/n)))));}
const xyz=[[1,0,0],[0,1,0],[0,0,1]];

function planeWave(v){
 const s=scene(),n=unit([1,0.52,0.45]), a=unit(cross(n,[0,0,1])), b=unit(cross(n,a));
 v=caps(v);
 const lambda=.56+1.04*v; const k=tau/lambda;
 axes(s,['x','y','z'],1.56);
 for(let i=-3;i<=3;i++){
  const d=i*lambda;if(Math.abs(d)>1.63)continue;
  const o=mul(n,d),corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([j,l])=>add(o,add(mul(a,j*.83),mul(b,l*.83))));
  poly(s,corners, i===0?'rgba(57,107,155,0.24)':'rgba(57,107,155,0.11)',C.blue);
  ln(s,[add(o,mul(a,-.83)),add(o,mul(a,.83))],C.grid,1,true);
 }
 arrow(s,[0,0,0],mul(n,1.9),C.red,2.5);lab(s,mul(n,2.04),'k',C.red);
 if(lambda<1.65){const base=mul(b,0.98);ln(s,[base,add(base,mul(n,lambda))],C.teal,2);lab(s,add(base,mul(n,.5*lambda)),'λ',C.teal);}
 s.status='Wavelength λ = '+lambda.toFixed(2)+' length units; |k| = '+k.toFixed(2)+' radians per unit. Every sheet marks the same phase modulo 2π.';
 return s;
}
const cube=seq(8,i=>[i&1,(i>>1)&1,(i>>2)&1]);
function directions(v){
 const s=scene(),idx=Math.round(caps(v)*2),labels=['[100]','[110]','[111]'],end=cube[[1,3,7][idx]],center=[-.84,-.84,-.84];
 const corners=cube.map(k=>add(center,mul(k,1.68)));
 for(let j=0;j<8;j++)for(let i=0;i<3;i++){const n=j^(1<<i);if(n>j)ln(s,[corners[j],corners[n]],C.grid,1.15);}
 for(const x of corners)pt(s,x,C.soft,2.5);
 ['x','y','z'].forEach((l,i)=>lab(s,add(center,mul(xyz[i],2.03)),l));
 arrow(s,center,add(center,mul(end,1.68)),C.teal,2.5);
 lab(s,add(add(center,mul(end,1.68)),[.16,.12,.24]),labels[idx],C.teal);
 s.status=labels[idx]+' is a '+['cube edge','face diagonal','body diagonal'][idx]+'. Its unit direction has '+['one positive component','two equal positive components','three equal positive components'][idx]+'.';
 return s;
}
function tetraBonds(v){
 const s=scene(),end=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(q=>mul(unit(q),1.58));
 const idx=Math.round(caps(v)*3);
 axes(s,['x','y','z'],1.13);
 for(let j=0;j<4;j++){
  const q=end[j];arrow(s,[0,0,0],q,j===idx?C.red:C.teal,j===idx?2.7:1.7);
  pt(s,q,j===idx?C.red:C.teal,4);
  for(let i=j+1;i<4;i++)ln(s,[q,end[i]],C.grid,1,true);
 }
 pt(s,[0,0,0],C.ink,4.5);lab(s,add(end[idx],[.18,.17,.15]),'Direction '+(idx+1),C.red);
 s.status='Direction '+(idx+1)+' of four tetrahedral directions. The angle between any two directions is about 109.47°. These are bond directions, not orbital probability surfaces.';
 return s;
}
function bz(){
 const faces=[], verts=[];
 for(const signs of [[1,1],[1,-1],[-1,1],[-1,-1]])for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(i!==j){const x=[0,0,0];x[i]=signs[0];x[j]=signs[1]*.5;verts.push(x);}
 const normals=[...xyz.flatMap(a=>[a,mul(a,-1)]),...cube.map(q=>q.map(x=>x*2-1))];
 for(const n of normals){
  const h=n.filter(x=>x).length===1?1:1.5;
  const face=verts.filter(q=>Math.abs(dot(q,n)-h)<1e-9);
  const o=mul(face.reduce(add,[0,0,0]),1/face.length);
  const a=unit(face[0].map((x,i)=>x-o[i])),b=cross(unit(n),a);
  face.sort((x,y)=>Math.atan2(dot(x,b),dot(x,a))-Math.atan2(dot(y,b),dot(y,a)));
  faces.push(face);
 }
 return faces;
}
const bzFaces=bz();
function zone(v){
 const s=scene(),scale=1.52,X=[1,0,0],G=[0,0,0],L=[.5,.5,.5];
 for(const q of bzFaces)poly(s,q.map(x=>mul(x,scale)),'rgba(57,107,155,0.07)',C.grid);
 axes(s,['kₓ','kᵧ','k_z'],1.84);
 ln(s,[mul(X,scale),G],C.red,2.6);
 ln(s,[G,mul(L,scale)],C.teal,2.6);
 lab(s,[1.61,.04,.1],'X',C.red);lab(s,[-.15,-.07,-.14],'Γ');lab(s,[.85,.86,.86],'L',C.teal);
 v=caps(v);const p=v<=.5?mul(X,1-2*v):mul(L,2*v-1);
 pt(s,mul(p,scale),C.ink,5.5);
 s.status='Selected k = ('+p.map(x=>x.toFixed(2)).join(', ')+') in units of 2π/a. The highlighted point follows X → Γ → L through the first Brillouin zone of a face-centered cubic lattice.';
 return s;
}
function parabolicBands(v){
 const s=scene(),u=caps(v),shift=1.17*u,gap=1.06,lo=-.65,hi=lo+gap;
 function val(x,y){return lo-.27*(x*x+y*y)}
 function cond(x,y){return hi+.27*((x-shift)**2+y*y)}
 axes(s,['kₓ','kᵧ','E'],1.68);
 const span=seq(13,i=>-1.28+2.56*i/12);
 for(const [f,c] of [[val,C.blue],[cond,C.teal]])for(const t of span){
  ln(s,span.map(x=>[x,t,f(x,t)]),c,.9);
  ln(s,span.map(y=>[t,y,f(t,y)]),c,.9);
 }
 const a=[0,0,lo],b=[shift,0,hi],sameX=shift/2,cc=[sameX,0,cond(sameX,0)],vv=[sameX,0,val(sameX,0)];
 pt(s,a,C.blue,5);pt(s,b,C.teal,5);
 ln(s,[a,[0,0,hi],b],C.gold,2,true);
 arrow(s,vv,cc,C.red,2);
 lab(s,[-.25,-.20,lo-.11],'Valence maximum',C.blue);
 lab(s,[shift+.12,.13,hi+.13],'Conduction minimum',C.teal);
 const vertical=gap+.135*shift*shift;
 s.status=(shift<.0001?'Direct: both extrema are at the same k. ':'Indirect: the extrema are at different k. ')+'Fundamental gap = '+gap.toFixed(2)+' eV; smallest same-k transition in this schematic model = '+vertical.toFixed(2)+' eV.';
 return s;
}
function shell(v){
 const s=scene(),k=.64+.89*caps(v),dk=.18,outer=k+dk;
 axes(s,['kₓ','kᵧ','k_z'],1.88);
 for(const [r,c] of [[k,C.blue],[outer,C.teal]]){
  for(let j=0;j<3;j++){
   ln(s,ring([0,0,0],xyz[(j+1)%3],xyz[(j+2)%3],r),c,1.35,j!==2);
   for (const sign of [-1,1]) ln(s,ring(mul(xyz[j],sign*r*.55),xyz[(j+1)%3],xyz[(j+2)%3],r*Math.sqrt(1-.55**2)),c,.72,true);
  }
 }
 const step=.23;
 for(let i=-7;i<=7;i++)for(let j=-7;j<=7;j++)for(let l=-7;l<=7;l++){
  const p=[i*step,j*step,l*step], radius=len(p);
  if(radius>=k&&radius<outer)pt(s,p,C.teal,1.65);
 }
 const line=unit([1,.45,.51]);
 ln(s,[[0,0,0],mul(line,k)],C.ink,1.4);ln(s,[mul(line,k),mul(line,outer)],C.gold,2.6);
 lab(s,add(mul(line,outer),[.06,.07,.14]),'dk',C.gold);
 const volume=4*Math.PI/3*(outer**3-k**3);
 s.status='k = '+k.toFixed(2)+', dk = '+dk.toFixed(2)+'. Exact shell volume '+volume.toFixed(2)+'; thin-shell approximation 4πk²dk = '+(4*Math.PI*k*k*dk).toFixed(2)+'. Each selected wavevector has two spin states.';
 return s;
}

const scenes={'sem-plane-wave':planeWave,'sem-directions':directions,'sem-tetrahedral-bonds':tetraBonds,'sem-zone-path':zone,'sem-band-surfaces':parabolicBands,'sem-k-shell':shell};
const sceneMeta={
 'sem-plane-wave':{title:'Phase fronts in three dimensions',description:'Turn the view to see that each equal-phase plane is perpendicular to k. Change the wavelength without changing its direction.',parameter:'Wavelength',initial:.34,page:8},
 'sem-directions':{title:'Three cubic directions',description:'Select the edge, face diagonal, or body diagonal, then rotate the cube to compare their components.',parameter:'Crystal direction: [100], [110], [111]',initial:.5,page:10},
 'sem-tetrahedral-bonds':{title:'Four tetrahedral bond directions',description:'Rotate the tetrahedron and select one of the four directions in the silicon bonding sketch.',parameter:'Bond direction',initial:0,page:7},
 'sem-zone-path':{title:'The X → Γ → L path in reciprocal space',description:'The horizontal path in the printed band diagram runs along two different directions in three dimensions. Rotate the face-centered cubic zone, then move the selected point along that path.',parameter:'Position from X through Γ to L',initial:.52,page:13},
 'sem-band-surfaces':{title:'Direct and indirect gaps on two energy surfaces',description:'Move the conduction minimum sideways. Compare the two edge heights with the shortest transition that must keep both wavevector components fixed. The surfaces are schematic, not a fit to any material.',parameter:'Offset of the conduction minimum',initial:.7,page:4},
 'sem-k-shell':{title:'Counting states in a three-dimensional shell',description:'Turn the shell to see that the printed ring is a cross-section. Move the inner radius while keeping the shell thickness fixed and compare how many grid points are selected.',parameter:'Inner shell radius',initial:.42,page:34}
};
export {scenes,sceneMeta};
