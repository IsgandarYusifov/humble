(() => {
  const tag = document.currentScript;
  const id = tag?.dataset.measurementId;
  const base = document.querySelector('meta[name="humble-base-path"]')?.content || '';
  if (!/^G-[A-Z0-9]+$/.test(id || '') || location.hostname !== tag.dataset.analyticsHost || (base && !location.pathname.startsWith(base + '/'))) return;
  const key = 'humble-analytics-consent-v1';
  const cookiePath = base || '/';
  let initialized = false;
  let returnFocus = null;
  const cleanUrl = value => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : ''; } catch { return ''; } };
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window['ga-disable-' + id] = true;
  gtag('consent', 'default', {analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  const banner = document.createElement('section');
  banner.className = 'analytics-consent';
  banner.setAttribute('aria-label', 'Usage analytics');
  banner.hidden = true;
  banner.innerHTML = '<h2>Usage analytics</h2><p>Allow Google Analytics to help us understand visits? Application details are not sent.</p><a class="analytics-details" href="' + base + (location.pathname.startsWith(base + '/v2/') ? '/v2' : '') + '/data/#analytics">Read the data notes</a><div class="analytics-actions"><button type="button" data-consent="granted">Allow analytics</button><button type="button" data-consent="denied">Decline</button></div>';
  document.body.append(banner);
  const readChoice = () => { try { return localStorage.getItem(key); } catch { return null; } };
  const eraseCookies = () => {
    for (const entry of document.cookie.split(';')) {
      const name = entry.split('=')[0].trim();
      if (!name.startsWith('humble_ga')) continue;
      const expired = name + '=; Max-Age=0; path=' + cookiePath + '; SameSite=Lax';
      document.cookie = expired;
      document.cookie = expired + '; domain=' + location.hostname;
      document.cookie = expired + '; domain=.' + location.hostname;
    }
  };
  const applyChoice = choice => {
    const allowed = choice === 'granted';
    window['ga-disable-' + id] = !allowed;
    gtag('consent', 'update', {analytics_storage:allowed?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    if (allowed && !initialized) {
      initialized = true;
      gtag('js', new Date());
      gtag('config', id, {page_location:cleanUrl(location.href),page_referrer:cleanUrl(document.referrer),cookie_prefix:'humble',cookie_path:cookiePath,cookie_domain:location.hostname,allow_google_signals:false,allow_ad_personalization_signals:false});
      const library = document.createElement('script');
      library.async = true;
      library.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
      document.head.append(library);
    }
    if (!allowed) eraseCookies();
    banner.hidden = choice === 'granted' || choice === 'denied';
  };
  banner.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    const choice = button.dataset.consent;
    try { localStorage.setItem(key, choice); } catch { /* Current-page consent still applies. */ }
    applyChoice(choice);
    returnFocus?.focus();
    returnFocus = null;
  }));
  document.querySelectorAll('[data-analytics-preferences]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => { returnFocus = button; banner.hidden = false; banner.querySelector('[data-consent]').focus(); });
  });
  addEventListener('storage', event => { if (event.key === key) applyChoice(readChoice()); });
  applyChoice(readChoice());
})();