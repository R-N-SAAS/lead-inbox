import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  defaultViewport: { width: 1920, height: 1080 }
});

const page = await browser.newPage();

// Test 1: WLW Firma-Seite wo Mitarbeiter GEFUNDEN wurde
console.log('\n=== WLW: WeLikeWeb (Mitarbeiter gefunden = 10) ===');
await page.goto('https://www.wlw.de/de/firma/welikeweb-gmbh-20025927', { waitUntil: 'domcontentloaded', timeout: 10000 });
await new Promise(r => setTimeout(r, 2000));
const text1 = await page.evaluate(() => document.body.innerText);
// Zeige nur Zeilen die "mitarbeiter" enthalten oder Zahlen
const lines1 = text1.split('\n').map(l => l.trim()).filter(l => l.length > 0);
console.log('Relevante Zeilen:');
lines1.forEach((l, i) => {
  if (l.toLowerCase().includes('mitarbeiter') || l.match(/^\d+$/)) {
    console.log(`  [${i}] "${l}"`);
  }
});

// Test 2: WLW Firma-Seite wo Mitarbeiter NICHT gefunden wurde
console.log('\n=== WLW: Immagine GmbH (Mitarbeiter NICHT gefunden) ===');
await page.goto('https://www.wlw.de/de/firma/immagine-gmbh-1368582', { waitUntil: 'domcontentloaded', timeout: 10000 });
await new Promise(r => setTimeout(r, 2000));
const text2 = await page.evaluate(() => document.body.innerText);
const lines2 = text2.split('\n').map(l => l.trim()).filter(l => l.length > 0);
console.log('Relevante Zeilen:');
lines2.forEach((l, i) => {
  if (l.toLowerCase().includes('mitarbeiter') || l.match(/^\d+$/) || l.toLowerCase().includes('firma') || l.toLowerCase().includes('über')) {
    console.log(`  [${i}] "${l}"`);
  }
});
// Zeige auch die ersten 40 Zeilen komplett
console.log('\nErste 40 Zeilen komplett:');
lines2.slice(0, 40).forEach((l, i) => console.log(`  [${i}] "${l}"`));

// Test 3: ipunkto (auch nicht gefunden)
console.log('\n=== WLW: ipunkto GmbH (Mitarbeiter NICHT gefunden) ===');
await page.goto('https://www.wlw.de/de/firma/ipunkto-gmbh-1897930', { waitUntil: 'domcontentloaded', timeout: 10000 });
await new Promise(r => setTimeout(r, 2000));
const text3 = await page.evaluate(() => document.body.innerText);
const lines3 = text3.split('\n').map(l => l.trim()).filter(l => l.length > 0);
console.log('Erste 40 Zeilen:');
lines3.slice(0, 40).forEach((l, i) => console.log(`  [${i}] "${l}"`));

// Test 4: Heiko Lindner Website - was steht "100 Mitarbeiter"?
console.log('\n=== Heiko Lindner Website (False Positive "100 Mitarbeiter") ===');
await page.goto('https://heiko-lindner.net/', { waitUntil: 'domcontentloaded', timeout: 10000 });
await new Promise(r => setTimeout(r, 2000));
const text4 = await page.evaluate(() => document.body.innerText);
const lines4 = text4.split('\n').map(l => l.trim()).filter(l => l.length > 0);
// Suche nach "100" im Kontext
lines4.forEach((l, i) => {
  if (l.includes('100') || l.toLowerCase().includes('mitarbeiter')) {
    console.log(`  [${i}] "${l}"`);
  }
});

await browser.close();
