export default function RulesPage() {
  return (
    <div className="container-rny py-16 max-w-3xl mx-auto">
      <h1 className="font-heading text-3xl font-extrabold text-black mb-4">Genel Kurallar</h1>
      <p className="text-brand-fume font-body mb-10">
        ritminiyakala&apos;yı kullanırken lütfen aşağıdaki kurallara uyunuz.
      </p>

      <div className="space-y-6 font-body text-brand-fume">
        {[
          { title: 'Saygılı Ol', desc: 'Tüm kullanıcılara saygılı davranın. Hakaret, nefret söylemi veya taciz kesinlikle yasaktır.' },
          { title: 'Doğru Bilgi Ver', desc: 'Aktivite oluşturulurken konum, saat ve açıklama bilgilerinin doğru girilmesi zorunludur.' },
          { title: 'Zamanında Katıl', desc: 'Katılım bildirdiğin aktivitelere zamanında katılmaya özen göster. İptal edeceksen önceden bildir.' },
          { title: 'Spam Yapma', desc: 'Aynı aktiviteyi tekrar tekrar paylaşmak veya reklam içerikli aktivite oluşturmak yasaktır.' },
          { title: 'Güvenli Oyna', desc: 'Aktiviteler sırasında katılımcıların fiziksel güvenliğine dikkat et.' },
          { title: 'Kural İhlalleri', desc: 'Kural ihlalleri tespit edilen hesaplar uyarı almadan askıya alınabilir veya silinebilir.' },
        ].map(({ title, desc }) => (
          <div key={title} className="bg-white border border-brand-border rounded-xl p-5">
            <h2 className="font-heading font-semibold text-black mb-1">{title}</h2>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
