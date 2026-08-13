import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const REF = () => adminDb.collection('activityTypeConfig').doc('aiConfig');

const DEFAULT_PROMPT = `A minimalist flat-style icon representing {subject}.
Clean vector look, bold simple shapes, vibrant single background color that fits the Ritminiyakala brand palette (deep purple #631C99 or energetic orange #E07000).
No text, no shadows, no gradients. White or light foreground icon.
Style: modern app icon, 512x512, square format.`;

export async function GET() {
  const snap = await REF().get();
  const data = snap.exists ? snap.data()! : {};

  return NextResponse.json({
    activeProvider:  data.activeProvider  ?? 'openai',
    promptTemplate:  data.promptTemplate  ?? DEFAULT_PROMPT,
    providers: {
      openai: {
        hasKey: !!data.openaiKey,
        model:  data.openaiModel ?? 'dall-e-3',
        size:   data.openaiSize  ?? '1024x1024',
        style:  data.openaiStyle ?? 'vivid',
      },
      stability: {
        hasKey:      !!data.stabilityKey,
        aspectRatio: data.stabilityAspect ?? '1:1',
        style:       data.stabilityStyle  ?? 'digital-art',
      },
      replicate: {
        hasKey: !!data.replicateKey,
        model:  data.replicateModel ?? 'black-forest-labs/flux-schnell',
      },
    },
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as Record<string, unknown>;
  const snap  = await REF().get();
  const existing = snap.exists ? snap.data()! : {};

  const update: Record<string, unknown> = { ...existing };

  if (body.activeProvider) update.activeProvider = body.activeProvider;
  if (body.promptTemplate)  update.promptTemplate  = body.promptTemplate;

  // API keys — empty string = keep existing (don't overwrite with blank)
  if (body.openaiKey    && String(body.openaiKey).trim())    update.openaiKey    = body.openaiKey;
  if (body.openaiModel)  update.openaiModel  = body.openaiModel;
  if (body.openaiSize)   update.openaiSize   = body.openaiSize;
  if (body.openaiStyle)  update.openaiStyle  = body.openaiStyle;

  if (body.stabilityKey    && String(body.stabilityKey).trim()) update.stabilityKey    = body.stabilityKey;
  if (body.stabilityAspect) update.stabilityAspect = body.stabilityAspect;
  if (body.stabilityStyle)  update.stabilityStyle  = body.stabilityStyle;

  if (body.replicateKey   && String(body.replicateKey).trim()) update.replicateKey   = body.replicateKey;
  if (body.replicateModel) update.replicateModel = body.replicateModel;

  await REF().set(update);
  return NextResponse.json({ ok: true });
}
