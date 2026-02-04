import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  defaultViewport: { width: 1920, height: 1080 }
});

const page = await browser.newPage();

// Cookie einmal akzeptieren
await page.goto('https://www.wlw.de', { waitUntil: 'domcontentloaded', timeout: 10000 });
await new Promise(r => setTimeout(r, 3000));
await page.evaluate(() => {
  const allEls = document.querySelectorAll('button, [role="button"], a');
  for (const el of allEls) {
    const text = (el.textContent || '').toLowerCase().trim();
    if (text.includes('akzeptier') || text.includes('accept')) {
      el.click();
      return;
    }
  }
});
await new Promise(r => setTimeout(r, 2000));
console.log('🍪 Cookie akzeptiert');

const searches = [
  'Münchner Marketing Akademie',
  'MunichMarketing',
  'Grapevine München GmbH',
  'Lovemark Public Relations'
];

for (const name of searches) {
  const query = encodeURIComponent(name);
  console.log(`\n=== Suche: "${name}" ===`);
  await page.goto(`https://www.wlw.de/de/suche?q=${query}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await new Promise(r => setTimeout(r, 3000));

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .filter(a => (a.getAttribute('href') || '').includes('/de/firma/'))
      .map(a => ({
        text: a.textContent?.trim().substring(0, 80),
        href: a.getAttribute('href')
      }));
  });

  const seen = new Set();
  if (links.length === 0) {
    console.log('  (keine /de/firma/ Links gefunden)');
    // Zeige was auf der Seite ist
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log(`  Seiten-Text: ${pageText}`);
  }
  for (const l of links) {
    if (!seen.has(l.href)) {
      seen.add(l.href);
      console.log(`  Text: "${l.text}"`);
      console.log(`  Href: ${l.href}\n`);
    }
  }
}

await browser.close();
