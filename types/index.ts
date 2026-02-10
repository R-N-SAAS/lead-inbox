export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface Job {
  id: string;
  customer_id: string;
  keyword: string;
  max_results: number;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  sheet_url: string | null;
  csv_url: string | null;
  error: string | null;
  make_run_id: string | null;
  lead_count: number | null;
}

export interface CustomerSettings {
  id: string;
  customer_id: string;
  make_webhook_url: string;
  company_name: string | null;
  updated_at: string;
}

export interface CallbackPayload {
  job_id: string;
  status: 'running' | 'done' | 'failed';
  sheet_url?: string;
  csv_url?: string;
  error?: string;
  lead_count?: number;
  make_run_id?: string;
  secret: string;
}

// What gets sent to Make webhook
export interface TriggerPayload {
  job_id: string;
  keyword: string;
  max_results: number;
  region: 'Germany';
  result_type: 'Company Search';
  customer_id: string;
}
