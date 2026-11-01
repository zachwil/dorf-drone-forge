'use strict';
const mappingTargets=[
 ['K1','Mountain presence','level0'],['K2','Forge presence','level1'],['K3','Crystal presence','level2'],['K4','Warmth','cutoff'],['K5','Reverb','reverb'],['K6','Master volume','master'],['K7','Choir drift','detune1'],['K8','Tempo','bpm'],
 ['Pad 1','Mountain mute','mute0'],['Pad 2','Forge mute','mute1'],['Pad 3','Crystal mute','mute2'],['Pad 4','Sequencer on/off','seqOn'],['Pad 5','Halls of stone','hall'],['Pad 6','Embers of the forge','embers'],['Pad 7','Frozen vault','ice'],['Pad 8','Awaken / rest','play']
];
let mappings={},learning=null,mappingDevice='',mappingDown=new Set();
const mappingPanel=document.createElement('section');mappingPanel.className='panel keyboard-panel';
mappingPanel.innerHTML=`<div class="section-heading"><h2>05 <span>MPK mini Mk2 · MIDI Learn</span></h2><button id="cancelLearn">Cancel learning</button></div><p class="muted">Connect MIDI and select your MPK input above. Keys play automatically. Choose one hardware program and Bank A; turn CC on and Prog Change off. Click Learn, then move that knob or tap that pad. Release pads between taps. Mappings save automatically on this computer.</p><p class="hint">Keep the same program, bank and pad mode after learning. Shared channel + CC assignments cannot control two actions; Dorf will report a conflict. Note-mode pads on the keyboard’s channel can also capture those keyboard notes. CC mode avoids that overlap.</p><p id="mappingMonitor" role="status">Waiting for MIDI input.</p><p id="mappingStatus" role="status" aria-live="polite">Click Learn to connect your controller and assign a control.</p><div class="mapping-actions"><button id="saveMappings">Save MIDI mappings</button><button id="exportMappings">Export backup</button><button id="importMappings">Import backup</button><input id="mappingFile" type="file" accept=".json,application/json" hidden><span id="mappingSaveStatus" role="status" aria-live="polite">Mappings save automatically after each assignment.</span></div><div id="mappingRows" class="mapping-grid"></div>`;
document.querySelector('footer').before(mappingPanel);
function mappingStorageKey(){return 'dorf-midi-map-v1:'+mappingDevice;}
function renderMappings(){$('mappingRows').innerHTML=mappingTargets.map((t,i)=>{const m=mappings[i];return `<div class="mapping-row ${learning===i?'learning':''}"><span><strong>${t[0]}</strong> · ${t[1]}<small>${m?`${m.kind==='cc'?'CC':'Note'} ${m.number} · channel ${m.channel+1}`:'Not assigned'}</small></span><button data-learn="${i}">${learning===i?'Listening…':'Learn'}</button><button data-clear="${i}" aria-label="Clear ${t[0]}">×</button></div>`;}).join('');}
function saveMappings(){
 if(!mappingDevice){$('mappingSaveStatus').textContent='Select a MIDI input before saving.';return false;}
 try{const data=JSON.stringify(mappings);localStorage.setItem(mappingStorageKey(),data);if(localStorage.getItem(mappingStorageKey())!==data)throw Error('Verification failed');$('mappingSaveStatus').textContent='Saved '+Object.keys(mappings).length+' mappings for '+mappingDevice+' at '+new Date().toLocaleTimeString()+'.';return true;}
 catch{$('mappingSaveStatus').textContent='Not saved on this computer. Use Export backup to keep your mappings.';return false;}
}
function validateMappingBackup(data){
 if(!data||data.format!=='dorf-midi-mappings'||data.version!==1||!data.mappings||typeof data.mappings!=='object'||Array.isArray(data.mappings))throw Error('Not a Dorf MIDI mapping backup.');
 const result={},seen=new Set();
 for(const [i,m] of Object.entries(data.mappings)){
  if(!/^(?:[0-9]|1[0-5])$/.test(i)||!m||!['cc','note'].includes(m.kind)||(+i<8&&m.kind!=='cc')||!Number.isInteger(m.number)||m.number<0||m.number>127||!Number.isInteger(m.channel)||m.channel<0||m.channel>15||(m.kind==='cc'&&[64,120,121,123].includes(m.number)))throw Error('Invalid mapping in backup.');
  const key=m.kind+':'+m.channel+':'+m.number;if(seen.has(key))throw Error('Backup contains conflicting assignments.');seen.add(key);result[i]={kind:m.kind,number:m.number,channel:m.channel};
 }
 return result;
}
$('saveMappings').onclick=()=>saveMappings();
$('exportMappings').onclick=()=>{
 if(!mappingDevice){$('mappingSaveStatus').textContent='Select a MIDI input first.';return;}
 download(new Blob([JSON.stringify({format:'dorf-midi-mappings',version:1,device:mappingDevice,mappings},null,2)],{type:'application/json'}),'dorf-midi-mappings.json');
 $('mappingSaveStatus').textContent='Backup requested. Choose a file location in the save dialog.';
};
$('importMappings').onclick=()=>{
 if(!mappingDevice){$('mappingSaveStatus').textContent='Select the MIDI input to restore mappings to first.';return;}
 $('mappingFile').click();
};
$('mappingFile').onchange=async e=>{
 const device=mappingDevice;
 try{const file=e.target.files[0];if(!file)return;if(!device)throw Error('Select a MIDI input first.');if(file.size>100000)throw Error('Backup file is too large.');
  const restored=validateMappingBackup(JSON.parse(await file.text()));
  if(device!==mappingDevice)throw Error('MIDI input changed; select the backup again.');
  ++learnRequest;learning=null;releaseNotes();mappingDown.clear();mappings=restored;renderMappings();saveMappings();$('mappingStatus').textContent='Backup restored to '+device+'.';
 }catch(error){$('mappingSaveStatus').textContent='Import failed: '+error.message;}finally{e.target.value='';}
};
function syncMappingDevice(){const device=selectedInput?.name||selectedInput?.id||'';if(device===mappingDevice)return;mappingDevice=device;$('mappingSaveStatus').textContent=device?'Using saved mappings for '+device+'.':'Select a MIDI input before saving.';learning=null;mappingDown.clear();mappings={};try{const saved=JSON.parse(localStorage.getItem(mappingStorageKey())||'{}');for(const [i,m] of Object.entries(saved)){if(/^\d+$/.test(i)&&+i<16&&m&&['cc','note'].includes(m.kind)&&Number.isInteger(m.number)&&m.number>=0&&m.number<128&&Number.isInteger(m.channel)&&m.channel>=0&&m.channel<16)mappings[i]=m;}}catch{}renderMappings();$('mappingStatus').textContent=device?'Mappings loaded for '+device+'.':'Select an input to begin.';}
let learnRequest=0;
async function beginLearning(index){
 const request=++learnRequest;
 learning=null;
 $('mappingStatus').textContent='Connecting to MIDI…';
 renderMappings();
 try{
  if(!midi)await $('midiConnect').onclick();
  if(request!==learnRequest)return;
  if(!midi)throw Error($('midiStatus').textContent||'MIDI access is unavailable.');
  if(!selectedInput||selectedInput.state==='disconnected'){
   const inputs=[...midi.inputs.values()].filter(p=>p.state==='connected');
   const mpks=inputs.filter(p=>/mpk/i.test(p.name||''));
   const candidate=mpks.length===1?mpks[0]:inputs.length===1?inputs[0]:null;
   if(!candidate)throw Error(inputs.length?'Select your MPK in the MIDI input menu above, then click Learn again.':'No MIDI input found. Plug in the MPK USB cable, then click Learn again.');
   $('midiInput').value=candidate.id;
   $('midiInput').onchange();
  }
  syncMappingDevice();
  releaseNotes();
  learning=index;
  $('mappingStatus').textContent='Listening on '+mappingDevice+': '+(index<8?'turn ':'tap ')+mappingTargets[index][0]+'.';
 }catch(error){$('mappingStatus').textContent=error.message;}
 renderMappings();
}
$('mappingRows').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.clear!==undefined){++learnRequest;syncMappingDevice();delete mappings[b.dataset.clear];learning=null;saveMappings();renderMappings();}else return beginLearning(+b.dataset.learn);};
$('cancelLearn').onclick=()=>{++learnRequest;learning=null;renderMappings();$('mappingStatus').textContent='Learning cancelled.';};
function applyMapping(index,value){const target=mappingTargets[index][2];if(index<8){const limits={cutoff:[100,6000],bpm:[20,120],detune1:[0,25]};const [min,max]=limits[target]||[0,100];const val=target==='cutoff'?Math.round(min*(max/min)**(value/127)):Math.round(min+(max-min)*value/127);const el=$(target);el.value=val;(target==='bpm'?el.onchange:el.oninput)({target:el});}else if(['hall','embers','ice'].includes(target)){$('preset').value=target;$('preset').onchange({target:$('preset')});}else if(target==='seqOn'){$('seqOn').checked=!$('seqOn').checked;$('seqOn').onchange();}else $(target).click();}
function mappedMidi(data){syncMappingDevice();const [status,number,value=0]=data,kind=status&240,channel=status&15;
 if(kind<128||kind>=240)return false;
 $('mappingMonitor').textContent=`Channel ${channel+1} · ${kind===176?'CC':kind===144||kind===128?'Note':kind===224?'Pitch bend':'Message'} ${number} · value ${value}`;
 const type=kind===176?'cc':kind===144||kind===128?'note':null;if(!type)return false;
 const active=kind!==128&&value>0;
 if(learning!==null){if(!active)return false;if(learning<8&&type!=='cc'){$('mappingStatus').textContent='Turn a knob to send a CC message.';return true;}
 if(type==='cc'&&[64,120,121,123].includes(number)){$('mappingStatus').textContent='This CC is reserved for sustain or all-notes-off. Choose another hardware assignment.';return true;}
 const conflict=Object.entries(mappings).find(([i,m])=>+i!==learning&&m.kind===type&&m.number===number&&m.channel===channel);
 if(conflict){$('mappingStatus').textContent='Already assigned to '+mappingTargets[+conflict[0]][0]+'. Clear that row or change the hardware assignment.';return true;}
 mappings[learning]={kind:type,number,channel};$('mappingStatus').textContent=mappingTargets[learning][0]+' learned. Map the next control.';learning=null;saveMappings();renderMappings();return true;}
 const match=Object.entries(mappings).find(([,m])=>m.kind===type&&m.number===number&&m.channel===channel);if(!match)return false;
 const i=+match[0];if(i<8){applyMapping(i,value);}else if(active){if(!mappingDown.has(i)){mappingDown.add(i);applyMapping(i,value);}}else mappingDown.delete(i);
 return true;
}
const originalMidiMessage=midiMessage;
midiMessage=e=>{if(!mappedMidi(e.data))originalMidiMessage(e);};
const originalInputChange=$('midiInput').onchange;
$('midiInput').onchange=()=>{originalInputChange();syncMappingDevice();};
window.addEventListener('blur',()=>mappingDown.clear());
renderMappings();
