"""Update the repository's portable database copy before committing saved activity."""
from contextlib import closing
from pathlib import Path
import os
import sqlite3
import tempfile

from server import DB_PATH, ROOT


def snapshot_workspace(source_path=DB_PATH, destination_path=ROOT / 'workspace-data.sqlite3'):
    source_path, destination_path = Path(source_path), Path(destination_path)
    if not source_path.exists():
        raise ValueError(f'Workspace database not found: {source_path}')
    if source_path.resolve() == destination_path.resolve():
        raise ValueError('The portable copy must be separate from the running database')
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(prefix='.workspace-export-', suffix='.sqlite3', dir=destination_path.parent)
    os.close(descriptor)
    temporary = Path(temporary_name)
    try:
        with closing(sqlite3.connect(source_path.resolve().as_uri() + '?mode=ro', uri=True)) as source:
            with closing(sqlite3.connect(temporary)) as destination:
                source.backup(destination)
                destination.execute('PRAGMA journal_mode=DELETE')
                # Browser sign-ins are device-specific; account credentials and workspace records stay.
                if destination.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='sessions'").fetchone():
                    destination.execute('DELETE FROM sessions')
                destination.commit()
                if destination.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                    raise ValueError('The portable database copy failed its integrity check')
        os.chmod(temporary, 0o600)
        os.replace(temporary, destination_path)
    finally:
        temporary.unlink(missing_ok=True)
    return destination_path


if __name__ == '__main__':
    print(f'Updated portable workspace: {snapshot_workspace()}')
