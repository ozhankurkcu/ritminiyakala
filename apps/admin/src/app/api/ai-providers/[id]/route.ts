import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const COL = () => adminDb.collection('aiProviders');

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const snap = await COL().doc(params.id).get();
  if (!snap.exists) return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 });
  const data = snap.data()!;
  return NextResponse.json({
    id:           snap.id,
    name:         data.name        ?? '',
    format:       data.format      ?? 'openai-images',
    baseUrl:      data.baseUrl     ?? '',
    hasKey:       !!data.apiKey,
    model:        data.model       ?? '',
    capabilities: data.capabilities ?? [],
    params:       data.params      ?? {},
    active:       data.active      ?? true,
    createdAt:    data.createdAt   ?? '',
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json() as Record<string, unknown>;
  const snap = await COL().doc(params.id).get();
  if (!snap.exists) return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 });

  const update: Record<string, unknown> = {};
  if (body.name         !== undefined) update.name         = body.name;
  if (body.format       !== undefined) update.format       = body.format;
  if (body.baseUrl      !== undefined) update.baseUrl      = body.baseUrl;
  if (body.model        !== undefined) update.model        = body.model;
  if (body.capabilities !== undefined) update.capabilities = body.capabilities;
  if (body.params       !== undefined) update.params       = body.params;
  if (body.active       !== undefined) update.active       = body.active;
  if (body.apiKey && String(body.apiKey).trim()) update.apiKey = String(body.apiKey).trim();

  await COL().doc(params.id).update(update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await COL().doc(params.id).delete();
  return NextResponse.json({ ok: true });
}
