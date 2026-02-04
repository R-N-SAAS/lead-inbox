import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Widget Demo | Lead Inbox',
  description: 'Testen Sie das Lead Inbox Contact Widget',
};

export default function WidgetDemoPage() {
  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style dangerouslySetInnerHTML={{ __html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            min-height: 100vh;
          }
          .header {
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .logo {
            font-weight: 700;
            font-size: 20px;
            color: #1e293b;
          }
          .nav {
            display: flex;
            gap: 24px;
          }
          .nav a {
            color: #64748b;
            text-decoration: none;
            font-size: 14px;
          }
          .nav a:hover {
            color: #1e293b;
          }
          .hero {
            text-align: center;
            padding: 80px 24px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
          }
          .hero h1 {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 16px;
          }
          .hero p {
            font-size: 20px;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
          }
          .content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 60px 24px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-bottom: 60px;
          }
          @media (max-width: 768px) {
            .grid {
              grid-template-columns: 1fr;
            }
          }
          .card {
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          }
          .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: #eff6ff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          .card h3 {
            font-size: 20px;
            margin-bottom: 8px;
          }
          .card p {
            color: #64748b;
            line-height: 1.6;
          }
          .section-title {
            text-align: center;
            margin-bottom: 48px;
          }
          .section-title h2 {
            font-size: 36px;
            margin-bottom: 12px;
          }
          .section-title p {
            color: #64748b;
            font-size: 18px;
          }
          .cta {
            text-align: center;
            padding: 60px 24px;
            background: white;
            border-radius: 24px;
            margin-bottom: 60px;
          }
          .cta h2 {
            font-size: 32px;
            margin-bottom: 16px;
          }
          .cta p {
            color: #64748b;
            margin-bottom: 24px;
          }
          .btn {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 14px 28px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
          }
          .btn:hover {
            background: #2563eb;
          }
          .footer {
            text-align: center;
            padding: 24px;
            color: #94a3b8;
            font-size: 14px;
          }
          .demo-notice {
            position: fixed;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            background: #1e293b;
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 14px;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          }
        `}} />
      </head>
      <body>
        <div className="demo-notice">
          🎯 Dies ist eine Demo-Seite zum Testen des Widgets
        </div>

        <header className="header">
          <div className="logo">Demo Company</div>
          <nav className="nav">
            <a href="#">Produkte</a>
            <a href="#">Über uns</a>
            <a href="#">Blog</a>
            <a href="#">Kontakt</a>
          </nav>
        </header>

        <section className="hero">
          <h1>Willkommen bei Demo Co.</h1>
          <p>Die beste Lösung für Ihr Unternehmen. Testen Sie unser Kontakt-Widget in der rechten unteren Ecke!</p>
        </section>

        <div className="content">
          <div className="section-title">
            <h2>Unsere Leistungen</h2>
            <p>Alles was Sie brauchen, an einem Ort</p>
          </div>

          <div className="grid">
            <div className="card">
              <div className="card-icon">
                <svg width="24" height="24" fill="#3b82f6" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3>Feature Eins</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.</p>
            </div>

            <div className="card">
              <div className="card-icon">
                <svg width="24" height="24" fill="#3b82f6" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3>Feature Zwei</h3>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.</p>
            </div>

            <div className="card">
              <div className="card-icon">
                <svg width="24" height="24" fill="#3b82f6" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Feature Drei</h3>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</p>
            </div>
          </div>

          <div className="cta">
            <h2>Bereit loszulegen?</h2>
            <p>Klicken Sie auf das Chat-Symbol unten rechts, um uns zu kontaktieren!</p>
            <a href="#" className="btn">Mehr erfahren</a>
          </div>
        </div>

        <footer className="footer">
          © 2024 Demo Company. Dies ist eine Testseite für das Lead Inbox Widget.
        </footer>

        {/* Lead Inbox Widget */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(w,d,s,o,f,js,fjs){
            w['LeadInboxWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
            js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
            js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
          }(window,document,'script','liw','/widget/widget.js'));
          liw('init', {
            orgSlug: 'demo',
            primaryColor: '#3b82f6',
            position: 'right',
            greeting: 'Haben Sie Fragen zu unseren Produkten? Wir helfen gerne!',
            buttonText: 'Absenden',
            successMessage: 'Vielen Dank! Wir melden uns innerhalb von 24 Stunden.'
          });
        `}} />
      </body>
    </html>
  );
}
