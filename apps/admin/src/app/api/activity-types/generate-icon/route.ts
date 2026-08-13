import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

type ProviderDoc = {
  name:    string;
  format:  string;
  baseUrl: string;
  apiKey:  string;
  model:   string;
  params:  Record<string, string>;
};

// ── Adapters ───────────────────────────────────────────────────────────────────

// Text-to-image (no reference)
async function callOpenAIImages(p: ProviderDoc, prompt: string): Promise<Buffer> {
  const endpointPath = p.params?.endpointPath || '/images/generations';
  const url = `${p.baseUrl.replace(/\/$/, '')}${endpointPath}`;
  const body: Record<string, unknown> = {
    model:  p.model || 'gpt-image-1',
    prompt,
    n:      1,
    size:   p.params?.size || '1024x1024',
  };
  if (p.params?.style) body.style = p.params.style;

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${p.apiKey}` },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${p.name} hata [${res.status}] → ${url}\n${await res.text()}`);

  const data = await res.json() as { data?: { b64_json?: string; url?: string }[] };
  const item = data.data?.[0];
  if (!item) throw new Error(`${p.name}: yanıtta 'data' alanı yok. Ham: ${JSON.stringify(data).slice(0, 300)}`);
  if (item.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item.url) return Buffer.from(await (await fetch(item.url)).arrayBuffer());
  throw new Error(`${p.name}: yanıtta b64_json veya url yok. Item: ${JSON.stringify(item).slice(0, 300)}`);
}

// Image-to-image with reference (OpenAI /images/edits)
async function callOpenAIEdits(p: ProviderDoc, prompt: string, refBuffer: Buffer): Promise<Buffer> {
  const url = `${p.baseUrl.replace(/\/$/, '')}/images/edits`;
  const form = new FormData();
  form.append('model',  p.model || 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('n',      '1');
  form.append('size',   p.params?.size || '1024x1024');
  form.append('image',  new Blob([refBuffer], { type: 'image/png' }), 'reference.png');

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${p.apiKey}` },
    body:    form,
  });
  if (!res.ok) throw new Error(`${p.name} edits hata [${res.status}] → ${url}\n${await res.text()}`);

  const data = await res.json() as { data?: { b64_json?: string; url?: string }[] };
  const item = data.data?.[0];
  if (!item) throw new Error(`${p.name}: edits yanıtında 'data' yok.`);
  if (item.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item.url) return Buffer.from(await (await fetch(item.url)).arrayBuffer());
  throw new Error(`${p.name}: edits yanıtında görüntü yok.`);
}

async function callStabilityV2(p: ProviderDoc, prompt: string): Promise<Buffer> {
  const base = p.baseUrl.replace(/\/$/, '') || 'https://api.stability.ai';
  const form = new FormData();
  form.append('prompt',        prompt);
  form.append('aspect_ratio',  p.params?.aspect_ratio  || '1:1');
  form.append('style_preset',  p.params?.style_preset  || 'digital-art');
  form.append('output_format', 'png');

  const res = await fetch(`${base}/v2beta/stable-image/generate/core`, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${p.apiKey}`, 'Accept': 'image/*' },
    body:    form,
  });
  if (!res.ok) throw new Error(`${p.name} hata: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function callReplicate(p: ProviderDoc, prompt: string): Promise<Buffer> {
  const base  = p.baseUrl.replace(/\/$/, '') || 'https://api.replicate.com/v1';
  const model = p.model || 'black-forest-labs/flux-schnell';

  const createRes = await fetch(`${base}/models/${model}/predictions`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${p.apiKey}` },
    body:    JSON.stringify({ input: { prompt, aspect_ratio: '1:1', output_format: 'png', num_outputs: 1 } }),
  });
  if (!createRes.ok) throw new Error(`${p.name} hata: ${await createRes.text()}`);
  const pred = await createRes.json() as { id: string; urls: { get: string } };

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(pred.urls.get, { headers: { 'Authorization': `Bearer ${p.apiKey}` } });
    const result  = await pollRes.json() as { status: string; output?: string[] };
    if (result.status === 'succeeded' && result.output?.[0]) {
      return Buffer.from(await (await fetch(result.output[0])).arrayBuffer());
    }
    if (result.status === 'failed') throw new Error(`${p.name}: üretim başarısız.`);
  }
  throw new Error(`${p.name}: zaman aşımı.`);
}

