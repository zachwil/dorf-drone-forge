// Bundle the installed Electron runtime and local app; no Node.js needed to run it.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
if(process.platform!=='win32')throw Error('Build the Windows bundle on Windows.');
const root=path.resolve(__dirname,'..');
const {version}=require('./package.json');
const name=`Dorf-Drone-Forge-${version}-windows-${process.arch}`;
const release=path.join(root,'release');
const target=path.join(release,name);
if(fs.existsSync(target))throw Error(`Output already exists: ${target}. Move it before rebuilding.`);
const runtime=path.dirname(require('electron'));
fs.mkdirSync(release,{recursive:true});
fs.cpSync(runtime,target,{recursive:true});
fs.renameSync(path.join(target,'electron.exe'),path.join(target,'Dorf Drone Forge.exe'));
const appRoot=path.join(target,'resources','app');
fs.mkdirSync(path.join(appRoot,'desktop'),{recursive:true});
fs.writeFileSync(path.join(appRoot,'package.json'),JSON.stringify({name:'dorf-drone-forge',version,main:'desktop/main.cjs'}));
for(const file of ['main.cjs','dorf.svg'])fs.copyFileSync(path.join(__dirname,file),path.join(appRoot,'desktop',file));
fs.cpSync(path.join(root,'dist'),path.join(appRoot,'dist'),{recursive:true});
fs.copyFileSync(path.join(root,'README.md'),path.join(target,'README.md'));
fs.cpSync(path.join(root,'docs'),path.join(target,'docs'),{recursive:true});
fs.writeFileSync(path.join(target,'START HERE.txt'),
  'Dorf Drone Forge\r\n\r\nExtract the entire ZIP, then double-click Dorf Drone Forge.exe.\r\nKeep all included files and folders together. No installation, Node.js, or internet is required.\r\nPress Escape to silence audio. Open MIDI setup to connect a controller.\r\n\r\nThis build is unsigned; Windows may ask you to confirm before running it.\r\n');
const archive=path.join(release,`${name}.zip`);
execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',
  'Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory($env:DORF_BUNDLE, $env:DORF_ARCHIVE, [System.IO.Compression.CompressionLevel]::Optimal, $true)'],
  {stdio:'inherit',windowsHide:true,env:{...process.env,DORF_BUNDLE:target,DORF_ARCHIVE:archive}});
console.log(`Created ${archive}`);
