// Employee Enrichment - Mitarbeiterzahl via Website + WLW
// + Adresse via Impressum-Fallback
import { delay } from '../utils/helpers.js';

const GENERIC_WORDS = new Set([
  'gmbh', 'kg', 'ltd', 'inc', 'co', 'und', 'der', 'die', 'das',
  'marketing', 'design', 'media', 'web', 'online', 'digital',
  'münchen', 'munich', 'berlin', 'hamburg', 'frankfurt',
  'agentur', 'firma', 'service', 'solutions', 'group',
  'public', 'relations', 'consulting', 'management'
]);

function cleanCompanyName(name) {
  if (!name) return name;
  let clean = name.split('·')[0];
  clean = clean.split('–')[0];
  clean = clean.split('|')[0];
  clean = clean.split(' - ')[0];
  clean = clean.replace(/\s*(GmbH|KG|e\.U\.|GmbH & Co\. KG)\s*.*/i, ' $1');
  return clean.trim();
}

// Zeilen-basierte Extraktion für Websites
function extractEmployeesFromWebsite(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  for (const line of lines) {
    const patterns = [
      /(\d+)\s*[-–]\s*(\d+)\s*(mitarbeiter|beschäftigte|angestellte|employees)/i,
      /(über|mehr als|ca\.?)\s*(\d+)\s*(mitarbeiter|beschäftigte|employees)/i,
      /(\d+)\s+(mitarbeiter|beschäftigte|angestellte|employees|staff)/i,
      /(mitarbeiter|beschäftigte|employees)[:\s]+(\d+)\s*[-–]\s*(\d+)/i,
      /(mitarbeiter|beschäftigte|employees)[:\s]+(\d+)/i,
      /team\s+(von|aus|mit)\s+(\d+)/i,
      /wir\s+sind\s+(\d+)/i,
      /(\d+)\s*(?:köpfig)/i,
      /(\d+)\s+(?:Personen|Arbeitnehmer)/i
    ];

    for (const p of patterns) {
      const m = line.match(p);
      if (m) {
        const nums = m[0].match(/\d+/g);
        if (nums) {
          const first = parseInt(nums[0]);
          if (first >= 1 && first <= 50000) {
            return nums.length > 1 ? `${nums[0]}-${nums[1]}` : nums[0];
          }
        }
      }
    }
  }
  return null;
}

// ── IMPRESSUM: Adresse extrahieren ──────────────────────────
// Deutsche Adresse erkennen: "Straße 12, 12345 Stadt" oder einzelne Teile
function extractAddressFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Suche nach PLZ-Muster: 5-stellige Zahl gefolgt von Stadtname
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Komplette Adresse in einer Zeile: "Straße 12, 12345 Stadt"
    const fullMatch = line.match(/([A-ZÄÖÜ][a-zäöüß\-]+(?:straße|str\.|weg|platz|allee|gasse|ring|damm|boulevard)\s*\d+[a-zA-Z]?)[,\s]+([\d]{5}\s*[A-ZÄÖÜ][a-zäöüß\s\-]+)/i);
    if (fullMatch) {
      return `${fullMatch[1].trim()}, ${fullMatch[2].trim()}`;
    }

    // PLZ + Stadt in einer Zeile: "12345 München"
    const plzMatch = line.match(/^(\d{5})\s+([A-ZÄÖÜ][a-zäöüß\s\-]{2,30})$/);
    if (plzMatch) {
      // Schaue eine Zeile davor nach Straße
      const prevLine = i > 0 ? lines[i - 1] : '';
      const streetMatch = prevLine.match(/([A-ZÄÖÜ][a-zäöüß\-]+(?:straße|str\.|weg|platz|allee|gasse|ring|damm|boulevard)\s*\d+[a-zA-Z]?)/i);
      if (streetMatch) {
        return `${streetMatch[1].trim()}, ${plzMatch[1]} ${plzMatch[2].trim()}`;
      }
      return `${plzMatch[1]} ${plzMatch[2].trim()}`;
    }
  }
  return null;
}

