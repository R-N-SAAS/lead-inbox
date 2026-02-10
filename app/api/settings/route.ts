import { NextRequest, NextResponse } from 'next/server';
import { getSettings, upsertSettings } from '@/lib/data';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await getSettings(session.customer_id);
  return NextResponse.json(settings || { customer_id: session.customer_id, make_webhook_url: '', company_name: null });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { make_webhook_url, company_name } = body;

  if (!make_webhook_url) {
    return NextResponse.json({ error: 'Webhook URL ist ein Pflichtfeld.' }, { status: 400 });
  }

  const settings = await upsertSettings({
    customer_id: session.customer_id,
    make_webhook_url,
    company_name: company_name || null,
  });

  return NextResponse.json(settings);
}
