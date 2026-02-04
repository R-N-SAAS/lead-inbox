import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: false,
  args: ['--window-size=1920,1080'],
  defaultViewport: { width: 1920, height: 1080 }
});

const page = await browser.newPage();

// Teste verschiedene WLW URLs
const urls = [
  'https://www.wlw.de/suchen/ergebnisse?what=Malerbetrieb',
  'https://www.wlw.de/suchen?what=Malerbetrieb',
  'https://www.wlw.de/de/suchen/ergebnisse?what=Malerbetrieb',
  'https://www.wlw.de/de/suchen?what=Malerbetrieb',
  'https://www.wlw.de'
];

for (const url of urls) {
  console.log(`\n--- Teste: ${url} ---`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));
    const text = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log(`Status: OK`);
    console.log(`Text: ${text}`);
  } catch(e) {
    console.log(`Fehler: ${e.message}`);
  }
}

// Teste auch: Suche auf der Homepage durchführen
console.log('\n--- Teste Homepage + Suche ---');
await page.goto('https://www.wlw.de', { waitUntil: 'domcontentloaded', timeout: 10000 });
await new Promise(r => setTimeout(r, 2000));

// Zeig mir das Suchfeld
const searchInfo = await page.evaluate(() => {
  const inputs = document.querySelectorAll('input');
  return Array.from(inputs).map(i => ({
    type: i.type,
    name: i.name,
    id: i.id,
    placeholder: i.placeholder,
    className: i.className?.substring(0, 80)
  }));
});
console.log('Suchfelder:', JSON.stringify(searchInfo, null, 2));

// Zeig mir auch forms
const forms = await page.evaluate(() => {
  const forms = document.querySelectorAll('form');
  return Array.from(forms).map(f => ({
    action: f.action,
    method: f.method,
    id: f.id
  }));
});
console.log('Forms:', JSON.stringify(forms, null, 2));

console.log('\nBrowser offen - Ctrl+C zum Schließen');
await new Promise(r => setTimeout(r, 60000));
await browser.close();
