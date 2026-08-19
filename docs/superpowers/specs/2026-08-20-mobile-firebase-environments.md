# Mobile App Firebase Environments — Design

**Date:** 2026-08-20
**Status:** Approved

## Problem

The Flutter mobile app (`apps/mobile`, scaffolded 2026-08-18) needs to talk to Firebase. Building
and testing it directly against the existing production Firebase project (`ritminiyakala`, already
used by `apps/web` and `apps/admin` with real users) risks corrupting real data with test
accounts, bugs, or in-progress migrations.

## Core principle: one real system, two sandboxes

There is exactly **one real, live system**: the existing `ritminiyakala` Firebase project. Once the
mobile app ships (App Store / Play Store), it connects to this same project — the same database and
the same `apps/admin` panel that `apps/web` already uses. This does not change.

`dev` and `staging` are not new systems and get no admin panel of their own — they are disposable
practice environments used only while building and testing the mobile app. If test data in them
ever needs inspecting, Firebase Console's own built-in data viewer (already accessible with the
project owner's Google account) is enough; no custom tooling is built for them.

**Explicitly out of scope:** `apps/web` and `apps/admin` are not touched by this work and keep
pointing at the existing `ritminiyakala` project unchanged. No new web/admin deployments (e.g. a
`dev.ritminiyakala.coffeenok.com`) are created — this design covers the mobile app only.

## Firebase projects

| Project ID | Role | Notes |
|---|---|---|
| `ritminiyakala` | prod (existing, untouched) | Already used by `apps/web` + `apps/admin` |
| `ritminiyakala-dev` | new | Mobile development sandbox |
| `ritminiyakala-staging` | new | Mobile pre-release testing |

**Services enabled in all three:** Authentication, Firestore, Storage, Cloud Messaging (FCM).
Crashlytics needs no per-project toggle — it activates automatically once the Flutter app links the
`firebase_crashlytics` package and calls its init function; the mobile app work should include it
from the start since retrofitting it later is more work than not.

**Billing:** Firebase Storage now requires the Blaze (pay-as-you-go) plan. `ritminiyakala-dev` and
`ritminiyakala-staging` will be switched to Blaze — confirmed acceptable. Both still carry Blaze's
free-tier quota, so low-volume dev/staging usage should not generate real charges in practice, but
this is not a hard guarantee.

## Per-environment app identity (Flutter flavors)

Chosen over a single bundle ID with manually-swapped config files specifically so dev, staging, and
a release build can all be installed on the same test device simultaneously without overwriting
each other — this is the standard Flutter multi-environment pattern.

| Flavor | Android/iOS ID | Home-screen name | Firebase project |
|---|---|---|---|
| `dev` | `com.ritminiyakala.mobile.dev` | Ritmi Dev | `ritminiyakala-dev` |
| `staging` | `com.ritminiyakala.mobile.staging` | Ritmi Staging | `ritminiyakala-staging` |
| `prod` | `com.ritminiyakala.mobile` | ritminiyakala | `ritminiyakala` |

Each flavor/platform pair is registered as its own "app" inside its Firebase project — 6 app
registrations total (3 flavors × iOS + Android).

## Tooling: FlutterFire CLI

Config is generated with the official `flutterfire configure` command (run once per Firebase
project) rather than hand-downloading `google-services.json` / `GoogleService-Info.plist` from the
Firebase Console — it talks to the Firebase project directly, registers the iOS/Android apps with
the right bundle IDs, and writes both the native config files and a `firebase_options_<env>.dart`
file (the current recommended Firebase-Flutter integration pattern, used with
`Firebase.initializeApp(options: ...)` instead of relying on native files being auto-discovered).

## Android/iOS flavor wiring

- **Android**: `android/app/build.gradle.kts` gets a `dev`/`staging`/`prod` flavor dimension. Each
  flavor's `google-services.json` lives in its own `android/app/src/<flavor>/` folder — the Google
  Services Gradle plugin picks the right one automatically based on which flavor is being built.
- **iOS**: three Xcode schemes (`dev`, `staging`, `prod`), each pointing at its own
  `GoogleService-Info.plist`.
- Running the app picks the environment explicitly, e.g.
  `flutter run --flavor dev -t lib/main_dev.dart` — there is no ambient/default environment, so it's
  always obvious which backend a running build is talking to.

## Out of scope for this doc

- The actual `flutterfire configure` run-through and flavor file edits — that's the implementation
  guide, done interactively once this spec is confirmed.
- Any Flutter app architecture (screens, state management) — separate future work.
