"""Extract preserved report projects, without overwriting different local content."""
from pathlib import Path
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
for number in (1, 2, 4):
    target = root / f'legacy/trabalho{number}/reports'
    with ZipFile(root / f'originals/relatorio_trabalho{number}.zip') as archive:
        for member in archive.infolist():
            if member.is_dir():
                continue
            dest = target / member.filename
            if not dest.resolve().is_relative_to(target.resolve()):
                raise ValueError(f'Unsafe archive path: {member.filename}')
            data = archive.read(member)
            if dest.exists() and dest.read_bytes() != data:
                raise FileExistsError(f'Refusing to overwrite: {dest}')
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
    print(target)
