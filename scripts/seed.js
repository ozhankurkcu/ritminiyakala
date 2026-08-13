const { initializeApp, cert }  = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount.json');

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore('ritminiyakala-db');

// ── Sabit veriler ──────────────────────────────────────────────────────────

const ACTIVITY_TYPES = [
  'yuruyus', 'kosu', 'tenis', 'dans', 'fitness',
  'padel', 'bisiklet', 'futbol', 'basketbol', 'doga-sporlari', 'diger',
];

const ACTIVITY_LABELS = {
  yuruyus: 'Yürüyüş', kosu: 'Koşu', tenis: 'Tenis', dans: 'Dans',
  fitness: 'Fitness', padel: 'Padel', bisiklet: 'Bisiklet',
  futbol: 'Futbol', basketbol: 'Basketbol', 'doga-sporlari': 'Doğa Sporları', diger: 'Diğer',
};

const EXPERIENCE_LEVELS = ['beginner', 'irregular', 'regular', 'daily'];
const VISIBILITY        = ['public', 'friends', 'private'];
const SKILL_LEVELS      = ['beginner', 'intermediate', 'advanced'];

// Aktivite dağılımı: %20 yürüyüş, %6 koşu, %6 tenis, %12 dans, kalan rasgele
// 50 kullanıcı → primary sport dağılımı:
const PRIMARY_ACTIVITY_POOL = [
  ...Array(10).fill('yuruyus'),   // %20 → 10 kullanıcı
  ...Array(3).fill('kosu'),       // %6  → 3 kullanıcı
  ...Array(3).fill('tenis'),      // %6  → 3 kullanıcı
  ...Array(6).fill('dans'),       // %12 → 6 kullanıcı
  // Kalan 28 kullanıcı → diğer sporlar (yürüyüş/koşu/tenis/dans hariç)
  ...Array(28).fill('other'),
];

const OTHER_SPORTS = ['fitness', 'padel', 'bisiklet', 'futbol', 'basketbol', 'doga-sporlari', 'diger'];

const TR_NAMES = [
  'Ahmet Yılmaz', 'Mehmet Kaya', 'Ayşe Demir', 'Fatma Çelik', 'Ali Şahin',
  'Zeynep Arslan', 'Mustafa Öztürk', 'Elif Kılıç', 'Hüseyin Doğan', 'Hande Aydın',
  'İbrahim Kurt', 'Selin Koç', 'Ömer Çakır', 'Büşra Yıldız', 'Emre Şimşek',
  'Gamze Polat', 'Kemal Erdoğan', 'Neslihan Güven', 'Serkan Aksoy', 'Ece Bulut',
  'Baran Kılınç', 'Merve Tunç', 'Tuncay Avcı', 'Dilara Yaman', 'Orhan Özdemir',
  'Cansu Türk', 'Ufuk Demirci', 'Seda Aslan', 'Tolga Güneş', 'Burcu Çetin',
  'Alp Korkmaz', 'İrem Yalçın', 'Caner Özer', 'Pınar Şen', 'Burak Ateş',
  'Derya Acar', 'Sinan Kaplan', 'Gizem Başar', 'Oğuz Erdem', 'Tuğba Saygı',
  'Mert Özkan', 'Esra Arslan', 'Volkan Çelik', 'Nazlı Kara', 'Deniz Başaran',
  'Leyla Ünlü', 'Cem Aktaş', 'Yasemin Güler', 'Koray Şahin', 'Aslı Durmaz',
];

const LOCATIONS = [
  'Kadıköy Moda Parkı, İstanbul',
  'Beşiktaş Sahil Yolu, İstanbul',
  'Maçka Parkı, İstanbul',
  'Göztepe Parkı, İstanbul',
  'Bağcılar Spor Salonu, İstanbul',
  'Bostancı Kordon, İstanbul',
  'Ataşehir Spor Kompleksi, İstanbul',
  'Çamlıca Koşu Parkuru, İstanbul',
  'Bakırköy Botanik Park, İstanbul',
  'Sarıyer Sahil, İstanbul',
  'Üsküdar Meydanı, İstanbul',
  'Fatih Sultan Mehmet Köprüsü Altı, İstanbul',
  'Fenerbahçe Parkı, İstanbul',
  'Levent Fitness Center, İstanbul',
  'Başakşehir Spor Salonu, İstanbul',
];

const ACTIVITY_TITLES = {
  yuruyus:        ['Sabah yürüyüşü', 'Akşam parkur yürüyüşü', 'Hafta sonu doğa yürüyüşü', 'Sahil yürüyüşü', 'Tempolu yürüyüş antrenmanı'],
  kosu:           ['5K koşu grubu', 'Sabah koşusu', 'Parkur koşusu', 'Maraton hazırlık koşusu', 'Interval antrenmanı'],
  tenis:          ['Tenis maçı', 'Tenis antrenmanı', 'Çift tenis', 'Tenis turnuvası hazırlık', 'Tenis buluşması'],
  dans:           ['Salsa dans dersi', 'Latin dansı', 'Halk dansları', 'Dans buluşması', 'Bachata pratiği'],
  fitness:        ['Sabah fitness', 'HIIT antrenmanı', 'Güç antrenmanı', 'Fonksiyonel fitness', 'Crossfit seansı'],
  padel:          ['Padel maçı', 'Padel antrenmanı', 'Çift padel', 'Padel turnuvası', 'Padel buluşması'],
  bisiklet:       ['Sabah bisikleti', 'Şehir bisikleti', 'MTB rotası', 'Uzun mesafe bisiklet', 'Bisiklet turu'],
  futbol:         ['Halı saha maçı', 'Futbol antrenmanı', '5v5 futbol', 'Futbol buluşması', 'Maç günü'],
  basketbol:      ['3v3 basketbol', 'Basketbol antrenmanı', 'Sokak basketbolu', 'Basketbol maçı', 'Shootaround'],
  'doga-sporlari':['Dağ yürüyüşü', 'Kamp trekking', 'Doğa rotası', 'Orman yürüyüşü', 'Doğa keşfi'],
  diger:          ['Spor buluşması', 'Aktif gün', 'Grup antrenmanı', 'Spor etkinliği', 'Açık hava aktivitesi'],
};

