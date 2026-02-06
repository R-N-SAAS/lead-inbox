// app/api/scraper/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

// ── Validierung ──
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

const VALID_RADII = [0, 10, 25, 50, 75, 100];

const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  pro: 500,
  enterprise: 2000,
};

function validateParams(
  params: any,
  plan: string = "free"
): { valid: boolean; errors: string[] } {
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

  // Radius validieren
  const radius = parseInt(params.radius, 10);
  if (!isNaN(radius) && !VALID_RADII.includes(radius))
    errors.push("Ungültiger Umkreis. Erlaubt: 0, 10, 25, 50, 75, 100 km.");

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
      radius = 0,        // Umkreis in km (neu)
      employees,          // boolean
      contactMode,        // "phone" | "email" | "both"
      websiteRequired,    // boolean
      targetLeads,        // number
      plan = "free",
    } = await request.json();

    // ── 2. Validieren ──
    const { valid, errors } = validateParams(
      { query, location, radius, contactMode, targetLeads },
      plan
    );

    if (!valid) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // ── 3. Suchquery mit Radius aufbauen ──
    // Bei Radius > 0 wird der Suchbegriff um den Umkreis erweitert
    let searchLocation = location;
    if (radius > 0 && location !== "Deutschland") {
      // Google Maps versteht "in München und Umgebung" oder wir nutzen
      // den Radius-Parameter direkt für den Scraper
      searchLocation = `${location} und Umgebung ${radius}km`;
    }

    // ── 4. Node.js Scraper starten ──
    const scraperPath = path.resolve(process.cwd(), 'final-scraper', 'index.js');
    const outputDir = path.resolve(process.cwd(), 'final-scraper', 'data', 'output');

    const env = {
      ...process.env,
      QUERY:             query.trim(),
      LOCATION:          location,
      RADIUS:            String(radius),
      SEARCH_LOCATION:   searchLocation,
      MAX_RESULTS:       String(Math.ceil(parseInt(targetLeads) * 2.5)),
      EMPLOYEES:         String(employees),
      CONTACT_MODE:      contactMode,
      WEBSITE_REQUIRED:  String(websiteRequired),
      TARGET_LEADS:      String(targetLeads),
      HEADLESS:          'true',
      OUTPUT_DIR:        outputDir,
    };

    const { stdout, stderr } = await execFileAsync(
      'node',
      [scraperPath],
      { env, timeout: 14400000 } // 4h Timeout
    );

    // ── 5. Output lesen ──
    const fs = await import('fs');
    const outputFile = path.resolve(outputDir, 'qualified_leads.json');

    if (!fs.existsSync(outputFile)) {
      return NextResponse.json(
        { success: false, error: 'Scraper hat keine Ergebnisse geliefert.' },
        { status: 500 }
      );
    }

    const raw = fs.readFileSync(outputFile, 'utf-8');
    const scraperOutput = JSON.parse(raw);
    const scrapedLeads = scraperOutput.leads || [];

    // ── 6. User holen (für org_id) ──
    const { data: { user } } = await supabase.auth.getUser();

    let orgId: string | null = null;
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single();
      orgId = userData?.org_id || null;
    }

    // ── 7. In Supabase-Format mappen ──
    const leadsToInsert = scrapedLeads.map((lead: any) => ({
      name:       lead.name,
      email:      lead.email || null,
      phone:      lead.phone || null,
      website:    lead.website || null,
      address:    lead.address || null,
      city:       location,
      message:    [
        lead.address && `Adresse: ${lead.address}`,
        lead.website && `Website: ${lead.website}`,
        lead.employees && `Mitarbeiter: ${lead.employees}`,
        radius > 0 && `Umkreis: ${radius} km um ${location}`,
      ].filter(Boolean).join('\n'),
      status:     'new',
      source:     'scraper',
      priority:   'medium',
      org_id:     orgId,
      scraped_from: 'google_maps',
      raw_data:   lead,
      created_at: new Date().toISOString(),
    }));

    // ── 8. In Supabase speichern ──
    const { data, error } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select();

    if (error) throw error;

    // ── 9. Output-Datei aufräumen ──
    try {
      fs.unlinkSync(outputFile);
    } catch (_) {
      // Nicht kritisch
    }

    // ── 10. Antwort ──
    return NextResponse.json({
      success: true,
      count:   data.length,
      leads:   data,
      meta: {
        query: query.trim(),
        location,
        radius,
        contactMode,
        targetLeads: parseInt(targetLeads),
      },
    });

  } catch (error: any) {
    console.error('Scraper API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
