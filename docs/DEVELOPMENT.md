# Setup and development

Download and extract the repository, or clone it. Run commands from the project root unless noted. Keep the whole project folder together.

## Windows from source

1. Install [Node.js LTS](https://nodejs.org/) with npm and PATH support (installer defaults).
2. Double-click `launch-dorf.cmd`. First launch needs internet to download Electron; later launches work offline.
3. Optionally create a shortcut to the launcher. If Node is not found after installation, reopen your terminal.

Manual setup:

```powershell
cd desktop
npm ci
npm start
```

To update Electron, close Dorf and run `npm update` from `desktop`.

## Linux from source

Install Electron using your distribution's package manager. The launcher searches for `electron43`, `electron`, `electron45`, then `electron44`. Electron 43 was tested on CachyOS.

```bash
chmod +x launch-dorf.sh
./launch-dorf.sh
```

This workflow needs no Node.js/npm or server and works offline after Electron is installed. Update Electron through your package manager.

Optional application-menu entry (requires Python 3):

```bash
python3 desktop/install-launcher.py
```

Keep the project in place afterward. To uninstall the menu entry, delete `~/.local/share/applications/dorf-drone-forge.desktop`, or the equivalent under `$XDG_DATA_HOME/applications`.

## Browser version

Install Python 3 and start a server from the project root:

```bash
# Linux
python3 -m http.server 8765 --directory dist
```

```powershell
# Windows
py -3 -m http.server 8765 --directory dist
```

Open [localhost:8765](http://localhost:8765) in Chrome or Edge for Web MIDI support. Keep the terminal open; Ctrl+C stops the server. Browser MIDI requires localhost or HTTPS, permission, and an OS-recognized device.

## Verification

From the project root:

```powershell
# Windows source checkout
.\launch-dorf.cmd --smoke-test
```

```bash
# Linux source checkout
./launch-dorf.sh --smoke-test
```

For a packaged app, run its executable with `--smoke-test`. The hidden-window test checks audio note release, MIDI access, recording support, and dashboard layout, then prints results and a screenshot path in the OS temporary directory. Test physical MIDI hardware separately.

Run the audio/MIDI logic checks with `node tests/midi.cjs`.

## Build and publish

On the target operating system, run these commands from `desktop`:

```bash
npm ci
npm run package:windows  # Windows
# or
npm run package:linux    # Linux
```

Archives appear in the project's `release/` folder with Electron and its license files. Move any existing output folder before rebuilding the same version.

For a GitHub release, update the version in `desktop/package.json` and its lockfile, commit the changes, and push a matching version tag. The Desktop release workflow builds and smoke-tests Windows and Linux x64 packages, then publishes both archives and SHA256 checksums. Linux CI reports MIDI access as unavailable when its ALSA device is absent; the normal smoke test still requires MIDI access.
