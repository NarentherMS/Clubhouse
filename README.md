# Advisor Activity Tracker

Advisor Activity Tracker is a local-first relationship activity tracker for advisor and internal POC conversations with professional sports clubs. It intentionally tracks relationship activity and follow-through only; Salesforce remains the source of truth for opportunities.

## Run locally

This project has no build step or third-party runtime dependencies. Python serves the app and a local SQLite database stores shared workspace state. From this folder, run:

```sh
python3 server.py
```

Then open [http://localhost:4173](http://localhost:4173). The app persists to `clubhouse.sqlite3` (ignored by Git) and is the source of truth for saved data. Workspace records are kept out of browser storage; any legacy browser-local workspace copy is removed on load and sign-out. Sign in with one of the local access accounts below. A fresh clone imports the included saved workspace automatically. If no database copy is included, the first Admin sign-in initializes the sample workspace for demonstration and feedback.

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

The local server persists one shared workspace in SQLite. Admin and Sub-admin can review team activity. Advisors see the companies allowed by their CME directory access and their own interaction and meeting records; record ownership controls editing. Sessions are stored server-side with idle and absolute expirations, and state updates are committed transactionally. The included sign-ins are local evaluation accounts. A real deployment still needs HTTPS termination, account provisioning and recovery, a hosted durable database plan, and scheduled off-host backups. Refresh the CME directory when league membership changes.

Create an operator-initiated database snapshot with:

```sh
python3 backup.py
```

Snapshots are written to `backups/` beside the database by default (or to `CLUBHOUSE_BACKUP_DIR` if set) and are ignored by Git. Store copies off the machine for recovery. To restore, stop the server, preserve the current database file, copy the chosen snapshot to the configured database path, and restart. For Docker, run `docker compose exec clubhouse python backup.py`; snapshots are stored in the mounted `/data/backups` folder.

## Timesheets and contract balances

Timesheets and expenses are saved directly and can be downloaded as CSV without approval. Advisors can edit and export their own entries; Admin and Sub-admin can view and export all entries. Existing expense records remain available as saved entries, including records previously marked as draft, submitted, returned, or approved. Saved timesheets deduct hours and the captured hourly rate from the contract's monthly allowance (first-month cap for the SOW start month, monthly cap thereafter). Editing an entry replaces its previous usage. Completed meeting minutes are included once, through the saved timesheet. Aggregate other-work hours spanning months are distributed equally across calendar days; meeting hours use their actual meeting dates. The month selector shows earlier balances. Negative balances indicate usage above the allowance. Legacy timesheets count toward usage and are editable by their owner.

The Overview shows planned meetings from today through the same date next month, inclusive, clamped to the last day of that month. The date range is displayed beside the count.

## CME directory access

Admin manages company access under **Workspace users → Company access**. Every existing advisor defaults to **All companies**. Choose **Selected companies** to limit an advisor to any combination of companies, including an empty selection. Several advisors can have access to the same company. Admin and Sub-admin see the whole directory; only Admin can change access.

The server filters company records, owned interactions, meetings, and assigned follow-ups, and rejects edits to companies outside an advisor's access. Restricted advisors cannot create additional companies through Other. Existing history remains stored and visible to staff; restoring company access restores the advisor's access to their history. Saved personal timesheets and expense records remain available for accounting, while new meeting-time suggestions use only accessible companies. Regular state saves cannot alter company access, and concurrent access edits are checked by revision.

## Advisor overviews

Admin and Sub-admin can open **Advisors** and select a person to see contract start and end dates, the hourly rate, key terms, recorded goals, all-time saved timesheet hours, and monthly hour and budget balances. Monthly figures reuse the same allowance calculation shown in Timesheets & expenses. That screen also shows each advisor's term start and end dates.

Companies contacted and interaction history use the interaction owner, rather than company access assignments. The history defaults to **All activity** and supports an inclusive From/To date range. That range affects only interaction history; company totals, goals, contract terms and monthly balances retain their own scope. No contract or goal values are invented for missing records. The Full contract link opens the existing contract page; editing remains Admin-only.

Admin can use **Workspace users → Company access → Selected companies → Add New Company** to create a company under **Other** and immediately grant the selected advisor access. Creation and access are saved together in one database transaction. Existing selections and the advisor's All/Selected access mode remain intact; advisors on All companies also see the new company. Duplicate names are rejected. Unsaved checkbox edits in the access form remain available for a separate Save company access action.

## Feedback-demo safeguards

Workspace reads include version fingerprints for visible interactions, meetings, and contracts. A save preserves newer untouched records, rejects conflicting edits to the same record with HTTP 409, and returns the confirmed state. Old browser tabs must reload before editing records without version metadata. Conflict messages keep the entered form values and offer Reload latest data. Meeting cancellation and initial setup wait for a confirmed server response before showing success.

Only the server-provisioned account named `admin` can initialize an empty workspace; the server does not trust a role supplied by the browser during setup. Sign-out clears in-memory account details and legacy workspace browser storage. Responses from earlier accounts are ignored after sign-out. Existing meeting records with missing or empty times remain usable in the calendar. Contract-expiry and billing-rounding policies are unchanged for this sample-data demo.

## Clone this workspace on another laptop

Clone the repository, open a terminal in the cloned folder, and run:

```sh
python3 server.py
```

Open http://localhost:4173 and use the same account details. On its first run, the server automatically imports `workspace-data.sqlite3`, which contains the accounts and saved workspace, including interactions, meetings, contracts, company access, timesheets and expenses. Existing local databases are kept.

Before committing newer saved activity on a laptop, run:

```sh
python3 sync_workspace.py
```

Then commit and push through GitHub Desktop. Git carries the snapshot from that commit; it does not synchronize edits automatically while the app is running.
