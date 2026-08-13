const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const sa = require('../serviceAccount.json');
initializeApp({ credential: cert(sa) });
const db = getFirestore('ritminiyakala-db');

const ACTIVITY_TYPE_CATEGORY = {
  yuruyus:         'bireysel-sporlar',
  kosu:            'bireysel-sporlar',
  tenis:           'bireysel-sporlar',
  padel:           'bireysel-sporlar',
  bisiklet:        'bireysel-sporlar',
  futbol:          'takim-sporlari',
  basketbol:       'takim-sporlari',
  dans:            'dans-sanat',
  fitness:         'fitness-saglik',
  'doga-sporlari': 'doga-acik-hava',
  diger:           'diger',
};

const CUSTOM_TYPE_CATEGORY = {
  'Satranç':         'zihin-oyunlari',
  'Okçuluk':         'bireysel-sporlar',
  'Kaligrafi':       'dans-sanat',
  'Sörf':            'su-sporlari',
  'Kaya Tırmanışı':  'doga-acik-hava',
  'Drone Yarışı':    'e-spor',
  'Akrobasi':        'dans-sanat',
  'Fotoğrafçılık':   'dans-sanat',
  'Stand-up Paddle': 'su-sporlari',
  'Parkur':          'bireysel-sporlar',
  'Eskrim':          'bireysel-sporlar',
  'Boks':            'bireysel-sporlar',
  'Trambolin':       'fitness-saglik',
  'Kano':            'su-sporlari',
  'E-Spor':          'e-spor',
  'Meditasyon':      'fitness-saglik',
  'Masa Tenisi':     'bireysel-sporlar',
  'Hip-Hop Dans':    'dans-sanat',
  'Nefes Egzersizi': 'fitness-saglik',
};

async function main() {
  const snap = await db.collection('activities').get();
  console.log(`${snap.size} aktivite bulundu, category ekleniyor...`);

  let updated = 0;
  let skipped = 0;
  const batchSize = 400;
  let batch = db.batch();
  let count = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();

    if (data.category) {
      skipped++;
      continue;
    }

    let category = 'diger';
    if (data.activityType === 'custom' && data.customTypeName) {
      category = CUSTOM_TYPE_CATEGORY[data.customTypeName] ?? 'diger';
    } else if (data.activityType) {
      category = ACTIVITY_TYPE_CATEGORY[data.activityType] ?? 'diger';
    }

    batch.update(docSnap.ref, { category });
    updated++;
    count++;

    if (count >= batchSize) {
      await batch.commit();
      batch = db.batch();
      count = 0;
      console.log(`  ${updated} güncellendi...`);
    }
  }

  if (count > 0) await batch.commit();

  console.log(`\n✓ Tamamlandı: ${updated} güncellendi, ${skipped} zaten category içeriyordu.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
