import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Handle incoming email replies
 * This endpoint is called by email service webhooks (Resend, SendGrid, etc.)
 * or by Make.com/Zapier integrations
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify webhook signature
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    
    // Support multiple webhook formats
    const {
      // Standard format
      leadId,
      leadEmail,
      fromEmail,
      fromName,
      subject,
      content,
      textContent,
      htmlContent,
      
      // Resend format
      to,
      from,
      text,
      html,
      
      // Raw data for debugging
      rawPayload,
    } = body;

    // Normalize data
    const normalizedData = {
      leadId: leadId || null,
      leadEmail: leadEmail || to?.[0]?.email || to,
      fromEmail: fromEmail || from?.email || from,
      fromName: fromName || from?.name,
      subject: subject || body.subject || '(Kein Betreff)',
      content: content || textContent || text || stripHtml(htmlContent || html || ''),
    };

    // Validate required fields
    if (!normalizedData.leadEmail && !normalizedData.leadId) {
      return NextResponse.json(
        { error: 'Either leadId or leadEmail is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find the lead
    let lead = null;
    
    if (normalizedData.leadId) {
      const { data } = await supabase
        .from('leads')
        .select('id, email, status, org_id')
        .eq('id', normalizedData.leadId)
        .single();
      lead = data;
    } else if (normalizedData.leadEmail) {
      // Find by email (most recent lead with this email)
      const { data } = await supabase
        .from('leads')
        .select('id, email, status, org_id')
        .eq('email', normalizedData.leadEmail.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      lead = data;
    }

    if (!lead) {
      console.log('No lead found for:', normalizedData.leadEmail || normalizedData.leadId);
      
      // Optionally create a new lead from the reply
      // This could be enabled via configuration
      return NextResponse.json(
        { 
          success: false, 
          message: 'Lead not found',
          processed: false,
        },
        { headers: corsHeaders }
      );
    }

    // Create conversation entry
    const conversation = {
      lead_id: lead.id,
      org_id: lead.org_id,
      direction: 'inbound',
      channel: 'email',
      subject: normalizedData.subject,
      content: normalizedData.content,
      replied_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { error: convError } = await supabase
      .from('conversations')
      .insert(conversation);

    if (convError) {
      console.error('Error creating conversation:', convError);
      // Continue anyway - we still want to update the lead status
    }

    // Update lead status to 'replied' if it was 'new' or 'replied' before
    // Don't downgrade from 'qualified', 'offer_sent', 'won', 'lost'
    const statusesToUpdate = ['new'];
    
    if (statusesToUpdate.includes(lead.status)) {
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          status: 'replied',
          last_contact_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      if (updateError) {
        console.error('Error updating lead status:', updateError);
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Reply processed',
        leadId: lead.id,
        newStatus: statusesToUpdate.includes(lead.status) ? 'replied' : lead.status,
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Email Reply Webhook Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Simple HTML to text conversion
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}
