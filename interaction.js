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
