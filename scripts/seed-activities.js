const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore('ritminiyakala-db');

const now = new Date();
const d = (daysFromNow, hour = 10) => {
  const t = new Date(now);
  t.setDate(t.getDate() + daysFromNow);
  t.setHours(hour, 0, 0, 0);
  return Timestamp.fromDate(t);
};

const activities = [
  {
    title: 'Sabah Yürüyüşü — Moda Sahili',
    description: 'Haftanın başında enerjik bir başlangıç yapmak isteyenler için Moda sahil şeridinde keyifli bir sabah yürüyüşü. Her seviyeye uygun, tempolu ama rahat bir rota.',
    activityType: 'yuruyus',
    skillLevel: 'beginner',
    experience: 'beginner',
    visibility: 'public',
    scheduleType: 'once',
    location: { address: 'Moda Sahili, Kadıköy, İstanbul', latitude: 40.9847, longitude: 29.0307 },
    startTime: d(2, 7),
    endTime:   d(2, 9),
    maxParticipants: 20,
    currentParticipants: 3,
    organizerId: 'seed-user-001',
    organizerName: 'Ayşe Demir',
    status: 'scheduled',
  },
  {
    title: 'Padel Maçı — Karma Çiftler',
    description: 'Ataşehir\'deki modern padel kortlarında karma çiftler maçı. Orta seviye oyuncular için ideal. Raket ve top sahada mevcut.',
    activityType: 'padel',
    skillLevel: 'intermediate',
    experience: 'regular',
    visibility: 'public',
    scheduleType: 'once',
    location: { address: 'Ataşehir Padel Club, Ataşehir, İstanbul', latitude: 40.9923, longitude: 29.1244 },
    startTime: d(3, 18),
    endTime:   d(3, 20),
    maxParticipants: 4,
    currentParticipants: 2,
    organizerId: 'seed-user-002',
    organizerName: 'Mert Özkan',
    status: 'scheduled',
  },
  {
    title: 'Bisiklet Turu — Belgrad Ormanı',
    description: 'Belgrad Ormanı\'nın doğal güzelliklerini keşfeden yaklaşık 25 km\'lik bir bisiklet turu. MTB veya hybrid bisiklet önerilir. Su ve atıştırmalık getirmeyi unutmayın.',
    activityType: 'bisiklet',
    skillLevel: 'intermediate',
    experience: 'regular',
    visibility: 'public',
    scheduleType: 'once',
    location: { address: 'Belgrad Ormanı Giriş Kapısı, Sarıyer, İstanbul', latitude: 41.1720, longitude: 28.9870 },
    startTime: d(5, 8),
    endTime:   d(5, 12),
    maxParticipants: 15,
    currentParticipants: 7,
    organizerId: 'seed-user-003',
    organizerName: 'Burak Ateş',
    status: 'scheduled',
  },
  {
    title: 'Açık Hava Fitness — Maçka Parkı',
    description: 'Maçka Parkı\'nda TRX, fonksiyonel egzersizler ve kardiyo içeren 60 dakikalık açık hava antrenmanı. Spor ayakkabı ve su şişesi ile gelin.',
    activityType: 'fitness',
    skillLevel: 'beginner',
    experience: 'irregular',
    visibility: 'public',
    scheduleType: 'once',
    location: { address: 'Maçka Parkı, Beşiktaş, İstanbul', latitude: 41.0443, longitude: 28.9987 },
    startTime: d(4, 7),
    endTime:   d(4, 8),
    maxParticipants: 25,
    currentParticipants: 11,
    organizerId: 'seed-user-004',
    organizerName: 'Selin Koç',
    status: 'scheduled',
  },
  {
    title: '5K Koşu — Bostancı Kordon',
    description: 'Bostancı kordon boyunca tempolu 5 km\'lik koşu. Orta tempoda başlayıp bitişte sprint yapacağız. Koşu deneyimi olan herkese açık.',
    activityType: 'kosu',
    skillLevel: 'intermediate',
    experience: 'regular',
    visibility: 'public',
    scheduleType: 'once',
    location: { address: 'Bostancı Kordon, Kadıköy, İstanbul', latitude: 40.9634, longitude: 29.0913 },
    startTime: d(6, 6),
    endTime:   d(6, 7),
    maxParticipants: 30,
    currentParticipants: 14,
    organizerId: 'seed-user-005',
    organizerName: 'Sinan Kaplan',
    status: 'scheduled',
  },
  {
    title: 'Salsa Başlangıç Atölyesi',
    description: 'Dans etmeyi hiç bilmeyenler için tasarlanmış 90 dakikalık Salsa başlangıç atölyesi. Adım adım öğreniyoruz, utanmayın — herkes yeni başladı bir zamanlar!',
    activityType: 'dans',
    skillLevel: 'beginner',
    experience: 'beginner',
    visibility: 'public',
    scheduleType: 'once',
    location: { address: 'Cihangir Dans Stüdyosu, Beyoğlu, İstanbul', latitude: 41.0328, longitude: 28.9815 },
    startTime: d(7, 19),
    endTime:   d(7, 21),
    maxParticipants: 16,
    currentParticipants: 9,
    organizerId: 'seed-user-006',
    organizerName: 'Gamze Polat',
    status: 'scheduled',
  },
  {
    title: 'Tenis Mikst Çiftler — Orta Seviye',
    description: 'Levent tenis kortlarında mikst çiftler maçı. Düzenli oynayan orta seviye oyuncular için. Kort rezervasyonu yapıldı, sadece gelmeniz yeterli.',
    activityType: 'tenis',
    skillLevel: 'intermediate',
    experience: 'regular',
    visibility: 'public',
    scheduleType: 'once',
    location: { address: 'Levent Tenis Kulübü, Levent, İstanbul', latitude: 41.0808, longitude: 29.0117 },
    startTime: d(8, 17),
    endTime:   d(8, 19),
    maxParticipants: 4,
    currentParticipants: 1,
    organizerId: 'seed-user-007',
    organizerName: 'Koray Şahin',
    status: 'scheduled',
  },
  {
    title: 'Hafta Sonu Futbol — 7\'ye 7',
    description: 'Bağcılar kapalı sahada 7\'ye 7 hafta sonu futbolu. Takımlar eşit dağıtılacak. Krampon ve şort ile gelin, forma verilecek.',
    activityType: 'futbol',
    skillLevel: 'intermediate',
    experience: 'irregular',
    visibility: 'public',
    scheduleType: 'once',
    location: { address: 'Bağcılar Kapalı Futbol Sahası, Bağcılar, İstanbul', latitude: 41.0394, longitude: 28.8561 },
    startTime: d(9, 15),
    endTime:   d(9, 17),
    maxParticipants: 14,
    currentParticipants: 6,
    organizerId: 'seed-user-008',
    organizerName: 'Volkan Çelik',
    status: 'scheduled',
  },
  {
    title: 'Doğa Yürüyüşü — Polonezköy',
    description: 'İstanbul\'un yeşil ciğeri Polonezköy\'de sakin ve dinlendirici bir doğa yürüyüşü. Yaklaşık 8 km, hafif eğimli parkur. Piknik malzemesi getirenler için uygun mola noktaları var.',
    activityType: 'doga-sporlari',
    skillLevel: 'beginner',
    experience: 'beginner',
    visibility: 'public',
    scheduleType: 'once',
    location: { address: 'Polonezköy Tabiat Parkı, Beykoz, İstanbul', latitude: 41.1583, longitude: 29.2022 },
    startTime: d(10, 9),
    endTime:   d(10, 13),
    maxParticipants: 20,
    currentParticipants: 8,
    organizerId: 'seed-user-009',
    organizerName: 'Leyla Ünlü',
    status: 'scheduled',
  },
  {
    title: 'Basketbol 3x3 — Kadıköy Sahası',
    description: 'Kadıköy açık basketbol sahasında 3x3 sokak basketbolu. Takımlar yerinde oluşturulacak, herkes oynar. Spor ayakkabı zorunlu.',
    activityType: 'basketbol',
    skillLevel: 'beginner',
    experience: 'irregular',
    visibility: 'public',
    scheduleType: 'once',
    location: { address: 'Kadıköy Açık Basketbol Sahası, Kadıköy, İstanbul', latitude: 40.9903, longitude: 29.0231 },
    startTime: d(11, 16),
    endTime:   d(11, 18),
    maxParticipants: 12,
    currentParticipants: 4,
    organizerId: 'seed-user-010',
    organizerName: 'Cem Aktaş',
    status: 'scheduled',
  },
];

async function main() {
  console.log('10 yeni aktivite ekleniyor...');
  for (const activity of activities) {
    const ref = await db.collection('activities').add({
      ...activity,
      customTypeName:   null,
      customTypeStatus: null,
      recurrence:       null,
      createdBy:        activity.organizerId,
      createdAt:        FieldValue.serverTimestamp(),
      updatedAt:        FieldValue.serverTimestamp(),
    });

    // Organizatör otomatik katılımcı
    await db.collection('activities').doc(ref.id)
      .collection('participants').doc(activity.organizerId).set({
        userId:      activity.organizerId,
        displayName: activity.organizerName,
        photoURL:    null,
        status:      'confirmed',
        joinedAt:    FieldValue.serverTimestamp(),
      });

    console.log(`✓ ${activity.title} (${ref.id})`);
  }
  console.log('\nTamamlandı! 10 aktivite eklendi.');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
