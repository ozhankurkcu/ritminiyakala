import { NextResponse } from 'next/server';
import { validateCredentials, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!validateCredentials(email, password)) {
    return NextResponse.json({ error: 'Geçersiz kimlik bilgileri.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, process.env.SESSION_SECRET ?? '', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 saat
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
