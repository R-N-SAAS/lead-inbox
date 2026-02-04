// Output Handler
import fs from 'fs';
import path from 'path';

export class OutputHandler {
  constructor(outputDir = './data/output') {
    this.outputDir = outputDir;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  saveAsJSON(leads, filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = filename ? `${filename}.json` : `leads_${timestamp}.json`;
    const filePath = path.join(this.outputDir, fileName);

    const data = {
      scrapedAt: new Date().toISOString(),
      totalLeads: leads.length,
      leads: leads
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return filePath;
  }

  saveAsCSV(leads, filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = filename ? `${filename}.csv` : `leads_${timestamp}.csv`;
    const filePath = path.join(this.outputDir, fileName);

    const headers = ['Name', 'Telefon', 'Mitarbeiter', 'Email', 'Website', 'Adresse', 'Quelle'];
    
    const rows = leads.map(lead => [
      this.escapeCsv(lead.name),
      this.escapeCsv(lead.phone || ''),
      this.escapeCsv(lead.employees || ''),
      this.escapeCsv(lead.email || ''),
      this.escapeCsv(lead.website || ''),
      this.escapeCsv(lead.address || ''),
      this.escapeCsv(lead.source)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    fs.writeFileSync(filePath, csvContent, 'utf-8');
    return filePath;
  }

  escapeCsv(value) {
    if (!value) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  printSummary(leads, duration) {
    // handled in index.js
  }
}
