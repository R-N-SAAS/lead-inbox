import { Job, CustomerSettings } from '@/types';

const mockJobs: Map<string, Job> = new Map();
const mockSettings: Map<string, CustomerSettings> = new Map();

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const seedJobs: Job[] = [
  {
    id: 'demo-001',
    customer_id: 'demo-customer',
    keyword: 'Maschinenbau',
    max_results: 5000,
    status: 'done',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2 + 300000).toISOString(),
    sheet_url: 'https://docs.google.com/spreadsheets/d/DEMO_SHEET_1/edit',
    csv_url: null,
    error: null,
    make_run_id: null,
    lead_count: 2847,
  },
  {
    id: 'demo-002',
    customer_id: 'demo-customer',
    keyword: 'IT Dienstleister',
    max_results: 2000,
    status: 'done',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000 + 180000).toISOString(),
    sheet_url: 'https://docs.google.com/spreadsheets/d/DEMO_SHEET_2/edit',
    csv_url: null,
    error: null,
    make_run_id: null,
    lead_count: 1512,
  },
  {
    id: 'demo-003',
    customer_id: 'demo-customer',
    keyword: 'Logistik',
    max_results: 5000,
    status: 'failed',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3500000).toISOString(),
    sheet_url: null,
    csv_url: null,
    error: 'Apify Actor timeout nach 120s. Bitte erneut versuchen.',
    make_run_id: null,
    lead_count: null,
  },
];

seedJobs.forEach((j) => mockJobs.set(j.id, j));

mockSettings.set('demo-customer', {
  id: 'settings-001',
  customer_id: 'demo-customer',
  make_webhook_url: process.env.DEFAULT_MAKE_WEBHOOK_URL || 'https://hook.eu2.make.com/DEMO',
  company_name: 'Demo GmbH',
  updated_at: new Date().toISOString(),
});

export const mockStore = {
  async createJob(data: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
    const job: Job = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockJobs.set(job.id, job);
    return job;
  },

  async getJob(id: string): Promise<Job | null> {
    return mockJobs.get(id) || null;
  },

  async getJobs(customerId: string): Promise<Job[]> {
    return Array.from(mockJobs.values())
      .filter((j) => j.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async updateJob(id: string, data: Partial<Job>): Promise<Job | null> {
    const job = mockJobs.get(id);
    if (!job) return null;
    const updated = { ...job, ...data, updated_at: new Date().toISOString() };
    mockJobs.set(id, updated);
    return updated;
  },

  async getSettings(customerId: string): Promise<CustomerSettings | null> {
    return mockSettings.get(customerId) || null;
  },

  async upsertSettings(data: Omit<CustomerSettings, 'id' | 'updated_at'>): Promise<CustomerSettings> {
    const existing = mockSettings.get(data.customer_id);
    const settings: CustomerSettings = {
      id: existing?.id || generateId(),
      ...data,
      updated_at: new Date().toISOString(),
    };
    mockSettings.set(data.customer_id, settings);
    return settings;
  },
};
