import {scenes as core} from './ucl-scenes-core.js';
import {scenes as em} from './em-scenes.js';
import {scenes as sem} from './sem-scenes.js';
const models={...core,...em,...sem};
for(const card of document.querySelectorAll('[data-scene]')){
 const scene=models[card.dataset.scene], canvas=card.querySelector('canvas'), ctx=canvas.getContext('2d');
 if(!ctx||!scene)continue;
 const range=card.querySelector('input'), status=card.querySelector('output');
 const defaultValue=+range.value, defaults=[-.72,.49];
 let yaw=defaults[0], pitch=defaults[1], touch=null;
 function draw(){
  const w=canvas.width,h=canvas.height, s=Math.min(w,h)*.189, co=Math.cos(yaw), si=Math.sin(yaw), cp=Math.cos(pitch),sp=Math.sin(pitch);
  const project=([x,y,z])=>{
   const u=co*x-si*y,b=si*x+co*y,v=cp*z-sp*b,depth=cp*b+sp*z;
   return [w/2+s*u,h/2-s*v,depth];
  };
  ctx.clearRect(0,0,w,h);
  const sceneData=scene(+range.value/100);
  const path=(p,close=false)=>{
   ctx.beginPath();p.forEach((v,i)=>{const [x,y]=project(v);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});
   if(close)ctx.closePath();
  };
  ctx.lineCap='round';ctx.lineJoin='round';
  const depth=p=>p.reduce((n,v)=>n+project(v)[2],0)/p.length;
  for(const f of [...(sceneData.polys||[])].sort((a,b)=>depth(a.p)-depth(b.p))){
   if(!f.p.length)continue;
   path(f.p,true);
   if(f.c){ctx.fillStyle=f.c;ctx.fill();}
   if(f.stroke){ctx.strokeStyle=f.stroke;ctx.lineWidth=1.15;ctx.stroke();}
  }
  for(const l of (sceneData.lines||[])){
   if(l.p.length<2)continue;
   path(l.p);ctx.strokeStyle=l.c||'#667986';ctx.lineWidth=l.width||1.45;ctx.setLineDash(l.dash?(Array.isArray(l.dash)?l.dash:[4,4]):[]);ctx.stroke();
  }
  ctx.setLineDash([]);
  for(const d of (sceneData.dots||[])){
   const [x,y]=project(d.p);ctx.beginPath();ctx.arc(x,y,d.r||3.5,0,2*Math.PI);ctx.fillStyle=d.c||'#22818a';ctx.fill();
  }
  ctx.font='600 13px system-ui,sans-serif';ctx.lineWidth=3;ctx.strokeStyle='#f6fafb';
  for(const l of (sceneData.labels||[])){
   const [x,y]=project(l.p), text=l.t;
   ctx.fillStyle=l.c||'#263c45';
   const labelX=Math.max(5,Math.min(w-ctx.measureText(text).width-5,x+6)),labelY=Math.max(14,Math.min(h-6,y-7));
   ctx.strokeText(text,labelX,labelY);ctx.fillText(text,labelX,labelY);
  }
  if(status.textContent!==sceneData.status)status.textContent=sceneData.status;
 }
 function rotate(x,y){yaw+=x;pitch=Math.max(-1.52,Math.min(1.52,pitch+y));draw();}
 for(const b of card.querySelectorAll('button[data-rotate]')){
  b.addEventListener('click',()=>{
   const mode=b.dataset.rotate;
   if(mode==='reset'){yaw=defaults[0];pitch=defaults[1];range.value=defaultValue;draw();return;}
   const [x,y]=mode.split(',').map(Number);rotate(x,y);
  });
 }
 canvas.addEventListener('keydown',e=>{
  const dirs={ArrowLeft:[-.18,0],ArrowRight:[.18,0],ArrowUp:[0,.16],ArrowDown:[0,-.16]};
  if(!dirs[e.key])return;e.preventDefault();rotate(...dirs[e.key]);
 });
 canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;touch={x:e.clientX,y:e.clientY,id:e.pointerId};
  canvas.setPointerCapture(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!touch||e.pointerId!==touch.id)return;
  const scale=canvas.clientWidth<450?.016:.009;
  rotate((e.clientX-touch.x)*scale,(e.clientY-touch.y)*scale);touch.x=e.clientX;touch.y=e.clientY;
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{touch=null;});
 range.addEventListener('input',draw);
 draw();
}
