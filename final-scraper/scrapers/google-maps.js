// Google Maps Scraper - Extrahiert ALLE Daten auf einmal aus der Liste (kein Klicken!)
import { delay } from '../utils/helpers.js';

export async function scrapeGoogleMaps(page, config) {
  const leads = [];

  try {
    console.log(`\n🔍 Scraping Google Maps: "${config.query}" in "${config.location}"`);

    const searchQuery = `${config.query} ${config.location}`;
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

    console.log(`📍 URL: ${searchUrl}`);

    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await delay(5000);

    // Cookie-Banner
    try {
      const cookieButton = await page.$('button[aria-label*="Alle ablehnen"]');
      if (cookieButton) {
        await cookieButton.click();
        await delay(1000);
        console.log('✅ Cookie-Banner geschlossen');
      }
    } catch (e) {}

    console.log('✅ Seite geladen');

    // Warte auf Feed
    await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
    console.log('✅ Ergebnisliste gefunden');

    // Scrolle durch Ergebnisse um mehr zu laden
    console.log('📜 Scrolle durch Ergebnisse...');
    for (let scroll = 0; scroll < 10; scroll++) {
      await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        if (feed) feed.scrollTop = feed.scrollHeight;
      });
      await delay(1500);
      console.log(`   Scroll ${scroll + 1}/10`);
    }

    await delay(2000);

    console.log('\n📊 Extrahiere Daten aus der Liste...');

    const listLeads = await page.evaluate(() => {
      const results = [];
      const feed = document.querySelector('div[role="feed"]');
      if (!feed) return results;

      const entries = Array.from(feed.children);

      for (const entry of entries) {
        try {
          const nameEl = entry.querySelector('h1, h2, h3, [class*="fontHead"]');
          const name = nameEl?.textContent?.trim();
          if (!name || name.length < 3) continue;

          const allText = entry.textContent || '';

          // TELEFON
          let phone = null;
          const phonePatterns = [
            /\+49[\s]?\d{2,5}[\s\/\-]?\d{3,8}/g,
            /0\d{2,5}[\s\/\-]?\d{3,8}/g,
            /\(\d{2,5}\)[\s]?\d{3,8}/g
          ];

          for (const pattern of phonePatterns) {
            const matches = allText.match(pattern);
            if (matches) {
              const longestMatch = matches.reduce((a, b) =>
                a.replace(/\D/g, '').length > b.replace(/\D/g, '').length ? a : b
              );
              const digitsOnly = longestMatch.replace(/\D/g, '');
              if (digitsOnly.length >= 7) {
                phone = longestMatch.trim();
                break;
              }
            }
          }

          // ADRESSE
          let address = null;
          const streetMatch = allText.match(/([A-ZÄÖÜ][a-zäöüß\-]+(?:straße|str\.|weg|platz|allee|gasse|ring|damm)[\s]?\d+[a-zA-Z]?)/i);
          if (streetMatch) address = streetMatch[0];

          const plzMatch = allText.match(/(\d{5}[\s]?[A-ZÄÖÜ][a-zäöüß\-]+)/);
          if (plzMatch) address = address ? `${address}, ${plzMatch[0]}` : plzMatch[0];

          // WEBSITE
          const websiteBtn = entry.querySelector('a[aria-label*="Website"]');
          const website = websiteBtn?.getAttribute('href') || null;

          results.push({ name, phone, address, website });

        } catch (e) {}
      }

      return results;
    });

    console.log(`\n✅ ${listLeads.length} Einträge extrahiert`);

    // Verarbeite und validiere
    let processed = 0;
    for (const lead of listLeads) {
      if (processed >= config.maxResults) break;

      if (!lead.name || lead.name === 'Ergebnisse' || lead.name.length < 3) continue;
      // Google Ads filtern
      if (lead.name.toLowerCase().includes('gesponsert')) continue;
      if (lead.website && lead.website.startsWith('/aclk')) lead.website = null;
      // Behörden / Gemeinden / Tourismus-Ämter filtern
      const nameL = lead.name.toLowerCase();
      if (nameL.startsWith('stadt ') || nameL.startsWith('gemeinde ') ||
          nameL.includes('tourist info') || nameL.includes('convention bureau') ||
          nameL.includes('tourismus und marketing') ||
          nameL.includes('marketing club') || nameL.includes('marketing e.v.')) {
        console.log(`⚠️  Überspringe "${lead.name}" - Behörde/Verein`);
        continue;
      }

      if (!lead.phone && !lead.address) {
        console.log(`⚠️  Überspringe "${lead.name}" - keine Kontaktdaten`);
        continue;
      }

      // Telefon normalisieren
      let cleanPhone = lead.phone;
      if (cleanPhone) {
        cleanPhone = cleanPhone.replace(/[^\d+]/g, '');
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '+49' + cleanPhone.substring(1);
        }
      }

      // Adresse: Google Maps hängt manchmal G/S/R/J an die Hausnummer
      let cleanAddress = lead.address;
      if (cleanAddress) {
        cleanAddress = cleanAddress.replace(/(\d+)[GSRJ]$/, '$1').trim();
      }

      // Website: UTM-Parameter entfernen
      let cleanWebsite = lead.website;
      if (cleanWebsite) {
        try {
          const url = new URL(cleanWebsite);
          for (const key of [...url.searchParams.keys()]) {
            if (key.startsWith('utm_') || key === 'gclid') url.searchParams.delete(key);
          }
          cleanWebsite = url.searchParams.toString()
            ? url.origin + url.pathname + '?' + url.searchParams.toString()
            : url.origin + url.pathname;
          if (cleanWebsite.endsWith('/') && cleanWebsite.split('/').length > 4) {
            cleanWebsite = cleanWebsite.replace(/\/$/, '');
          }
        } catch (e) {}
      }

      // Log NACH Cleaning
      console.log(`\n📋 Lead ${processed + 1}/${config.maxResults}`);
      console.log(`   Name: ${lead.name}`);
      console.log(`   Telefon: ${cleanPhone || '❌'}`);
      console.log(`   Adresse: ${cleanAddress || '❌'}`);
      console.log(`   Website: ${cleanWebsite || '❌'}`);

      leads.push({
        name: lead.name,
        phone: cleanPhone,
        address: cleanAddress,
        website: cleanWebsite,
        source: 'google_maps',
        scrapedAt: new Date().toISOString()
      });

      console.log(`   ✅ Lead gespeichert`);
      processed++;
    }

  } catch (error) {
    console.error('❌ Fehler beim Scraping:', error.message);
  }

  console.log(`\n📊 Gesamt gesammelt: ${leads.length} Leads`);
  return leads;
}
