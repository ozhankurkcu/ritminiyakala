import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export type AIProviderFormat = 'openai-images' | 'stability-v2' | 'replicate' | 'fal';
export type AICapability = 'image-generation' | 'text-generation';

export interface AIProvider {
  id: string;
  name: string;
  format: AIProviderFormat;
  baseUrl: string;
  apiKey: string;
  model: string;
  capabilities: AICapability[];
  params: Record<string, string>;
  active: boolean;
  createdAt: string;
}

const COL = () => adminDb.collection('aiProviders');

export async function GET() {
  const snap = await COL().orderBy('createdAt', 'desc').get();
  const providers = snap.docs.map((d) => {
    const data = d.data();
    return {
      id:           d.id,
      name:         data.name        ?? '',
      format:       data.format      ?? 'openai-images',
      baseUrl:      data.baseUrl     ?? '',
      apiKey:       '',               // never return key
      hasKey:       !!data.apiKey,
      model:        data.model       ?? '',
      capabilities: data.capabilities ?? [],
      params:       data.params      ?? {},
      active:       data.active      ?? true,
      createdAt:    data.createdAt   ?? '',
    };
  });
  return NextResponse.json(providers);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<AIProvider>;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'İsim zorunlu.' }, { status: 400 });
  }

  const doc: Record<string, unknown> = {
    name:         body.name.trim(),
    format:       body.format       ?? 'openai-images',
    baseUrl:      body.baseUrl      ?? '',
    model:        body.model        ?? '',
    capabilities: body.capabilities ?? [],
    params:       body.params       ?? {},
    active:       body.active       ?? true,
    createdAt:    new Date().toISOString(),
  };
  if (body.apiKey?.trim()) doc.apiKey = body.apiKey.trim();

  const ref = await COL().add(doc);
  return NextResponse.json({ ok: true, id: ref.id });
}
