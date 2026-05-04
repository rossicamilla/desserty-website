// Tiny helper: inject reused HTML chunks (nav/footer) and mark active link
(function(){
  const PAGES = {
    '':'home',
    'dubai-chocolate':'dubai',
    'ooh':'ooh',
    'storia':'storia',
    'diventa-partner':'contatti',
  };
  // Normalize: strip .html so slug matching works both locally (file://) and on server (clean URLs)
  const here = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  const key = PAGES[here] || '';

  const navHTML = `
  <header class="nav">
    <div class="nav-inner">
      <a class="logo" href="./"><img src="Immagini/og/logo-arancio.png" alt="Desserty" style="height:72px;width:auto;display:block"/></a>
      <nav class="nav-links">
        <a href="dubai-chocolate.html" data-key="dubai">Dubai Chocolate</a>
        <a href="ooh.html" data-key="ooh">OOH!</a>
        <a href="storia.html" data-key="storia">Storia</a>
        <a href="diventa-partner.html" data-key="contatti">Contatti</a>
      </nav>
      <div class="nav-cta">
        <span class="lang active">IT</span>
        <a class="lang" href="en/${here || 'index'}.html" style="color:inherit;text-decoration:none">EN</a>
      </div>
      <button class="nav-hamburger" aria-label="Apri menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <nav class="nav-mobile-menu" aria-label="Navigazione">
      <a href="dubai-chocolate.html" data-key="dubai">Dubai Chocolate</a>
      <a href="ooh.html" data-key="ooh">OOH!</a>
      <a href="storia.html" data-key="storia">Storia</a>
      <a href="diventa-partner.html" data-key="contatti">Contatti</a>
      <div class="nav-mobile-lang">
        <span class="lang active">IT</span>
        <span class="sep">·</span>
        <a class="lang" href="en/${here || 'index'}.html">EN</a>
      </div>
    </nav>
  </header>`;

  const footerHTML = `
  <footer class="footer">
    <div class="ooh-band">
      <div class="ooh-band-inner">
        <div class="ooh-band-text">
          Visita anche il sito<br/><span style="color:var(--ooh-pink)">dedicato a OOH!</span>
        </div>
        <a href="http://www.oohfruit.com" target="_blank" class="ooh-band-link">
          www.oohfruit.com ↗
        </a>
      </div>
    </div>
    <div class="footer-inner" style="margin-top:60px">
      <div>
        <a class="logo" href="./"><img src="Immagini/og/logo-arancio.png" alt="Desserty" style="height:72px;width:auto;display:block"/></a>
        <p class="blurb">Frozen dessert per tutti i gusti. Le innovazioni dei dessert del mondo, portate in Italia.</p>
        <div class="footer-socials">
          <a href="https://www.linkedin.com/showcase/dessertyfood/" target="_blank" aria-label="LinkedIn">LinkedIn ↗</a>
        </div>
      </div>
      <div>
        <h5>Linee</h5>
        <ul>
          <li><a href="dubai-chocolate.html">Dubai Chocolate</a></li>
          <li><a href="ooh.html">OOH! Sticks &amp; Barattoli</a></li>
        </ul>
      </div>
      <div>
        <h5>Azienda</h5>
        <ul>
          <li><a href="storia.html">Storia</a></li>
          <li><a href="diventa-partner.html">Diventa partner</a></li>
        </ul>
      </div>
      <div>
        <h5>Contatti</h5>
        <ul>
          <li><a href="diventa-partner.html">Scrivici</a></li>
          <li>Confluencia Srl</li>
          <li>Via Magenta 25</li>
          <li>20831 Seregno (MB)</li>
          <li><a href="tel:+390362182119">+39 0362 182 1191</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Desserty è un marchio di Confluencia Srl</span>
      <span><a href="privacy.html" style="color:#888;text-decoration:none">Privacy</a> · <a href="cookies.html" style="color:#888;text-decoration:none">Cookies</a> · <a href="termini.html" style="color:#888;text-decoration:none">Termini</a></span>
    </div>
  </footer>`;

  function mount(){
    const navSlot = document.querySelector('[data-mount="nav"]');
    const footSlot = document.querySelector('[data-mount="footer"]');
    if(navSlot) navSlot.innerHTML = navHTML;
    if(footSlot) footSlot.innerHTML = footerHTML;
    if(key === 'ooh'){const band=footSlot.querySelector('.ooh-band');if(band)band.style.display='none';}
    document.querySelectorAll('.nav-links a').forEach(a=>{
      if(a.dataset.key === key) a.classList.add('active');
    });
    document.querySelectorAll('.nav-cta .lang').forEach(el=>{
      el.addEventListener('click',()=>{
        document.querySelectorAll('.nav-cta .lang').forEach(x=>x.classList.remove('active'));
        el.classList.add('active');
      });
    });
    document.querySelectorAll('.nav-mobile-menu [data-key]').forEach(a=>{
      if(a.dataset.key===key) a.classList.add('active');
    });
    const hamburger=document.querySelector('.nav-hamburger');
    const mobileMenu=document.querySelector('.nav-mobile-menu');
    if(hamburger&&mobileMenu){
      hamburger.addEventListener('click',()=>{
        const open=mobileMenu.classList.toggle('open');
        hamburger.setAttribute('aria-expanded',open);
      });
      mobileMenu.querySelectorAll('[data-key]').forEach(a=>{
        a.addEventListener('click',()=>{
          mobileMenu.classList.remove('open');
          hamburger.setAttribute('aria-expanded','false');
        });
      });
    }
  }
  function fixMarquees(){
    document.querySelectorAll('.marquee-track').forEach(track=>{
      const original = track.querySelector('span:not([aria-hidden])');
      if(!original) return;
      track.querySelectorAll('[aria-hidden]').forEach(el=>el.remove());
      let safety = 0;
      while(track.scrollWidth < window.innerWidth * 3 && safety++ < 20){
        const clone = original.cloneNode(true);
        clone.setAttribute('aria-hidden','true');
        track.appendChild(clone);
      }
      const spanW = original.offsetWidth;
      const gap = parseInt(getComputedStyle(track).gap) || 48;
      const unit = spanW + gap;
      track.style.setProperty('--unit', unit + 'px');
    });
  }

  function injectFavicon(){
    if(!document.querySelector('link[rel="icon"]')){
      const lnk=document.createElement('link');
      lnk.rel='icon';lnk.type='image/png';
      lnk.href='Immagini/og/favicon-orange.png';
      document.head.appendChild(lnk);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{mount();fixMarquees();injectFavicon();});
  else { mount(); fixMarquees(); injectFavicon(); }
})();
