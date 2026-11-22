"""Build an installable Sauce mod ZIP from committed files, never local captures."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent


def git(*args):
    return subprocess.check_output(['git', '-c', f'safe.directory={ROOT.as_posix()}', *args], cwd=ROOT)


def build(ref='HEAD'):
    commit = git('rev-parse', '--verify', f'{ref}^{{commit}}').decode().strip()
    manifest = json.loads(git('show', f'{commit}:manifest.json'))
    version = manifest['version']
    if not re.fullmatch(r'\d+\.\d+\.\d+', version) or manifest['id'] != 'cr45h-hud':
        raise ValueError('Expected the cr45h-hud manifest with a stable semantic version')
    files = git('ls-tree', '-r', '--name-only', '-z', commit).decode().split('\0')
    include = {'manifest.json', 'README.md', 'CHANGELOG.md', 'LICENSE.txt'}
    files = sorted(p for p in files if p in include or p.startswith(('pages/', 'images/')))
    required = include | {window['file'] for window in manifest['windows']}
    if not required.issubset(files):
        raise ValueError(f'Missing package files: {required - set(files)}')
    destination = ROOT / 'dist' / f'cr45h-hud-{version}.zip'
    destination.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for path in files:
            info = zipfile.ZipInfo(f'cr45h-hud/{path}', date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, git('show', f'{commit}:{path}'))
    with zipfile.ZipFile(destination) as archive:
        if archive.testzip() is not None:
            raise ValueError('Archive integrity check failed')
        packed = json.loads(archive.read('cr45h-hud/manifest.json'))
        if packed['version'] != version or len(archive.namelist()) != len(files):
            raise ValueError('Archive manifest or contents did not match')
    checksum = hashlib.sha256(destination.read_bytes()).hexdigest()
    destination.with_suffix('.zip.sha256').write_text(f'{checksum}  {destination.name}\n', encoding='utf-8')
    print(f'Built {destination.name} from {commit[:12]}: {len(files)} files, {destination.stat().st_size:,} bytes')
    print(f'SHA256: {checksum}')
    return destination


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ref', default='HEAD', help='Committed Git ref to package (default: HEAD)')
    build(parser.parse_args().ref)
