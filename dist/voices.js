'use strict';
// Each partial is [waveform, semitone offset, relative level, detune cents].
const instrumentVoices={
 soft:{name:'Hearth flute',description:'The original soft triangle voice.',attack:.08,release:.7,partials:[['triangle',0,1,3]]},
 organ:{name:'Deep-hall organ',description:'Octave ranks with a hollow fifth and a steady sustain.',attack:.03,release:.45,partials:[['sine',0,.55,0],['sine',12,.25,0],['sine',19,.12,0],['sine',24,.08,0]]},
 choir:{name:'Ancestor choir',description:'Slow, drifting voices with an airy octave.',attack:1.1,release:1.6,partials:[['sawtooth',0,.32,9],['triangle',12,.48,6],['sine',19,.2,4]]},
 strings:{name:'Bowed iron',description:'Detuned bowed strings with a gradual swell.',attack:.5,release:1,partials:[['sawtooth',0,.55,7],['sawtooth',12,.15,11],['triangle',0,.3,2]]},
 bell:{name:'Mithril bell',description:'A struck bell with shimmering, inharmonic overtones.',attack:.006,decay:2.8,sustain:0,release:.7,partials:[['sine',0,.56,0],['sine',19.1,.24,0],['sine',32.2,.14,0],['sine',38,.06,0]]},
 harp:{name:'Runestone harp',description:'A quick pluck that fades while you hold the key.',attack:.008,decay:1.2,sustain:0,release:.3,partials:[['triangle',0,.8,1],['sine',12,.2,0]]},
 horn:{name:'Bronze horn',description:'A warm, reedy lead with a rounded attack.',attack:.16,release:.5,partials:[['square',0,.35,2],['triangle',0,.5,0],['sine',12,.15,0]]},
 bass:{name:'Underdeep bass',description:'A dark sub-octave foundation for low melodies.',attack:.04,release:.4,partials:[['sine',-12,.6,0],['triangle',0,.4,2]]}
};
function createInstrumentVoice(note,id,velocity){
 const spec=instrumentVoices[id]||instrumentVoices.soft;
 const layers=spec.partials.map(([wave,offset,weight,drift])=>{
  const level=velocity/127*.12*weight;
  const voice=createVoice(note+offset,wave,level,drift,spec.attack);
  if(spec.decay!==undefined)voice.g.gain.linearRampToValueAtTime(level*spec.sustain,ctx.currentTime+spec.attack+spec.decay);
  return voice;
 });
 return {note,oscs:layers.flatMap(v=>v.oscs),stop(){layers.forEach(v=>v.stop(spec.release));}};
}
