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
console.log('🍪 Cookie akzeptiert');

// Teste verschiedene Website-URLs als Suchbegriff
const urls = [
  'www.welikeweb.de',
  'www.immagine.de',
  'www.armagan-maler.de',
  'www.malerbetrieb-jaegerhuber.de',
  'www.grapevine.agency',
  'www.lovemark-pr.de'
];

for (const url of urls) {
  console.log(`\n=== Suche mit URL: "${url}" ===`);
  const query = encodeURIComponent(url);
  await page.goto(`https://www.wlw.de/de/suche?q=${query}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await new Promise(r => setTimeout(r, 3000));

  const result = await page.evaluate(() => {
    const text = document.body.innerText;
    // Nur relevante Zeilen
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2 && l.length < 120);
    return lines.slice(0, 20);
  });

  console.log(result.join('\n'));
}

await browser.close();
