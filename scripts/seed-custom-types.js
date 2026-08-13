const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const sa = require('../serviceAccount.json');
initializeApp({ credential: cert(sa) });
const db = getFirestore('ritminiyakala-db');

const now = new Date();
const d = (daysFromNow, hour = 10) => {
  const t = new Date(now);
  t.setDate(t.getDate() + daysFromNow);
  t.setHours(hour, 0, 0, 0);
  return Timestamp.fromDate(t);
};

const USERS = [
  { id: 'bz3bkwnco4ts8hvs', name: 'Ahmet Yılmaz' },
  { id: 'a20ki05hzdfkvqlx', name: 'Mehmet Kaya' },
  { id: 'ath2duibz5xsvkuw', name: 'Ayşe Demir' },
  { id: 'i0y55mjalo8td2no', name: 'Fatma Çelik' },
  { id: 'u11nxe9qz0n88aw0', name: 'Ali Şahin' },
  { id: 'tlz0dm7tdmpoc43q', name: 'Zeynep Arslan' },
  { id: 'vacugkfzmw6zj4cr', name: 'Mustafa Öztürk' },
  { id: 'iidmlq5l08eihxyc', name: 'Elif Kılıç' },
  { id: 'al5nfwqpy24df3z6', name: 'Hüseyin Doğan' },
  { id: 'vxvqbku42ypzetjl', name: 'Hande Aydın' },
  { id: 'rbmxg2g8ungcnr9g', name: 'İbrahim Kurt' },
  { id: 'lyveixuzpnlfkwe4', name: 'Selin Koç' },
  { id: 'el8omn1f1rtlkv23', name: 'Ömer Çakır' },
  { id: 'rmgpu0o4oso9dyhu', name: 'Büşra Yıldız' },
  { id: '9mh93gdclr0l4tu0', name: 'Emre Şimşek' },
  { id: 'iwtnotlt4u4jhtud', name: 'Gamze Polat' },
  { id: '6z5iemfs6ezkjhsn', name: 'Kemal Erdoğan' },
  { id: 'f4zy742o0ee9wtkm', name: 'Neslihan Güven' },
  { id: 'tmrsp6b686n53my6', name: 'Serkan Aksoy' },
  { id: '148nvj67p5i8u6w9', name: 'Ece Bulut' },
];

