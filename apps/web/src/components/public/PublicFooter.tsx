import Link from 'next/link';
import Image from 'next/image';

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-brand-border mt-20">
      <div className="container-rny py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <Image src="/logo.png" alt="ritminiyakala" height={48} width={240} style={{ height: 48, width: 'auto' }} className="object-contain mb-2" />
            <p className="text-sm text-brand-fume leading-relaxed">
              Sporun ritmini bul. Birlikte daha güçlüyüz.
            </p>
          </div>
          <div>
            <p className="font-heading font-semibold text-black mb-3">Platform</p>
            <ul className="space-y-2 text-sm text-brand-fume">
              <li><Link href="/pricing" className="hover:text-primary-700 no-underline">Fiyatlandırma</Link></li>
              <li><Link href="/login" className="hover:text-primary-700 no-underline">Giriş Yap</Link></li>
              <li><Link href="/signup" className="hover:text-primary-700 no-underline">Kayıt Ol</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-heading font-semibold text-black mb-3">Şirket</p>
            <ul className="space-y-2 text-sm text-brand-fume">
              <li><span className="hover:text-primary-700 cursor-default">Hakkımızda</span></li>
              <li><span className="hover:text-primary-700 cursor-default">Gizlilik Politikası</span></li>
              <li><span className="hover:text-primary-700 cursor-default">Kullanım Koşulları</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-brand-border pt-6 text-center">
          <p className="text-xs text-brand-fume">
            © {new Date().getFullYear()} Dorlion Ltd. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
