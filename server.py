"""Local development server for Clubhouse. Uses only the Python standard library."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from pathlib import Path
import json
import sqlite3
import hashlib
import hmac
import secrets
from http.cookies import SimpleCookie

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "clubhouse.sqlite3"
SESSIONS = {}
DEMO_ACCOUNTS = [
    ("admin", "ClubhouseAdmin26!", "u-admin"),
    ("avery", "AveryClub26!", "u-avery"),
    ("jamie", "JamieClub26!", "u-jamie"),
    ("taylor", "TaylorClub26!", "u-taylor"),
]

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL)")
    conn.execute("CREATE TABLE IF NOT EXISTS accounts (username TEXT PRIMARY KEY, user_id TEXT NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL)")
    return conn

def password_hash(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 180000).hex()

def ensure_accounts():
    with connect() as conn:
        count = conn.execute("SELECT COUNT(*) FROM accounts").fetchone()[0]
        if count == 0:
            for username, password, user_id in DEMO_ACCOUNTS:
                salt = secrets.token_hex(16)
                conn.execute("INSERT INTO accounts(username,user_id,salt,password_hash) VALUES(?,?,?,?)",
                             (username, user_id, salt, password_hash(password, salt)))

def session_actor(handler):
    cookie = SimpleCookie(handler.headers.get("Cookie", ""))
    morsel = cookie.get("clubhouse_session")
    return SESSIONS.get(morsel.value) if morsel else None

def account_user(username):
    with connect() as conn:
        row = conn.execute("SELECT user_id,salt,password_hash FROM accounts WHERE username=?", (username,)).fetchone()
    return row

def get_state():
    with connect() as conn:
        row = conn.execute("SELECT payload FROM app_state WHERE id=1").fetchone()
    return json.loads(row[0]) if row else None

def put_state(state):
    with connect() as conn:
        conn.execute("INSERT INTO app_state(id,payload) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload", (json.dumps(state),))

def visible_state(state, actor):
    result = json.loads(json.dumps(state))
    person = next((u for u in state.get("users", []) if u["id"] == actor), None)
    if not person:
        raise ValueError("Unknown demo user")
    result["activeUser"] = actor
    # Contract information is private to its owner unless the signed-in user is an admin.
    if person.get("role") != "Admin":
        contracts = result.get("contracts", {})
        result["contracts"] = {actor: contracts[actor]} if actor in contracts else {}
    # All signed-in users share the club directory and club history. Remove
    # legacy assignment metadata so old demo data cannot imply restrictions.
    for club in result.get("clubs", []):
        club.pop("assignments", None)
    return result

def same(a, b):
    return json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True)

def validate_and_merge(old, incoming, actor):
    users = {u["id"]: u for u in old.get("users", [])}
    person = users.get(actor)
    if not person:
        raise ValueError("Unknown demo user")
    if person.get("role") == "Admin":
        merged = incoming
        merged["activeUser"] = actor
        merged["clubs"] = [{k: v for k, v in club.items() if k != "assignments"} for club in incoming.get("clubs", [])]
        return merged

    club_ids = {c["id"] for c in old.get("clubs", [])}
    for club in incoming.get("clubs", []):
        if club["id"] not in club_ids:
            raise ValueError("Unknown club")
    if not same(incoming.get("users", []), old.get("users", [])):
        raise ValueError("Only an admin can manage users")

    merged = json.loads(json.dumps(old))
    merged["clubs"] = [{k: v for k, v in club.items() if k != "assignments"} for club in old.get("clubs", [])]
    old_interactions = {x["id"]: x for x in old.get("interactions", [])}
    merged_interactions = {x["id"]: x for x in old.get("interactions", [])}
    for item in incoming.get("interactions", []):
        if item.get("clubId") not in club_ids:
            raise ValueError("Unknown club")
        previous = old_interactions.get(item["id"])
        if previous is None:
            if item.get("owner") != actor:
                raise ValueError("You can only create interactions for yourself")
            merged_interactions[item["id"]] = item
        elif previous.get("owner") == actor:
            if item.get("owner") != actor:
                raise ValueError("Interaction ownership cannot be transferred")
            merged_interactions[item["id"]] = item
        else:
            before = json.loads(json.dumps(previous))
            after = json.loads(json.dumps(item))
            before_f = {f["id"]: f for f in before.get("followups", [])}
            after_f = {f["id"]: f for f in after.get("followups", [])}
            for fid, follow in before_f.items():
                changed = after_f.get(fid)
                if changed and changed.get("owner") == actor:
                    if changed.get("status") not in {"Open", "Done", "Canceled"}:
                        raise ValueError("Invalid follow-up status")
                    follow["status"] = changed.get("status")
                    changed["status"] = before_f[fid].get("status")
            if not same(before, after):
                raise ValueError("You can only edit interactions you created")
            merged_interactions[item["id"]] = item
    merged["interactions"] = list(merged_interactions.values())

    old_meetings = {m["id"]: m for m in old.get("meetings", [])}
    merged_meetings = {m["id"]: m for m in old.get("meetings", [])}
    for item in incoming.get("meetings", []):
        if item.get("clubId") not in club_ids:
            raise ValueError("Unknown club")
        previous = old_meetings.get(item["id"])
        if previous is None:
            if item.get("owner") != actor:
                raise ValueError("You can only create meetings for yourself")
        else:
            if previous.get("owner") != actor and not same(previous, item):
                raise ValueError("You can only change meetings you created")
            if item.get("owner") != previous.get("owner"):
                raise ValueError("Meeting ownership cannot be transferred")
        if item.get("status") not in {"Planned", "Completed", "Canceled"}:
            raise ValueError("Invalid meeting status")
        merged_meetings[item["id"]] = item
    merged["meetings"] = list(merged_meetings.values())
    merged["activeUser"] = actor
    return merged

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        ensure_accounts()
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print("[clubhouse] " + fmt % args)

    def send_json(self, status, payload, headers=None):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/api/session":
            actor = session_actor(self)
            if not actor:
                return self.send_json(200, {"authenticated": False})
            state = get_state()
            return self.send_json(200, {"authenticated": True, "actor": actor, "state": visible_state(state, actor) if state else None})
        if url.path == "/api/state":
            actor = session_actor(self)
            if not actor:
                return self.send_json(401, {"error": "Sign in to continue"})
            state = get_state()
            if state is None:
                return self.send_json(200, {"state": None})
            try:
                return self.send_json(200, {"state": visible_state(state, actor)})
            except ValueError as exc:
                return self.send_json(403, {"error": str(exc)})
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/login":
            try:
                data = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))))
                row = account_user(data.get("username", "").strip().lower())
                if not row or not hmac.compare_digest(password_hash(data.get("password", ""), row[1]), row[2]):
                    return self.send_json(401, {"error": "Username or password is incorrect"})
                token = secrets.token_urlsafe(32)
                SESSIONS[token] = row[0]
                state = get_state()
                return self.send_json(200, {"authenticated": True, "actor": row[0], "state": visible_state(state, row[0]) if state else None},
                                      {"Set-Cookie": f"clubhouse_session={token}; HttpOnly; SameSite=Lax; Path=/"})
            except (ValueError, KeyError, TypeError, json.JSONDecodeError):
                return self.send_json(400, {"error": "Invalid sign-in request"})
        if path == "/api/logout":
            token_cookie = SimpleCookie(self.headers.get("Cookie", "")).get("clubhouse_session")
            if token_cookie:
                SESSIONS.pop(token_cookie.value, None)
            return self.send_json(200, {"ok": True}, {"Set-Cookie": "clubhouse_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"})
        if path != "/api/state":
            return self.send_json(404, {"error": "Not found"})
        try:
            actor = session_actor(self)
            if not actor:
                return self.send_json(401, {"error": "Sign in to continue"})
            data = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))))
            incoming = data["state"]
            incoming["activeUser"] = actor
            old = get_state()
            if old is None:
                if not any(u.get("id") == actor and u.get("role") == "Admin" for u in incoming.get("users", [])):
                    raise ValueError("Initialize the demo workspace as an admin")
                merged = incoming
            else:
                merged = validate_and_merge(old, incoming, actor)
            put_state(merged)
            return self.send_json(200, {"ok": True})
        except (ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
            return self.send_json(403, {"error": str(exc)})

if __name__ == "__main__":
    print("Clubhouse listening at http://localhost:4173")
    ThreadingHTTPServer(("127.0.0.1", 4173), Handler).serve_forever()
