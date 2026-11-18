import * as T from 'three';

let canvas=document.querySelector('#scene');
let software=false;
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});}catch(e){software=true;const next=canvas.cloneNode();canvas.replaceWith(next);canvas=next;renderer=new SoftwareRenderer(canvas);}
function SoftwareRenderer(canvas){
const ctx=canvas.getContext('2d');let w=innerWidth,h=innerHeight;
this.setPixelRatio=()=>{};this.setSize=(x,y)=>{w=x;h=y;canvas.width=x;canvas.height=y;};
this.render=(scene,camera)=>{scene.updateMatrixWorld();camera.updateMatrixWorld();ctx.clearRect(0,0,w,h);const vp=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);const faces=[];const light=new T.Vector3(-.4,.8,.6).normalize();
scene.traverse(o=>{if(!o.isMesh||o.parent===scene||!o.visible)return;const geo=o.geometry,p=geo.attributes.position,idx=geo.index,mat=o.material;if(!p||Array.isArray(mat))return;const verts=[];for(let i=0;i<p.count;i++){let world=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);let v=world.clone().applyMatrix4(vp);verts.push({world,x:(v.x*.5+.5)*w,y:(-.5*v.y+.5)*h,z:v.z});}const n=idx?idx.count:p.count;for(let i=0;i<n;i+=3){const a=verts[idx?idx.getX(i):i],b=verts[idx?idx.getX(i+1):i+1],c=verts[idx?idx.getX(i+2):i+2];if(a.z>1||b.z>1||c.z>1)continue;const norm=new T.Vector3().subVectors(b.world,a.world).cross(new T.Vector3().subVectors(c.world,a.world)).normalize();const front=norm.dot(new T.Vector3().subVectors(camera.position,a.world))>0;if(!front)continue;const glass=mat.transmission>0;let col=mat.color.clone();const bright=.45+Math.max(0,norm.dot(light))*.65;col.multiplyScalar(bright);if(mat.emissive)col.add(mat.emissive.clone().multiplyScalar(Math.min(mat.emissiveIntensity*.4,1)));col.convertLinearToSRGB();const rgb=[col.r,col.g,col.b].map(v=>Math.round(Math.min(1,v)*255));faces.push({a,b,c,z:(a.z+b.z+c.z)/3,glass,color:'rgba('+rgb.join(',')+','+(glass?.16:1)+')'});}});
faces.sort((a,b)=>b.z-a.z);for(const f of faces){ctx.beginPath();ctx.moveTo(f.a.x,f.a.y);ctx.lineTo(f.b.x,f.b.y);ctx.lineTo(f.c.x,f.c.y);ctx.closePath();ctx.fillStyle=f.color;ctx.fill();if(!f.glass){ctx.strokeStyle=f.color;ctx.lineWidth=.65;ctx.stroke();}}
};}

renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
const scene=new T.Scene();
const camera=new T.PerspectiveCamera(36,innerWidth/innerHeight,.1,100);camera.position.set(0,1.3,13);camera.lookAt(0,.8,0);

