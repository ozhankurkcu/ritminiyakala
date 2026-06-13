export default function Home() {
  return (
    <main className="min-h-screen bg-brand-lightBg flex flex-col items-center justify-center p-8">
      {/* Logo / Brand */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-extrabold text-primary-700 mb-2">
          ritminiyakala
        </h1>
        <p className="text-brand-fume text-lg font-body">
          Global Spor Aktivite Keşif Platformu
        </p>
      </div>

      {/* Brand Renk Paleti — Sprint 0 test */}
      <section className="w-full max-w-2xl mb-10">
        <h2 className="font-heading text-xl font-bold text-black mb-4">Marka Renk Paleti</h2>
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg overflow-hidden shadow-sm">
            <div className="h-16 bg-primary-700" />
            <div className="p-2 bg-white text-xs font-body">
              <p className="font-semibold">Primary</p>
              <p className="text-brand-fume">#631C99</p>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-sm">
            <div className="h-16 bg-secondary" />
            <div className="p-2 bg-white text-xs font-body">
              <p className="font-semibold">Secondary</p>
              <p className="text-brand-fume">#FF7E00</p>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-sm">
            <div className="h-16 bg-accent" />
            <div className="p-2 bg-white text-xs font-body">
              <p className="font-semibold">Accent</p>
              <p className="text-brand-fume">#60E1EB</p>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-sm">
            <div className="h-16 bg-brand-fume" />
            <div className="p-2 bg-white text-xs font-body">
              <p className="font-semibold">Füme</p>
              <p className="text-brand-fume">#696969</p>
            </div>
          </div>
        </div>
      </section>

      {/* Buton Sistemi — Sprint 0 test */}
      <section className="w-full max-w-2xl mb-10">
        <h2 className="font-heading text-xl font-bold text-black mb-4">Buton Sistemi</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary btn-md">Primary</button>
          <button className="btn-secondary btn-md">Secondary</button>
          <button className="btn-accent btn-md">Accent</button>
          <button className="btn-outline btn-md">Outline</button>
          <button className="btn-ghost btn-md">Ghost</button>
          <button className="btn-primary btn-md" disabled>Disabled</button>
        </div>
      </section>

      {/* Tipografi — Sprint 0 test */}
      <section className="w-full max-w-2xl mb-10">
        <h2 className="font-heading text-xl font-bold text-black mb-4">Tipografi</h2>
        <div className="space-y-2 font-body">
          <p className="font-heading text-3xl font-extrabold text-primary-700">H1 — Montserrat 800</p>
          <p className="font-heading text-2xl font-bold text-primary-700">H2 — Montserrat 700</p>
          <p className="font-heading text-xl font-semibold text-primary-700">H3 — Montserrat 600</p>
          <p className="text-base text-brand-fume">Body — Nunito Sans 400 — #696969</p>
          <p className="text-sm text-brand-intLink">Internal link — #2DB8C0</p>
          <p className="text-sm text-brand-extLink">External link — #808080</p>
        </div>
      </section>

      {/* Badge Sistemi */}
      <section className="w-full max-w-2xl">
        <h2 className="font-heading text-xl font-bold text-black mb-4">Badge Sistemi</h2>
        <div className="flex flex-wrap gap-2">
          <span className="badge-primary">Primary</span>
          <span className="badge-success">Başarılı</span>
          <span className="badge-warning">Uyarı</span>
          <span className="badge-error">Hata</span>
          <span className="badge-pending">Beklemede</span>
        </div>
      </section>

      <footer className="mt-16 text-center text-sm text-brand-fume font-body">
        Sprint 0 — Design System Test ✅ — Dorlion Ltd.
      </footer>
    </main>
  );
}
