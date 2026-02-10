import { cookies } from 'next/headers';

const SESSION_COOKIE = 'lg_session';
const DEMO_USER = process.env.DEMO_USER || 'admin@leadgen.local';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demo1234';
const DEFAULT_CUSTOMER_ID = process.env.DEFAULT_CUSTOMER_ID || 'demo-customer';

export interface Session {
  email: string;
  customer_id: string;
}

export function verifyCredentials(email: string, password: string): boolean {
  return email === DEMO_USER && password === DEMO_PASSWORD;
}

export async function createSession(email: string): Promise<void> {
  const session: Session = { email, customer_id: DEFAULT_CUSTOMER_ID };
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64');
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encoded, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
