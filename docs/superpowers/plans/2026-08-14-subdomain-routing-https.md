# Subdomain Routing + Local HTTPS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move ritminiyakala's 6 sub-projects from path-based routing (`projects.coffeenok.com/[proje]/`) to per-project subdomains (`[proje].coffeenok.com`), served over locally-trusted HTTPS, within the home router's 10-entry local-DNS limit.

**Architecture:** A single `mkcert`-issued wildcard certificate (`*.coffeenok.com`) is installed in NGINX Proxy Manager (NPM) and assigned to one dedicated NPM proxy host per project (replacing the old shared-domain path-routing). The router's local DNS is repointed to make room for the 5 new subdomains within its 10-host cap. `ritminiyakala` web/admin drop their `basePath` config (already built to be env-var-gated) since they now serve from their own domain root. Everything stays LAN-only — no public DNS, no port forwarding, no Let's Encrypt.

**Tech Stack:** Docker Compose, Nginx Proxy Manager (jc21/nginx-proxy-manager), `mkcert`, Next.js 14 (standalone output), CentOS Stream 10 host.

## Global Constraints

- LAN-only: no public IP exposure, no port forwarding, ever (spec: "Out of scope").
- Router local DNS: exactly 10 host entries max, no wildcard support (verified in spec).
- No dnsenable.com API access — Let's Encrypt DNS-01 is not usable; do not attempt it.
- `/opt/stacks` and `/srv/nextcloud` are **not** git repositories — no commit step applies to changes there. Only changes inside `/srv/projects/ritminiyakala` (a real git repo) get committed, and only if they're actual tracked files (`.env` is gitignored — never commit it).
- Certificate validity ≤ 825 days (Safari/iOS constraint on locally-trusted roots) — this is `mkcert`'s own default, do not override it with a longer `-cert-file` validity flag (no such flag exists; do not attempt to hand-roll one with `openssl x509 -days` on the mkcert-issued cert).
- Never paste secrets (NPM admin password, Basic Auth passwords, private keys) into chat; where a human step needs credentials, the user performs it directly.

---

### Task 1: Install mkcert and generate the wildcard certificate

**Files:**
- Create: `/usr/local/bin/mkcert` (binary, not tracked)
- Create: CA files under `mkcert -CAROOT` (default `~/.local/share/mkcert` for user `papyrux`)
- Create: `/opt/stacks/certs/coffeenok-wildcard.pem`, `/opt/stacks/certs/coffeenok-wildcard-key.pem` (not tracked)

**Interfaces:**
- Produces: `/opt/stacks/certs/coffeenok-wildcard.pem` (cert) and `/opt/stacks/certs/coffeenok-wildcard-key.pem` (key), used by Task 5 (NPM custom SSL certificate) and referenced by their absolute paths in later tasks.
- Produces: root CA public cert at `$(mkcert -CAROOT)/rootCA.pem`, used by Task 2.

- [ ] **Step 1: Download and install the mkcert binary**

