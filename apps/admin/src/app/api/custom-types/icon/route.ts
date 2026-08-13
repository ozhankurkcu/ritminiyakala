import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Proposal ikonları public/icons/custom/ klasöründe saklanır
// (sistem ikonlarıyla karışmaması için)
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const id   = form.get('id')   as string | null;
  const file = form.get('icon') as File   | null;

  if (!id || !file) {
    return NextResponse.json({ error: 'id ve icon gerekli' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Sadece resim dosyası yüklenebilir' }, { status: 400 });
  }

  const ext    = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const folder = join(process.cwd(), 'public', 'icons', 'custom');
  await mkdir(folder, { recursive: true });

  const filename = `${id}.${ext}`;
  await writeFile(join(folder, filename), Buffer.from(await file.arrayBuffer()));

  // Web app'e de kopyala
  try {
    const webFolder = join(process.cwd(), '..', '..', 'web', 'public', 'icons', 'custom');
    await mkdir(webFolder, { recursive: true });
    await writeFile(join(webFolder, filename), Buffer.from(await file.arrayBuffer()));
  } catch { /* sessiz geç */ }

  return NextResponse.json({ ok: true, iconUrl: `/icons/custom/${filename}` });
}
