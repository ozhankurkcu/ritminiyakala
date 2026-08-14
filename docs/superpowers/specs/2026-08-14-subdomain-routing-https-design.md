# Subdomain Routing + Local HTTPS — Design

**Date:** 2026-08-14
**Status:** Approved, pending implementation plan

## Problem

Projects are currently reached via path-based routing under `projects.coffeenok.com/[proje-adı]/`
(e.g. `projects.coffeenok.com/ritminiyakala/`). This has two issues:

1. The user wants each project reachable at its own subdomain: `[proje-adı].coffeenok.com`.
2. `projects.coffeenok.com` (and every other `*.coffeenok.com` host) has no HTTPS at all — NPM has
   no certificate configured for any proxy host, and port 443 isn't even published on the NPM
   container. Modern browsers increasingly try HTTPS-first, so plain-HTTP-only hosts intermittently
   fail to load for the user even though the server is fine.

## Constraints discovered during brainstorming

- **`coffeenok.com` is a real, owned domain** (DNS host: dnsenable.com), but subdomains
  (`projects.coffeenok.com` etc.) only exist as **router-local DNS overrides** — they do not resolve
  from the public internet. The apex `coffeenok.com` A record (93.89.226.17) does not match the
  server's current outbound IP and is unrelated/unused for this purpose.
- **No static public IP, no port forwarding.** The home server (`192.168.1.240`) is reachable only
  from the home LAN. This is intentional — user confirmed LAN-only access is all that's needed, now
  and for the foreseeable future.
- **No API access to dnsenable.com** — only the web panel. This rules out automating Let's Encrypt
  DNS-01 challenge renewal.
- **Router (Etisalat eLife Connect C1AA) local DNS allows max 10 host entries.** Tested: the router
  UI *accepts* a `*.coffeenok.com` wildcard-looking entry, but it does **not** actually resolve
  wildcard queries (verified: `cloud.coffeenok.com` resolves, `abc123test.coffeenok.com` does not).
  Treat the router's local DNS as exact-match only, 10 slots, no wildcard.

## Current router DNS entries (9 of 10, before this change)

| Domain | Points to | Purpose |
|---|---|---|
| auxenme.coffeenok.com | 192.168.1.240 | Project subdomain (already exists, keep) |
| cloud.coffeenok.com | 192.168.1.240 (nextcloud:8080) | Personal cloud storage — keep |
| media.coffeenok.com | 192.168.1.240 (jellyfin:8096) | Media server — keep |
| portainer.coffeenok.com | 192.168.1.240 (portainer:9000) | Docker admin UI — **remove**, use IP:port |
| home.coffeenok.com | 192.168.1.240 (homepage:3000) | Dashboard — **remove**, use IP:port |
| mission.coffeenok.com | 192.168.1.240 (mission-control:3005) | Non-functional since openclaw removal — **remove**, re-add when a new agent system is connected |
| projects.coffeenok.com | 192.168.1.240 (project-portal:3000) | Project launcher — keep |
| katip.coffeenok.com | 192.168.1.240 | Reserved for a future personal assistant ("Hermes" or similar) — not yet active, keep reserved |
| cockpit.coffeenok.com | 192.168.1.240 (host:9090) | System admin panel — **remove**, use IP:port |
| *(invalid)* `*.coffeenok.com` | — | Accepted by router UI but non-functional — **delete** |

## Target router DNS entries (exactly 10 of 10)

Keep (5): `auxenme`, `cloud`, `media`, `projects`, `katip`
Add (5): `ritminiyakala`, `ritminiyakala-admin`, `codbizme`, `onlineopportunities`, `arqhy`

All point to `192.168.1.240`. **This uses the full 10-slot budget** — adding any future subdomain
(or restoring `mission`) requires removing another entry first. This trade-off was discussed and
accepted by the user.

`portainer`, `cockpit`, and `home` remain reachable via `192.168.1.240:9000` / `:9090` / `:3000`
directly — no NPM/DNS entry needed since these are low-frequency admin tools, not everyday apps.

## Certificate strategy: local CA via `mkcert`

Since there's no public reachability, Let's Encrypt (HTTP-01 or DNS-01 without API access) is not
viable. Instead:

1. Install `mkcert` on the server (single static binary, well-known/audited tool by Filippo Valsorda).
2. Generate one local root CA (one-time).
3. Issue a single certificate covering `*.coffeenok.com` and `coffeenok.com`, signed by that CA.
   Validity: **≤825 days** (Safari/iOS/macOS reject locally-trusted certs longer than this, even for
   manually-trusted roots; Chrome has no such limit for non-public roots, so 825 days is the binding
   constraint). Put a reminder to regenerate before expiry.