// ── Yardımcı fonksiyonlar ──────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function futureDate(daysAhead, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

// ── Kullanıcı oluştur ──────────────────────────────────────────────────────

function createUserDoc(userId, name, primarySport) {
  const sports = shuffle(ACTIVITY_TYPES).slice(0, randomInt(2, 5));
  if (!sports.includes(primarySport)) sports[0] = primarySport;

  return {
    email:            `${name.toLowerCase().replace(/\s+/g, '.').replace(/[ğüşıöçĞÜŞİÖÇ]/g, c => ({ğ:'g',ü:'u',ş:'s',ı:'i',ö:'o',ç:'c',Ğ:'G',Ü:'U',Ş:'S',İ:'I',Ö:'O',Ç:'C'}[c]||c))}@example.com`,
    displayName:      name,
    photoURL:         null,
    bio:              `${ACTIVITY_LABELS[primarySport]} tutkunu. Sporu hayatın bir parçası olarak görüyorum.`,
    sportPreferences: sports,
    skillLevel:       pick(SKILL_LEVELS),
    experience:       pick(EXPERIENCE_LEVELS),
    experienceYears:  randomInt(1, 15),
    location:         null,
    isEmailVerified:  true,
    status:           'active',
    createdAt:        FieldValue.serverTimestamp(),
    updatedAt:        FieldValue.serverTimestamp(),
  };
}

// ── Aktivite oluştur ───────────────────────────────────────────────────────

function createActivityDoc(organizerId, organizerName, sport, dayOffset) {
  const startHour  = pick([7, 8, 9, 10, 11, 17, 18, 19]);
  const duration   = pick([1, 1.5, 2]);
  const startTime  = futureDate(dayOffset, startHour);
  const endTime    = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
  const titles     = ACTIVITY_TITLES[sport] || ACTIVITY_TITLES.diger;
  const maxP       = randomInt(4, 20);

  return {
    title:               pick(titles),
    description:         `${ACTIVITY_LABELS[sport]} etkinliği. Herkese açık, gel birlikte yapalım!`,
    activityType:           sport,
    skillLevel:          pick([...SKILL_LEVELS, 'all']),
    experience:          pick(EXPERIENCE_LEVELS),
    visibility:          pick(VISIBILITY),
    scheduleType:        Math.random() > 0.3 ? 'once' : 'recurring',
    recurrence:          null,
    location: {
      latitude:  0,
      longitude: 0,
      address:   pick(LOCATIONS),
    },
    startTime:           Timestamp.fromDate(startTime),
    endTime:             Timestamp.fromDate(endTime),
    maxParticipants:     maxP,
    currentParticipants: randomInt(1, Math.max(1, maxP - 1)),
    organizerId,
    organizerName,
    createdBy:           organizerId,
    status:              'scheduled',
    createdAt:           FieldValue.serverTimestamp(),
    updatedAt:           FieldValue.serverTimestamp(),
  };
}

// ── Ana seed fonksiyonu ────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seed başlıyor — 50 kullanıcı + aktiviteler...\n');

  const activityPool = shuffle(PRIMARY_ACTIVITY_POOL);
  let activityCount = 0;

  for (let i = 0; i < 50; i++) {
    const name        = TR_NAMES[i];
    const userId      = uid();
    let   primarySport = activityPool[i];

    if (primarySport === 'other') primarySport = pick(OTHER_SPORTS);

    // Kullanıcı dokümanı
    const userDoc = createUserDoc(userId, name, primarySport);
    await db.collection('users').doc(userId).set(userDoc);

    // Her kullanıcıya en az 3 farklı spor türünde 2-3 aktivite
    const userSports = [primarySport];
    const otherAvailable = ACTIVITY_TYPES.filter(s => s !== primarySport);
    const extraSports    = shuffle(otherAvailable).slice(0, randomInt(2, 3));
    userSports.push(...extraSports);

    let dayOffset = randomInt(1, 5);

    for (const sport of userSports) {
      const variations = randomInt(2, 3);
      for (let v = 0; v < variations; v++) {
        const actDoc = createActivityDoc(userId, name, sport, dayOffset);
        const actRef = db.collection('activities').doc();

        const batch = db.batch();
        batch.set(actRef, actDoc);

        // Organizatör otomatik katılımcı
        batch.set(
          actRef.collection('participants').doc(userId),
          {
            userId,
            displayName: name,
            photoURL:    null,
            status:      'confirmed',
            joinedAt:    FieldValue.serverTimestamp(),
          }
        );

        await batch.commit();
        activityCount++;
        dayOffset += randomInt(1, 7);
      }
    }

    process.stdout.write(`\r✓ ${i + 1}/50 kullanıcı oluşturuldu`);
  }

  console.log(`\n\n✅ Tamamlandı!`);
  console.log(`   👥 50 kullanıcı`);
  console.log(`   🏃 ${activityCount} aktivite`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});
