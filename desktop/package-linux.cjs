// Build on Linux so runtime permissions and symlinks survive in the archive.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
if(process.platform!=='linux')throw Error('Build the Linux bundle on Linux.');
const root=path.resolve(__dirname,'..');
const {version}=require('./package.json');
const name=`Dorf-Drone-Forge-${version}-linux-${process.arch}`;
const release=path.join(root,'release');
const target=path.join(release,name);
if(fs.existsSync(target))throw Error(`Output already exists: ${target}. Move it before rebuilding.`);
fs.mkdirSync(release,{recursive:true});
fs.cpSync(path.dirname(require('electron')),target,{recursive:true,verbatimSymlinks:true});
fs.renameSync(path.join(target,'electron'),path.join(target,'dorf-drone-forge'));
const appRoot=path.join(target,'resources','app');
fs.mkdirSync(path.join(appRoot,'desktop'),{recursive:true});
fs.writeFileSync(path.join(appRoot,'package.json'),JSON.stringify({name:'dorf-drone-forge',version,main:'desktop/main.cjs'}));
for(const file of ['main.cjs','dorf.svg'])fs.copyFileSync(path.join(__dirname,file),path.join(appRoot,'desktop',file));
fs.cpSync(path.join(root,'dist'),path.join(appRoot,'dist'),{recursive:true});
fs.copyFileSync(path.join(root,'README.md'),path.join(target,'README.md'));
fs.writeFileSync(path.join(target,'START HERE.txt'),
  'Dorf Drone Forge\n\nExtract the entire archive, then run ./dorf-drone-forge from its folder.\nKeep all included files together. Node.js and a system Electron install are not required.\nRequires an x64 Linux desktop with Electron-compatible system libraries.\nPress Escape to silence audio. Open MIDI setup to connect a controller.\n');
const archive=path.join(release,`${name}.tar.gz`);
execFileSync('tar',['-czf',archive,'-C',release,name],{stdio:'inherit'});
console.log(`Created ${archive}`);
