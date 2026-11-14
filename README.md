# Clubhouse

Clubhouse is a local-first relationship activity tracker for advisor and internal POC conversations with professional sports clubs. It intentionally tracks relationship activity and follow-through only; Salesforce remains the source of truth for opportunities.

## Run locally

This project has no build step or third-party runtime dependencies. Python serves the app and a local SQLite database stores shared workspace state. From this folder, run:

```sh
python3 server.py
```

Then open [http://localhost:4173](http://localhost:4173). The app persists to `clubhouse.sqlite3` (ignored by Git) and keeps a browser-local copy as a fallback. Sign in with any of the demo accounts below to evaluate the Admin and regular-user views. Initial activity is marked **Sample**.

## Demo sign-in accounts

Sign in with a username and password. The sign-in screen also has buttons that fill these demo credentials for you:

| Access | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `ClubhouseAdmin26!` |
| Advisor | `avery` | `AveryClub26!` |
| Advisor | `jamie` | `JamieClub26!` |
| Internal POC | `taylor` | `TaylorClub26!` |

Use the admin account first the first time the app is run; this seeds the sample workspace.

## Included

- Directory for NFL, MLB, MLS, NHL, and NBA clubs with search and league filters.
- Club histories, meeting preparation through recent notes, planned meetings, and open next steps.
- Completed interaction logging with EXL POC and club/client POC name and designation, discussion summaries, capabilities, and assigned next steps.
- Six next-step tags: meeting scheduled, materials to be shared, NDA in progress, SOW in progress, awaiting their response, and yet to be decided.
- Next-step status updates, overdue indicators, and upcoming meeting reminders inside the app.
- Planned meeting creation, rescheduling, cancellation, and conversion into a completed interaction.
- A combined overview and SVP activity digest, with upcoming meetings above the filters, date-range metrics, league/club/advisor/POC/capability/next-step status filters, and advisor/POC grouping.
- Admin club assignment interface and regular-user scoping for assigned clubs and owned records.
- The Admin workspace focuses on review and access management; regular users get the interaction logging actions.

## Demo limitations

The local server persists one workspace on this computer and enforces club-assignment and record-ownership rules for authenticated demo accounts. Demo passwords are intentionally included for evaluation and should be changed before any real deployment. The server binds to localhost; a production deployment needs account provisioning, password reset, a shared hosted database, secure session storage, and deployment-grade authorization. The local sample club directory should be refreshed if league membership changes.
