const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map();
const element=()=>({value:'0',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},children:[],setAttribute(){},appendChild(){},before(){},add(){},replaceChildren(){}});
const sandbox={document:{addEventListener(){},getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement:element,querySelector(){return element();},querySelectorAll(){return [];}},window:{addEventListener(){}},setInterval(){},setTimeout(){},requestAnimationFrame(){},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/voices.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),sandbox);
vm.runInContext(`
// Exercise the actual audio release before replacing voices for MIDI routing checks.
for(const voiceId of Object.keys(instrumentVoices))for(const supportsHold of [false,true]){
 settings.keyboardVoice=voiceId;const expectedStops=instrumentVoices[voiceId].partials.length*2;
 const stops=[],events=[];
 const param={value:.1,setValueAtTime(v,t){events.push(['set',v,t]);},linearRampToValueAtTime(v,t){events.push(['ramp',v,t]);},cancelScheduledValues(t){events.push(['cancel',t]);}};
 if(supportsHold)param.cancelAndHoldAtTime=t=>events.push(['hold',t]);
 ctx={state:'running',currentTime:0,createGain:()=>({gain:param,connect(){},disconnect(){}}),createOscillator:()=>({frequency:{},detune:{},connect(){},start(){},stop(t){stops.push(t);},disconnect(){}})};
 bus={};onNote('ptr:1',60,90,false);ctx.currentTime=.04;offNote('ptr:1',true);
 if(stops.length!==expectedStops||stops.some(t=>t>2))throw Error('Oscillators did not stop on key release');
 if(voices.size||held.size)throw Error('Released key remains held');
 if(!events.some(e=>e[0]==='ramp'&&e[1]===0))throw Error('Missing fade to silence');
 if(!events.some(e=>e[0]===(supportsHold?'hold':'cancel')))throw Error('Release compatibility path not exercised');
 offNote('ptr:1',true);if(stops.length!==expectedStops)throw Error('Duplicate release');
}
settings.keyboardVoice='soft';
ctx={state:'running',currentTime:0};
createVoice=(note)=>({note,oscs:[{detune:{setTargetAtTime(){}}}],stop(){}});
const messages=[];selectedOutput={send:m=>messages.push(m)};
$('channel').value='2';
onNote('key:a',60,90);if(messages[0].join()!=='146,60,90')throw Error('Wrong output channel');
offNote('key:a',true);if(messages[1].join()!=='130,60,0')throw Error('Missing note off');
midiMessage({data:[144,64,100]});if(!voices.has('midi:0:64'))throw Error('Input note missing');
if(messages.length!==2)throw Error('MIDI feedback: input forwarded');
midiMessage({data:[176,64,127]});midiMessage({data:[128,64,0]});
if(!voices.has('midi:0:64'))throw Error('Sustain failed');
midiMessage({data:[176,64,0]});if(voices.size)throw Error('Sustain stuck');
midiMessage({data:[145,67,90]});midiMessage({data:[145,67,0]});if(voices.size)throw Error('Zero velocity note off failed');
onNote('seq',62);releaseNotes();if(voices.size||outNotes.size)throw Error('Panic left notes');
`,sandbox);
assert.ok(true);console.log('MIDI input, output channel, note-off, sustain, feedback prevention, and panic checks passed.');

