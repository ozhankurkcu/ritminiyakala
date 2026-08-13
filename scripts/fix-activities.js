const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const sa = require('../serviceAccount.json');
initializeApp({ credential: cert(sa) });
const db = getFirestore('ritminiyakala-db');

// Gerçek kullanıcılar
const USERS = [
  { id: 'ath2duibz5xsvkuw', name: 'Ayşe Demir' },
  { id: 'u5mbcjx6ydmt03m2', name: 'Mert Özkan' },
  { id: 'hvp1tld64vu191l2', name: 'Burak Ateş' },
  { id: 'lyveixuzpnlfkwe4', name: 'Selin Koç' },
  { id: 't6tausoloqpb3sbp', name: 'Sinan Kaplan' },
  { id: 'iwtnotlt4u4jhtud', name: 'Gamze Polat' },
  { id: 'ktst30clvmb7lx2a', name: 'Koray Şahin' },
  { id: 'm6uayjhj0bbb43lz', name: 'Volkan Çelik' },
  { id: 'jd3swsrywazo2tdh', name: 'Leyla Ünlü' },
  { id: 'gzxj1iq51v2j00ph', name: 'Cem Aktaş' },
  // Katılımcı havuzu
  { id: 'bz3bkwnco4ts8hvs', name: 'Ahmet Yılmaz' },
  { id: 'a20ki05hzdfkvqlx', name: 'Mehmet Kaya' },
  { id: '3c55aicogquv19rr', name: 'Dilara Yaman' },
  { id: 'al5nfwqpy24df3z6', name: 'Hüseyin Doğan' },
  { id: '9mh93gdclr0l4tu0', name: 'Emre Şimşek' },
  { id: 'a6wxf6fbjt99ezqa', name: 'Merve Tunç' },
  { id: 'fl7s2d3g9rlglznv', name: 'Alp Korkmaz' },
  { id: '148nvj67p5i8u6w9', name: 'Ece Bulut' },
  { id: '27kpjqi21yrxnbx1', name: 'Derya Acar' },
  { id: 'el8omn1f1rtlkv23', name: 'Ömer Çakır' },
  { id: 'f4zy742o0ee9wtkm', name: 'Neslihan Güven' },
  { id: 'fho7xpmiewfzz8vj', name: 'Burcu Çetin' },
  { id: 'rbmxg2g8ungcnr9g', name: 'İbrahim Kurt' },
  { id: 'iidmlq5l08eihxyc', name: 'Elif Kılıç' },
  { id: 'vvkq20jmvud0m61x', name: 'Tuncay Avcı' },
];

// Az önce eklenen aktiviteler: id → organizatör index (0-9) + katılımcı listesi
const ACTIVITY_MAP = [
  { id: 'cgUsLStfx2NiqLLgxX1F', orgIdx: 0, participants: [10, 11, 12] },           // Sabah Yürüyüşü
  { id: 'J8HODvdrDxadjaOCOc31', orgIdx: 1, participants: [13, 14] },                // Padel
  { id: '3WkpXba2ZB6PnHMiYs83', orgIdx: 2, participants: [15, 16, 17, 18, 19, 20] },// Bisiklet
  { id: 'M92Kw97JPl1KL7THzuVz', orgIdx: 3, participants: [10, 11, 12, 21, 22, 23, 24] }, // Fitness
  { id: 'QJx1OY3zhuapTBTqtG3Z', orgIdx: 4, participants: [13, 14, 15, 16, 17, 18, 19, 20, 21] }, // 5K Koşu
  { id: 'nlPoAGpghCvo6PaZy5T3', orgIdx: 5, participants: [22, 23, 24, 10, 11, 12, 13] }, // Salsa
  { id: 'AqiwS6gP83VIoJ7Uszp8', orgIdx: 6, participants: [] },                      // Tenis (1 katılımcı - organizatör)
  { id: 'fhATea5kELFyATAQnCSk', orgIdx: 7, participants: [14, 15, 16, 17, 18] },   // Futbol
  { id: 'i7sEgNsvSoBZyvoQHIu4', orgIdx: 8, participants: [19, 20, 21, 22, 23, 24] }, // Doğa
  { id: 'p2Yknf0PTv75lzbNzxXz', orgIdx: 9, participants: [10, 11, 12] },            // Basketbol
];

async function main() {
  for (const act of ACTIVITY_MAP) {
    const org = USERS[act.orgIdx];
    const ref = db.collection('activities').doc(act.id);

    // Organizatör bilgisini güncelle
    await ref.update({
      organizerId:   org.id,
      organizerName: org.name,
      createdBy:     org.id,
      updatedAt:     FieldValue.serverTimestamp(),
    });

    // Mevcut katılımcıları temizle
    const existingParts = await ref.collection('participants').get();
    for (const p of existingParts.docs) await p.ref.delete();

    // Organizatörü katılımcı olarak ekle
    await ref.collection('participants').doc(org.id).set({
      userId:      org.id,
      displayName: org.name,
      photoURL:    null,
      status:      'confirmed',
      joinedAt:    FieldValue.serverTimestamp(),
    });

    // Diğer katılımcıları ekle
    for (const pidx of act.participants) {
      const u = USERS[pidx];
      await ref.collection('participants').doc(u.id).set({
        userId:      u.id,
        displayName: u.name,
        photoURL:    null,
        status:      'confirmed',
        joinedAt:    FieldValue.serverTimestamp(),
      });
    }

    const total = 1 + act.participants.length;
    await ref.update({ currentParticipants: total });

    console.log(`✓ ${act.id} → Organizatör: ${org.name}, Katılımcı: ${total}`);
  }
  console.log('\nTamamlandı!');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
