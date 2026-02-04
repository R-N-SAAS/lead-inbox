# Lead Inbox - Frontend

Ein modernes Lead-Management-System mit automatisierter Lead-Erfassung, E-Mail-Kampagnen und Analytics.

![Lead Inbox Dashboard](https://via.placeholder.com/800x400?text=Lead+Inbox+Dashboard)

## 🚀 Features

- **Lead Management** - Erfassen, filtern und verwalten Sie Leads
- **Status Workflow** - Visueller Pipeline-Flow (Neu → Qualifiziert → Gewonnen)
- **E-Mail Kampagnen** - Erstellen und automatisieren Sie Follow-up Sequenzen
- **Embeddable Widget** - Kontaktformular für Ihre Website
- **Analytics Dashboard** - Echtzeit-Statistiken und Conversion-Tracking
- **Responsive Design** - Optimiert für Desktop und Mobile

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Glassmorphism Design
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Language:** TypeScript
- **Deployment:** Vercel

## 📦 Installation

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Supabase Account

### 1. Repository klonen

```bash
git clone https://github.com/your-username/lead-inbox.git
cd lead-inbox
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Environment Variables

Kopieren Sie `.env.example` nach `.env.local`:

```bash
cp .env.example .env.local
```

Füllen Sie die Werte aus:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Setup

Führen Sie das SQL-Schema in Ihrer Supabase-Instanz aus:

```sql
-- Siehe: supabase/schema.sql
```

### 5. Development Server starten

```bash
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000)

## 🏗️ Projekt-Struktur

```
lead-inbox-frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── webhook/       # Webhook Endpoints
│   ├── dashboard/         # Dashboard Pages
│   │   ├── leads/        # Lead Management
│   │   ├── campaigns/    # E-Mail Kampagnen
│   │   ├── analytics/    # Analytics Dashboard
│   │   ├── widget/       # Widget Konfigurator
│   │   └── settings/     # Einstellungen
│   ├── login/            # Auth Pages
│   ├── register/
│   └── onboarding/       # Onboarding Wizard
├── components/
│   ├── ui/               # Reusable UI Components
│   └── common/           # Layout Components
├── lib/                   # Utilities & Config
├── styles/               # Global CSS
├── types/                # TypeScript Types
└── public/
    └── widget/           # Embeddable Widget JS
```

## 🎨 UI Components

Alle UI-Komponenten folgen einem konsistenten Glassmorphism-Design:

| Komponente | Beschreibung |
|------------|--------------|
| `Button` | 5 Varianten: primary, secondary, danger, success, ghost |
| `Card` | Glass, Solid, Bordered Varianten |
| `Modal` | Portal-based mit Animationen |
| `Dropdown` | Keyboard Navigation Support |
| `Badge` | Status, Source, Priority Badges |
| `Tabs` | Context-basiertes Tab System |

## 📱 Responsive Design

- **Mobile First** Approach
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Mobile Sidebar** mit Overlay-Navigation
- **Touch-optimierte** Interaktionen

## 🔌 API Endpoints

### Widget Lead Submission
```
POST /api/webhook/lead
Content-Type: application/json

{
  "name": "Max Mustermann",
  "email": "max@beispiel.de",
  "phone": "+49123456789",
  "message": "Anfrage...",
  "orgSlug": "demo"
}
```

### E-Mail Reply Webhook
```
POST /api/webhook/email-reply
Content-Type: application/json

{
  "leadEmail": "max@beispiel.de",
  "subject": "Re: Ihre Anfrage",
  "content": "..."
}
```

## 🚀 Deployment

### Vercel (Empfohlen)

1. **Repository mit Vercel verbinden**
   - Gehen Sie zu [vercel.com](https://vercel.com)
   - Importieren Sie das Repository

2. **Environment Variables setzen**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

## 🔧 Widget Integration

### 1. Script einbinden

```html
<script>
  (function(w,d,s,o,f,js,fjs){
    w['LeadInboxWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','liw','https://your-app.vercel.app/widget/widget.js'));
  
  liw('init', {
    orgSlug: 'your-org-slug',
    primaryColor: '#3b82f6',
    position: 'right'
  });
</script>
```

### 2. Konfigurationsoptionen

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `orgSlug` | string | required | Ihre Organisation ID |
| `primaryColor` | string | `#3b82f6` | Primärfarbe des Widgets |
| `position` | `'left'` \| `'right'` | `'right'` | Widget-Position |
| `greeting` | string | `'Haben Sie Fragen?'` | Begrüßungstext |
| `buttonText` | string | `'Nachricht senden'` | Submit-Button Text |

## 🧪 Testing

```bash
# Type Check
npm run type-check

# Linting
npm run lint

# Build Test
npm run build
```

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE)

## 🤝 Support

Bei Fragen oder Problemen:
- GitHub Issues
- E-Mail: support@leadinbox.io

---

Made with ❤️ in Germany