const ACTIVITIES = [
  { customTypeName: 'Satranç',         title: 'Haftalık Satranç Turnuvası',         description: 'Her hafta Cuma akşamı düzenlenen dostane satranç turnuvası. Tüm seviyeler katılabilir, ödüllü finallar yapılır.', location: { address: 'Kadıköy Kültür Merkezi, Kadıköy, İstanbul', latitude: 40.9901, longitude: 29.0243 }, startTime: d(3, 19), endTime: d(3, 22), maxParticipants: 16, currentParticipants: 5 },
  { customTypeName: 'Okçuluk',          title: 'Okçuluk Deneyim Günü',               description: 'Geleneksel Türk okçuluğunu deneyimlemek isteyenler için başlangıç atölyesi. Ekipman sağlanacaktır.', location: { address: 'Maçka Spor Tesisi, Beşiktaş, İstanbul', latitude: 41.0443, longitude: 28.9987 }, startTime: d(5, 10), endTime: d(5, 13), maxParticipants: 12, currentParticipants: 3 },
  { customTypeName: 'Kaligrafi',        title: 'Hat Sanatı & Kaligrafi Atölyesi',    description: 'Osmanlı hat sanatını modern kaligrafi ile buluşturan yaratıcı atölye. Malzemeler dahildir.', location: { address: 'Beyoğlu Sanat Atölyesi, Beyoğlu, İstanbul', latitude: 41.0328, longitude: 28.9772 }, startTime: d(6, 14), endTime: d(6, 17), maxParticipants: 10, currentParticipants: 6 },
  { customTypeName: 'Sörf',             title: 'Sörf Başlangıç Kampı — Alaçatı',     description: 'Alaçatı koylarında 2 günlük sörf başlangıç kampı. Sörf tahtası ve wetsuit dahil. Ulaşım kendi imkânlarınızla.', location: { address: 'Alaçatı Plajı, Çeşme, İzmir', latitude: 38.2829, longitude: 26.3756 }, startTime: d(14, 9), endTime: d(14, 17), maxParticipants: 8, currentParticipants: 4 },
  { customTypeName: 'Kaya Tırmanışı',   title: 'Doğal Kaya Tırmanışı — Gebze',       description: 'Gebze\'deki doğal kaya formasyonlarında orta zorlukta tırmanış. Ekipman gereklidir, tırmanış deneyimi olan herkes katılabilir.', location: { address: 'Gebze Kaya Parkuru, Gebze, Kocaeli', latitude: 40.8023, longitude: 29.4309 }, startTime: d(8, 8), endTime: d(8, 14), maxParticipants: 10, currentParticipants: 7 },
  { customTypeName: 'Drone Yarışı',     title: 'FPV Drone Yarışı — Açık Saha',       description: 'FPV drone pilotları için engel parkurunda yarış etkinliği. Kendi drone\'unuzu getirmeniz gerekmektedir.', location: { address: 'Tuzla Açık Alan, Tuzla, İstanbul', latitude: 40.8165, longitude: 29.3001 }, startTime: d(10, 10), endTime: d(10, 14), maxParticipants: 20, currentParticipants: 8 },
  { customTypeName: 'Akrobasi',         title: 'Akrobasi & Hava Jimnastiği Atölyesi', description: 'Temel akrobasi ve hava jimnastiği hareketleri öğrenin. Mindersiz stüdyo ortamında güvenli antrenman.', location: { address: 'Şişli Jimnastik Salonu, Şişli, İstanbul', latitude: 41.0602, longitude: 28.9877 }, startTime: d(4, 15), endTime: d(4, 17), maxParticipants: 14, currentParticipants: 5 },
  { customTypeName: 'Fotoğrafçılık',    title: 'Sokak Fotoğrafçılığı Yürüyüşü',      description: 'Balat sokaklarında sokak fotoğrafçılığı yürüyüşü. DSLR, mirrorless veya telefon kameranızla katılabilirsiniz.', location: { address: 'Balat Mahallesi, Fatih, İstanbul', latitude: 41.0246, longitude: 28.9437 }, startTime: d(7, 9), endTime: d(7, 12), maxParticipants: 15, currentParticipants: 9 },
  { customTypeName: 'Stand-up Paddle',  title: 'SUP (Stand-Up Paddle) Turu',          description: 'Büyükada çevresinde stand-up paddle turu. Tahta ve kürek sağlanacaktır. Yüzme bilmek şart.', location: { address: 'Büyükada İskelesi, Büyükada, İstanbul', latitude: 40.8740, longitude: 29.1267 }, startTime: d(9, 8), endTime: d(9, 12), maxParticipants: 10, currentParticipants: 4 },
  { customTypeName: 'Parkur',           title: 'Parkur & Freerun Antrenmanı',          description: 'Kentsel parkur hareketleri — atlama, tırmanma, denge. Başlangıç ve orta seviye gruplar ayrı çalışır.', location: { address: 'Maltepe Sahil Parkı, Maltepe, İstanbul', latitude: 40.9327, longitude: 29.1522 }, startTime: d(2, 16), endTime: d(2, 18), maxParticipants: 20, currentParticipants: 11 },
  { customTypeName: 'Eskrim',           title: 'Eskrim Tanıtım Dersi',                 description: 'Olimpik eskrim sporunun temellerini öğrenin. Floret ile başlangıç tekniklerini deneyimleyin, ekipman dahil.', location: { address: 'Fatih Spor Kompleksi, Fatih, İstanbul', latitude: 41.0182, longitude: 28.9397 }, startTime: d(11, 17), endTime: d(11, 19), maxParticipants: 12, currentParticipants: 6 },
  { customTypeName: 'Satranç',          title: 'Açık Hava Satranç — Göztepe Parkı',   description: 'Göztepe Parkı\'ndaki dev satranç taşlarıyla açık hava satranç etkinliği. Herkese açık, kayıt gerekmez.', location: { address: 'Göztepe Parkı, Kadıköy, İstanbul', latitude: 40.9720, longitude: 29.0595 }, startTime: d(4, 11), endTime: d(4, 14), maxParticipants: 30, currentParticipants: 12 },
  { customTypeName: 'Boks',             title: 'Boks Fitness Antrenmanı',              description: 'Kavga yok, sadece fitness! Boks teknikleri ve kese antrenmanından oluşan 60 dk\'lık yoğun cardio seansı.', location: { address: 'Üsküdar Boks Salonu, Üsküdar, İstanbul', latitude: 41.0255, longitude: 29.0150 }, startTime: d(3, 7), endTime: d(3, 8), maxParticipants: 20, currentParticipants: 13 },
  { customTypeName: 'Trambolin',        title: 'Trambolin Parkı Buluşması',            description: 'Trambolin parkında birlikte zıplama etkinliği. Çocuk dostu, aileler de katılabilir. Çorap zorunludur.', location: { address: 'Jump Arena, Ümraniye, İstanbul', latitude: 41.0167, longitude: 29.1167 }, startTime: d(12, 13), endTime: d(12, 15), maxParticipants: 25, currentParticipants: 10 },
  { customTypeName: 'Kano',             title: 'Kano Turu — Sapanca Gölü',            description: 'Sapanca Gölü\'nde sabah kano turu. Ulaşım organize edilmektedir. Deniz fenni belgesi gerekmez, eğitim verilecek.', location: { address: 'Sapanca Gölü Kano Merkezi, Sapanca, Sakarya', latitude: 40.6867, longitude: 30.2667 }, startTime: d(15, 7), endTime: d(15, 12), maxParticipants: 12, currentParticipants: 5 },
  { customTypeName: 'E-Spor',           title: 'FIFA Turnuvası — 1v1',                 description: '1v1 FIFA turnuvası. PS5 konsollarında oynanacak. Kazanana büyük ödül, katılıma küçük ödül verilecek.', location: { address: 'Beşiktaş Gaming Lounge, Beşiktaş, İstanbul', latitude: 41.0422, longitude: 29.0067 }, startTime: d(5, 15), endTime: d(5, 22), maxParticipants: 16, currentParticipants: 9 },
  { customTypeName: 'Meditasyon',       title: 'Sabah Meditasyonu — Emirgan Korusu',  description: 'Emirgan Korusu\'nda güneş doğarken rehberli meditasyon seansı. Battaniye veya yoga matı getirmeniz önerilir.', location: { address: 'Emirgan Korusu, Sarıyer, İstanbul', latitude: 41.1065, longitude: 29.0507 }, startTime: d(6, 6), endTime: d(6, 7), maxParticipants: 30, currentParticipants: 14 },
  { customTypeName: 'Masa Tenisi',      title: 'Masa Tenisi Ligi — Haftalık Maçlar',  description: 'Her Salı düzenlenen masa tenisi ligi. Puanlama sistemi ile sezon sonunda şampiyon belirlenir.', location: { address: 'Beykoz Spor Salonu, Beykoz, İstanbul', latitude: 41.1281, longitude: 29.1181 }, startTime: d(7, 18), endTime: d(7, 21), maxParticipants: 16, currentParticipants: 7 },
  { customTypeName: 'Hip-Hop Dans',     title: 'Hip-Hop Dans Dersi — Başlangıç',      description: 'Sıfırdan hip-hop dans öğrenmek isteyenler için eğlenceli başlangıç dersi. Rahat kıyafet ve spor ayakkabı şart.', location: { address: 'Beylikdüzü Dans Stüdyosu, Beylikdüzü, İstanbul', latitude: 41.0000, longitude: 28.6500 }, startTime: d(8, 17), endTime: d(8, 19), maxParticipants: 18, currentParticipants: 11 },
  { customTypeName: 'Nefes Egzersizi',  title: 'Wim Hof Nefes & Soğuk Duş Atölyesi', description: 'Wim Hof yöntemiyle nefes egzersizleri ve soğuk terapi. Bağışıklık sisteminizi güçlendirin, stresle başa çıkın.', location: { address: 'Şişli Wellness Merkezi, Şişli, İstanbul', latitude: 41.0602, longitude: 28.9877 }, startTime: d(9, 8), endTime: d(9, 11), maxParticipants: 15, currentParticipants: 8 },
];

