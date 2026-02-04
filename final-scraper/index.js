// FINAL Lead Scraper - Google Maps + Mitarbeiterzahl
import dotenv from 'dotenv';
import { createBrowser, createPage } from './utils/browser.js';
import { scrapeGoogleMaps } from './scrapers/google-maps.js';
import { enrichWithEmployeeCount } from './scrapers/employee-enrichment.js';
import { OutputHandler } from './utils/output.js';
import { removeDuplicates } from './utils/helpers.js';

dotenv.config();

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('      🚀 LEAD SCRAPER - MIT MITARBEITERZAHL');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  const startTime = Date.now();

  const config = {
    query: process.env.QUERY || 'Maler',
    location: process.env.LOCATION || 'München',
    maxResults: parseInt(process.env.MAX_RESULTS || '10'),
    headless: process.env.HEADLESS !== 'false',
    delay: parseInt(process.env.DELAY || '3000')
  };

  console.log('⚙️  KONFIGURATION:');
  console.log(`   Suche: "${config.query}" in "${config.location}"`);
  console.log(`   Max. Ergebnisse: ${config.maxResults}`);
  console.log(`   Mitarbeiterzahl: JA (Website + WLW)`);
  console.log(`   Headless: ${config.headless ? 'Ja' : 'Nein'}`);
  console.log('');

  // Browser starten
  console.log('🌐 Starte Browser...');
  const browser = await createBrowser(config.headless);
  const page = await createPage(browser);

  let finalLeads = [];

  // ── Städte-Listen ──
  // Tier 1: 10 Großstädte (immer)
  // Tier 2: +20 Mittelstädte (wenn > 200 Leads gewünscht)
  // Tier 3: +30 Kleinstädte (wenn > 500 Leads gewünscht)
  const TIER1 = [
    'Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt',
    'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'
  ];
  const TIER2 = [
    'Bremen', 'Dresden', 'Hannover', 'Nürnberg', 'Duisburg',
    'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster',
    'Karlsruhe', 'Mannheim', 'Augsburg', 'Wiesbaden', 'Gelsenkirchen',
    'Mönchengladbach', 'Braunschweig', 'Kiel', 'Chemnitz', 'Aachen'
  ];
  const TIER3 = [
    'Halle', 'Magdeburg', 'Freiburg', 'Krefeld', 'Lübeck',
    'Oberhausen', 'Erfurt', 'Rostock', 'Kassel', 'Hagen',
    'Saarbrücken', 'Hamm', 'Mülheim', 'Erlangen', 'Reutlingen',
    'Ulm', 'Konstanz', 'Regensburg', 'Ingolstadt', 'Würzburg',
    'Heilbronn', 'Villingen', 'Ravensburg', 'Friedrichshafen', 'Tübingen',
    'Flensburg', 'Jena', 'Potsdam', 'Brandenburg', 'Schwerin'
  ];

  function getCitiesForTarget(target) {
    if (target <= 200) return TIER1;
    if (target <= 500) return [...TIER1, ...TIER2];
    return [...TIER1, ...TIER2, ...TIER3];
  }

  try {
    console.log('\n📍 PHASE 1: Google Maps Scraping...');

    let googleLeads = [];

    if (config.location.toLowerCase() === 'deutschland') {
      const cities = getCitiesForTarget(config.maxResults);
      // +50% Puffer: Filter (Behörden, Ads, Duplikate) werfen ~30-40% weg
      const perCity = Math.ceil((config.maxResults / cities.length) * 1.5);
      console.log(`   🏙️  Deutschland-Modus: ${cities.length} Städte × ${perCity} Leads\n`);

      for (const city of cities) {
        if (googleLeads.length >= config.maxResults * 1.5) break; // Genug Rohdaten
        console.log(`\n   📍 Stadt: ${city}`);
        const cityConfig = { ...config, location: city, maxResults: perCity };
        const cityLeads = await scrapeGoogleMaps(page, cityConfig);
        googleLeads.push(...cityLeads);
      }
    } else {
      googleLeads = await scrapeGoogleMaps(page, config);
    }

    console.log(`\n✅ Google Maps: ${googleLeads.length} Leads`);

    // Duplikate
    const uniqueLeads = removeDuplicates(googleLeads, 'name');
    console.log(`🧹 Duplikate: ${googleLeads.length} → ${uniqueLeads.length}`);

    // ── PHASE 2: Mitarbeiterzahl + Impressum ──
    finalLeads = await enrichWithEmployeeCount(page, uniqueLeads);

  } catch (error) {
    console.error('\n❌ Fehler:', error.message);
  } finally {
    await browser.close();
    console.log('\n🔒 Browser geschlossen');
  }

  // ── OUTPUT ──
  const duration = Date.now() - startTime;
  const outputHandler = new OutputHandler(process.env.OUTPUT_DIR);

  // Qualifiziert = Telefon + Mitarbeiter + Adresse (alle drei Pflicht)
  const qualifiedLeads = finalLeads.filter(l => l.phone && l.employees && l.address);

  console.log('\n💾 Speichere Ergebnisse...');
  outputHandler.saveAsJSON(qualifiedLeads, 'qualified_leads');
  outputHandler.saveAsCSV(qualifiedLeads, 'qualified_leads');
  outputHandler.saveAsJSON(finalLeads, 'all_leads');
  outputHandler.saveAsCSV(finalLeads, 'all_leads');
  console.log(`   ✅ Qualifiziert: qualified_leads.json / .csv`);
  console.log(`   📦 Alle Leads:  all_leads.json / .csv`);

  // ── FINALE STATISTIKEN ──
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('                SCRAPING ABGESCHLOSSEN');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log(`📊 ZUSAMMENFASSUNG:`);
  console.log(`   Gescrapet:     ${finalLeads.length} Leads`);
  console.log(`   Qualifiziert:  ${qualifiedLeads.length} Leads (Tel + Mitarbeiter + Adresse)`);
  console.log(`   Verworfene:    ${finalLeads.length - qualifiedLeads.length}`);
  console.log(`⏱️  Dauer:         ${Math.round(duration/1000)}s`);
  console.log('');

  if (qualifiedLeads.length > 0) {
    console.log('✅ QUALIFIZIERTE LEADS:');
    console.log('   ─────────────────────────────────────────────────────────────────');
    console.log('   Nr.  Firma                          Tel              MA    Adresse');
    console.log('   ─────────────────────────────────────────────────────────────────');
    qualifiedLeads.forEach((l, i) => {
      const name = (l.name || '').substring(0, 34).padEnd(34);
      const phone = (l.phone || '').padEnd(17);
      const emp = (l.employees || '').padEnd(6);
      const addr = (l.address || '').substring(0, 30);
      console.log(`   ${String(i+1).padStart(2)}.  ${name} ${phone} ${emp} ${addr}`);
    });
    console.log('   ─────────────────────────────────────────────────────────────────');

    const s = {
      email: qualifiedLeads.filter(l => l.email).length,
      website: qualifiedLeads.filter(l => l.website).length,
      address: qualifiedLeads.filter(l => l.address).length
    };
    const t = qualifiedLeads.length;
    console.log('');
    console.log('📊 DATENQUALITÄT (qualifizierte Leads):');
    console.log(`   📞 Telefon:     ${t}/${t} (100%)`);
    console.log(`   👥 Mitarbeiter: ${t}/${t} (100%)`);
    console.log(`   📍 Adresse:     ${t}/${t} (100%)`);
    console.log(`   📧 Email:       ${s.email}/${t} (${Math.round(s.email/t*100)}%)`);
    console.log(`   🌐 Website:     ${s.website}/${t} (${Math.round(s.website/t*100)}%)`);
  }

  console.log('');
  console.log('✨ Fertig!');
  console.log('');
}

main().catch(error => {
  console.error('❌ Fatal Error:', error.message);
  process.exit(1);
});
