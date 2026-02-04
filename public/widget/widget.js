/**
 * Lead Inbox - Embeddable Contact Widget
 * Version: 1.0.0
 * 
 * Usage:
 * <script>
 *   (function(w,d,s,o,f,js,fjs){
 *     w['LeadInboxWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
 *     js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
 *     js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
 *   }(window,document,'script','liw','https://yourapp.com/widget/widget.js'));
 *   liw('init', { orgSlug: 'your-org-slug', primaryColor: '#3b82f6', position: 'right' });
 * </script>
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.LeadInboxWidgetLoaded) return;
  window.LeadInboxWidgetLoaded = true;

  // Default configuration
  const defaultConfig = {
    orgSlug: '',
    primaryColor: '#3b82f6',
    position: 'right', // 'left' or 'right'
    greeting: 'Haben Sie Fragen? Wir helfen gerne!',
    buttonText: 'Nachricht senden',
    successMessage: 'Vielen Dank! Wir melden uns schnellstmöglich.',
    apiEndpoint: '', // Will be auto-detected
  };

  let config = { ...defaultConfig };
  let isOpen = false;
  let isSubmitting = false;
  let isSubmitted = false;

  // Styles
  const styles = `
    #liw-container {
      position: fixed;
      bottom: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    #liw-container.liw-left { left: 24px; }
    #liw-container.liw-right { right: 24px; }
    
    #liw-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    #liw-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(0,0,0,0.2);
    }
    #liw-toggle svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    
    #liw-widget {
      position: absolute;
      bottom: 72px;
      width: 360px;
      max-width: calc(100vw - 48px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #liw-widget.liw-open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
    #liw-container.liw-left #liw-widget { left: 0; }
    #liw-container.liw-right #liw-widget { right: 0; }
    
    #liw-header {
      padding: 16px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #liw-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    #liw-header-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #liw-header-icon svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
    #liw-header-text h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
    #liw-header-text p {
      margin: 0;
      font-size: 12px;
      opacity: 0.8;
    }
    #liw-close {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.2s;
    }
    #liw-close:hover {
      background: rgba(255,255,255,0.2);
    }
    #liw-close svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
    
    #liw-body {
      padding: 20px;
    }
    #liw-greeting {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 16px;
    }
    
    #liw-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .liw-input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
      color: #1e293b;
      background: white;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .liw-input:focus {
      outline: none;
      border-color: var(--liw-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .liw-input::placeholder {
      color: #94a3b8;
    }
    textarea.liw-input {
      resize: none;
      min-height: 80px;
    }
    
    #liw-submit {
      width: 100%;
      padding: 12px 16px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s;
    }
    #liw-submit:hover:not(:disabled) {
      opacity: 0.9;
    }
    #liw-submit:active:not(:disabled) {
      transform: scale(0.98);
    }
    #liw-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    #liw-success {
      text-align: center;
      padding: 24px 0;
    }
    #liw-success-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #dcfce7;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
    }
    #liw-success-icon svg {
      width: 24px;
      height: 24px;
      fill: #16a34a;
    }
    #liw-success-text {
      color: #1e293b;
      font-weight: 500;
    }
    
    #liw-footer {
      padding: 8px 16px;
      background: #f8fafc;
      text-align: center;
    }
    #liw-footer a {
      color: #94a3b8;
      font-size: 11px;
      text-decoration: none;
    }
    #liw-footer a:hover {
      color: #64748b;
    }
    
    #liw-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 12px;
      display: none;
    }
    #liw-error.liw-visible {
      display: block;
    }

    @media (max-width: 480px) {
      #liw-widget {
        width: calc(100vw - 48px);
        bottom: 72px;
      }
    }
  `;

  // Icons
  const icons = {
    chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    contact: '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg>',
  };

  // Initialize widget
  function init(userConfig) {
    config = { ...defaultConfig, ...userConfig };
    
    // Auto-detect API endpoint if not provided
    if (!config.apiEndpoint) {
      const scriptTag = document.getElementById('liw');
      if (scriptTag && scriptTag.src) {
        const url = new URL(scriptTag.src);
        config.apiEndpoint = url.origin + '/api/webhook/lead';
      } else {
        config.apiEndpoint = '/api/webhook/lead';
      }
    }

    injectStyles();
    createWidget();
  }

  // Inject CSS styles
  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.id = 'liw-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Create widget HTML
  function createWidget() {
    const container = document.createElement('div');
    container.id = 'liw-container';
    container.className = config.position === 'left' ? 'liw-left' : 'liw-right';
    container.style.setProperty('--liw-primary', config.primaryColor);

    container.innerHTML = `
      <div id="liw-widget">
        <div id="liw-header" style="background: ${config.primaryColor}">
          <div id="liw-header-content">
            <div id="liw-header-icon">${icons.contact}</div>
            <div id="liw-header-text">
              <h3>Kontakt</h3>
              <p>Wir sind für Sie da</p>
            </div>
          </div>
          <button id="liw-close">${icons.close}</button>
        </div>
        
        <div id="liw-body">
          <div id="liw-form-container">
            <p id="liw-greeting">${escapeHtml(config.greeting)}</p>
            <div id="liw-error"></div>
            <form id="liw-form">
              <input type="text" name="name" class="liw-input" placeholder="Name *" required>
              <input type="email" name="email" class="liw-input" placeholder="E-Mail *" required>
              <input type="tel" name="phone" class="liw-input" placeholder="Telefon">
              <textarea name="message" class="liw-input" placeholder="Ihre Nachricht *" required></textarea>
              <button type="submit" id="liw-submit" style="background: ${config.primaryColor}">${escapeHtml(config.buttonText)}</button>
            </form>
          </div>
          
          <div id="liw-success" style="display: none;">
            <div id="liw-success-icon">${icons.check}</div>
            <p id="liw-success-text">${escapeHtml(config.successMessage)}</p>
          </div>
        </div>
        
        <div id="liw-footer">
          <a href="https://leadinbox.io" target="_blank" rel="noopener">Powered by Lead Inbox</a>
        </div>
      </div>
      
      <button id="liw-toggle" style="background: ${config.primaryColor}">${icons.chat}</button>
    `;

    document.body.appendChild(container);

    // Event listeners
    document.getElementById('liw-toggle').addEventListener('click', toggleWidget);
    document.getElementById('liw-close').addEventListener('click', closeWidget);
    document.getElementById('liw-form').addEventListener('submit', handleSubmit);
  }

  // Toggle widget open/close
  function toggleWidget() {
    isOpen = !isOpen;
    const widget = document.getElementById('liw-widget');
    const toggle = document.getElementById('liw-toggle');
    
    if (isOpen) {
      widget.classList.add('liw-open');
      toggle.innerHTML = icons.close;
    } else {
      widget.classList.remove('liw-open');
      toggle.innerHTML = icons.chat;
    }
  }

  function closeWidget() {
    isOpen = false;
    document.getElementById('liw-widget').classList.remove('liw-open');
    document.getElementById('liw-toggle').innerHTML = icons.chat;
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    isSubmitting = true;

    const form = e.target;
    const submitBtn = document.getElementById('liw-submit');
    const errorEl = document.getElementById('liw-error');
    
    // Get form data
    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim(),
      orgSlug: config.orgSlug,
      source: 'widget',
      pageUrl: window.location.href,
      pageTitle: document.title,
    };

    // Validate
    if (!formData.name || !formData.email || !formData.message) {
      showError('Bitte füllen Sie alle Pflichtfelder aus.');
      isSubmitting = false;
      return;
    }

    if (!isValidEmail(formData.email)) {
      showError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      isSubmitting = false;
      return;
    }

    // Update UI
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';
    errorEl.classList.remove('liw-visible');

    try {
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      // Show success
      document.getElementById('liw-form-container').style.display = 'none';
      document.getElementById('liw-success').style.display = 'block';
      isSubmitted = true;

      // Reset after delay
      setTimeout(() => {
        if (isSubmitted) {
          document.getElementById('liw-form-container').style.display = 'block';
          document.getElementById('liw-success').style.display = 'none';
          form.reset();
          isSubmitted = false;
          closeWidget();
        }
      }, 4000);

    } catch (error) {
      console.error('Lead Inbox Widget Error:', error);
      showError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = config.buttonText;
    }
  }

  function showError(message) {
    const errorEl = document.getElementById('liw-error');
    errorEl.textContent = message;
    errorEl.classList.add('liw-visible');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Process queued commands
  function processQueue() {
    const queue = window.liw && window.liw.q ? window.liw.q : [];
    
    window.liw = function(command, args) {
      if (command === 'init') {
        init(args);
      }
    };

    // Process any queued calls
    for (let i = 0; i < queue.length; i++) {
      window.liw.apply(null, queue[i]);
    }
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processQueue);
  } else {
    processQueue();
  }

})();
