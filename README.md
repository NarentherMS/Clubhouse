# Clubhouse

Clubhouse is a local-first relationship activity tracker for advisor and internal POC conversations with professional sports clubs. It intentionally tracks relationship activity and follow-through only; Salesforce remains the source of truth for opportunities.

## Run locally

This project has no build step or third-party runtime dependencies. Python serves the app and a local SQLite database stores shared workspace state. From this folder, run:

```sh
python3 server.py
```

Then open [http://localhost:4173](http://localhost:4173). The app persists to `clubhouse.sqlite3` (ignored by Git) and keeps a browser-local copy as a fallback. Sign in with one of the local access accounts below. The workspace starts with the club directory and no interactions or meetings; teams add their real activity as it happens.

## Run in a container

Docker is an optional portable run path. From the project folder:

```sh
docker compose up --build
```

Then open [http://localhost:4173](http://localhost:4173). The named `clubhouse_data` volume keeps the SQLite workspace between container restarts. Stop with `Ctrl+C`; use `docker compose down` to stop and remove the container. Keep the named volume to retain saved workspace data.

## Shared hosting notes

The server can run behind a TLS-terminating reverse proxy. Configure `CLUBHOUSE_HOST=0.0.0.0`, `CLUBHOUSE_PORT`, and `CLUBHOUSE_DB_PATH` for the host environment, mount durable storage at the database path, and set `CLUBHOUSE_COOKIE_SECURE=1` when HTTPS is enabled. The container listens on port 4173 and includes a `/healthz` endpoint. Do not use an ephemeral filesystem for the SQLite database. For larger deployments, replace the local SQLite store with a managed relational database and connect a managed identity provider.

## Local sign-in accounts

Enter a username and password to sign in to the local workspace:

| Access | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `ClubhouseAdmin26!` |
| Advisor | `avery` | `AveryClub26!` |
| Advisor | `jamie` | `JamieClub26!` |
| Internal POC | `taylor` | `TaylorClub26!` |

Use the admin account first the first time the app is run; this initializes the workspace.

## Included

- Directory for NFL, MLB, MLS, NHL, and NBA clubs with search and league filters.
- Club histories, meeting preparation through recent notes, planned meetings, and open next steps.
- Completed interaction logging with EXL POC and club/client POC name and designation, discussion summaries, capabilities, and assigned next steps.
- Six next-step tags: meeting scheduled, materials to be shared, NDA in progress, SOW in progress, awaiting their response, and yet to be decided.
- Next-step status updates, overdue indicators, and upcoming meeting reminders inside the app.
- Planned meeting creation, rescheduling, cancellation, and conversion into a completed interaction.
- A combined overview and SVP activity digest, with upcoming meetings above the filters, date-range metrics, league/club/advisor/POC/capability/next-step status filters, and advisor/POC grouping.
- Shared club access for all advisors and POCs, with ownership checks for editing interactions and meetings.
- The Admin workspace provides a cross-team activity view and workspace user roles; regular users can log interactions and meetings.

## Deployment notes

The local server persists one shared workspace in SQLite. Every signed-in advisor and POC can view all clubs and club histories; record ownership controls who can edit interactions and planned meetings. Sessions are stored server-side with idle and absolute expirations, and state updates are committed transactionally. The included sign-ins are local evaluation accounts. A real deployment still needs HTTPS termination, account provisioning and recovery, a hosted durable database plan, and scheduled off-host backups. Refresh the club directory when league membership changes.

Create an operator-initiated database snapshot with:

```sh
python3 backup.py
```

Snapshots are written to `backups/` beside the database by default (or to `CLUBHOUSE_BACKUP_DIR` if set) and are ignored by Git. Store copies off the machine for recovery. To restore, stop the server, preserve the current database file, copy the chosen snapshot to the configured database path, and restart. For Docker, run `docker compose exec clubhouse python backup.py`; snapshots are stored in the mounted `/data/backups` folder.
