import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function PATCH(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const body = await request.json();
  const { uid } = params;

  try {
    if (body.action === 'ban') {
      await adminAuth.updateUser(uid, { disabled: true });
      await adminDb.collection('users').doc(uid).update({ banned: true });

    } else if (body.action === 'unban') {
      await adminAuth.updateUser(uid, { disabled: false });
      await adminDb.collection('users').doc(uid).update({ banned: false });

    } else if (body.action === 'reset-password') {
      const user = await adminAuth.getUser(uid);
      if (!user.email) return NextResponse.json({ error: 'E-posta bulunamadı.' }, { status: 400 });
      const link = await adminAuth.generatePasswordResetLink(user.email);
      return NextResponse.json({ ok: true, link });

    } else if (body.action === 'update-plan') {
      await adminDb.collection('users').doc(uid).update({
        plan: body.plan,
        planStartDate: new Date(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'İşlem başarısız.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { uid: string } }
) {
  const { uid } = params;
  try {
    await Promise.all([
      adminAuth.deleteUser(uid).catch(() => null), // seed kullanıcıları auth'ta olmayabilir
      adminDb.collection('users').doc(uid).delete(),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Kullanıcı silinemedi.' }, { status: 500 });
  }
}
