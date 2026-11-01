const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map();
const element=()=>({value:'0',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},children:[],setAttribute(){},appendChild(){},before(){},add(){},replaceChildren(){}});
const sandbox={document:{addEventListener(){},getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement:element,querySelectorAll(){return [];}},window:{addEventListener(){}},setInterval(){},setTimeout(){},requestAnimationFrame(){},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),sandbox);
vm.runInContext(`
// Exercise the actual audio release before replacing voices for MIDI routing checks.
for(const supportsHold of [false,true]){
 const stops=[],events=[];
 const param={value:.1,setValueAtTime(v,t){events.push(['set',v,t]);},linearRampToValueAtTime(v,t){events.push(['ramp',v,t]);},cancelScheduledValues(t){events.push(['cancel',t]);}};
 if(supportsHold)param.cancelAndHoldAtTime=t=>events.push(['hold',t]);
 ctx={state:'running',currentTime:0,createGain:()=>({gain:param,connect(){},disconnect(){}}),createOscillator:()=>({frequency:{},detune:{},connect(){},start(){},stop(t){stops.push(t);},disconnect(){}})};
 bus={};onNote('ptr:1',60,90,false);ctx.currentTime=.04;offNote('ptr:1',true);
 if(stops.length!==2||stops.some(t=>t>.8))throw Error('Oscillators did not stop on key release');
 if(voices.size||held.size)throw Error('Released key remains held');
 if(!events.some(e=>e[0]==='ramp'&&e[1]===0))throw Error('Missing fade to silence');
 if(!events.some(e=>e[0]===(supportsHold?'hold':'cancel')))throw Error('Release compatibility path not exercised');
 offNote('ptr:1',true);if(stops.length!==2)throw Error('Duplicate release');
}
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
