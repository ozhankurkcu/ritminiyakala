import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snap = await adminDb
      .collection('activities')
      .where('activityType', '==', 'custom')
      .get();

    const items = snap.docs
      .map((doc) => {
        const d = doc.data();
        return {
          id:               doc.id,
          title:            d.title            ?? '',
          customTypeName:   d.customTypeName   ?? '',
          customTypeStatus: d.customTypeStatus ?? 'pending',
          organizerName:    d.organizerName    ?? '',
          createdAt:        d.createdAt?.toDate?.()?.toISOString() ?? '',
          description:      d.customTypeDescription ?? null,
          iconUrl:          d.customTypeIconUrl     ?? null,
          active:           d.customTypeActive      !== false,
          category:         d.customTypeCategory    ?? null,
        };
      })
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Özel türler alınamadı.' }, { status: 500 });
  }
}
