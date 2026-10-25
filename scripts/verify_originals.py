"""Verify all original archives and extracted legacy code against their manifest."""
from pathlib import Path
from zipfile import ZipFile
import hashlib
import json

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'originals/manifest.json').read_text())
for entry in manifest['archives']:
    file = root / entry['path']
    assert hashlib.sha256(file.read_bytes()).hexdigest() == entry['sha256'], file
for entry in manifest['code']:
    file = root / entry['path']
    data = file.read_bytes()
    assert hashlib.sha256(data).hexdigest() == entry['sha256'], file
    with ZipFile(root / entry['archive']) as archive:
        assert data == archive.read(entry['member']), file
print(f"Verified {len(manifest['archives'])} originals and {len(manifest['code'])} legacy code files.")
