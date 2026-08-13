import { cookies } from 'next/headers';

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const SESSION_COOKIE = 'admin_session';

export function checkAdminSession(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === process.env.SESSION_SECRET;
}

export function validateCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export { SESSION_COOKIE };
