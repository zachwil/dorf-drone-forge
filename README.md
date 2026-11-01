# Dorf · Drone Forge

A local Linux desktop instrument for ambient drone and dungeon synth, with an optional browser version.

## Linux desktop

Run `./launch-dorf.sh` from this directory, or select **Dorf Drone Forge** in your application menu after installing the launcher with `python3 desktop/install-launcher.py`.

Uses the system Electron runtime (tested with CachyOS Electron 43). No server, login, internet connection, or npm installation is needed. Keep this project directory in place: the menu entry points to it. The app blocks remote network requests and uses system fonts. Audio and USB MIDI run locally. Recordings and sound presets open a save dialog. Press Escape to silence all audio.

The launcher searches for `electron43`, `electron`, `electron45`, or `electron44`. Install one through your distribution if needed. A system package manager update keeps the runtime up to date. To uninstall the menu entry, remove `~/.local/share/applications/dorf-drone-forge.desktop` (or the corresponding XDG_DATA_HOME location).

Desktop smoke test: `./launch-dorf.sh --smoke-test`. This opens a hidden window, checks real Web Audio note release and MIDI access, prints results, and exits. USB hardware still requires an end-to-end test with your own equipment.

## Browser version

Run locally with `python3 -m http.server 8765 --directory dist`, then open http://localhost:8765.

Click **Awaken the forge** to start three sustained drone layers. Set their presence and drift, choose a root, and shape the sound with low-pass filtering and cavern reverb. Enable the eight-step sequencer; click a step to cycle through the minor scale and a rest. Play the on-screen keyboard or A W S E D F T G Y H U J K.

## USB MIDI

Use a desktop browser supporting Web MIDI (Chrome or Edge recommended). MIDI requires localhost or HTTPS, permission, and an OS-recognized MIDI device. Click **Connect MIDI**, grant permission, and select input and/or output. MIDI input plays the internal polyphonic synth with velocity, sustain pedal (CC64), mod wheel mapped to filter (CC1), and ±2-semitone pitch bend. Output sends on-screen/computer-keyboard and sequencer notes on the selected channel. Input is not forwarded to output, preventing MIDI loops. Drone layers remain internal.

Record downloads the internal audio in the browser's supported format (typically WebM). External synthesizer audio is not captured over MIDI. Save/load sound exports/imports settings as JSON. Silence all stops voices and suspends the audio engine; playing a key or awakening the forge resumes it.

No account or build is needed for local use. Sound generation runs on-device. The interface uses system fonts. Hosted Site access is private.

## Akai MPK mini Mk2 mapping

Reload the desktop app with Ctrl+R after updating (finish any recording first). Connect MIDI, select the MPK input, then scroll to **MPK mini Mk2 · MIDI Learn**. Piano keys already play the synth. The joystick supports pitch bend and CC1 filter movement unless that CC is learned to another control.

Choose a hardware program and pad Bank A. Enable **CC**, disable **Prog Change** and **Note Repeat**, and use momentary pads. Click Learn beside K1 and turn physical knob K1; repeat for K2–K8. Click Learn beside each pad row and tap the matching pad. Keep the same program, bank and mode afterward. Mapping is stored locally by input device name, separately from sound preset files.

K1–K3: drone levels. K4: filter. K5: reverb. K6: master. K7: choir detune. K8: tempo. Pads 1–3: drone mutes. Pad 4: sequencer. Pads 5–7: sound presets. Pad 8: drone playback.

The MIDI monitor shows channel, number and value. Conflicting assignments are rejected: clear an existing row or change the controller's assignment. Note-mode pads sharing a note and channel with piano keys cannot be distinguished; use CC pad mode to avoid stealing keyboard notes. Sustain CC64 and channel-mode messages are reserved. If a pad only works every second tap, its hardware CC mode may be Toggle: change it to Momentary using the Akai editor, or learn it in note mode on a separate pad channel. Escape remains Silence all.

## Instrument voices

Above the playable keyboard, choose **Keyboard instrument** for on-screen, computer and MIDI keys, and **Sequencer instrument** for the built-in melody. Choices: Hearth flute, Deep-hall organ, Ancestor choir, Bowed iron, Mithril bell, Runestone harp, Bronze horn and Underdeep bass. Each uses different oscillator partials and envelopes. Bell and harp decay while held; other voices sustain until release. Changes apply to newly played notes. The existing drone layers retain their own sounds.

Both instrument selections are included in Save sound. Older saved sounds load with Hearth flute. Voices share the Warmth filter and cavern reverb; raise Warmth to hear more bell overtones. The selector changes internal audio only, not an external synth's program.

### Save and back up MIDI mappings

In the MIDI Learn section, **Save MIDI mappings** explicitly writes the selected controller's mappings to local storage, reads the stored value back to verify it, and shows a count and time. Automatic saving after learning still works. **Export backup** saves a separate `dorf-midi-mappings.json` file; complete the desktop save dialog. To restore, select the destination MIDI input and use **Import backup**. Import replaces that input's mappings, validates the file before changing anything, and saves locally. These files are separate from sound preset JSON. If local storage fails, the app reports it and you can still export a backup.

### Evolving sequencer

Enable **Randomize each pass** to generate a fresh pattern when playback wraps from step 8 to step 1. The current pass finishes first. **Rest bias** is the independent chance for each generated step to be silent: 0% yields no rests; 100% yields all rests. It affects both manual and automatic randomization, and does not rewrite the current pattern when adjusted. Root, tempo and instrument stay unchanged. Both options are saved with the sound; older sound files default to continuous mode off and 18% rest bias.

## The expedition visualizer

A local canvas animation below the transport shows three dwarves trekking through a mine with scrolling rock walls, supports, crystals and rails. Keyboard, MIDI and sequencer notes create colored crystals (instrument), positioned by pitch and sized by velocity, and trigger pickaxe sparks. Released notes fade with the cavern setting. Drone presence/mute changes the three lantern meters and dwarf lantern light; tempo affects travel speed, warmth affects torch glow, and reverb affects mist. Audio level adds a light pulse. The scene rests when audio is stopped. Pause scene stops animation without affecting the instrument; reduced-motion preferences start it paused. No external graphics or network access are required.

## Compact desktop layout

The main performance dashboard fits a 1280 × 720 content area without scrolling: transport, mine scene, drone mix, effects, sequencer, instruments and keyboard. Use **MIDI setup** in the header for devices, learning, and mapping backups; Close or Escape returns to the dashboard. Narrow windows or heights below 690 pixels use a scrolling layout to keep controls accessible. Maximize the window for the full dashboard.
