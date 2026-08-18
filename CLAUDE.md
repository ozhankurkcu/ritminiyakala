# ritminiyakala

Monorepo: `apps/web` (Next.js, mevcut), `apps/admin` (Next.js, mevcut), `apps/mobile` (Flutter, iOS+Android, yeni).

## apps/mobile
- Flutter, hedef platformlar: iOS + Android (Flutter-web kullanılmıyor)
- org: `com.ritminiyakala`
- Geliştirme iki makinede yapılıyor: Windows (günlük geliştirme, Android) + Mac (iOS Simulator/build)
- Branch: `feature/mobile-app` üzerinde geliştiriliyor, hazır olunca `main`'e PR ile birleşecek

## Deploy
`apps/web` ve `apps/admin`, ev sunucusunda (Docker + Nginx Proxy Manager) host ediliyor — bkz.
`docs/superpowers/plans/2026-08-14-subdomain-routing-https.md`. Mobil uygulama bu akışa dahil
değil, App Store / Play Store'a ayrı bir CI ile gidecek.