scene.add(new T.HemisphereLight(0xe3f2ff,0x293135,3));
function light(c,i,p){const l=new T.DirectionalLight(c,i);l.position.set(...p);scene.add(l);}light(0xffdda1,5,[-4,7,5]);light(0x83cfff,4,[5,3,-3]);light(0xffffff,2,[1,5,6]);
// A studio environment supplies real reflections to the glass and polished metal.
const envScene=new T.Scene();envScene.background=new T.Color(0x576568);
function softbox(x,y,z,sx,sy,color){const m=new T.Mesh(new T.PlaneGeometry(sx,sy),new T.MeshBasicMaterial({color,side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,1,0);envScene.add(m);}
softbox(-5,5,4,3,9,0xfff0cc);softbox(5,4,1,2,7,0xd9f5ff);softbox(0,7,-4,8,3,0xffffff);if(!software){const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(envScene,.04).texture;}
const robot=new T.Group();scene.add(robot);
const white=new T.MeshStandardMaterial({color:0xe5e2d7,metalness:.68,roughness:.28});const dark=new T.MeshStandardMaterial({color:0x263138,metalness:.85,roughness:.31});const gold=new T.MeshStandardMaterial({color:0xc49a42,metalness:.8,roughness:.23});const black=new T.MeshStandardMaterial({color:0x101b22,metalness:.55,roughness:.26});const blue=new T.MeshStandardMaterial({color:0x8ceaff,emissive:0x00aaff,emissiveIntensity:4});const warm=new T.MeshStandardMaterial({color:0xffe7a0,emissive:0xffbd37,emissiveIntensity:3});
function mesh(geo,mat,pos=[0,0,0],parent=robot){const m=new T.Mesh(geo,mat);m.position.set(...pos);parent.add(m);return m;}
function sphere(r,mat,p,scale=[1,1,1],parent=robot){const m=mesh(new T.SphereGeometry(r,24,16),mat,p,parent);m.scale.set(...scale);return m;}
function cyl(r1,r2,h,mat,p,parent=robot){return mesh(new T.CylinderGeometry(r1,r2,h,32),mat,p,parent);}
function tor(r,t,mat,p,parent=robot){const m=mesh(new T.TorusGeometry(r,t,8,40),mat,p,parent);m.rotation.x=Math.PI/2;return m;}
function rod(a,b,r,mat,parent=robot){const av=new T.Vector3(...a),bv=new T.Vector3(...b);const m=cyl(r,r,av.distanceTo(bv),mat,av.clone().add(bv).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return m;}
// Main ceramic-alloy housing, collar and engine stack.
sphere(.82,dark,[0,-.38,0],[1,.88,1]);sphere(.81,white,[0,-.19,0],[1,.75,1]);cyl(.62,.74,.22,dark,[0,-.76,0]);tor(.69,.055,gold,[0,-.65,0]);
for(let i=0;i<20;i++){const a=i*Math.PI/10;const m=mesh(new T.BoxGeometry(.07,.2,.07),black,[.66*Math.sin(a),-.78,.66*Math.cos(a)]);m.rotation.y=a;}
cyl(.56,.6,.3,white,[0,-1.01,0]);tor(.58,.045,dark,[0,-.9,0]);
function thruster(x,y,z,r,parent=robot){cyl(r*.8,r,.14,gold,[x,y+.17,z],parent);cyl(r,r*.9,.25,dark,[x,y,z],parent);tor(r*.97,.035,white,[x,y+.08,z],parent);cyl(r*.82,r*.72,.13,white,[x,y-.17,z],parent);cyl(r*.66,r*.66,.035,black,[x,y-.25,z],parent);tor(r*.69,.035,blue,[x,y-.25,z],parent);cyl(r*.48,r*.56,.025,blue,[x,y-.27,z],parent);for(let i=0;i<8;i++){let a=i*Math.PI/4;sphere(.035,white,[x+r*.96*Math.sin(a),y,z+r*.96*Math.cos(a)],[1,1,1],parent);}}
thruster(0,-1.22,0,.53);
for(const s of [-1,1]){sphere(.24,gold,[s*.76,-.18,0]);sphere(.2,dark,[s*.83,-.18,0]);rod([s*.88,-.18,0],[s*1.24,-.4,.05],.11,dark);for(let i=0;i<5;i++)sphere(.12,dark,[s*(.9+i*.065),-.19-i*.042,.02],[1,.8,1]);rod([s*1.24,-.4,.05],[s*1.53,-.48,.05],.075,gold);thruster(s*1.55,-.53,.05,.36);rod([s*.5,-.75,.2],[s*.89,-1.12,.52],.075,gold);sphere(.12,dark,[s*.7,-.95,.37]);thruster(s*.95,-1.3,.59,.29);}
// Torso seams, fasteners, chest display and rear service panel.
for(const s of [-1,1]){const seam=mesh(new T.BoxGeometry(.045,.57,.06),gold,[s*.48,-.13,.64]);seam.rotation.z=s*.3;sphere(.1,gold,[s*.42,-.59,.52]);sphere(.06,blue,[s*.42,-.59,.59]);}
const display=mesh(new T.BoxGeometry(.39,.24,.09),dark,[0,.03,.77]);display.rotation.x=-.15;mesh(new T.BoxGeometry(.28,.07,.025),blue,[0,.04,.824]);mesh(new T.BoxGeometry(.42,.42,.09),dark,[0,-.24,-.76]);for(let i=0;i<4;i++)mesh(new T.BoxGeometry(.3,.026,.025),gold,[0,-.12-i*.075,-.817]);
cyl(.51,.54,.15,dark,[0,.4,0]);tor(.55,.055,gold,[0,.46,0]);cyl(.57,.57,.12,dark,[0,.54,0]);tor(.57,.035,white,[0,.59,0]);
for(let i=0;i<12;i++){let a=i*Math.PI/6;sphere(.034,i===0?blue:white,[.574*Math.sin(a),.54,.574*Math.cos(a)]);}
// Lathed lightbulb silhouette: narrow neck flows into a broad round crown.
const profile=[[.40,.6],[.42,.79],[.5,.96],[.73,1.12],[.98,1.34],[1.18,1.64],[1.27,1.98],[1.25,2.3],[1.12,2.63],[.88,2.91],[.57,3.1],[.28,3.2],[0,3.23]];
const curve=new T.SplineCurve(profile.map(p=>new T.Vector2(...p)));const glassMat=new T.MeshPhysicalMaterial({color:0xffe5a0,metalness:0,roughness:.075,transmission:.92,thickness:.15,ior:1.46,transparent:true,opacity:1,side:T.DoubleSide,iridescence:.7,iridescenceIOR:1.32,clearcoat:1});mesh(new T.LatheGeometry(curve.getPoints(45),48),glassMat);
cyl(.25,.29,.19,gold,[0,.76,0]);for(let i=0;i<3;i++)tor(.27-i*.02,.024,gold,[0,.72+i*.08,0]);
rod([0,.8,0],[0,1.15,0],.07,warm);for(let s of [-1,1]){rod([s*.1,.84,0],[s*.43,1.83,0],.015,gold);rod([s*.12,.84,.05],[s*.3,1.59,.04],.012,warm);}
let coil=[];for(let i=0;i<=160;i++){let t=i/160;coil.push(new T.Vector3(-.43+.86*t,1.83+.085*Math.sin(t*Math.PI*22),.085*Math.cos(t*Math.PI*22)));}mesh(new T.TubeGeometry(new T.CatmullRomCurve3(coil),180,.013,8,false),warm);
// Friendly oval eyes on the front of the bulb.
const eyes=new T.Group();robot.add(eyes);
for(const s of [-1,1]){const eye=sphere(.16,gold,[s*.39,2.03,1.155],[.7,1.65,.25],eyes);eye.rotation.z=-s*.08;const e=sphere(.147,black,[s*.39,2.035,1.19],[.7,1.65,.25],eyes);e.rotation.z=-s*.08;sphere(.055,new T.MeshStandardMaterial({color:0x38a6b4,metalness:.6,roughness:.17}),[s*.39,1.93,1.22],[.8,.7,.15],eyes);sphere(.025,white,[s*.39-.025,2.14,1.226],[1,1,.2],eyes);}
const happyEyes=new T.Group();robot.add(happyEyes);happyEyes.visible=false;
for(const sign of [-1,1]){const points=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI;points.push(new T.Vector3(sign*.39+Math.cos(a)*.15,2+Math.sin(a)*.16,1.22));}mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.035,8,false),black,[0,0,0],happyEyes);}
const bulbLight=new T.PointLight(0xffcb56,6,6);bulbLight.position.set(0,1.7,0);robot.add(bulbLight);
// Soft emissive halo, transparent so the inner structure remains visible.
const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,196,64,.28)');gradient.addColorStop(.5,'rgba(255,185,40,.09)');gradient.addColorStop(1,'rgba(255,185,40,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const halo=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(glowCanvas),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));halo.position.set(0,1.92,0);halo.scale.set(3.7,3.7,1);robot.add(halo);
const pages=['home','blueprint','philosophy','identity','society'];
let current='home',paused=matchMedia('(prefers-reduced-motion: reduce)').matches,helloUntil=0,drag=null;
let center={x:innerWidth*.59,y:innerHeight*.54},target={...center},last=performance.now(),elapsed=0,scale=1;
let orbitYaw=-.18,orbitPitch=0,suppressClick=false;
const handle=document.querySelector('#robot-handle'),bubble=document.querySelector('#bubble'),motion=document.querySelector('#motion');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function defaultCenter(){return current==='home'?{x:innerWidth*(innerWidth<650?.68:.59),y:innerWidth<650?385:Math.min(innerHeight*.54,540)}:{x:innerWidth-100,y:innerWidth<650?175:235};}
function route(){let name=location.hash.slice(1)||'home';if(!pages.includes(name)){name='home';history.replaceState(null,'','#home');}current=name;drag=null;helloUntil=0;suppressClick=false;bubble.classList.remove('visible');target=defaultCenter();document.body.dataset.page=name;document.querySelectorAll('.page').forEach(p=>{p.hidden=p.id!==name;p.classList.toggle('active',p.id===name);});document.querySelectorAll('nav a').forEach(a=>{const active=a.dataset.page===name;a.classList.toggle('current',active);a.tabIndex=active?-1:0;if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});handle.setAttribute('aria-label',name==='home'?'Say hello to Igai. Drag anywhere in the scene or use arrow keys to rotate the model.':'Say hello to Igai. Igai will turn around, smile, and return to watching the page.');document.querySelector('#back').hidden=name==='home';document.querySelector('#page-counter').textContent='0'+pages.indexOf(name)+' / 04';document.title='IGAI — '+({home:'I Got An Idea!',blueprint:'The Blueprint',philosophy:'Job & Philosophy',identity:'Logo Guideline',society:'Societal Problems'}[name]);window.scrollTo({top:0,behavior:'instant'});if(name!=='home')document.querySelector('#content').focus({preventScroll:true});}
addEventListener('hashchange',route);route();
function setMotion(){document.body.classList.toggle('paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.innerHTML=paused?'RESUME MOTION <span>▶</span>':'PAUSE MOTION <span>Ⅱ</span>';motion.setAttribute('aria-label',paused?'Resume motion':'Pause motion');}motion.onclick=()=>{paused=!paused;setMotion();};setMotion();
function greet(){helloUntil=performance.now()+3200;bubble.classList.add('visible');bubble.textContent=['I GOT AN IDEA!','HELLO, CREATIVE MIND!','LET’S NOTICE SOMETHING NEW.'][Math.floor(Math.random()*3)];}
document.addEventListener('pointerdown',e=>{if(current!=='home'||e.button!==0)return;if(e.target.closest('a,nav,header,summary,input,button:not(#robot-handle)'))return;if(e.pointerType==='touch'&&!e.target.closest('#robot-handle'))return;suppressClick=false;drag={x:e.clientX,y:e.clientY,yaw:orbitYaw,pitch:orbitPitch,moved:false};handle.setPointerCapture(e.pointerId);});
document.addEventListener('pointermove',e=>{if(current!=='home'||!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;if(drag.moved){helloUntil=0;orbitYaw=drag.yaw+dx*.008;orbitPitch=Math.max(-1.1,Math.min(1.1,drag.pitch+dy*.006));}});
document.addEventListener('pointerup',e=>{if(!drag)return;suppressClick=drag.moved;drag=null;if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);setTimeout(()=>suppressClick=false,0);});
document.addEventListener('pointercancel',()=>{drag=null;suppressClick=false;});
handle.addEventListener('click',()=>{if(!suppressClick)greet();});
handle.addEventListener('keydown',e=>{if(current==='home'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();helloUntil=0;orbitYaw+=e.key==='ArrowLeft'?-.2:e.key==='ArrowRight'?.2:0;orbitPitch=Math.max(-1.1,Math.min(1.1,orbitPitch+(e.key==='ArrowUp'?-.15:e.key==='ArrowDown'?.15:0)));}});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);target=defaultCenter();});
const homeScale=()=>innerWidth<650?Math.min(.52,innerWidth/760):Math.min(1,innerHeight/830);
function animate(now){requestAnimationFrame(animate);const delta=Math.min((now-last)/1000,.05);last=now;if(!paused)elapsed+=delta;const blend=reduced?1:1-Math.exp(-delta*7);
// Fixed camera: only the model rotates, floats, or changes its screen placement.
center.x+=(target.x-center.x)*blend;center.y+=(target.y-center.y)*blend;
const floatY=paused||drag?0:Math.sin(elapsed*1.3)*6,floatX=current==='home'||paused?0:Math.sin(elapsed*.7)*12;
const desiredScale=current==='home'?homeScale():(innerWidth<650?.25:.34);scale+=(desiredScale-scale)*blend;robot.scale.setScalar(scale);
camera.updateMatrixWorld();const desired=new T.Vector3((center.x+floatX)/innerWidth*2-1,-(center.y+floatY)/innerHeight*2+1,.5).unproject(camera);const dir=desired.sub(camera.position).normalize();const position=camera.position.clone().add(dir.multiplyScalar(-camera.position.z/dir.z));robot.position.copy(position);robot.position.y-=.8*scale;
const smiling=now<helloUntil;eyes.visible=!smiling;happyEyes.visible=smiling;if(!smiling)bubble.classList.remove('visible');
const ry=smiling?0:current==='home'?orbitYaw:Math.PI;
const angleDelta=Math.atan2(Math.sin(ry-robot.rotation.y),Math.cos(ry-robot.rotation.y));robot.rotation.y+=angleDelta*blend;
const pitch=smiling||current!=='home'?0:orbitPitch;robot.rotation.x+=(pitch-robot.rotation.x)*blend;robot.rotation.z=paused||drag?0:Math.sin(elapsed*.8)*.025;
handle.style.left=(center.x+floatX)+'px';handle.style.top=(center.y+floatY)+'px';if(current==='home'){handle.style.width=(innerWidth<650?170:280)+'px';handle.style.height=(innerWidth<650?250:370)+'px';}else{handle.style.width='130px';handle.style.height='170px';}
renderer.render(scene,camera);}
requestAnimationFrame(animate);const loading=document.querySelector('#loading');loading.style.opacity='0';setTimeout(()=>loading.remove(),450);window.igai={scene,robot,camera,renderer,greet,get page(){return current;},get paused(){return paused;}};

