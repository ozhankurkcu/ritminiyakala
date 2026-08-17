# Mobile (iOS + Android) Dev Environment Setup — Design & Guide

**Date:** 2026-08-17
**Status:** Approved, this doc doubles as the execution guide (all steps are manual, run on the
user's own Windows/Mac machines — nothing here is executed by the agent)

## Decisions

- **Framework:** Flutter, for both iOS and Android. Web stays on the existing Next.js app
  (`apps/web`) — Flutter-web is not used, so there's no code sharing between the web app and the
  mobile app at the framework level.
- **Repo structure:** new top-level `apps/mobile/` in the existing `ritminiyakala` monorepo,
  alongside `apps/web` and `apps/admin`.
- **Home server involvement:** none, for mobile. The Docker/NPM deploy loop on the home server
  keeps serving only `apps/web` and `apps/admin`, unchanged. Mobile builds go to a separate CI
  (Codemagic or GitHub Actions) and then to TestFlight/App Store and Google Play — not through
  this server.
- **Dev machines:** both available — day-to-day development on Windows, switching to the Mac for
  iOS Simulator/build work (Windows cannot run Xcode/iOS tooling at all). Same VS Code setup on
  both.
- **Branching:** a dedicated `feature/mobile-app` branch, not directly on `main` — this is a large,
  long-running body of work and shouldn't disturb the working web/admin deploy until it's ready to
  merge via PR.
- **Claude Code integration:** the official VS Code extension, so diffs and file references show
  in the editor instead of a bare terminal. A `CLAUDE.md` at the repo root carries project
  conventions into every future session automatically (fresh sessions, fresh subagents) without
  re-explaining them each time.

## Out of scope (for this guide)

- Firebase project setup itself (dev/staging/prod projects, `google-services.json` /
  `GoogleService-Info.plist`) — the user asked for this as a separate follow-up.
- The actual Flutter app scaffold/architecture (screens, state management, etc.) — that's a
  separate brainstorming session once the environment is ready, per the user's own plan to keep
  infra/ops and feature-dev sessions separate.

---

## Setup Guide

### Part A — One-time tool installs

**On Windows:**

1. Install **Git for Windows**: https://git-scm.com/download/win — during setup, keep the default
   "Git Credential Manager" component checked (this handles GitHub login via browser, no manual
   token needed).
2. Install **VS Code**: https://code.visualstudio.com/
3. Install the **Flutter SDK** for Windows: https://docs.flutter.dev/get-started/install/windows
   — follow their installer, then run `flutter doctor` in a terminal and resolve anything it flags
   red (usually: accept Android SDK licenses, install Android Studio for its SDK/emulator tooling
   even though you won't write code there).

**On Mac:**

1. Install **Xcode** from the App Store (needed for iOS builds/Simulator — this is the one thing
   only the Mac can do).
2. Open Xcode once, accept its license, let it install additional components when prompted.
3. Install **Homebrew** if not already present: https://brew.sh/
4. Install **VS Code**: `brew install --cask visual-studio-code` (or the same download link as
   Windows).
5. Install the **Flutter SDK** for macOS: https://docs.flutter.dev/get-started/install/macos
   then run `flutter doctor` and resolve anything flagged red (it will specifically check for
   Xcode command-line tools and CocoaPods — install CocoaPods with `sudo gem install cocoapods` if
   missing).
6. Git comes preinstalled on macOS; run `git --version` once to trigger the Xcode Command Line
   Tools prompt if it appears, accept it.

### Part B — VS Code configuration (identical on both machines)

1. Open VS Code → Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`) → install:
   - **Flutter** (publisher: Dart Code)
   - **Dart** (publisher: Dart Code — usually auto-installed alongside Flutter)
   - **Claude Code** (publisher: Anthropic)
   - GitLens (optional, publisher: GitKraken — nice-to-have for history/blame inline)
2. Sign in to the Claude Code extension with the same account used elsewhere.

### Part C — Clone the repo and create the feature branch

Run in a terminal (Windows: Git Bash or PowerShell; Mac: Terminal):

```bash
git clone https://github.com/ozhankurkcu/ritminiyakala.git
cd ritminiyakala
git checkout -b feature/mobile-app
```

Open this cloned folder in VS Code: `code .` from inside it, or File → Open Folder.

Do this identically on both Windows and Mac — each machine gets its own clone of the same repo. Push
the branch once so both machines can `git pull` the same in-progress work:

```bash
git push -u origin feature/mobile-app
```

### Part D — Scaffold the Flutter app

From the repo root (on whichever machine you're starting on — Windows is fine, Android doesn't
need the Mac):

```bash
cd apps
flutter create mobile --org com.ritminiyakala --platforms=ios,android
cd mobile
flutter doctor
flutter run
```

`flutter run` needs a target — either a plugged-in phone with USB debugging on, or a running
emulator (Android Studio's AVD Manager) / iOS Simulator (Mac only, `open -a Simulator` first).

### Part E — Add the project's `CLAUDE.md`

Create `ritminiyakala/CLAUDE.md` at the repo root (if it doesn't already exist) so every future
Claude Code session — on either machine, or a fresh subagent — picks up project conventions
automatically instead of needing them re-explained. Populate it once real conventions exist (state
management choice, folder layout inside `apps/mobile/lib/`, naming rules) — leave it minimal for
now and grow it as decisions get made in the next (app-architecture) session.

### Part F — Verify the loop end-to-end

1. On Windows: make a trivial change (e.g. edit the default counter app's title text), commit,
   push to `feature/mobile-app`.
2. On Mac: `git pull`, confirm the change is there, run `flutter run` targeting the iOS Simulator
   to confirm the Mac side of the toolchain works too.
3. This confirms both machines are correctly wired to the same branch before real feature work
   starts.

---

## Next steps (separate sessions, per the user's own plan)

1. Firebase project setup (dev/staging/prod) — follow-up conversation, explicitly requested next.
2. Flutter app architecture brainstorming (screens, state management, how it talks to
   Firebase/Firestore) — a fresh, dedicated session once the environment above is confirmed
   working, to keep this infra session's context out of that one.
