// app/api/scraper/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

// ── Validierung (spiegelt searchParams.js vom Backend) ──
const VALID_LOCATIONS = [
  "Deutschland",
  "Berlin", "München", "Hamburg", "Köln", "Frankfurt",
  "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen",
  "Bremen", "Dresden", "Hannover", "Nürnberg", "Duisburg",
  "Bochum", "Bielefeld", "Bonn", "Münster", "Karlsruhe",
  "Mannheim", "Augsburg", "Wiesbaden", "Braunschweig", "Kiel",
  "Chemnitz", "Aachen", "Freiburg", "Lübeck", "Rostock",
  "Kassel", "Ulm", "Regensburg", "Würzburg", "Heilbronn", "Konstanz",
];

const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  pro: 500,
  enterprise: 2000,
};

function validateParams(params: any, plan: string = "free"): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const limit = PLAN_LIMITS[plan] ?? 50;

  if (!params.query || params.query.trim().length < 2)
    errors.push("Suchbegriff muss mindestens 2 Zeichen haben.");

  if (!VALID_LOCATIONS.includes(params.location))
    errors.push("Ungültiger Standort.");

  if (!["phone", "email", "both"].includes(params.contactMode))
    errors.push("Kontaktmodus ungültig. Verwende: phone | email | both");

  const target = parseInt(params.targetLeads, 10);
  if (isNaN(target) || target < 1)
    errors.push("Anzahl Ergebnisse muss mindestens 1 sein.");
  if (target > limit)
    errors.push(`Dein Plan (${plan}) erlaubt max. ${limit} Leads.`);

  return { valid: errors.length === 0, errors };
}

// ── Haupthandler ──
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // ── 1. Body parsen ──
    const {
      query,
      location,
      employees,        // boolean
      contactMode,      // "phone" | "email" | "both"
      websiteRequired,  // boolean
      targetLeads,      // number
      plan = "free",    // vom Auth-User, default free
    } = await request.json();

    // ── 2. Validieren ──
    const { valid, errors } = validateParams(
      { query, location, contactMode, targetLeads },
      plan
    );

    if (!valid) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // ── 3. Node.js Scraper starten ──
    // Pfad zum Scraper anpassen falls nötig
    const scraperPath = path.resolve(process.cwd(), 'final-scraper', 'index.js');

    // Umgebungsvariablen als Env-Vars übergeben (wie unsere .env)
    const env = {
      ...process.env,
      QUERY:             query.trim(),
      LOCATION:          location,
      MAX_RESULTS:       String(Math.ceil(parseInt(targetLeads) * 2.5)), // Puffer
      EMPLOYEES:         String(employees),
      CONTACT_MODE:      contactMode,
      WEBSITE_REQUIRED:  String(websiteRequired),
      TARGET_LEADS:      String(targetLeads),
      HEADLESS:          'true',
      OUTPUT_DIR:        path.resolve(process.cwd(), 'final-scraper', 'data', 'output'),
    };

    const { stdout, stderr } = await execFileAsync(
      'node',
      [scraperPath],
      { env, timeout: 14400000 } // 4h Timeout für große Runs
    );

    // ── 4. Output lesen ──
    // Der Scraper schreibt qualified_leads.json in OUTPUT_DIR
    const fs = await import('fs');
    const outputFile = path.resolve(env.OUTPUT_DIR, 'qualified_leads.json');

    if (!fs.existsSync(outputFile)) {
      return NextResponse.json(
        { success: false, error: 'Scraper hat keine Ergebnisse geliefert.' },
        { status: 500 }
      );
    }

    const raw = fs.readFileSync(outputFile, 'utf-8');
    const scraperOutput = JSON.parse(raw);
    const scrapedLeads = scraperOutput.leads || [];

    // ── 5. In Supabase-Format mappen ──
    // Passt auf sein bestehendes Lead-Interface
    const leadsToInsert = scrapedLeads.map((lead: any) => ({
      name:       lead.name,
      email:      lead.email || null,
      phone:      lead.phone || null,
      message:    `Gefunden: ${lead.address || ''}\nWebsite: ${lead.website || ''}\nMitarbeiter: ${lead.employees || 'N/A'}`,
      status:     'new',
      source:     'scraper',
      priority:   'medium',
      created_at: new Date().toISOString(),
    }));

    // ── 6. In Supabase speichern ──
    const { data, error } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select();

    if (error) throw error;

    // ── 7. Antwort ──
    return NextResponse.json({
      success: true,
      count:   data.length,
      leads:   data,
    });

  } catch (error: any) {
    console.error('Scraper API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