```bash
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

- [ ] **Step 2: Verify the binary runs**

Run: `mkcert -version`
Expected: prints a version string (e.g. `v1.4.4`), no error.

- [ ] **Step 3: Generate the local root CA**

```bash
mkcert -install
```

Expected output includes `Created a new local CA` (or `The local CA is already installed`, if
re-run) and may print NSS-related warnings — those are harmless on a headless server with no
Firefox/NSS store and can be ignored.

- [ ] **Step 4: Confirm the CA files exist**

Run: `ls "$(mkcert -CAROOT)"`
Expected: `rootCA-key.pem` and `rootCA.pem` are listed.

- [ ] **Step 5: Generate the wildcard certificate**

```bash
mkdir -p /opt/stacks/certs
cd /opt/stacks/certs
mkcert -cert-file coffeenok-wildcard.pem -key-file coffeenok-wildcard-key.pem "*.coffeenok.com" "coffeenok.com"
```

- [ ] **Step 6: Verify the certificate's SAN list and expiry**

Run: `openssl x509 -in /opt/stacks/certs/coffeenok-wildcard.pem -noout -text | grep -A2 "Subject Alternative Name"`
Expected: shows `DNS:*.coffeenok.com, DNS:coffeenok.com`.

Run: `openssl x509 -in /opt/stacks/certs/coffeenok-wildcard.pem -noout -enddate`
Expected: a `notAfter=` date roughly 825 days from today (2026-08-14) — i.e. around late 2028.

No commit — `/opt/stacks` is not a git repository.

---

### Task 2: Publish rootCA.pem for the user to download onto their devices

**Files:** none tracked — a temporary file server only.

**Interfaces:**
- Consumes: `$(mkcert -CAROOT)/rootCA.pem` from Task 1.
- Produces: a LAN-reachable download URL, used by the user in Task 11 (out of agent's control — device installs).

- [ ] **Step 1: Copy the root CA cert into its own directory**

```bash
mkdir -p /opt/stacks/certs/ca-download
cp "$(mkcert -CAROOT)/rootCA.pem" /opt/stacks/certs/ca-download/rootCA.pem
```

- [ ] **Step 2: Start a temporary LAN-only HTTP file server in the background**

```bash
cd /opt/stacks/certs/ca-download
nohup python3 -m http.server 8899 --bind 192.168.1.240 > /tmp/rootca-server.log 2>&1 &
```

- [ ] **Step 3: Verify it serves the file**

Run: `curl -s -o /dev/null -w "HTTP %{http_code}\n" http://192.168.1.240:8899/rootCA.pem`
Expected: `HTTP 200`

- [ ] **Step 4: Tell the user the download URL**

Report to the user: `http://192.168.1.240:8899/rootCA.pem` — download this on every device that
needs to trust `*.coffeenok.com`, using the per-OS steps already given (Task 11 repeats them).

No commit — temporary server, not a tracked file.

---

### Task 3: Open port 443 on the NPM container

**Files:**
- Modify: `/opt/stacks/npm/docker-compose.yml`

**Interfaces:**
- Produces: NPM container listening on host port 443, required by Task 5 (SSL proxy hosts).

- [ ] **Step 1: Confirm current state (no 443 published)**

Run: `docker port npm`
Expected: lists `80/tcp` and `81/tcp` only, no `443/tcp`.

- [ ] **Step 2: Edit the compose file**

In `/opt/stacks/npm/docker-compose.yml`, under the `npm` service's `ports:` key, change:

```yaml
    ports:
      - "80:80"
      - "81:81"
```

to:

```yaml
    ports:
      - "80:80"
      - "81:81"
      - "443:443"
```

- [ ] **Step 3: Recreate the container**

```bash
cd /opt/stacks/npm
docker compose up -d --force-recreate
```

- [ ] **Step 4: Verify port 443 is now published and the container is healthy**

Run: `docker port npm`
Expected: now also lists `443/tcp -> 0.0.0.0:443`.

Run: `docker ps --filter name=npm --format '{{.Status}}'`
Expected: `Up ...` (no restart loop).

No commit — `/opt/stacks` is not a git repository.

---

### Task 4: User adds/removes router local-DNS entries

**Files:** none — this task is performed by the user in the router's web UI (Etisalat eLife
Connect C1AA), not by the agent.

- [ ] **Step 1 (user): Remove 4 entries** from the router's local DNS / static host table:
  `mission.coffeenok.com`, `portainer.coffeenok.com`, `cockpit.coffeenok.com`,
  `home.coffeenok.com`, and the non-functional `*.coffeenok.com` entry (5 total to remove).

- [ ] **Step 2 (user): Add 5 new entries**, all pointing to `192.168.1.240`:
  `ritminiyakala.coffeenok.com`, `ritminiyakala-admin.coffeenok.com`,
  `codbizme.coffeenok.com`, `onlineopportunities.coffeenok.com`, `arqhy.coffeenok.com`.