async function main() {
  console.log('20 özel tür aktivitesi ekleniyor...');

  for (let i = 0; i < ACTIVITIES.length; i++) {
    const act = ACTIVITIES[i];
    const user = USERS[i % USERS.length];

    const ref = await db.collection('activities').add({
      title:            act.title,
      description:      act.description,
      activityType:        'custom',
      customTypeName:   act.customTypeName,
      customTypeStatus: 'pending',
      skillLevel:       'beginner',
      experience:       'beginner',
      visibility:       'public',
      scheduleType:     'once',
      recurrence:       null,
      location:         act.location,
      startTime:        act.startTime,
      endTime:          act.endTime,
      maxParticipants:  act.maxParticipants,
      currentParticipants: act.currentParticipants,
      organizerId:      user.id,
      organizerName:    user.name,
      createdBy:        user.id,
      status:           'scheduled',
      createdAt:        FieldValue.serverTimestamp(),
      updatedAt:        FieldValue.serverTimestamp(),
    });

    // Organizatör otomatik katılımcı
    await db.collection('activities').doc(ref.id)
      .collection('participants').doc(user.id).set({
        userId:      user.id,
        displayName: user.name,
        photoURL:    null,
        status:      'confirmed',
        joinedAt:    FieldValue.serverTimestamp(),
      });

    console.log(`✓ [${act.customTypeName}] ${act.title} → ${user.name}`);
  }

  console.log('\nTamamlandı! 20 özel tür aktivitesi eklendi.');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
