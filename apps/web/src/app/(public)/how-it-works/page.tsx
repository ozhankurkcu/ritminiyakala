export default function HowItWorksPage() {
  return (
    <div className="container-rny py-16 max-w-3xl mx-auto">
      <h1 className="font-heading text-3xl font-extrabold text-black mb-4">Nasıl Çalışır?</h1>
      <p className="text-brand-fume font-body mb-10">ritminiyakala, spor aktivitelerini organize etmek ve keşfetmek için tasarlanmış bir platformdur.</p>

      <div className="space-y-8">
        {[
          { step: '01', title: 'Profilini Oluştur', desc: 'Spor tercihlerini ve tecrübe seviyeni belirt. Sana en uygun aktiviteler öne çıksın.' },
          { step: '02', title: 'Aktivite Keşfet', desc: 'Yakınındaki spor aktivitelerini bul. Filtrele, incele, katılmak istediğine karar ver.' },
          { step: '03', title: 'Katıl veya Oluştur', desc: 'Bir aktiviteye katıl ya da kendi aktiviteni oluştur. Sporun ritmini birlikte yakala.' },
          { step: '04', title: 'Bağlan & Paylaş', desc: 'Aktivite sonrası diğer katılımcılarla bağlantı kur, deneyimlerini paylaş.' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="flex gap-6 items-start">
            <div className="shrink-0 w-12 h-12 rounded-full bg-primary-700 text-white font-heading font-bold text-lg flex items-center justify-center">
              {step}
            </div>
            <div>
              <h2 className="font-heading font-semibold text-black text-lg mb-1">{title}</h2>
              <p className="text-brand-fume font-body">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
