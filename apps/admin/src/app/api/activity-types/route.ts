import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { existsSync } from 'fs';
import { join } from 'path';

const REF = () => adminDb.collection('activityTypeConfig').doc('main');

const SYSTEM_TYPES = [
  { slug: 'yuruyus',       label: 'Yürüyüş',      category: 'bireysel-sporlar' },
  { slug: 'kosu',          label: 'Koşu',          category: 'bireysel-sporlar' },
  { slug: 'tenis',         label: 'Tenis',         category: 'bireysel-sporlar' },
  { slug: 'padel',         label: 'Padel',         category: 'bireysel-sporlar' },
  { slug: 'bisiklet',      label: 'Bisiklet',      category: 'bireysel-sporlar' },
  { slug: 'futbol',        label: 'Futbol',        category: 'takim-sporlari'   },
  { slug: 'basketbol',     label: 'Basketbol',     category: 'takim-sporlari'   },
  { slug: 'dans',          label: 'Dans',          category: 'dans-sanat'       },
  { slug: 'fitness',       label: 'Fitness',       category: 'fitness-saglik'   },
  { slug: 'doga-sporlari', label: 'Doğa Sporları', category: 'doga-acik-hava'  },
  { slug: 'diger',         label: 'Diğer',         category: 'diger'            },
];

function iconPath(slug: string) {
  return join(process.cwd(), 'public', 'icons', `${slug}.png`);
}

export async function GET() {
  const snap = await REF().get();
  const config = snap.exists ? snap.data()! : {};

  const types = SYSTEM_TYPES
    .filter((t) => existsSync(iconPath(t.slug)) || config.iconOverride?.[t.slug])
    .map((t, i) => ({
      ...t,
      iconUrl:          config.iconOverride?.[t.slug] ?? `/icons/${t.slug}.png`,
      order:            config.order?.[t.slug]            ?? i,
      active:           config.inactive?.[t.slug]         !== true,
      deleted:          config.deleted?.[t.slug]          === true,
      customLabel:      config.customLabel?.[t.slug]      ?? null,
      description:      config.description?.[t.slug]      ?? null,
      categoryOverride: config.categoryOverride?.[t.slug] ?? null,
    }))
    .filter((t) => !t.deleted)
    .sort((a, b) => a.order - b.order);

  return NextResponse.json(types);
}

// PATCH: update a single field or a full edit object
export async function PATCH(req: NextRequest) {
  const body = await req.json() as Record<string, unknown>;
  const snap = await REF().get();
  const config: Record<string, Record<string, unknown>> = snap.exists
    ? (snap.data() as Record<string, Record<string, unknown>>)
    : {};

  const ensure = (key: string) => ({ ...(config[key] ?? {}) });

  if (body.bulk) {
    // Full edit save: { bulk: true, slug, label, description, category, active, iconUrl? }
    const { slug, label, description, category, active, iconUrl } = body as {
      slug: string; label: string; description: string; category: string; active: boolean; iconUrl?: string;
    };

    const customLabel      = ensure('customLabel');
    const descMap          = ensure('description');
    const categoryOverride = ensure('categoryOverride');
    const inactive         = ensure('inactive');
    const iconOverride     = ensure('iconOverride');

    // label — store only if different from original
    const original = SYSTEM_TYPES.find((t) => t.slug === slug);
    if (label && label !== original?.label) customLabel[slug] = label;
    else delete customLabel[slug];

    if (description?.trim()) descMap[slug] = description.trim();
    else delete descMap[slug];

    if (category && category !== original?.category) categoryOverride[slug] = category;
    else delete categoryOverride[slug];

    if (!active) inactive[slug] = true;
    else delete inactive[slug];

    if (iconUrl) iconOverride[slug] = iconUrl;

    await REF().set({ ...config, customLabel, description: descMap, categoryOverride, inactive, iconOverride }, { merge: true });

  } else if (body.field === 'order') {
    await REF().set({ ...config, order: body.value }, { merge: true });

  } else if (body.field === 'delete') {
    const deleted = ensure('deleted');
    deleted[body.slug as string] = true;
    await REF().set({ ...config, deleted }, { merge: true });
  }

  return NextResponse.json({ ok: true });
}
