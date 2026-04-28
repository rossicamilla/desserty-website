// Tiny helper: inject reused HTML chunks (nav/footer) and mark active link
(function(){
  const PAGES = {
    'index.html':'home',
    'dubai-chocolate.html':'dubai',
    'ooh.html':'ooh',
    'storia.html':'storia',
    'diventa-partner.html':'contatti',
  };
  const here = (location.pathname.split('/').pop() || 'index.html');
  const key = PAGES[here] || '';

  const navHTML = `
  <header class="nav">
    <div class="nav-inner">
      <a class="logo" href="index.html"><b>D</b>esserty<span class="dot">.</span></a>
      <nav class="nav-links">
        <a href="dubai-chocolate.html" data-key="dubai">Dubai Chocolate</a>
        <a href="ooh.html" data-key="ooh">OOH!</a>
        <a href="storia.html" data-key="storia">Our Story</a>
        <a href="diventa-partner.html" data-key="contatti">Contact</a>
      </nav>
      <div class="nav-cta">
        <a class="lang" href="../${here}" style="color:inherit;text-decoration:none">IT</a>
        <span class="lang active">EN</span>
      </div>
      <button class="nav-hamburger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <nav class="nav-mobile-menu" aria-label="Navigation">
      <a href="dubai-chocolate.html" data-key="dubai">Dubai Chocolate</a>
      <a href="ooh.html" data-key="ooh">OOH!</a>
      <a href="storia.html" data-key="storia">Our Story</a>
      <a href="diventa-partner.html" data-key="contatti">Contact</a>
      <div class="nav-mobile-lang">
        <a class="lang" href="../${here}">IT</a>
        <span class="sep">·</span>
        <span class="lang active">EN</span>
      </div>
    </nav>
  </header>`;

  const footerHTML = `
  <footer class="footer">
    <div class="footer-inner">
      <div>
        <a class="logo" href="index.html"><b>D</b>esserty<span class="dot" style="color:var(--terracotta)">.</span></a>
        <p class="blurb">Frozen desserts for every mood. The world's best dessert innovations, now in Italy.</p>
        <div class="footer-socials">
          <a href="https://www.linkedin.com/in/desserty" target="_blank" aria-label="LinkedIn">LinkedIn ↗</a>
          <a href="http://www.oohfruit.com" target="_blank" aria-label="OOH! Fruit">oohfruit.com ↗</a>
        </div>
      </div>
      <div>
        <h5>Products</h5>
        <ul>
          <li><a href="dubai-chocolate.html">Dubai Chocolate</a></li>
          <li><a href="ooh.html">OOH! Sticks &amp; Jars</a></li>
        </ul>
      </div>
      <div>
        <h5>Company</h5>
        <ul>
          <li><a href="storia.html">Our Story</a></li>
          <li><a href="diventa-partner.html">Become a partner</a></li>
        </ul>
      </div>
      <div>
        <h5>Contact</h5>
        <ul>
          <li><a href="diventa-partner.html">Get in touch</a></li>
          <li>Confluencia Srl</li>
          <li>Via Magenta 25</li>
          <li>20831 Seregno (MB)</li>
          <li><a href="tel:+390362182119">+39 0362 182 1191</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Desserty is a brand of Confluencia Srl</span>
      <span><a href="privacy.html" style="color:#888;text-decoration:none">Privacy</a> · <a href="cookies.html" style="color:#888;text-decoration:none">Cookies</a> · <a href="termini.html" style="color:#888;text-decoration:none">Terms</a></span>
    </div>
  </footer>`;

  const oohBannerHTML = `
  <div class="ooh-band">
    <div class="ooh-band-text">
      Check out the dedicated<br/><span style="color:var(--ooh-pink)">OOH! website</span>
    </div>
    <a href="http://www.oohfruit.com" target="_blank" class="ooh-band-link">
      www.oohfruit.com ↗
    </a>
  </div>`;

  function mount(){
    const navSlot = document.querySelector('[data-mount="nav"]');
    const footSlot = document.querySelector('[data-mount="footer"]');
    if(navSlot) navSlot.innerHTML = navHTML;
    if(footSlot){
      if(here !== 'ooh.html'){
        footSlot.insertAdjacentHTML('beforebegin', oohBannerHTML);
      }
      footSlot.innerHTML = footerHTML;
    }
    document.querySelectorAll('.nav-links a').forEach(a=>{
      if(a.dataset.key === key) a.classList.add('active');
    });
    document.querySelectorAll('.nav-cta .lang').forEach(el=>{
      el.addEventListener('click',()=>{
        document.querySelectorAll('.nav-cta .lang').forEach(x=>x.classList.remove('active'));
        el.classList.add('active');
      });
    });
    // mobile menu active links
    document.querySelectorAll('.nav-mobile-menu [data-key]').forEach(a=>{
      if(a.dataset.key===key) a.classList.add('active');
    });
    // hamburger toggle
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

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{mount();fixMarquees();});
  else { mount(); fixMarquees(); }
})();