async function callFal(p: ProviderDoc, prompt: string): Promise<Buffer> {
  const base  = p.baseUrl.replace(/\/$/, '') || 'https://fal.run';
  const model = p.model || 'fal-ai/flux/schnell';

  const res = await fetch(`${base}/${model}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${p.apiKey}` },
    body:    JSON.stringify({ prompt, image_size: 'square_hd', num_images: 1 }),
  });
  if (!res.ok) throw new Error(`${p.name} hata: ${await res.text()}`);
  const data = await res.json() as { images: { url: string }[] };
  return Buffer.from(await (await fetch(data.images[0].url)).arrayBuffer());
}

// ── Main route ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { subject, providerId, targetId, targetType, referenceSlug } = await req.json() as {
      subject:       string;
      providerId:    string;
      targetId:      string;
      targetType:    'system' | 'proposal';
      referenceSlug?: string;   // mevcut sistem ikonu slug'ı, stil referansı olarak
    };

    if (!subject?.trim())    return NextResponse.json({ error: 'Konu (subject) gerekli.' }, { status: 400 });
    if (!providerId?.trim()) return NextResponse.json({ error: 'Provider seçilmedi.' },     { status: 400 });

    // Provider
    const provSnap = await adminDb.collection('aiProviders').doc(providerId).get();
    if (!provSnap.exists) return NextResponse.json({ error: 'Provider bulunamadı.' }, { status: 404 });
    const provider = provSnap.data()! as ProviderDoc;
    if (!provider.apiKey) return NextResponse.json({ error: `${provider.name} için API key tanımlı değil.` }, { status: 400 });

    // Prompt
    const configSnap = await adminDb.collection('activityTypeConfig').doc('aiConfig').get();
    const config     = configSnap.exists ? configSnap.data()! : {};
    const template   = (config.promptTemplate as string) ?? 'A minimalist flat icon representing {subject}.';
    const prompt     = template.replace('{subject}', subject.trim());

    // Referans ikon dosyası (varsa)
    let refBuffer: Buffer | null = null;
    if (referenceSlug) {
      const refPath = join(process.cwd(), 'public', 'icons', `${referenceSlug}.png`);
      if (existsSync(refPath)) refBuffer = await readFile(refPath);
    }

    // Generate
    let buffer: Buffer;
    const fmt = provider.format;

    if (fmt === 'openai-images') {
      buffer = refBuffer
        ? await callOpenAIEdits(provider, prompt, refBuffer)   // stil referanslı
        : await callOpenAIImages(provider, prompt);             // saf text-to-image
    } else if (fmt === 'stability-v2') buffer = await callStabilityV2(provider, prompt);
    else if  (fmt === 'replicate')     buffer = await callReplicate(provider, prompt);
    else if  (fmt === 'fal')           buffer = await callFal(provider, prompt);
    else return NextResponse.json({ error: `Desteklenmeyen format: ${fmt}` }, { status: 400 });

    // Kaydet
    const subfolder = targetType === 'proposal' ? 'custom' : '';
    const folder    = join(process.cwd(), 'public', 'icons', subfolder);
    await mkdir(folder, { recursive: true });
    const filename = `${targetId}.png`;
    await writeFile(join(folder, filename), buffer);

    // Web app'e kopyala (apps/admin → ../web = apps/web)
    try {
      const webFolder = join(process.cwd(), '..', 'web', 'public', 'icons', subfolder);
      await mkdir(webFolder, { recursive: true });
      await writeFile(join(webFolder, filename), buffer);
    } catch (copyErr) {
      console.warn('[generate-icon] web app kopyalama başarısız:', copyErr);
    }

    const iconUrl = subfolder ? `/icons/${subfolder}/${filename}` : `/icons/${filename}`;
    return NextResponse.json({ ok: true, iconUrl, provider: provider.name });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    console.error('[generate-icon]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
