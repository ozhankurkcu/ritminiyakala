import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json() as {
      action:          string;
      customTypeName?: string;
      status?:         string;
      description?:    string;
      category?:       string;
      active?:         boolean;
      iconUrl?:        string;
    };
    const { action, customTypeName, status, description, category, active, iconUrl } = body;
    const ref = adminDb.collection('activities').doc(params.id);

    if (action === 'approve') {
      await ref.update({
        customTypeStatus: 'approved',
        ...(customTypeName ? { customTypeName } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else if (action === 'reject') {
      await ref.update({
        customTypeStatus: 'rejected',
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else if (action === 'edit-type') {
      await ref.update({
        customTypeName,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else if (action === 'save') {
      await ref.update({
        ...(customTypeName !== undefined ? { customTypeName }            : {}),
        ...(status         !== undefined ? { customTypeStatus: status }  : {}),
        ...(description !== undefined ? { customTypeDescription: description || null } : {}),
        ...(category    !== undefined ? { customTypeCategory: category }               : {}),
        ...(active      !== undefined ? { customTypeActive: active }                   : {}),
        ...(iconUrl        !== undefined ? { customTypeIconUrl: iconUrl } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else if (action === 'delete') {
      await ref.delete();
    } else {
      return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'İşlem başarısız.' }, { status: 500 });
  }
}
