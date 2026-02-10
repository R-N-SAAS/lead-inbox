import { Job, CustomerSettings } from '@/types';
import { getSupabaseServer, getSupabaseBrowser, isSupabaseConfigured } from './supabase';
import { mockStore } from './mock-store';

export async function createJob(data: {
  customer_id: string;
  keyword: string;
  max_results: number;
}): Promise<Job> {
  if (!isSupabaseConfigured) {
    return mockStore.createJob({
      ...data,
      status: 'queued',
      sheet_url: null,
      csv_url: null,
      error: null,
      make_run_id: null,
      lead_count: null,
    });
  }

  const sb = getSupabaseServer()!;
  const { data: job, error } = await sb
    .from('jobs')
    .insert({
      customer_id: data.customer_id,
      keyword: data.keyword,
      max_results: data.max_results,
      status: 'queued',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return job as Job;
}

export async function getJob(id: string): Promise<Job | null> {
  if (!isSupabaseConfigured) return mockStore.getJob(id);

  const sb = getSupabaseServer()!;
  const { data, error } = await sb.from('jobs').select('*').eq('id', id).single();
  if (error) return null;
  return data as Job;
}

export async function getJobs(customerId: string): Promise<Job[]> {
  if (!isSupabaseConfigured) return mockStore.getJobs(customerId);

  const sb = getSupabaseServer()!;
  const { data, error } = await sb
    .from('jobs')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data || []) as Job[];
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
  if (!isSupabaseConfigured) return mockStore.updateJob(id, updates);

  const sb = getSupabaseServer()!;
  const { data, error } = await sb
    .from('jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data as Job;
}

export async function getSettings(customerId: string): Promise<CustomerSettings | null> {
  if (!isSupabaseConfigured) return mockStore.getSettings(customerId);

  const sb = getSupabaseServer()!;
  const { data, error } = await sb
    .from('customer_settings')
    .select('*')
    .eq('customer_id', customerId)
    .single();

  if (error) return null;
  return data as CustomerSettings;
}

export async function upsertSettings(settings: {
  customer_id: string;
  make_webhook_url: string;
  company_name: string | null;
}): Promise<CustomerSettings> {
  if (!isSupabaseConfigured) return mockStore.upsertSettings(settings);

  const sb = getSupabaseServer()!;
  const { data, error } = await sb
    .from('customer_settings')
    .upsert(
      { ...settings, updated_at: new Date().toISOString() },
      { onConflict: 'customer_id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CustomerSettings;
}

export async function fetchJobClient(id: string): Promise<Job | null> {
  const res = await fetch(`/api/jobs?id=${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchJobsClient(customerId: string): Promise<Job[]> {
  const res = await fetch(`/api/jobs?customer_id=${customerId}`);
  if (!res.ok) return [];
  return res.json();
}
