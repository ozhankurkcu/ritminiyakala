export default function GdprPage() {
  return (
    <div className="container-rny py-16 max-w-3xl mx-auto">
      <h1 className="font-heading text-3xl font-extrabold text-black mb-2">GDPR &amp; Gizlilik</h1>
      <p className="text-brand-fume text-sm font-body mb-10">Son güncelleme: Haziran 2026</p>

      <div className="space-y-8 font-body text-brand-fume leading-relaxed">
        <section>
          <h2 className="font-heading font-semibold text-black text-lg mb-2">Hangi Verileri Topluyoruz?</h2>
          <p>Kayıt sırasında ad, e-posta adresi ve opsiyonel profil bilgileri (şehir, spor tercihleri) toplanmaktadır. Aktivite oluşturulurken konum verisi işlenmektedir.</p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-black text-lg mb-2">Verileri Nasıl Kullanıyoruz?</h2>
          <p>Toplanan veriler yalnızca platform işlevselliği (aktivite eşleştirme, bildirimler) için kullanılmaktadır. Veriler üçüncü taraflarla ticari amaçla paylaşılmaz.</p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-black text-lg mb-2">Haklarınız</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verilerinize erişim hakkı</li>
            <li>Verilerinizin düzeltilmesini talep hakkı</li>
            <li>Verilerinizin silinmesini talep hakkı (&quot;unutulma hakkı&quot;)</li>
            <li>Veri işlemeye itiraz hakkı</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-black text-lg mb-2">Çerezler</h2>
          <p>Oturum yönetimi için zorunlu çerezler kullanılmaktadır. İsteğe bağlı analitik çerezler için onayınız alınmaktadır.</p>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-black text-lg mb-2">İletişim</h2>
          <p>GDPR kapsamındaki talepleriniz için: <a href="mailto:gdpr@dorlion.com" className="text-primary-700 underline">gdpr@dorlion.com</a></p>
        </section>
      </div>
    </div>
  );
}