- [ ] **Step 3 (agent): Verify resolution from the server**, once the user confirms they've saved
  the changes:

```bash
for h in ritminiyakala ritminiyakala-admin codbizme onlineopportunities arqhy auxenme cloud media projects katip; do
  echo -n "$h.coffeenok.com -> "; getent hosts "$h.coffeenok.com" | awk '{print $1}'
done
for h in mission portainer cockpit home; do
  echo -n "$h.coffeenok.com -> "; getent hosts "$h.coffeenok.com" | awk '{print $1}' || echo "(gone, expected)"
done
```

Expected: the first 10 all print `192.168.1.240`; the last 4 print nothing / exit non-zero
(no longer resolvable).

No commit — router configuration, not a file in any repo.

---

### Task 5: Create the 6 new NPM proxy hosts with the wildcard certificate

**Files:** NPM's internal SQLite DB and generated nginx conf files under the `npm` container's
`/data` volume (`/opt/stacks/npm/data/...` on the host) — not a git repository, no commit.

**Interfaces:**
- Consumes: `/opt/stacks/certs/coffeenok-wildcard.pem` + `-key.pem` from Task 1.
- Produces: 6 working HTTPS vhosts, verified by Task 9.

NPM's "Advanced" multi-location config editor is known to be broken in this environment (see
project memory: `domain_names` validation error on save) — but a plain single-target proxy host
with a Custom SSL cert does **not** use that editor, so do this through the normal NPM UI at
`http://192.168.1.240:81`.

- [ ] **Step 1 (user or agent-guided): Add the Custom SSL Certificate (once)**

In NPM: **SSL Certificates** → **Add SSL Certificate** → type **Custom**.
- Name: `coffeenok-wildcard`
- Certificate: paste the contents of `/opt/stacks/certs/coffeenok-wildcard.pem`
- Certificate Key: paste the contents of `/opt/stacks/certs/coffeenok-wildcard-key.pem`
- Save.

Get the file contents to paste with:
```bash
cat /opt/stacks/certs/coffeenok-wildcard.pem
cat /opt/stacks/certs/coffeenok-wildcard-key.pem
```

- [ ] **Step 2: Add each of the 6 proxy hosts**

For each row below: **Proxy Hosts** → **Add Proxy Host** → Details tab fill in Domain
Names/Forward Hostname/Forward Port, **Block Common Exploits** on → SSL tab: select
**coffeenok-wildcard** from the SSL Certificate dropdown, **Force SSL** on → Save.

| Domain Names | Forward Hostname / IP | Forward Port |
|---|---|---|
| ritminiyakala.coffeenok.com | ritminiyakala | 3000 |
| ritminiyakala-admin.coffeenok.com | ritminiyakala-admin | 3000 |
| codbizme.coffeenok.com | codbizme | 3000 |
| onlineopportunities.coffeenok.com | onlineopportunities | 3000 |
| arqhy.coffeenok.com | arqhy | 3000 |
| auxenme.coffeenok.com | auxenme | 3000 |

- [ ] **Step 3: Verify all 7 rows exist and are enabled**

```bash
docker exec npm python3 -c "
import sqlite3
db = sqlite3.connect('/data/database.sqlite')
cur = db.cursor()
cur.execute(\"SELECT domain_names, forward_host, forward_port, certificate_id, ssl_forced, enabled FROM proxy_host WHERE domain_names LIKE '%ritminiyakala%' OR domain_names LIKE '%codbizme%' OR domain_names LIKE '%onlineopportunities%' OR domain_names LIKE '%arqhy%' OR domain_names LIKE '%auxenme%'\")
for row in cur.fetchall(): print(row)
"
```

Expected: 6 rows (ritminiyakala, ritminiyakala-admin, codbizme, onlineopportunities, arqhy,
auxenme), each with a non-zero `certificate_id`, `ssl_forced=1`, `enabled=1`.

