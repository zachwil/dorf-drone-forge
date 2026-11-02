# Dorf · Drone Forge

A local ambient drone and dungeon synth instrument for Windows, Linux, or your browser. Includes three drone layers, eight playable voices, an eight-step sequencer, USB MIDI, recording, and a reactive mine scene. No account or app build is required.

## Install and launch

Download and extract this repository (or clone it). Keep the whole project folder together. Run the commands below from that folder unless noted.

### Windows

**Portable app:** If you received a Windows release ZIP, extract the entire archive and double-click `Dorf Drone Forge.exe` inside. Keep its supporting files together. No Node.js, installation, or internet access is needed. The app is unsigned, so Windows may ask for confirmation on first launch.

**From source:**

1. Install [Node.js LTS](https://nodejs.org/) with npm included and Node added to PATH (the installer defaults).
2. Double-click `launch-dorf.cmd`. The first launch downloads Electron and needs internet access; subsequent launches work offline.
3. Optionally create a desktop or Start menu shortcut to `launch-dorf.cmd`.

If Node.js is not found, close and reopen your terminal after installation. For manual setup:

```powershell
cd desktop
npm install
npm start
```

To update Electron, close Dorf and run `npm update` from `desktop`.

To build a shareable Windows ZIP, run `npm install` then `npm run package:windows` from `desktop` on Windows. The bundle is written to `release/` in the project root and includes Electron and its license files. Move any previous output folder before rebuilding the same version.

### Linux

Install a system Electron runtime through your distribution's package manager. The launcher searches for `electron43`, `electron`, `electron45`, then `electron44`; Electron 43 was tested on CachyOS.

```bash
chmod +x launch-dorf.sh
./launch-dorf.sh
```

No Node.js/npm installation or server is needed for this workflow. After installing Electron, the app works offline. Update Electron through your system package manager.

Optional application-menu entry (requires Python 3):

```bash
python3 desktop/install-launcher.py
```

Keep the project in its current location after installing the menu entry. To remove the entry, delete `~/.local/share/applications/dorf-drone-forge.desktop`, or the equivalent under `$XDG_DATA_HOME/applications`.

### Browser (Windows or Linux)

Install Python 3, then start a local server:

```bash
# Linux
python3 -m http.server 8765 --directory dist
```

```powershell
# Windows
py -3 -m http.server 8765 --directory dist
```

Open [localhost:8765](http://localhost:8765) in Chrome or Edge for Web MIDI support. Keep the terminal open; press Ctrl+C to stop the server.

## Play and save

- Click **Awaken the forge** to start the drones. Adjust their levels and drift, root note, Warmth filter, and cavern reverb.
- Play the on-screen keyboard or **A W S E D F T G Y H U J K**. Choose separate **Keyboard instrument** and **Sequencer instrument** voices; changes affect new notes.
- Enable the sequencer and click steps to cycle through notes and a rest. **Randomize each pass** changes the pattern after step 8; **Rest bias** controls the chance of silence in generated patterns.
- **Record** captures internal audio, typically as WebM. It does not capture an external synthesizer's audio over MIDI.
- **Save/Load sound** exports/imports sound settings as JSON, including instrument and sequencer settings. Desktop exports open a save dialog.
- **Silence all** / **Escape** stops audio. Play a key or awaken the forge to resume.

Use **MIDI setup** in the header for devices, learning, and mapping backups. Maximize the window for the compact dashboard. **Pause scene** stops only the animation.

## USB MIDI

Connect an OS-recognized MIDI device, open **MIDI setup**, click **Connect MIDI**, grant permission, and select input and/or output. Browser MIDI requires localhost or HTTPS.

Input supports velocity, sustain (CC64), filter/mod wheel (CC1), and ±2-semitone pitch bend. Output sends keyboard and sequencer notes on the selected channel. Input is not forwarded to output; drones remain internal.

### Akai MPK mini Mk2

1. Select the MPK input. Choose a hardware program and pad Bank A; enable **CC**, disable **Prog Change** and **Note Repeat**, and use **Momentary** pads.
2. In **MPK mini Mk2 · MIDI Learn**, click **Learn** beside each knob/pad and move or tap the matching hardware control.
3. Keep that hardware program, bank, and mode for future sessions. Piano keys work without learning.

| Controls | Functions |
| --- | --- |
| K1–K3 | Drone levels |
| K4–K8 | Filter, reverb, master, choir detune, tempo |
| Pads 1–3 | Drone mutes |
| Pad 4 | Sequencer |
| Pads 5–7 | Sound presets |
| Pad 8 | Drone playback |

Conflicting assignments are rejected; clear the existing assignment or change the controller setting. CC64 and channel-mode messages are reserved. If a pad responds every second tap, switch it from Toggle to Momentary. Note-mode pads need a separate channel or unused notes to avoid conflicts with piano keys.

Mappings save automatically by input device name. **Save MIDI mappings** verifies local storage. Use **Export backup** to save `dorf-midi-mappings.json`; to restore, select the destination input and choose **Import backup**, which replaces that input's mappings. Mapping backups are separate from sound presets.

## Check your installation

Run the desktop smoke test from the project folder:

```powershell
# Windows PowerShell
.\launch-dorf.cmd --smoke-test
```

```bash
# Linux
./launch-dorf.sh --smoke-test
```

The hidden-window test checks audio note release, MIDI access, recording support, and dashboard layout, then prints results and a screenshot path in the OS temporary directory. Test physical MIDI input/output with your own equipment as well.
