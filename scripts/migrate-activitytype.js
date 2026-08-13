const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const sa = require('../serviceAccount.json');
initializeApp({ credential: cert(sa) });
const db = getFirestore('ritminiyakala-db');

async function main() {
  const snap = await db.collection('activities').get();
  console.log(`${snap.size} aktivite bulundu, ActivityType → activityType migration başlıyor...`);

  let updated = 0;
  let skipped = 0;
  const batch_size = 400;
  let batch = db.batch();
  let count = 0;

  for (const doc of snap.docs) {
    const data = doc.data();

    if ('ActivityType' in data) {
      const ref = db.collection('activities').doc(doc.id);
      batch.update(ref, {
        activityType: data.ActivityType,
        ActivityType: FieldValue.delete(),
      });
      updated++;
      count++;

      if (count >= batch_size) {
        await batch.commit();
        batch = db.batch();
        count = 0;
        console.log(`  ${updated} doküman güncellendi...`);
      }
    } else {
      skipped++;
    }
  }

  if (count > 0) await batch.commit();

  console.log(`\n✓ Tamamlandı: ${updated} güncellendi, ${skipped} zaten activityType kullanıyordu.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