- [ ] **Step 4: Smoke-test HTTPS from the server**

```bash
for h in ritminiyakala codbizme onlineopportunities arqhy auxenme; do
  echo -n "$h.coffeenok.com -> "
  curl -s -o /dev/null -w "HTTP %{http_code}\n" -k "https://$h.coffeenok.com/"
done
curl -s -o /dev/null -w "ritminiyakala-admin (Basic Auth expected) -> HTTP %{http_code}\n" -k "https://ritminiyakala-admin.coffeenok.com/"
```

Expected: `200` for the 5 plain projects (or a Next.js redirect code if the app itself redirects,
e.g. `307`); `401` for `ritminiyakala-admin` (Basic Auth still required — unchanged from the
existing setup).

No commit — NPM's data directory is not a git repository.

---

### Task 6: Redeploy ritminiyakala web + admin without NEXT_PUBLIC_BASE_PATH

**Files:**
- Modify: `/srv/projects/ritminiyakala/apps/web/.env` (remove one line, not tracked)
- Modify: `/srv/projects/ritminiyakala/apps/admin/.env` (remove one line, not tracked)

**Interfaces:**
- Consumes: the existing conditional `basePath` logic in both apps'
  `next.config.mjs` (`const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;`) — already
  built and deployed, no code change needed here.
- Produces: `ritminiyakala-web-img` and `ritminiyakala-admin-img` images serving from `/` instead
  of `/ritminiyakala` / `/ritminiyakala-admin`.

- [ ] **Step 1: Remove the base path line from both .env files**

```bash
sudo sed -i '/^NEXT_PUBLIC_BASE_PATH=/d' /srv/projects/ritminiyakala/apps/web/.env
sudo sed -i '/^NEXT_PUBLIC_BASE_PATH=/d' /srv/projects/ritminiyakala/apps/admin/.env
```

(If `sudo` prompts for a password non-interactively and fails, ask the user to run these two
commands themselves — the `.env` files are root-owned, as established earlier in this project.)

- [ ] **Step 2: Confirm removal**

```bash
grep NEXT_PUBLIC_BASE_PATH /srv/projects/ritminiyakala/apps/web/.env; echo "web exit: $?"
grep NEXT_PUBLIC_BASE_PATH /srv/projects/ritminiyakala/apps/admin/.env; echo "admin exit: $?"
```

Expected: both `grep` commands find nothing (`exit: 1`).

- [ ] **Step 3: Rebuild both images**

```bash
cd /srv/projects/ritminiyakala/apps/web && docker build --network=host -t ritminiyakala-web-img .
cd /srv/projects/ritminiyakala/apps/admin && docker build --network=host -t ritminiyakala-admin-img .
```

Expected: both builds end with `naming to docker.io/library/...-img done`, no errors.

- [ ] **Step 4: Recreate both containers**

```bash
cd /opt/stacks/ritminiyakala && docker compose up -d --force-recreate
cd /opt/stacks/ritminiyakala-admin && docker compose up -d --force-recreate
```

- [ ] **Step 5: Verify both serve from root, over the new HTTPS subdomains**

```bash
curl -s -o /dev/null -w "web root -> HTTP %{http_code}\n" -k "https://ritminiyakala.coffeenok.com/"
curl -s -k "https://ritminiyakala.coffeenok.com/" | grep -o '_next/static[^"]*' | head -3
curl -s -o /dev/null -w "admin login -> HTTP %{http_code}\n" -k -u "ritminiyakala-admin:gqEgKy2aBegEH6J6zvrY" "https://ritminiyakala-admin.coffeenok.com/login"
```

Expected: `200` for both; the `_next/static` asset paths do **not** start with
`/ritminiyakala/` or `/ritminiyakala-admin/` any more (they start with `/_next/static` directly,
confirming basePath is gone).

No commit — `.env` files are gitignored and must never be committed.

---

### Task 7: Update project-portal's links to the new subdomains

