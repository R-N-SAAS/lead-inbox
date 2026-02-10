import { NextRequest, NextResponse } from 'next/server';
import { updateJob } from '@/lib/data';
import { CallbackPayload } from '@/types';

export async function POST(req: NextRequest) {
  const body: CallbackPayload = await req.json();
  const { job_id, status, sheet_url, csv_url, error, lead_count, make_run_id, secret } = body;

  // Verify shared secret
  const expectedSecret = process.env.MAKE_CALLBACK_SECRET || 'my-secret-token-change-me';
  const headerSecret = req.headers.get('x-callback-secret');

  if (secret !== expectedSecret && headerSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
  }

  if (!job_id || !status) {
    return NextResponse.json({ error: 'job_id and status required' }, { status: 400 });
  }

  if (!['running', 'done', 'failed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const updated = await updateJob(job_id, {
    status,
    ...(sheet_url && { sheet_url }),
    ...(csv_url && { csv_url }),
    ...(error && { error }),
    ...(lead_count !== undefined && { lead_count }),
    ...(make_run_id && { make_run_id }),
  });

  if (!updated) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, job: updated });
}
