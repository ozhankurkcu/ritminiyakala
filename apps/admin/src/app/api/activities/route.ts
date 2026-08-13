import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// "Kadıköy Moda Parkı, İstanbul" → "İstanbul"
function extractCity(address: string): string {
  if (!address) return '—';
  const parts = address.split(',');
  return parts[parts.length - 1]?.trim() ?? '—';
}

export async function GET() {
  try {
    const snap = await adminDb.collection('activities').orderBy('startTime', 'desc').get();
    const activities = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id:                  doc.id,
        title:               d.title ?? '',
        activityType:           d.activityType ?? '',
        organizerName:       d.organizerName ?? '',
        startTime:           d.startTime?.toDate?.()?.toISOString() ?? '',
        status:              d.status ?? 'scheduled',
        currentParticipants: d.currentParticipants ?? 0,
        maxParticipants:     d.maxParticipants ?? 0,
        location: {
          address:   d.location?.address ?? '',
          city:      d.location?.city ?? extractCity(d.location?.address ?? ''),
          latitude:  d.location?.latitude  ?? 0,
          longitude: d.location?.longitude ?? 0,
        },
      };
    });
    return NextResponse.json(activities);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Aktiviteler alınamadı.' }, { status: 500 });
  }
}