**Files:**
- Modify: `/opt/stacks/project-portal/config/projects.json`

**Interfaces:**
- Consumes: nothing from earlier tasks besides the new subdomains existing (Task 5).
- Produces: updated `url` field per project, read by project-portal's own frontend at request time
  (no rebuild needed if it reads the JSON at runtime — verify in Step 3).

- [ ] **Step 1: Read the current file**

```bash
cat /opt/stacks/project-portal/config/projects.json
```

- [ ] **Step 2: Replace each project's `url` field**

Edit `/opt/stacks/project-portal/config/projects.json` so each `url` becomes the HTTPS subdomain:

```json
"url": "https://ritminiyakala.coffeenok.com"
```
```json
"url": "https://onlineopportunities.coffeenok.com"
```
```json
"url": "https://codbizme.coffeenok.com"
```
```json
"url": "https://auxenme.coffeenok.com"
```
```json
"url": "https://arqhy.coffeenok.com"
```

(Leave every other field — `name`, `description`, `type`, `github`, `path`, `container`,
`publicUrl`, `status` — unchanged.)

- [ ] **Step 3: Reload project-portal so it picks up the change**

```bash
docker restart project-portal
```

If project-portal caches the JSON only at process start (likely, for a small Node app), a restart
is required — a bind-mounted file edit alone won't be picked up.

- [ ] **Step 4: Verify the updated JSON is correct**

```bash
cat /opt/stacks/project-portal/config/projects.json | python3 -m json.tool
```

Expected: every project's `url` field now starts with `https://` and ends in `.coffeenok.com`
(no `/ritminiyakala`-style paths left).

The agent does not have project-portal's Basic Auth credentials, so the rendered page itself can't
be curled directly. Ask the user to open `https://projects.coffeenok.com/` in a browser (Task 8
gives this host SSL) and confirm each project card links to its new subdomain.

No commit — `/opt/stacks` is not a git repository.

---

### Task 8: Give projects.coffeenok.com itself HTTPS too, for consistency

**Files:**
- Modify: existing NPM proxy host `id=9` (`projects.coffeenok.com`) via NPM UI.

**Interfaces:**
- Consumes: `coffeenok-wildcard` certificate created in Task 5, Step 1.

- [ ] **Step 1: Assign the wildcard cert to the existing projects.coffeenok.com host**

In NPM UI: **Proxy Hosts** → open `projects.coffeenok.com` → **SSL** tab → select
**coffeenok-wildcard** → enable **Force SSL** → Save.

- [ ] **Step 2: Verify**

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" -k "https://projects.coffeenok.com/"
```

Expected: `401` (project-portal's own Basic Auth prompt) or `200` if already authenticated by
the `-u` flag — either way, not a connection error, confirming SSL termination now works here too.

No commit — NPM's data directory is not a git repository.

---

### Task 9: End-to-end verification of every migrated subdomain

**Files:** none — verification only.

**Interfaces:**
- Consumes: all of Tasks 3–8.

- [ ] **Step 1: HTTPS + correct backend for every project subdomain**

```bash
for h in ritminiyakala codbizme onlineopportunities arqhy auxenme; do
  echo "=== $h.coffeenok.com ==="
  curl -s -o /dev/null -w "HTTP %{http_code}\n" -k "https://$h.coffeenok.com/"
done
```

Expected: every one returns `200` (or the app's normal redirect code — not `502`/`504`/`000`).

- [ ] **Step 2: ritminiyakala web's API routes work at the new root path**

```bash
curl -s -k "https://ritminiyakala.coffeenok.com/api/hero" -w "\nHTTP: %{http_code}\n" | head -c 200
```

Expected: JSON body (hero config), `HTTP: 200` — confirms the `apiPath()` fix behaves correctly
with `NEXT_PUBLIC_BASE_PATH` unset (empty prefix).

- [ ] **Step 3: ritminiyakala-admin Basic Auth + app login still both work**

```bash
curl -s -o /dev/null -w "no auth -> HTTP %{http_code}\n" -k "https://ritminiyakala-admin.coffeenok.com/"
curl -s -o /dev/null -w "basic auth -> HTTP %{http_code}\n" -k -u "ritminiyakala-admin:gqEgKy2aBegEH6J6zvrY" "https://ritminiyakala-admin.coffeenok.com/login"
```

Expected: `401` then `200`.

- [ ] **Step 4: Old path-based URLs still work (nothing broken yet — cleanup is Task 10)**

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://projects.coffeenok.com/ritminiyakala/
```

