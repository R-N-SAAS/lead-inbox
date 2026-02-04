import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Handle POST request - Create new lead from widget
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      message,
      orgSlug,
      source = 'widget',
      pageUrl,
      pageTitle,
    } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail ist erforderlich' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase client with service role key
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
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Optional: Look up organization by slug
    let orgId = null;
    if (orgSlug) {
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();
      
      if (org) {
        orgId = org.id;
      }
    }

    // Check for duplicate (same email in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email.toLowerCase())
      .gte('created_at', oneDayAgo)
      .maybeSingle();

    if (existingLead) {
      // Update existing lead instead of creating duplicate
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          message: message ? `${message}\n\n---\nWeitere Anfrage von: ${pageUrl || 'Widget'}` : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLead.id);

      if (updateError) {
        console.error('Error updating existing lead:', updateError);
      }

      return NextResponse.json(
        { 
          success: true, 
          message: 'Anfrage aktualisiert',
          leadId: existingLead.id,
          isUpdate: true,
        },
        { headers: corsHeaders }
      );
    }

    // Create new lead
    const newLead = {
      name: name?.trim() || null,
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      message: message?.trim() || null,
      status: 'new',
      priority: 'medium',
      source: source,
      org_id: orgId,
      raw_data: {
        pageUrl,
        pageTitle,
        userAgent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer'),
        submittedAt: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    };

    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert(newLead)
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating lead:', insertError);
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Anfrage' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Optional: Trigger notification webhook (Make.com, Zapier, etc.)
    // This would be configured in the organization settings
    // await triggerWebhook(orgId, lead);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Anfrage erfolgreich gesendet',
        leadId: lead.id,
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Widget API Error:', error);
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Optional: Handle GET request for testing
export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok', 
      service: 'Lead Inbox Widget API',
      version: '1.0.0',
    },
    { headers: corsHeaders }
  );
}
