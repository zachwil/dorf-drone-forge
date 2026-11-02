const {app,BrowserWindow,Menu,session}=require('electron');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const entry=path.join(__dirname,'../dist/index.html');
const entryURL=pathToFileURL(entry).href;
const smoke=process.argv.includes('--smoke-test');
if(smoke)app.setPath('userData',path.join(app.getPath('temp'),'dorf-smoke-profile'));
app.setName('Dorf Drone Forge');
let win;
if(!app.requestSingleInstanceLock()){app.quit();}else{
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});
app.whenReady().then(async()=>{
 const local=wc=>wc&&wc.getURL()===entryURL;
 // Chromium checks midiSysex even for this app's sysex:false request.
 const permissionAllowed=(wc,p)=>local(wc)&&['midi','midiSysex'].includes(p);
 session.defaultSession.setPermissionCheckHandler((wc,permission)=>permissionAllowed(wc,permission));
 session.defaultSession.setPermissionRequestHandler((wc,permission,callback)=>callback(permissionAllowed(wc,permission)));
 // The instrument is fully local. No remote resources or navigation are needed.
 session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(_details,callback)=>callback({cancel:true}));
 win=new BrowserWindow({width:1280,height:800,minWidth:650,minHeight:600,title:'Dorf · Drone Forge',backgroundColor:'#141917',icon:path.join(__dirname,'dorf.svg'),show:!smoke,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,backgroundThrottling:false}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{if(url!==entryURL)event.preventDefault();});
 Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Dorf',submenu:[{label:'Silence all',accelerator:'Escape',click:()=>win.webContents.executeJavaScript("document.getElementById('panic').click()")},{type:'separator'},{role:'quit'}]},{label:'View',submenu:[{role:'reload'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]}]));
 session.defaultSession.on('will-download',(_event,item)=>{item.setSaveDialogOptions({title:'Save Dorf recording or sound',defaultPath:path.join(app.getPath('downloads'),path.basename(item.getFilename()))});});
 if(smoke)win.setContentSize(1280,720);
 await win.loadFile(entry);
 if(smoke){
  try{
   const result=await win.webContents.executeJavaScript(`(async()=>{
    await init();
    onNote('test',60,90,false);
    if(!window.mineVisual||!document.getElementById('mineCanvas'))throw Error('Mine scene missing');
    window.mineVisual.noteOn('scene-test',67,110);
    window.mineVisual.noteOff('scene-test');
    if(!voices.has('test'))throw Error('Note did not start');
    offNote('test',true);
    if(voices.has('test'))throw Error('Note did not release');
    await new Promise(r=>setTimeout(r,1000));
    if(document.documentElement.scrollHeight>innerHeight)throw Error('Dashboard overflows vertically');
    if(document.documentElement.scrollWidth>innerWidth)throw Error('Dashboard overflows horizontally');
    const midiAvailable=typeof navigator.requestMIDIAccess==='function';
    const access=await navigator.requestMIDIAccess({sysex:false}).catch(e=>{throw new Error('MIDI: '+e.name+': '+e.message);});
    const recordingAvailable=typeof MediaRecorder==='function';
    await ctx.close();
    return {title:document.title,secureContext:isSecureContext,midiAvailable,inputs:access.inputs.size,outputs:access.outputs.size,recordingAvailable,noteRelease:'passed'};
   })()`,true);
   const screenshot=await win.webContents.capturePage();const screenshotPath=path.join(app.getPath('temp'),'dorf-desktop-smoke.png');require('node:fs').writeFileSync(screenshotPath,screenshot.toPNG());console.log('DORF_SMOKE '+JSON.stringify({...result,screenshotPath}));app.exit(0);
  }catch(error){console.error(String(error),error?.stack);app.exit(1);}
 }
}).catch(error=>{console.error(String(error),error?.stack);app.exit(1);});
app.on('window-all-closed',()=>app.quit());
}