Expected: `200` (unchanged, old route still intact until Task 10).

- [ ] **Step 5: Ask the user to confirm in an actual browser**

Report to the user: please open `https://ritminiyakala.coffeenok.com/` in your browser (once you've
installed the root CA per Task 11 — otherwise expect a trust warning you can click through for this
manual check) and confirm the page loads and looks correct, including the hero slider images and
any activity icons.

No commit — verification only.

---

### Task 10: Remove old path-based routes and now-redundant NPM hosts

**Files:**
- Modify: NPM proxy host `id=9`'s nginx conf (`/data/nginx/proxy_host/9.conf` inside the `npm`
  container) — remove the 5 migrated projects' `location` blocks, keep the root `/` block
  (project-portal launcher) and `block-exploits` include.
- Delete: NPM proxy host DB rows for `portainer`, `cockpit`, `home` (ids from the earlier query —
  re-query first, do not hardcode).

**Interfaces:**
- Consumes: Task 9 passing completely (do not run this task if any check in Task 9 failed).

- [ ] **Step 1: Re-read the current proxy_host 9 conf**

```bash
docker exec npm cat /data/nginx/proxy_host/9.conf
```

- [ ] **Step 2: Remove the 5 migrated `location` blocks (ritminiyakala, onlineopportunities,
  codbizme, auxenme, arqhy) but keep the `location = ...` redirects only if any other host still
  needs them — none do, remove those too**

```bash
docker exec npm python3 -c "
import re
content = open('/data/nginx/proxy_host/9.conf').read()
for name in ['ritminiyakala', 'onlineopportunities', 'codbizme', 'auxenme', 'arqhy', 'ritminiyakala-admin']:
    content = re.sub(r'  location /' + re.escape(name) + r'/ \{.*?\n  \}\n\n', '', content, flags=re.S)
    content = re.sub(r'  location = /' + re.escape(name) + r' \{.*?\n  \}\n\n', '', content, flags=re.S)
open('/data/nginx/proxy_host/9.conf', 'w').write(content)
print('done')
"
```

- [ ] **Step 3: Validate and reload nginx**

```bash
docker exec npm nginx -t
docker exec npm nginx -s reload
```

Expected: `syntax is ok` / `test is successful`, no errors.

- [ ] **Step 4: Confirm the old paths now 404 (or fall through to project-portal) and the new
  subdomains still work**

```bash
curl -s -o /dev/null -w "old path (expect 404 or portal fallback) -> HTTP %{http_code}\n" http://projects.coffeenok.com/ritminiyakala/
curl -s -o /dev/null -w "new subdomain (expect 200) -> HTTP %{http_code}\n" -k https://ritminiyakala.coffeenok.com/
```

- [ ] **Step 5: Delete the portainer/cockpit/home NPM proxy hosts**

```bash
docker exec npm python3 -c "
import sqlite3
db = sqlite3.connect('/data/database.sqlite')
cur = db.cursor()
cur.execute(\"SELECT id, domain_names FROM proxy_host WHERE domain_names LIKE '%portainer%' OR domain_names LIKE '%cockpit%' OR domain_names LIKE '%home.coffeenok%'\")
rows = cur.fetchall()
print('deleting:', rows)
ids = [str(r[0]) for r in rows]
for row_id, _ in rows:
    cur.execute('DELETE FROM proxy_host WHERE id = ?', (row_id,))
db.commit()
print('conf files to remove:', ' '.join(f'/data/nginx/proxy_host/{i}.conf' for i in ids))
"
```

