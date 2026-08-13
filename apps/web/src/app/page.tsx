import Link from 'next/link';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { HeroSlider } from '@/components/public/HeroSlider';
import { ActivityTypesSection } from '@/components/public/ActivityTypesSection';

const STEPS = [
  {
    step: '01',
    title: 'Profilini Oluştur',
    desc: 'Spor tercihlerini ve tecrübe seviyeni belirt. Sana en uygun aktiviteler öne çıksın.',
  },
  {
    step: '02',
    title: 'Aktivite Keşfet',
    desc: 'Yakınındaki spor aktivitelerini bul. Filtrele, incele, katılmak istediğine karar ver.',
  },
  {
    step: '03',
    title: 'Katıl veya Oluştur',
    desc: 'Bir aktiviteye katıl ya da kendi aktiviteni oluştur. Sporun ritmini birlikte yakala.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-lightBg flex flex-col">
      <PublicNav />

      <main className="flex-1">
        {/* HERO */}
        <HeroSlider />

        {/* SPOR TÜRLERİ */}
        <ActivityTypesSection />

        {/* NASIL ÇALIŞIR */}
        <section className="bg-white py-16 px-4">
          <div className="container-rny max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-black text-center mb-2">
              Nasıl Çalışır?
            </h2>
            <p className="text-brand-fume text-center mb-12">3 adımda spor hayatını aktifleştir.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {STEPS.map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="font-heading font-extrabold text-primary-700 text-xl">{step}</span>
                  </div>
                  <h3 className="font-heading font-bold text-black mb-2">{title}</h3>
                  <p className="text-sm text-brand-fume leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEĞER ÖNERMESİ */}
        <section className="py-16 px-4">
          <div className="container-rny max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: '🗺️', title: 'Konum Bazlı Keşif', desc: 'Yakınındaki aktiviteleri harita üzerinde keşfet.' },
                { icon: '🤝', title: 'Spor Arkadaşı Bul', desc: 'Aynı ilgi alanını paylaşan insanlarla buluş.' },
                { icon: '📅', title: 'Kolay Planlama', desc: 'Aktivite oluştur, davet et, takvimini doldur.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="card text-center hover:border-primary-300 transition-colors">
                  <div className="text-4xl mb-3">{icon}</div>
                  <h3 className="font-heading font-bold text-black mb-2">{title}</h3>
                  <p className="text-sm text-brand-fume">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-secondary to-[#e06500] py-16 px-4">
          <div className="container-rny max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl font-extrabold text-white mb-3">
              Bugün Başla
            </h2>
            <p className="text-white/80 mb-8">
              Ücretsiz hesap oluştur, ilk aktiviteni keşfet veya oluştur.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-white text-primary-700 font-heading font-bold text-lg px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors no-underline"
            >
              Hemen Kaydol — Ücretsiz
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
