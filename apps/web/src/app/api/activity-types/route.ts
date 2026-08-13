import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snap = await adminDb
      .collection('activities')
      .where('activityType', '==', 'custom')
      .where('customTypeStatus', '==', 'approved')
      .get();

    // İsim bazlı deduplicate — aynı türden birden fazla aktivite olabilir
    const seen = new Set<string>();
    const types: { id: string; name: string; iconUrl: string | null }[] = [];

    snap.docs.forEach((d) => {
      const data = d.data();
      const name = (data.customTypeName as string | undefined)?.trim();
      if (!name || seen.has(name)) return;
      seen.add(name);
      types.push({
        id:      d.id,
        name,
        iconUrl: (data.customTypeIconUrl as string) ?? null,
      });
    });

    return NextResponse.json(types);
  } catch (err) {
    console.error('[/api/activity-types]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