4. Upload the cert+key into NPM as a **Custom** SSL certificate; assign it to every proxy host
   (existing and new); enable **Force SSL** on all of them.
5. NPM's `docker-compose.yml` currently only publishes `80:80` / `81:81` — add `443:443` and
   recreate the container.
6. The CA's `rootCA.pem` must be manually installed as a trusted root on each of the user's own
   devices (one-time per device). Step-by-step instructions for Windows / macOS / Android / iOS were
   given directly to the user in chat and should be repeated in the implementation-plan hand-off.
   `rootCA.pem` will be made available to the user via Nextcloud (`cloud.coffeenok.com`) for
   download onto each device.

This works entirely without public reachability: DNS resolution is router-local, certificate trust
is manually installed, and port 443 only needs to be reachable over the LAN — none of which depends
on the server's public IP or port forwarding. Confirmed with the user.

## NPM proxy hosts (new)

One dedicated proxy host per project (not sub-path locations like the old setup):

| Subdomain | Forward target | Notes |
|---|---|---|
| ritminiyakala.coffeenok.com | `ritminiyakala:3000` | NPM already on `ritminiyakala_ritminiyakala-net` |
| ritminiyakala-admin.coffeenok.com | `ritminiyakala-admin:3000` | Same network; keep existing Basic Auth in addition to app login |
| codbizme.coffeenok.com | `codbizme:3000` | NPM already reaches this network (used for path-routing today) |
| onlineopportunities.coffeenok.com | `onlineopportunities:3000` | Same |
| arqhy.coffeenok.com | `arqhy:3000` | Same |

Each: Block Common Exploits on, custom wildcard cert assigned, Force SSL on. `auxenme` already has
a router DNS entry but currently has no NPM proxy host of its own (it's only reachable via
`projects.coffeenok.com/auxenme/` today) — creating `auxenme.coffeenok.com` as a dedicated host is
in scope too, for consistency with the other 5.

Remove NPM proxy hosts for `portainer`, `cockpit`, `home` (redundant now that DNS entries are gone
and they were already reachable via IP:port anyway).

## Application changes

- **`apps/web` and `apps/admin` (ritminiyakala)**: remove `NEXT_PUBLIC_BASE_PATH` from each `.env`.
  No code changes needed — `next.config.mjs` and the `apiPath()` helper were already built to make
  `basePath` fully opt-in via this one env var (see prior session's basePath fix). Rebuild both
  images and redeploy.
- **`codbizme` / `onlineopportunities` / `arqhy`**: plain `placeholder.js`, path-independent — no
  changes needed.
- **`project-portal`**: update `config/projects.json` — change each project's `url` field from the
  old path-based URL (`http://projects.coffeenok.com/ritminiyakala`) to the new subdomain
  (`https://ritminiyakala.coffeenok.com`). `projects.coffeenok.com` itself stays as a launcher
  dashboard with its own existing Basic Auth.

## Migration order (staged, no downtime, reversible until the last step)

1. Install `mkcert`, generate CA + wildcard cert.
2. Add `443:443` to NPM's compose file, recreate NPM container.
3. **User**: add the 5 new router DNS entries; remove `mission`, `portainer`, `cockpit`, `home`, and
   the invalid wildcard entry.
4. Create the 6 new NPM proxy hosts (cert + Force SSL).
5. Rebuild/redeploy `ritminiyakala` web + admin without `NEXT_PUBLIC_BASE_PATH`.
6. Update and reload `project-portal`'s `config/projects.json`.
7. Test every new subdomain end-to-end (page load, static assets, API routes, admin login +
   Basic Auth).
8. Only after all pass: remove the old path-based `location` blocks for the 5 migrated projects
   from `proxy_host/9.conf` (keep `projects.coffeenok.com`'s root/launcher block); delete the
   `portainer`/`cockpit`/`home` NPM proxy host DB rows + conf files.
9. **User**: install `rootCA.pem` as a trusted root on each personal device (Windows / macOS /
   Android / iOS instructions provided).

Old path-based URLs keep working through step 7, so each step can be verified before the next, and
nothing is destructive until step 8 — which only happens after the new setup is confirmed working.

## Out of scope

- Public/internet-facing access (explicitly not wanted right now).
- Automating certificate renewal (no DNS API available; manual regeneration in ~2 years is
  acceptable for a home-lab setup).
- `mission.coffeenok.com` and `katip.coffeenok.com` activation — both intentionally deferred to
  future, separate work.
