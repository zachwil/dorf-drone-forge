# MIDI controller mapping

Use any MIDI controller that your operating system recognizes and that sends standard MIDI CC or note messages. You do not need eight knobs or eight pads: assign only the actions you want, using any available knobs, faders, pads, or buttons. Piano keys play without learning.

## Assign controls

1. Open **MIDI setup**, click **Connect MIDI**, and select your controller input. Learn selects an input automatically only when one connected input is available.
2. Set knobs and faders to **absolute CC (0–127)**. Set buttons and pads to **momentary CC or note** mode. Disable note repeat for triggers.
3. In **MIDI Learn**, click **Learn** beside an action, then move or press the hardware control. Release triggers between presses. **Cancel learning** exits without assigning.
4. Keep the same controller program, bank, channel, and message mode for later sessions.

| Slots | Actions | Accepted messages |
| --- | --- | --- |
| Continuous 1–3 | Drone levels | Absolute CC |
| Continuous 4–8 | Filter, reverb, master, choir drift, tempo | Absolute CC |
| Trigger 1–3 | Drone mutes | Momentary CC or note |
| Trigger 4 | Sequencer on/off | Momentary CC or note |
| Trigger 5–7 | Sound presets | Momentary CC or note |
| Trigger 8 | Drone playback | Momentary CC or note |

Slot numbers describe Dorf actions, not required hardware labels. Relative encoders, program changes, pitch bend, aftertouch, SysEx, and high-resolution CC pairs cannot be learned as such. Configure compatible controls to send ordinary 7-bit absolute CC messages. Pitch bend still works normally for playing notes.

## Conflicts and troubleshooting

Each message type, channel, and number can control only one action. Clear an existing row or change the controller assignment to resolve a conflict. CC64 and CC120/121/123 are reserved for sustain and note-management functions.

Note triggers sharing a channel and note with piano keys will capture those keys. Use CC triggers, unused notes, or a separate channel. If a trigger responds every second press, change its hardware mode from Toggle to Momentary. Learned CC1 replaces the default mod-wheel filter behavior for that message.

For an Akai MPK mini Mk2, choose a program and pad bank, enable CC pad mode, disable Prog Change and Note Repeat, and use momentary pads. Then learn controls using the same steps above.

## Save and restore

Mappings save automatically by input device name. **Save MIDI mappings** verifies local storage; **Export backup** saves `dorf-midi-mappings.json`. To restore, select the destination input and choose **Import backup**, replacing its mappings. These files are separate from sound presets. Existing MPK mappings and backups remain compatible.
