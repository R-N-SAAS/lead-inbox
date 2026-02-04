// ============================================
// LEAD INBOX - TYPE DEFINITIONS
// Backend-kompatible Typen für Frontend
// ============================================

// Lead Status - muss mit Backend übereinstimmen
export type LeadStatus = 
  | 'new' 
  | 'replied' 
  | 'qualified' 
  | 'offer_sent' 
  | 'won' 
  | 'lost' 
  | 'unsubscribed';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export type LeadSource = 
  | 'web_form' 
  | 'widget' 
  | 'scraper' 
  | 'manual' 
  | 'api' 
  | 'import';

// Lead Interface - Backend-Tabelle: leads
export interface Lead {
  id: string;
  org_id: string;
  name: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  
  // Erweiterte Felder (Scraper)
  website?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  scraped_from?: string;
  raw_data?: Record<string, any>;
  
  // Deduplizierung
  is_duplicate?: boolean;
  duplicate_of?: string;
  
  // Tracking
  first_reply_sent_at?: string;
  last_contact_at?: string;
  custom_fields?: Record<string, any>;
  
  // Timestamps
  created_at: string;
  updated_at?: string;
}

// Conversation Interface - Backend-Tabelle: conversations
export interface Conversation {
  id: string;
  lead_id: string;
  org_id: string;
  direction: 'inbound' | 'outbound';
  channel: 'email' | 'phone' | 'sms' | 'chat';
  subject?: string;
  content: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  created_at: string;
}

// Campaign Interface - Backend-Tabelle: campaigns
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface Campaign {
  id: string;
  org_id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  from_name: string;
  from_email: string;
  reply_to?: string;
  status: CampaignStatus;
  
  // Einstellungen
  settings: {
    daily_limit: number;
    time_window_start: string; // "09:00"
    time_window_end: string;   // "18:00"
    days_of_week: number[];    // [1,2,3,4,5] = Mo-Fr
    delay_between_emails: number; // Sekunden
  };
  
  // Statistiken
  stats: {
    total_recipients: number;
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
  };
  
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
}

// Campaign Recipient - Backend-Tabelle: campaign_recipients
export type RecipientStatus = 'pending' | 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed';

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  lead_id: string;
  status: RecipientStatus;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  error_message?: string;
  created_at: string;
}

// Follow-up Sequence - Backend-Tabelle: follow_up_sequences
export interface FollowUpSequence {
  id: string;
  campaign_id: string;
  step_number: number;
  delay_days: number;
  subject: string;
  body_html: string;
  body_text?: string;
  is_active: boolean;
  created_at: string;
}

// Organization - Backend-Tabelle: organizations
export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  website?: string;
  email_settings?: {
    from_name: string;
    from_email: string;
    reply_to: string;
    signature_html: string;
  };
  widget_settings?: {
    primary_color: string;
    position: 'left' | 'right';
    greeting: string;
  };
  created_at: string;
  updated_at?: string;
}

// User - Backend-Tabelle: users
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'owner' | 'admin' | 'member';
  org_id: string;
  created_at: string;
}

// Scraping Log - Backend-Tabelle: scraping_logs
export interface ScrapingLog {
  id: string;
  org_id: string;
  source: string;
  query: string;
  leads_found: number;
  leads_inserted: number;
  leads_duplicate: number;
  status: 'running' | 'completed' | 'failed';
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageResponseTime: number; // in Stunden
  leadsByStatus: Record<LeadStatus, number>;
  leadsBySource: Record<LeadSource, number>;
  leadsOverTime: Array<{
    date: string;
    count: number;
  }>;
  recentLeads: Lead[];
}

// Campaign Stats
export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalReplied: number;
  openRate: number;
  replyRate: number;
  campaignsOverTime: Array<{
    date: string;
    sent: number;
    opened: number;
    replied: number;
  }>;
}

// Widget Configuration
export interface WidgetConfig {
  orgSlug: string;
  primaryColor: string;
  position: 'left' | 'right';
  greeting: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'textarea';
    required: boolean;
  }>;
}

// Form State Types
export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface CampaignFormData {
  name: string;
  subject: string;
  body_html: string;
  from_name: string;
  daily_limit: number;
  time_window_start: string;
  time_window_end: string;
  days_of_week: number[];
}

// Filter Types
export interface LeadFilters {
  search?: string;
  status?: LeadStatus | 'all';
  priority?: LeadPriority | 'all';
  source?: LeadSource | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface CampaignFilters {
  search?: string;
  status?: CampaignStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
}
