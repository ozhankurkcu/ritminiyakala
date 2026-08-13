import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { action } = await request.json();
  try {
    if (action === 'cancel') {
      await adminDb.collection('activities').doc(params.id).update({ status: 'cancelled' });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'İşlem başarısız.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await adminDb.collection('activities').doc(params.id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Aktivite silinemedi.' }, { status: 500 });
  }
}
