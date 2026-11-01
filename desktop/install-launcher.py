#!/usr/bin/env python3
"""Install a user application-menu entry pointing to this checkout."""
from pathlib import Path
import os
root = Path(__file__).resolve().parent.parent
data = Path(os.environ.get('XDG_DATA_HOME', Path.home() / '.local/share'))
applications = data / 'applications'
applications.mkdir(parents=True, exist_ok=True)
def quote_exec(value):
    return '"' + str(value).replace('\\', '\\\\').replace('"', '\\"').replace('`', '\\`').replace('$', '\\$').replace('%', '%%') + '"'
entry = applications / 'dorf-drone-forge.desktop'
entry.write_text('[Desktop Entry]\nType=Application\nName=Dorf Drone Forge\nComment=Dwarven ambient drone and dungeon synth\nExec=' + quote_exec(root / 'launch-dorf.sh') + '\nIcon=' + str(root / 'desktop/dorf.svg') + '\nTerminal=false\nCategories=AudioVideo;Audio;Music;\nStartupWMClass=dorf-drone-forge\n')
print('Installed:', entry)
