import { NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DEFAULT_CONFIG = {
  bgType: 'gradient',
  bgGradient: 'from-[#631C99] via-[#581C87] to-[#3d0f5e]',
  bgColor: '#631C99',
  bgImage: '',
  textColor: '#ffffff',
  highlightColor: '#60E1EB',
  subTextColor: 'rgba(255,255,255,0.8)',
  bottomText: 'Kredi kartı gerekmez · Anında başla',
  intervalSeconds: 8,
  slides: [
    { id: '1', heading: 'Sporun Ritmini',     highlight: 'Birlikte Yakala',    sub: 'Yakınındaki spor aktivitelerini keşfet, yeni spor arkadaşları bul, kendi aktiviteni oluştur. Tüm sporlar, tek platform.', active: true, order: 0 },
    { id: '2', heading: 'Yeni Arkadaşlar,',   highlight: 'Yeni Başlangıçlar', sub: 'Seni bekleyen binlerce sporsever var. Aynı tutkuyu paylaşan insanlarla tanış, birlikte hareket et.', active: true, order: 1 },
    { id: '3', heading: 'Aktiviteni Oluştur,', highlight: 'Sahaya Çıkar',     sub: 'Kendi aktiviteni dakikalar içinde yayınla. Katılımcıları belirle, konumunu paylaş, oyunu başlat.', active: true, order: 2 },
    { id: '4', heading: 'Her Seviye,',         highlight: 'Her Spor',          sub: 'Futboldan yogaya, bisikletten satranç turnuvalarına — hangi spor olursa olsun, sana uygun aktivite burada.', active: true, order: 3 },
    { id: '5', heading: 'Şehrin En İyi',       highlight: 'Spor Topluluğu',    sub: 'Mahallenin spor kültürünü birlikte inşa edelim. Küçük bir adımla büyük bir topluluğun parçası ol.', active: true, order: 4 },
  ],
};

export async function GET() {
  try {
    const snap = await getDoc(doc(db, 'heroConfig', 'main'));
    if (!snap.exists()) return NextResponse.json(DEFAULT_CONFIG);
    return NextResponse.json({ ...DEFAULT_CONFIG, ...snap.data() });
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}
