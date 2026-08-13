import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const [listResult, fsSnap, activitiesSnap, participantsSnap] = await Promise.all([
      adminAuth.listUsers(1000),
      adminDb.collection('users').get(),
      adminDb.collection('activities').select('organizerId').get(),
      adminDb.collectionGroup('participants').get(),
    ]);

    const authMap = new Map(listResult.users.map((u) => [u.uid, u]));
    const fsMap   = new Map(fsSnap.docs.map((d) => [d.id, d.data()]));

    // Kaç aktivite organize etti
    const organizedCount: Record<string, number> = {};
    activitiesSnap.docs.forEach((doc) => {
      const uid = doc.data().organizerId;
      if (uid) organizedCount[uid] = (organizedCount[uid] ?? 0) + 1;
    });

    // Kaç aktiviteye katıldı (kendi organize ettikleri hariç)
    const joinedCount: Record<string, number> = {};
    participantsSnap.docs.forEach((doc) => {
      const uid = doc.id;
      joinedCount[uid] = (joinedCount[uid] ?? 0) + 1;
    });

    const allUids = new Set(Array.from(authMap.keys()).concat(Array.from(fsMap.keys())));

    const users = Array.from(allUids).map((uid) => {
      const auth    = authMap.get(uid);
      const profile = fsMap.get(uid) ?? {};
      const organized = organizedCount[uid] ?? 0;
      const joined    = joinedCount[uid]    ?? 0;
      return {
        uid,
        email:            auth?.email       ?? profile.email       ?? '',
        displayName:      auth?.displayName ?? profile.displayName ?? 'İsimsiz',
        photoURL:         auth?.photoURL    ?? null,
        disabled:         auth?.disabled    ?? profile.banned      ?? false,
        createdAt:        auth?.metadata.creationTime ?? profile.createdAt?.toDate?.()?.toISOString() ?? '',
        lastSignIn:       auth?.metadata.lastSignInTime ?? '',
        onboarded:        profile.onboarded  ?? false,
        city:             profile.city       ?? '',
        activityTypes:       profile.activityTypes ?? [],
        source:           auth ? 'auth' : 'firestore',
        // Plan
        plan:             profile.plan          ?? 'free',
        planStartDate:    profile.planStartDate?.toDate?.()?.toISOString() ?? profile.createdAt?.toDate?.()?.toISOString() ?? '',
        // Aktiviteler
        activitiesOrganized: organized,
        activitiesJoined:    joined,
        activitiesTotal:     joined, // joined zaten tüm katılımları içeriyor (organize ettikleri dahil)
        // Ödeme (Stripe entegre olmadan placeholder)
        totalPayment: profile.totalPayment ?? 0,
      };
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Kullanıcılar alınamadı.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, displayName, city, activityTypes } = await request.json();
    const userRecord = await adminAuth.createUser({ email, password, displayName });
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid, email, displayName,
      city: city ?? '', activityTypes: activityTypes ?? [],
      onboarded: true, plan: 'free',
      planStartDate: new Date(), createdAt: new Date(),
    });
    return NextResponse.json({ ok: true, uid: userRecord.uid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kullanıcı oluşturulamadı.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
