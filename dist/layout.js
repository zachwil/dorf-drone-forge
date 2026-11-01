'use strict';
(()=>{
 const main=document.querySelector('main');
 document.querySelector('.intro').remove();
 const foundation=$('layers').previousElementSibling;
 const workspace=document.createElement('div');workspace.className='sound-workspace';
 const left=document.createElement('div');left.className='sound-foundation';
 const atmosphere=document.querySelector('.atmosphere');
 const sequence=document.querySelector('.sequence');
 const lower=document.querySelector('.lower');
 left.append(foundation,$('layers'),atmosphere);workspace.append(left,sequence);lower.replaceWith(workspace);
 const keyboard=document.querySelector('.keyboard-panel');keyboard.classList.add('performance-keyboard');
 const midiRow=document.querySelector('.midi-row');
 const mapping=document.querySelector('#mappingRows').closest('section');
 const dialog=document.createElement('dialog');dialog.id='midiDialog';
 const heading=document.createElement('div');heading.className='dialog-heading';
 const title=document.createElement('h2');title.textContent='MIDI devices & mappings';
 const close=document.createElement('button');close.textContent='Close';close.onclick=()=>dialog.close();heading.append(title,close);
 dialog.append(heading,midiRow,mapping);document.body.append(dialog);
 const setup=document.createElement('button');setup.textContent='MIDI setup';setup.onclick=()=>dialog.showModal();
 $('midiConnect').after(setup);
 const originalConnect=$('midiConnect').onclick;
 $('midiConnect').onclick=async()=>{await originalConnect();if(!dialog.open)dialog.showModal();};
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 const footer=document.querySelector('footer');footer.querySelectorAll(':scope > span').forEach(n=>n.remove());footer.append($('notice'));
 // Keep long descriptions available without occupying performance space.
 $('keyboardVoice').title=$('voiceDescription').textContent;
})();
