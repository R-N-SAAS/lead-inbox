import { NextRequest, NextResponse } from 'next/server';
import { getJob, getJobs } from '@/lib/data';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const customerId = searchParams.get('customer_id') || session.customer_id;

  if (id) {
    const job = await getJob(id);
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(job);
  }

  const jobs = await getJobs(customerId);
  return NextResponse.json(jobs);
}
