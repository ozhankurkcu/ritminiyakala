/**
 * Login teşhis + düzeltme scripti (SADECE LOKAL — kendi makinende çalıştır).
 *
 * Kullanım (apps/web klasöründen):
 *   Sadece teşhis:            node scripts/fix-login.cjs
 *   Şifreyi sıfırla+doğrula:  node scripts/fix-login.cjs "YeniSifre123"
 *
 * Ne yapar:
 *   - ozhankurkcu@gmail.com hesabını Firebase'de bulur
 *   - emailVerified / provider / şifre var mı bilgisini yazar
 *   - Argüman olarak yeni şifre verirsen: şifreyi ayarlar + emailVerified=true yapar
 *
 * Gizli: serviceAccount.json kullanır, git'e commit edilmez.
 */
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

const EMAIL = 'ozhankurkcu@gmail.com';
const newPassword = process.argv[2]; // opsiyonel

const serviceAccount = require(path.resolve(__dirname, '../../../serviceAccount.json'));
initializeApp({ credential: cert(serviceAccount) });

(async () => {
  try {
    const user = await getAuth().getUserByEmail(EMAIL);

    console.log('\n===== HESAP BULUNDU =====');
    console.log('uid           :', user.uid);
    console.log('email         :', user.email);
    console.log('emailVerified :', user.emailVerified);
    console.log('disabled      :', user.disabled);
    console.log('providers     :', user.providerData.map((p) => p.providerId).join(', ') || '(yok)');
    console.log('şifre var mı  :', !!user.passwordHash ? 'EVET (email/şifre girişi mümkün)' : 'HAYIR (muhtemelen sadece Google)');
    console.log('oluşturulma   :', user.metadata.creationTime);
    console.log('son giriş     :', user.metadata.lastSignInTime || '(hiç)');

    if (newPassword) {
      await getAuth().updateUser(user.uid, {
        password: newPassword,
        emailVerified: true,
        disabled: false,
      });
      console.log('\n✅ ŞİFRE AYARLANDI. Artık şu bilgilerle giriş yapabilirsin:');
      console.log('   E-posta:', EMAIL);
      console.log('   Şifre  :', newPassword);
      console.log('   (emailVerified=true yapıldı, hesap aktif)');
    } else {
      console.log('\nℹ️  Şifre ayarlamak için:  node scripts/fix-login.cjs "YeniSifre123"');
    }
    process.exit(0);
  } catch (e) {
    const code = e.code || e.message;
    if (code === 'auth/user-not-found') {
      console.log('\n❌ Bu e-postayla KAYITLI HESAP YOK:', EMAIL);
      console.log('   → /signup üzerinden kayıt olman gerekiyor.');
    } else {
      console.log('\n❌ HATA:', code);
    }
    process.exit(1);
  }
})();
