'use strict';
(()=>{
 const canvas=$('mineCanvas'),g=canvas.getContext('2d');
 const W=960,H=270,ground=217;
 canvas.width=W;canvas.height=H;
 const colors={soft:'#a7dfc4',organ:'#dec48c',choir:'#c3aceb',strings:'#a9c9e0',bell:'#76e4ef',harp:'#9cdaa0',horn:'#e7a971',bass:'#a1a3d8'};
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let paused=reduced,scroll=0,last=0,time=0,lastReadout=0,energy=0;
 let notes=[],sparks=[];
 const waveform=new Uint8Array(256);
 const miners=[{x:260,color:'#b99064'},{x:370,color:'#7f9b90'},{x:480,color:'#9889ad'}];
 const rect=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
 function polygon(points,c){g.fillStyle=c;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
 function glow(x,y,r,c,strength=1){g.save();g.globalAlpha*=strength;const grad=g.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,c);grad.addColorStop(1,'transparent');g.fillStyle=grad;g.fillRect(x-r,y-r,r*2,r*2);g.restore();}
 function crystal(x,y,size,c,lit){if(lit)glow(x,y-size/2,size*2,c,lit*.35);polygon([[x-size/3,y],[x-size/2,y-size*.7],[x,y-size],[x+size/3,y-size*.6],[x+size/4,y]],c);polygon([[x,y],[x,y-size],[x+size/3,y-size*.6],[x+size/4,y]],'#ffffff22');}
 function dwarf(miner,index,moving){
  const stride=moving?Math.sin(time*5+index*2):0;
  const strike=notes.some(n=>n.miner===index&&n.age<.5);
  const x=miner.x,y=ground-3-Math.abs(stride)*2;
  const presence=settings.muted[index]?0:settings.levels[index]/100;
  glow(x+21,y-39,40+presence*25,'#f5b658',.12+presence*.15+energy*.25);
  rect(x-10-stride*3,y-11,8,11,'#43392d');rect(x+3+stride*3,y-11,8,11,'#43392d');
  rect(x-13-stride*3,y-3,12,5,'#242b26');rect(x+2+stride*3,y-3,13,5,'#242b26');
  rect(x-16,y-42,10,27,'#574b36');rect(x-18,y-37,3,16,'#9b8153');
  rect(x-11,y-35,25,25,miner.color);rect(x-12,y-15,27,5,'#453a2e');rect(x-1,y-15,5,5,'#c9aa68');
  rect(x-7,y-51,21,19,'#d1aa7d');rect(x+9,y-42,9,6,'#deb58a');rect(x+8,y-46,3,3,'#242923');
  polygon([[x-8,y-39],[x+11,y-35],[x+7,y-17],[x-3,y-20],[x-10,y-30]],['#d6d0b0','#bdb7a3','#c9b28c'][index]);
  rect(x-10,y-56,25,9,miner.color);rect(x-13,y-49,31,4,'#b79e65');rect(x+7,y-55,7,6,'#eecf82');
  const handY=strike?y-49:y-25;
  rect(x+11,y-33,7,14,miner.color);rect(x+15,handY,7,6,'#d1aa7d');
  g.save();g.translate(x+20,handY+2);g.rotate(strike?-.8:.5);rect(-2,-22,4,35,'#8b6943');polygon([[-14,-21],[0,-26],[16,-20],[12,-16],[0,-21],[-12,-17]],'#b9bfb1');g.restore();
 }
 function draw(){
  const sound=ctx?.state==='running';
  const moving=sound&&(playing||voices.size>0);
  const warmth=(Math.log(settings.cutoff/100)/Math.log(60));
  rect(0,0,W,H,'#101917');
  // Distant openings drift more slowly than the foreground.
  for(let i=-1;i<8;i++){const x=i*180-(scroll*.25)%180;polygon([[x,ground],[x+22,60],[x+75,26],[x+130,58],[x+158,ground]],'#1c2927');polygon([[x+26,ground],[x+44,105],[x+83,80],[x+117,110],[x+131,ground]],'#111e1d');}
  for(let i=-1;i<16;i++){const x=i*80-(scroll*.5)%80;const depth=25+((i+25)*37%60);polygon([[x,0],[x+66,0],[x+28,depth]],'#25302b');rect(x+5,depth+5,25,3,'#26312a');}
  for(let i=-1;i<6;i++){const x=i*240-scroll%240;rect(x,58,12,ground-58,'#483d2d');rect(x-8,54,162,11,'#50432f');rect(x+136,58,12,ground-58,'#483d2d');polygon([[x+12,65],[x+48,65],[x+12,99]],'#5a4b33');polygon([[x+136,65],[x+102,65],[x+136,99]],'#5a4b33');rect(x+4,83,4,5,'#a08857');}
  rect(0,ground,W,H-ground,'#30362b');rect(0,ground,W,4,'#73704b');
  for(let i=0;i<24;i++){const x=i*47-scroll%47;rect(x,ground+18+(i%3)*8,16,3,'#464b37');}
  // Track ties and rails continue beneath the party.
  for(let i=-1;i<25;i++)rect(i*48-scroll%48,ground+27,23,14,'#4e4431');
  rect(0,ground+29,W,3,'#84806a');rect(0,ground+39,W,2,'#626858');
  for(let i=-1;i<12;i++){const x=i*110-(scroll*.8)%110;const c=['#56877e','#65829a','#8e7d9d'][((i%3)+3)%3];crystal(x,ground,16+((i+20)*13%23),c,.25+energy);}
  // Filter warmth changes the torchlight; master/audio level changes its pulse.
  glow(660,145,120+warmth*100,'#e7a54f',.07+warmth*.12+energy*.3);
  rect(650,145,5,34,'#8c6034');polygon([[646,146],[647,134],[653,119-Math.sin(time*8)*3],[661,139],[657,149]],'#d89c4f');rect(651,134,4,12,'#efd68b');
  miners.forEach((m,i)=>dwarf(m,i,moving));
  // Reverb is represented by drifting cavern mist.
  g.save();g.globalAlpha=settings.reverb/100*.13;for(let i=0;i<6;i++){glow((i*230-time*9)%1300-100,190+Math.sin(i+time*.3)*10,140,'#bfd5c3');}g.restore();
  for(const n of notes){const alpha=n.released?Math.max(0,1-n.tail/(.8+settings.reverb/35)):1;const x=n.x-(scroll-n.scroll)*.65,y=90+(84-n.note)*1.6-Math.min(n.age,3)*8;g.save();g.globalAlpha=alpha;crystal(x,y,12+n.velocity/10,n.color,.7);g.strokeStyle=n.color;g.globalAlpha=alpha*.28;g.beginPath();g.arc(x,y-10,18+n.age*12,0,Math.PI*2);g.stroke();g.globalAlpha=alpha;g.fillStyle='#e2e6cb';g.font='11px monospace';g.fillText(noteName(n.note),x-8,y+17);g.restore();}
  for(const p of sparks){rect(p.x,p.y,3,3,p.color);}
  // Three lantern meters show the drone mix even while individual notes play.
  g.font='10px monospace';['HEART','CHOIR','VAULT'].forEach((name,i)=>{const x=20+i*100;g.fillStyle='#acb4a0';g.fillText(name,x,24);rect(x,32,65,4,'#384336');rect(x,32,65*(settings.muted[i]?0:settings.levels[i]/100),4,miners[i].color);});
  g.fillStyle='#c4bd99';g.textAlign='right';g.fillText(moving?'THE EXPEDITION CONTINUES':'RESTING IN THE DEEP',W-20,25);g.textAlign='left';
 }
 window.mineVisual={noteOn(key,note,velocity){if(paused)return;const id=key==='seq'?settings.sequenceVoice:settings.keyboardVoice;const color=colors[id]||colors.soft;const miner=Math.abs(note)%3;notes=notes.filter(n=>n.key!==key);notes.push({key,note,velocity,color,miner,x:miners[miner].x+35,scroll,age:0,tail:0,released:false});if(notes.length>64)notes.shift();for(let i=0;i<7;i++)sparks.push({x:miners[miner].x+24,y:ground-43,vx:20+Math.random()*65,vy:-30-Math.random()*70,life:.5+Math.random()*.4,color});sparks=sparks.slice(-180);},noteOff(key){for(const n of notes)if(n.key===key)n.released=true;}};
 $('minePause').textContent=paused?'Resume scene':'Pause scene';
 $('minePause').setAttribute('aria-pressed',String(paused));
 $('minePause').onclick=()=>{paused=!paused;last=0;if(paused){notes=[];sparks=[];}$('minePause').textContent=paused?'Resume scene':'Pause scene';$('minePause').setAttribute('aria-pressed',String(paused));};
 function frame(now){requestAnimationFrame(frame);if(document.hidden){last=0;return;}const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!paused){time+=dt;const running=ctx?.state==='running';if(running&&analyser){analyser.getByteTimeDomainData(waveform);let sum=0;for(const v of waveform)sum+=((v-128)/128)**2;energy=Math.sqrt(sum/waveform.length);}else energy=0;if(running&&(playing||voices.size))scroll+=dt*(12+settings.bpm*.3);for(const n of notes){n.age+=dt;if(n.released)n.tail+=dt;}notes=notes.filter(n=>n.tail<.8+settings.reverb/35);for(const p of sparks){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;}sparks=sparks.filter(p=>p.life>0);draw();}else if(!lastReadout)draw();if(now-lastReadout>300){$('mineReadout').textContent=paused?'Scene paused · audio remains playable':`${voices.size} active notes · ${settings.bpm} BPM · ${instrumentVoices[settings.keyboardVoice].name} · cavern ${settings.reverb}%`;lastReadout=now;}}
 draw();requestAnimationFrame(frame);
})();
