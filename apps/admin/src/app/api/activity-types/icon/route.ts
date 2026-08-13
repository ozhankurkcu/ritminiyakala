import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const slug = form.get('slug') as string | null;
  const file = form.get('icon') as File | null;

  if (!slug || !file) {
    return NextResponse.json({ error: 'slug ve icon gerekli' }, { status: 400 });
  }

  // Sadece PNG/JPEG/WEBP kabul et
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Sadece resim dosyası yüklenebilir' }, { status: 400 });
  }

  const ext  = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const dest = join(process.cwd(), 'public', 'icons', `${slug}.${ext}`);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  // Web app icons klasörüne de yaz (monorepo varsayımı)
  try {
    const webDest = join(process.cwd(), '..', '..', 'web', 'public', 'icons', `${slug}.${ext}`);
    await writeFile(webDest, buffer);
  } catch {
    // web app klasörü bulunamazsa sessizce geç
  }

  return NextResponse.json({ ok: true, iconUrl: `/icons/${slug}.${ext}` });
}
