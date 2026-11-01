# Dorf · Drone Forge

A dependency-free browser instrument for ambient drone and dungeon synth.

Run locally with `python3 -m http.server 8765 --directory dist`, then open http://localhost:8765.

Click **Awaken the forge** to start three sustained drone layers. Set their presence and drift, choose a root, and shape the sound with low-pass filtering and cavern reverb. Enable the eight-step sequencer; click a step to cycle through the minor scale and a rest. Play the on-screen keyboard or A W S E D F T G Y H U J K.

## USB MIDI

Use a desktop browser supporting Web MIDI (Chrome or Edge recommended). MIDI requires localhost or HTTPS, permission, and an OS-recognized MIDI device. Click **Connect MIDI**, grant permission, and select input and/or output. MIDI input plays the internal polyphonic synth with velocity, sustain pedal (CC64), mod wheel mapped to filter (CC1), and ±2-semitone pitch bend. Output sends on-screen/computer-keyboard and sequencer notes on the selected channel. Input is not forwarded to output, preventing MIDI loops. Drone layers remain internal.

Record downloads the internal audio in the browser's supported format (typically WebM). External synthesizer audio is not captured over MIDI. Save/load sound exports/imports settings as JSON. Silence all stops voices and suspends the audio engine; playing a key or awakening the forge resumes it.

No account or build is needed for local use. Sound generation runs on-device. Google Fonts are optional; system fonts are used when offline. Hosted Site access is private.
