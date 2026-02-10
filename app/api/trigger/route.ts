import { NextRequest, NextResponse } from 'next/server';
import { createJob, getSettings } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { TriggerPayload } from '@/types';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { keyword, max_results } = body;

  if (!keyword) {
    return NextResponse.json({ error: 'Suchbegriff ist ein Pflichtfeld.' }, { status: 400 });
  }

  const maxResults = Math.min(Math.max(Number(max_results) || 5000, 1), 5000);
  const customerId = session.customer_id;

  const settings = await getSettings(customerId);
  const envWebhook = process.env.DEFAULT_MAKE_WEBHOOK_URL;
  const webhookUrl = settings?.make_webhook_url || envWebhook;

  console.log('[TRIGGER] settings webhook:', settings?.make_webhook_url);
  console.log('[TRIGGER] env webhook:', envWebhook);
  console.log('[TRIGGER] using webhook:', webhookUrl);

  if (!webhookUrl || webhookUrl.includes('DEMO') || webhookUrl.includes('YOUR_WEBHOOK')) {
    console.log('[TRIGGER] → DEMO MODE (no real webhook)');
    // Demo mode: simulate
    const job = await createJob({
      customer_id: customerId,
      keyword,
      max_results: maxResults,
    });

    setTimeout(async () => {
      const { updateJob } = await import('@/lib/data');
      await updateJob(job.id, { status: 'running' });
      setTimeout(async () => {
        await updateJob(job.id, {
          status: 'done',
          sheet_url: `https://docs.google.com/spreadsheets/d/DEMO_${job.id}/edit`,
          lead_count: Math.floor(Math.random() * Math.min(maxResults, 3000)) + 50,
        });
      }, 8000);
    }, 3000);

    return NextResponse.json({ job });
  }

  // Production: create job + trigger Make
  const job = await createJob({
    customer_id: customerId,
    keyword,
    max_results: maxResults,
  });

  // Payload an Make – Region & Result Type werden hier hardcoded mitgeschickt
  const payload: TriggerPayload = {
    job_id: job.id,
    keyword,
    max_results: maxResults,
    region: 'Germany',
    result_type: 'Company Search',
    customer_id: customerId,
  };

  try {
    const makeRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!makeRes.ok) {
      const { updateJob } = await import('@/lib/data');
      await updateJob(job.id, {
        status: 'failed',
        error: `Make Webhook Fehler: HTTP ${makeRes.status}`,
      });
      return NextResponse.json(
        { error: 'Make Webhook konnte nicht erreicht werden.', job },
        { status: 502 }
      );
    }

    return NextResponse.json({ job });
  } catch (err: any) {
    const { updateJob } = await import('@/lib/data');
    await updateJob(job.id, {
      status: 'failed',
      error: `Verbindungsfehler: ${err.message}`,
    });
    return NextResponse.json({ error: err.message, job }, { status: 500 });
  }
}
