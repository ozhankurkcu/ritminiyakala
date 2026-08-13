import Link from 'next/link';

const PLANS = [
  {
    name: 'Ücretsiz',
    price: '$0',
    period: '',
    desc: 'Başlamak için ideal. Temel özellikleri ücretsiz dene.',
    color: 'border-brand-border',
    badge: null,
    cta: 'Ücretsiz Başla',
    ctaHref: '/signup',
    ctaStyle: 'btn-outline btn-lg',
    features: [
      '1 aktivite oluşturma',
      '1 katılımcı kabul etme',
      'Aktiviteleri keşfet (salt okunur)',
      'Temel profil',
    ],
    missing: [
      'Sınırsız aktivite',
      'Grup mesajlaşma',
      'Öncelikli görünürlük',
    ],
  },
  {
    name: 'Aktif Sporcu',
    price: '$11',
    period: '/ay',
    desc: 'Düzenli spor yapanlar ve küçük gruplar için.',
    color: 'border-primary-300',
    badge: null,
    cta: 'Planı Seç',
    ctaHref: '/signup?plan=regular',
    ctaStyle: 'btn-primary btn-lg text-white',
    features: [
      '10 aktif aktivite',
      '20 katılımcıya kadar',
      'Keşfet filtreleri',
      'Aktivite istatistikleri',
      'E-posta bildirimleri',
    ],
    missing: [
      'Grup mesajlaşma',
      'Öncelikli görünürlük',
    ],
  },
  {
    name: 'Sosyal Sporcu',
    price: '$22',
    period: '/ay',
    desc: 'Topluluğunu büyütmek isteyen aktif organizatörler için.',
    color: 'border-secondary',
    badge: 'En Popüler',
    cta: 'Planı Seç',
    ctaHref: '/signup?plan=social',
    ctaStyle: 'btn-secondary btn-lg text-white',
    features: [
      'Sınırsız aktivite',
      'Sınırsız katılımcı',
      'Grup mesajlaşma',
      'Öncelikli keşfet görünürlüğü',
      'Gelişmiş istatistikler',
      'Özel aktivite sayfası',
    ],
    missing: [],
  },
  {
    name: 'Profesyonel',
    price: 'Özel',
    period: '',
    desc: 'Spor kulüpleri, federasyonlar ve kurumsal yapılar için.',
    color: 'border-accent-dark',
    badge: null,
    cta: 'Bize Ulaşın',
    ctaHref: 'mailto:hello@dorlion.com',
    ctaStyle: 'btn-accent btn-lg',
    features: [
      'Her şey dahil',
      'White-label seçeneği',
      'API erişimi',
      'Özel entegrasyonlar',
      'Öncelikli destek',
      'Fatura & muhasebe',
    ],
    missing: [],
  },
];

export default function PricingPage() {
  return (
    <div className="py-16 px-4">
      <div className="container-rny max-w-5xl mx-auto">
        {/* Başlık */}
        <div className="text-center mb-14">
          <h1 className="font-heading text-4xl font-extrabold text-primary-700 mb-3">
            Sana Uygun Planı Seç
          </h1>
          <p className="text-brand-fume text-lg max-w-xl mx-auto">
            Ücretsiz başla, ihtiyacın büyüdükçe planını yükselt. İstediğin zaman iptal et.
          </p>
        </div>

        {/* Planlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 ${plan.color} p-6 flex flex-col`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-heading font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="mb-5">
                <p className="font-heading font-bold text-black text-lg mb-0.5">{plan.name}</p>
                <div className="flex items-baseline gap-0.5 mb-2">
                  <span className="font-heading font-extrabold text-3xl text-primary-700">{plan.price}</span>
                  {plan.period && <span className="text-brand-fume text-sm">{plan.period}</span>}
                </div>
                <p className="text-sm text-brand-fume leading-snug">{plan.desc}</p>
              </div>

              <Link
                href={plan.ctaHref}
                className={`${plan.ctaStyle} no-underline w-full mb-6 inline-flex items-center justify-center`}
              >
                {plan.cta}
              </Link>

              <div className="flex-1 space-y-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    <span className="text-black">{f}</span>
                  </div>
                ))}
                {plan.missing.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-brand-border mt-0.5 shrink-0">✗</span>
                    <span className="text-brand-fume line-through">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SSS */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-xl font-bold text-black text-center mb-8">Sık Sorulan Sorular</h2>
          <div className="space-y-4">
            {[
              {
                q: 'İstediğim zaman iptal edebilir miyim?',
                a: 'Evet. Aboneliğini dilediğin zaman iptal edebilirsin. Dönem sonuna kadar erişimin devam eder.',
              },
              {
                q: 'Ücretsiz planda ne kadar kalabilirim?',
                a: 'Süresiz. Ücretsiz plan bir zaman sınırı olmadan kullanılabilir.',
              },
              {
                q: 'Profesyonel plan ne kadara mal olur?',
                a: 'Kullanım hacmine ve özel ihtiyaçlarına göre fiyatlandırılır. Ekibimizle iletişime geç.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-brand-border rounded-xl p-5">
                <p className="font-heading font-semibold text-black mb-1">{q}</p>
                <p className="text-sm text-brand-fume">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