// Impressum-URL finden auf der Website
async function findAndScrapeImpressum(page, baseUrl) {
  try {
    // Mögliche Impressum-Pfade direkt aufrufen
    const origin = new URL(baseUrl).origin;
    const impressumPaths = [
      '/impressum',
      '/impressum.html',
      '/impressum.htm',
      '/legal/impressum',
      '/de/impressum',
      '/about/impressum'
    ];

    // Erst: Suche nach Impressum-Link auf der aktuellen Seite
    const impressumLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      for (const link of links) {
        const href = (link.getAttribute('href') || '').toLowerCase();
        const text = (link.textContent || '').toLowerCase().trim();
        if (href.includes('impressum') || text === 'impressum') {
          // Relative URL → absolute machen
          return link.href; // browser gibt absolute URL zurück
        }
      }
      return null;
    });

    let targetUrl = impressumLink;

    // Wenn kein Link gefunden: bekannte Pfade probieren
    if (!targetUrl) {
      for (const path of impressumPaths) {
        targetUrl = origin + path;
        break; // nur /impressum probieren, schnell
      }
    }

    if (!targetUrl) return null;

    // Impressum-Seite laden
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 8000 });
    await delay(1500);

    const text = await page.evaluate(() => document.body.innerText);
    return extractAddressFromText(text);

  } catch (e) {
    return null;
  }
}

// WLW Cookie akzeptieren
async function acceptWlwCookie(page) {
  try {
    await page.evaluate(() => {
      const allEls = document.querySelectorAll('button, [role="button"], a');
      for (const el of allEls) {
        const text = (el.textContent || '').toLowerCase().trim();
        if (text === 'akzeptieren' || text === 'alle akzeptieren' ||
            text === 'accept' || text === 'accept all' ||
            text.includes('akzeptier')) {
          el.click();
          return;
        }
      }
      const cookieBtn = document.querySelector('[class*="cookiescript"] button, .cookiescript_accept, [id*="cookiescript_accept"]');
      if (cookieBtn) cookieBtn.click();
    });
    await delay(1500);
  } catch(e) {}
}

