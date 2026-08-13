import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { rows } = await request.json() as {
      rows: { email: string; displayName: string; password: string; city?: string }[]
    };

    const results = await Promise.allSettled(
      rows.map(async (row) => {
        const user = await adminAuth.createUser({
          email:       row.email,
          password:    row.password || 'Rny2024!',
          displayName: row.displayName,
        });
        await adminDb.collection('users').doc(user.uid).set({
          uid:        user.uid,
          email:      row.email,
          displayName: row.displayName,
          city:       row.city ?? '',
          activityTypes: [],
          onboarded:  true,
          createdAt:  new Date(),
        });
        return user.uid;
      })
    );

    const success = results.filter((r) => r.status === 'fulfilled').length;
    const failed  = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({ success, failed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Import başarısız.' }, { status: 500 });
  }
}
