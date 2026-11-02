# Dorf · Drone Forge

An offline ambient drone and dungeon synth instrument for Windows and Linux, with a browser option. Three drone layers, eight instrument voices, an eight-step sequencer, USB MIDI, audio recording, and a reactive mine scene.

## Download and run

Get the latest build from [GitHub Releases](https://github.com/zachwil/dorf-drone-forge/releases/latest).

| Platform | Download | Launch after extracting |
| --- | --- | --- |
| Windows x64 | `windows-x64.zip` | Double-click **Dorf Drone Forge.exe** |
| Linux x64 | `linux-x64.tar.gz` | Open a terminal in the extracted folder and run `./dorf-drone-forge` |

Extract the **entire archive** and keep its files together. Electron is included; no Node.js, Python, or separate Electron installation is needed. Linux requires a desktop with Electron-compatible system libraries and Chromium sandbox support. Windows builds are unsigned, so Windows may ask for confirmation on first launch.

Private repository downloads require repository access. `SHA256SUMS.txt` is an optional download-integrity check; it is not needed to run the app.

For source installation, browser use, or packaging, see [Setup and development](docs/DEVELOPMENT.md).

## Quick start

- **Awaken the forge** starts the drones. Shape them with presence, drift, root note, Warmth, and cavern reverb.
- Play the on-screen keyboard, a MIDI controller, or **A W S E D F T G Y H U J K**. Choose separate keyboard and sequencer instruments.
- Enable the sequencer; click steps to change notes or add rests. **Randomize each pass** creates a new pattern after step 8; **Rest bias** controls how often generated steps are silent.
- **Record** captures internal audio, typically as WebM. External synthesizer audio is not captured over MIDI.
- **Save/Load sound** exports/imports sound settings as JSON. Complete the save dialog when exporting.
- **Silence all / Escape** stops audio. Play a key or awaken the forge to resume.

Maximize the window for the full dashboard. **Pause scene** pauses the animation without stopping audio.

## MIDI and backups

Connect your controller, open **MIDI setup**, click **Connect MIDI**, grant permission, and select input and/or output.

Input supports velocity, sustain (CC64), filter/mod wheel (CC1), and ±2-semitone pitch bend. Output sends keyboard and sequencer notes on the selected channel. Input is not forwarded to output; drones stay internal.

Mappings save automatically by device name. **Save MIDI mappings** verifies the save. **Export backup** creates a separate mapping JSON file; select the destination input before using **Import backup**, which replaces its mappings. Sound presets and MIDI mappings need separate backups.

See [MIDI controller mapping](docs/MIDI-CONTROLLERS.md) to assign knobs, faders, pads, or buttons. Controllers must send standard MIDI CC or note messages; relative encoders and program changes cannot be learned.
