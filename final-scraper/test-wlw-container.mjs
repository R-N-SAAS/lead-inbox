import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  defaultViewport: { width: 1920, height: 1080 }
});

const page = await browser.newPage();

// Cookie akzeptieren
await page.goto('https://www.wlw.de', { waitUntil: 'domcontentloaded', timeout: 10000 });
await new Promise(r => setTimeout(r, 3000));
await page.evaluate(() => {
  const allEls = document.querySelectorAll('button, [role="button"], a');
  for (const el of allEls) {
    if ((el.textContent || '').toLowerCase().includes('akzeptier')) { el.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 2000));
console.log('🍪 Cookie akzeptiert\n');

// Nur eine Suche — WLW.de rate-limits nach 1-2
await page.goto('https://www.wlw.de/de/suche?q=WeLikeWeb+GmbH', { waitUntil: 'domcontentloaded', timeout: 10000 });
await new Promise(r => setTimeout(r, 4000));

// Zeig mir den KOMPLETTEN Text der Seite — suche nach "Mitarbeiter"
const pageText = await page.evaluate(() => document.body.innerText);
const lines = pageText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

console.log('=== ALLE Zeilen mit "Mitarbeiter" oder Zahlen in der Nähe ===');
lines.forEach((line, i) => {
  if (line.toLowerCase().includes('mitarbeiter') || line.match(/^\d+[-–]\d+$/)) {
    // Zeige 2 Zeilen vor und nach als Kontext
    const start = Math.max(0, i - 2);
    const end = Math.min(lines.length, i + 3);
    console.log(`\n  --- Kontext um Zeile ${i} ---`);
    for (let j = start; j < end; j++) {
      console.log(`  ${j === i ? '>>>' : '   '} [${j}] "${lines[j]}"`);
    }
  }
});

// Zeig auch die komplette HTML-Struktur eines Suchergebnisses
console.log('\n=== Struktur eines Suchergebnisses ===');
const structure = await page.evaluate(() => {
  // Finde den Link zu WeLikeWeb
  const links = Array.from(document.querySelectorAll('a[href*="/de/firma/"]'));
  const wlwLink = links.find(l => l.textContent.includes('WeLikeWeb'));
  if (!wlwLink) return 'Kein WeLikeWeb Link gefunden';

  // Gehe nach oben bis zum Suchergebnis-Container
  let el = wlwLink;
  for (let i = 0; i < 8; i++) {
    if (el.parentElement) el = el.parentElement;
  }
  // Zeig die HTML-Struktur (vereinfacht)
  return {
    containerTag: el.tagName,
    containerClass: el.className?.substring(0, 100),
    containerText: el.innerText,
    containerHtml: el.innerHTML.substring(0, 1000)
  };
});
console.log(JSON.stringify(structure, null, 2));

await browser.close();