vm.runInContext(`
$('steps').children=Array.from({length:8},()=>({classList:{add(){},remove(){}}}));
settings.restBias=0;randomizeSequence();if(settings.steps.some(n=>n<0||n>7))throw Error('Zero rest bias produced a rest');
settings.restBias=100;randomizeSequence();if(settings.steps.some(n=>n!==-1))throw Error('Full rest bias produced a note');
settings.steps=[0,1,2,3,4,5,6,7];settings.randomizeEachPass=true;
playing=true;$('seqOn').checked=true;stepIndex=0;nextStep=0;
for(let i=0;i<8;i++){ctx.currentTime=i*2;tickSequence();if(settings.steps[0]!==0)throw Error('Randomized before full pass');}
ctx.currentTime=16;tickSequence();if(settings.steps.some(n=>n!==-1)||stepIndex!==9)throw Error('Did not randomize at wrap');
if(voices.has('seq')||outNotes.has('seq'))throw Error('Old sequence note stuck at all-rest wrap');
settings.randomizeEachPass=false;settings.steps=[0,1,2,3,4,5,6,7];stepIndex=16;ctx.currentTime=20;tickSequence();
if(settings.steps[0]!==0)throw Error('Randomized while disabled');
stopSequence();playing=false;$('seqOn').checked=false;settings.restBias=18;
`,sandbox);
console.log('Rest-bias extremes, complete-pass timing, disabled mode and wrap note-off passed.');
const savedMaps=new Map();
sandbox.localStorage={getItem:k=>savedMaps.get(k),setItem:(k,v)=>savedMaps.set(k,v)};
vm.runInContext(fs.readFileSync('dist/mapping.js','utf8'),sandbox);
vm.runInContext(`
master={gain:{setTargetAtTime(){}}};filter={frequency:{setTargetAtTime(){}}};wet={gain:{setTargetAtTime(){}}};
selectedInput={name:'MPK mini test'};syncMappingDevice();
learning=0;midiMessage({data:[176,20,80]});
if(mappings[0].number!==20)throw Error('Knob learning failed');
midiMessage({data:[176,20,127]});if(settings.levels[0]!==100)throw Error('Knob range failed');
midiMessage({data:[176,20,0]});if(settings.levels[0]!==0)throw Error('Knob zero failed');
learning=1;midiMessage({data:[176,20,90]});if(mappings[1])throw Error('Duplicate assignment accepted');
learning=8;midiMessage({data:[185,40,100]});
let actions=0;$('mute0').click=()=>actions++;
midiMessage({data:[185,40,0]});midiMessage({data:[185,40,127]});midiMessage({data:[185,40,127]});midiMessage({data:[185,40,0]});
if(actions!==1)throw Error('Pad double-triggered');
midiMessage({data:[144,60,90]});if(!voices.has('midi:0:60'))throw Error('Keyboard routing broken');midiMessage({data:[128,60,0]});
mappingDevice='';mappings={};syncMappingDevice();if(mappings[0].number!==20)throw Error('Mapping persistence failed');
`,sandbox);
console.log('MIDI Learn, conflict detection, knob ranges, pad debounce, keyboard routing and persistence passed.');
(async()=>{
 await vm.runInContext(`(async()=>{
  const originalConnect=$('midiConnect').onclick;
  midi=null;selectedInput=null;mappingDevice='';
  $('midiConnect').onclick=async()=>{midi={inputs:new Map([['controller',{id:'controller',name:'Generic fader controller',state:'connected'}]])};};
  await $('mappingRows').onclick({target:{closest:()=>({dataset:{learn:'2'}})}});
  if(learning!==2||selectedInput.id!=='controller')throw Error('Learn did not select the only controller');
  if(!$('mappingStatus').textContent.includes('Listening'))throw Error('Missing listening feedback');
  midiMessage({data:[176,25,70]});if(mappings[2].number!==25)throw Error('Click-to-learn did not map incoming CC');
  selectedInput=null;midi={inputs:new Map([['a',{id:'a',name:'MPK mini MK2',state:'connected'}],['b',{id:'b',name:'Other controller',state:'connected'}]])};
  await beginLearning(3);
  if(learning!==null||selectedInput!==null||!$('mappingStatus').textContent.includes('Select your controller'))throw Error('Multiple inputs should require selection without brand preference');
  selectedInput=midi.inputs.get('b');await beginLearning(3);
  if(learning!==3||selectedInput.id!=='b')throw Error('Explicit controller selection ignored');
  midiMessage({data:[178,30,127]});if(mappings[3].channel!==2)throw Error('Fader on another channel failed');
  await beginLearning(9);midiMessage({data:[153,45,100]});
  if(mappings[9].kind!=='note'||mappings[9].channel!==9)throw Error('Note trigger learning failed');
  await beginLearning(4);midiMessage({data:[153,46,100]});
  if(learning!==4||mappings[4])throw Error('Continuous control accepted a note');
  selectedInput=null;midi={inputs:new Map()};
  await beginLearning(3);if(learning!==null||!$('mappingStatus').textContent.includes('No MIDI input'))throw Error('Missing disconnected feedback');
  selectedInput=null;midi=null;let finishConnect;
  $('midiConnect').onclick=()=>new Promise(r=>finishConnect=r);
  const pending=beginLearning(4);$('cancelLearn').onclick();finishConnect();await pending;
  if(learning!==null)throw Error('Cancelled learning armed later');
  $('midiConnect').onclick=originalConnect;
  mappingDevice='MPK backup test';mappings={0:{kind:'cc',number:21,channel:0}};
  if(!saveMappings()||!$('mappingSaveStatus').textContent.includes('Saved 1'))throw Error('Explicit save failed');
  const backup={format:'dorf-midi-mappings',version:1,mappings};
  const roundtrip=validateMappingBackup(JSON.parse(JSON.stringify(backup)));
  if(roundtrip[0].number!==21)throw Error('Backup roundtrip failed');
  const realSet=localStorage.setItem;localStorage.setItem=()=>{throw Error('Disk full');};
  if(saveMappings()||!$('mappingSaveStatus').textContent.includes('Not saved'))throw Error('Storage failure hidden');
  localStorage.setItem=realSet;
  const restoredFile={size:100,text:async()=>JSON.stringify({format:'dorf-midi-mappings',version:1,mappings:{1:{kind:'cc',number:22,channel:2}}})};
  await $('mappingFile').onchange({target:{files:[restoredFile],value:'backup.json'}});
  if(mappings[0]||mappings[1].number!==22)throw Error('Import failed');
  const before=JSON.stringify(mappings);
  await $('mappingFile').onchange({target:{files:[{size:10,text:async()=>'{bad json'}],value:'bad.json'}});
  if(JSON.stringify(mappings)!==before)throw Error('Bad import overwrote mappings');
  let invalidRejected=false;try{validateMappingBackup({format:'dorf-midi-mappings',version:1,mappings:{0:{kind:'cc',number:21,channel:0},1:{kind:'cc',number:21,channel:0}}});}catch{invalidRejected=true;}
  if(!invalidRejected)throw Error('Duplicate backup accepted');

 })()`,sandbox);
 console.log('Generic controller selection, multiple-input choice, CC faders, note triggers, backups and cancellation passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
