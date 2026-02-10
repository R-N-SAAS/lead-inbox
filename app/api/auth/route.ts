import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSession, destroySession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, email, password } = body;

  if (action === 'logout') {
    await destroySession();
    return NextResponse.json({ ok: true });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'E-Mail und Passwort erforderlich.' }, { status: 400 });
  }

  if (!verifyCredentials(email, password)) {
    return NextResponse.json({ error: 'Ungültige Anmeldedaten.' }, { status: 401 });
  }

  await createSession(email);
  return NextResponse.json({ ok: true });
}