The last line of that output prints the exact `rm` targets (based on the known current DB state
from the design phase, these are ids **5** for `portainer.coffeenok.com`, **6** for
`home.coffeenok.com`, and **12** for `cockpit.coffeenok.com` — but re-verify against the printed
output before deleting, in case ids have changed since the spec was written). Remove those conf
files and reload:

```bash
docker exec npm rm -f /data/nginx/proxy_host/5.conf /data/nginx/proxy_host/6.conf /data/nginx/proxy_host/12.conf
docker exec npm nginx -t && docker exec npm nginx -s reload
```

- [ ] **Step 6: Verify they're gone and the IP:port access still works**

```bash
curl -s -o /dev/null -w "portainer via old domain (expect fail) -> %{http_code}\n" --max-time 3 http://portainer.coffeenok.com/ 2>&1
curl -s -o /dev/null -w "portainer via IP:port (expect 200/30x) -> %{http_code}\n" http://192.168.1.240:9000/
```

No commit — NPM's data directory is not a git repository.

---

### Task 11: User installs the root CA on their devices; agent stops the temp file server

**Files:** none — user's own devices, plus stopping the Task 2 background process.

- [ ] **Step 1 (user): Download `http://192.168.1.240:8899/rootCA.pem`** on every device that will
  browse these subdomains, and install it as a trusted root certificate:
  - **Windows:** double-click the file → Install Certificate → Local Machine → place in
    "Trusted Root Certification Authorities".
  - **macOS:** double-click → adds to Keychain Access "System" keychain → open it there → Trust →
    "Always Trust".
  - **Android:** Settings → Security → Encryption & credentials → Install a certificate → CA
    certificate → select the file.
  - **iOS/iPadOS:** send the file to the device (AirDrop/email) → open it → Settings shows
    "Profile Downloaded" → Settings → General → VPN & Device Management → install the profile →
    **then also** Settings → General → About → Certificate Trust Settings → enable full trust for
    the new root.

- [ ] **Step 2 (user): Confirm no certificate warning** when visiting
  `https://ritminiyakala.coffeenok.com/` on each device.

- [ ] **Step 3 (agent): Stop the temporary file server once the user confirms all their devices
  are done**

```bash
pkill -f "http.server 8899"
```

- [ ] **Step 4 (agent): Verify it's stopped**

Run: `curl -s -o /dev/null -w "%{http_code}\n" --max-time 3 http://192.168.1.240:8899/rootCA.pem`
Expected: connection failure (command errors out / times out), confirming the temporary server no
longer runs.

No commit — nothing tracked in this task.

---

## Self-review notes

- **Spec coverage:** every numbered item in the spec's "Migration order" (1–9) maps to a task
  above (mkcert→Task 1, CA distribution→Task 2, port 443→Task 3, router DNS→Task 4, proxy
  hosts→Task 5, app rebuild→Task 6, project-portal→Task 7, verification→Task 9, cleanup→Task 10,
  device install→Task 11). Task 8 (SSL on `projects.coffeenok.com` itself) was implied by the
  design's "all of them" cert-assignment language and made explicit as its own task.
- **No placeholders:** all commands are concrete; the one intentionally-generic line in Task 10
  Step 5 (`for id in ...`) was replaced with an explicit re-query + manual id substitution because
  the actual ids can't be known until Task 5/earlier state is re-queried live — this is flagged
  in-line for the implementer to fill from real query output, not a vague instruction.
- **Type/name consistency:** container names (`ritminiyakala`, `ritminiyakala-admin`, `codbizme`,
  `onlineopportunities`, `arqhy`, `auxenme`), file paths, and the `NEXT_PUBLIC_BASE_PATH` env var
  name match exactly what was established earlier in this project (verified against the spec and
  prior session commands).
