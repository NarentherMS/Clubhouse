"""Create a consistent SQLite snapshot of the Clubhouse workspace."""
from datetime import datetime, timezone
from pathlib import Path
import os
import sqlite3

from server import DB_PATH


def main():
    if not DB_PATH.exists():
        raise SystemExit(f"Workspace database not found: {DB_PATH}")

    backup_dir = Path(os.environ.get("CLUBHOUSE_BACKUP_DIR", DB_PATH.parent / "backups")).expanduser()
    backup_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    target = backup_dir / f"clubhouse-{stamp}.sqlite3"

    with sqlite3.connect(f"{DB_PATH.resolve().as_uri()}?mode=ro", uri=True) as source:
        with sqlite3.connect(target) as snapshot:
            source.backup(snapshot)
    try:
        os.chmod(target, 0o600)
    except OSError:
        pass
    print(f"Created workspace snapshot: {target}")


if __name__ == "__main__":
    main()