export async function enrichWithEmployeeCount(page, leads) {
  console.log('\n👥 PHASE 2: Suche Mitarbeiterzahl + Adresse...');
  console.log('   Quellen: Website (+ Impressum) → WLW.de');

  // WLW Cookie einmal akzeptieren
  console.log('   🍪 WLW Cookie akzeptieren...');
  await page.goto('https://www.wlw.de', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await delay(2000);
  await acceptWlwCookie(page);

  const enriched = [];
  let stats = { website: 0, wlw: 0, notFound: 0, impressum: 0 };

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    let employees = null;
    let email = lead.email || null;
    let address = lead.address || null;
    let source = null;
    const cleanName = cleanCompanyName(lead.name);

    console.log(`\n   ${i + 1}/${leads.length} ${cleanName}`);

    // ─── STUFE 1: Firmen-Website ─────────────────────
    if (lead.website) {
      try {
        console.log(`      [1/2] Website...`);
        await page.goto(lead.website, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await delay(2000);

        const result = await page.evaluate(() => {
          const text = document.body.innerText;
          const emailMatch = text.match(/([a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
          let email = emailMatch ? emailMatch[1].toLowerCase() : null;
          if (email && (email.includes('example') || email.includes('sentry') || email.includes('placeholder'))) email = null;
          return { text, email };
        });

        if (result.email && !email) {
          email = result.email;
          console.log(`      📧 Email: ${email}`);
        }

        employees = extractEmployeesFromWebsite(result.text);
        if (employees) {
          source = 'website';
          stats.website++;
          console.log(`      ✅ Website: ${employees} Mitarbeiter`);
        } else {
          console.log(`      ❌ Website: nicht gefunden`);
        }

        // ── Impressum-Fallback wenn keine Adresse ──
        if (!address) {
          console.log(`      📍 Suche Adresse im Impressum...`);
          const impressumAddress = await findAndScrapeImpressum(page, lead.website);
          if (impressumAddress) {
            address = impressumAddress;
            stats.impressum++;
            console.log(`      ✅ Impressum: ${address}`);
          } else {
            console.log(`      ❌ Impressum: keine Adresse gefunden`);
          }
        }

      } catch (e) {
        console.log(`      ⚠️  Website Fehler: ${e.message.substring(0, 60)}`);
      }
    }

    // ─── STUFE 2: WLW ────────────────────────────────
    if (!employees) {
      try {
        console.log(`      [2/2] WLW...`);

        const query = encodeURIComponent(cleanName);
        await page.goto(`https://www.wlw.de/de/suche?q=${query}`, {
          waitUntil: 'domcontentloaded',
          timeout: 12000
        });
        await delay(3000);
        await acceptWlwCookie(page);
        await delay(1000);

        const wlwResult = await page.evaluate((searchName) => {
          const GENERIC = new Set([
            'gmbh', 'kg', 'ltd', 'inc', 'co', 'und', 'der', 'die', 'das',
            'marketing', 'design', 'media', 'web', 'online', 'digital',
            'münchen', 'munich', 'berlin', 'hamburg', 'frankfurt',
            'agentur', 'firma', 'service', 'solutions', 'group',
            'public', 'relations', 'consulting', 'management'
          ]);

          const nameLower = searchName.toLowerCase();
          const allWords = nameLower.split(/\s+/).filter(w => w.length > 2);
          const specificWords = allWords.filter(w => !GENERIC.has(w));
          const wordsToMatch = specificWords.length > 0 ? specificWords : allWords;

          const firmaLinks = Array.from(document.querySelectorAll('a[href*="/de/firma/"]'));

          let bestMatch = null;
          let bestScore = 0;

          for (const link of firmaLinks) {
            const href = link.getAttribute('href');
            const text = (link.textContent || '').trim();
            const textLower = text.toLowerCase();
            const hrefLower = href.toLowerCase();

            let score = 0;
            if (textLower.includes(nameLower)) score += 10;
            for (const word of wordsToMatch) {
              if (textLower.includes(word)) score += 3;
              if (hrefLower.includes(word)) score += 1;
            }

            if (score > bestScore) {
              bestScore = score;

              let container = link.parentElement;
              for (let j = 0; j < 10; j++) {
                if (!container) break;
                if (container.innerText && container.innerText.includes('Lieferung')) break;
                container = container.parentElement;
              }

              const containerText = container ? container.innerText : '';
              const containerLines = containerText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

              let employees = null;
              for (let k = 0; k < containerLines.length; k++) {
                const line = containerLines[k];
                const empMatch = line.match(/^(\d+)\s*[-–]\s*(\d+)$/);
                if (empMatch) {
                  const first = parseInt(empMatch[1]);
                  const second = parseInt(empMatch[2]);
                  if (first >= 1 && first < second && second <= 50000 && first < 1900) {
                    employees = `${empMatch[1]}-${empMatch[2]}`;
                    break;
                  }
                }
              }

              bestMatch = {
                href: href,
                text: text.substring(0, 60),
                score: score,
                employees: employees
              };
            }
          }

          return bestScore >= 10 ? bestMatch : null;
        }, cleanName);

        if (wlwResult) {
          console.log(`      → Firma (Score ${wlwResult.score}): ${wlwResult.text}`);

          if (wlwResult.employees) {
            employees = wlwResult.employees;
            source = 'wlw';
            stats.wlw++;
            console.log(`      ✅ WLW: ${employees} Mitarbeiter`);
          } else {
            console.log(`      ❌ WLW: kein Mitarbeiter-Feld`);
          }
        } else {
          console.log(`      ❌ WLW: keine passende Firma`);
        }

      } catch (e) {
        console.log(`      ⚠️  WLW Fehler: ${e.message.substring(0, 60)}`);
      }
    }

    if (!employees) stats.notFound++;

    enriched.push({
      ...lead,
      name: cleanName,
      employees: employees,
      employeeSource: source,
      email: email,
      address: address
    });
  }

  // Summary
  const total = leads.length;
  const found = stats.website + stats.wlw;
  console.log('\n   ─────────────────────────────────────');
  console.log(`   👥 Mitarbeiter gefunden: ${found}/${total} (${Math.round(found/total*100)}%)`);
  console.log(`      Website: ${stats.website} | WLW: ${stats.wlw} | Nicht gefunden: ${stats.notFound}`);
  console.log(`   📍 Adressen via Impressum ergänzt: ${stats.impressum}`);

  return enriched;
}
