/* ─────────────────────────────────────────────
   HOSPITALITY STUDIO — SHARED JS
   ───────────────────────────────────────────── */

/* ── SHARED NAV HTML ── */
const NAV_HTML = `
<nav id="nav">
  <a href="/index.html" class="nav-logo">Hospitality<span class="dot">.</span>Studio</a>
  <ul class="nav-links">
    <li><a href="/index.html" data-page="index">Home</a></li>
    <li><a href="/services.html" data-page="services">Services</a></li>
    <li><a href="/work.html" data-page="work">Our Work</a></li>
    <li><a href="/pricing.html" data-page="pricing">Pricing</a></li>
    <li><a href="/about.html" data-page="about">About</a></li>
    <li><a href="/contact.html" class="nav-cta">Start a Project</a></li>
  </ul>
  <button class="nav-burger" id="burger" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>
<div class="nav-mobile" id="mobileNav">
  <button class="nav-mobile-close" id="mobileClose">✕</button>
  <a href="/index.html">Home</a>
  <a href="/services.html">Services</a>
  <a href="/work.html">Our Work</a>
  <a href="/pricing.html">Pricing</a>
  <a href="/about.html">About</a>
  <a href="/contact.html">Start a Project →</a>
</div>`;

/* ── SHARED FOOTER HTML ── */
const FOOTER_HTML = `
<footer id="footer">
  <div class="footer-top">
    <div>
      <div class="footer-brand-name">Hospitality<span>.</span>Studio</div>
      <p class="footer-brand-desc">Hospitality websites built by people who've actually worked in the industry. We know what your guests need to see — and what makes them book.</p>
    </div>
    <div class="footer-col">
      <h5>Services</h5>
      <ul>
        <li><a href="/services.html">Restaurants & Cafés</a></li>
        <li><a href="/services.html">Hotels & Villas</a></li>
        <li><a href="/services.html">Private Chef & Events</a></li>
        <li><a href="/services.html">F&B Brands</a></li>
        <li><a href="/services.html">Redesigns</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h5>Studio</h5>
      <ul>
        <li><a href="/about.html">About</a></li>
        <li><a href="/work.html">Our Work</a></li>
        <li><a href="/pricing.html">Pricing</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h5>Get Started</h5>
      <ul>
        <li><a href="/contact.html">Start a Project</a></li>
        <li><a href="/pricing.html">View Packages</a></li>
        <li><a href="mailto:hello@formawebdesign.com">hello@formawebdesign.com</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p class="footer-copy">© 2025 Hospitality Studio · Remote · Worldwide</p>
    <div class="footer-badge">Currently taking new projects</div>
  </div>
</footer>`;

/* ── INJECT NAV & FOOTER ── */
function injectLayout() {
  const navEl = document.getElementById('nav-placeholder');
  const footerEl = document.getElementById('footer-placeholder');
  if (navEl) navEl.innerHTML = NAV_HTML;
  if (footerEl) footerEl.innerHTML = FOOTER_HTML;

  // Active nav link
  const page = document.body.dataset.page;
  if (page) {
    const link = document.querySelector(`.nav-links [data-page="${page}"]`);
    if (link) link.classList.add('active');
  }

  // Scroll effect
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 60));
    if (scrollY > 60) nav.classList.add('scrolled');
  }

  // Mobile menu
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileClose = document.getElementById('mobileClose');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => mobileNav.classList.add('open'));
    mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
  }
}

/* ── SCROLL REVEAL ── */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── NETLIFY IDENTITY (for CMS redirect) ── */
function initIdentity() {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', user => {
      if (!user) {
        window.netlifyIdentity.on('login', () => { document.location.href = '/admin/'; });
      }
    });
  }
}

/* ── LOAD CMS DATA ── */
async function loadData(file) {
  try {
    const res = await fetch(`/data/${file}.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('not found');
    return await res.json();
  } catch {
    return null;
  }
}

/* ── RENDER TESTIMONIALS ── */
async function renderTestimonials(containerId) {
  const data = await loadData('testimonials');
  const container = document.getElementById(containerId);
  if (!container || !data || !data.testimonials) return;
  container.innerHTML = data.testimonials.map(t => `
    <div class="testi-card">
      <div class="testi-stars">★★★★★</div>
      <p class="testi-text">"${t.quote}"</p>
      <div class="testi-author">
        <div class="testi-av">${t.initials || t.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        <div>
          <div class="testi-name">${t.name}</div>
          <div class="testi-role">${t.role}${t.location ? ' · ' + t.location : ''}</div>
        </div>
      </div>
    </div>`).join('');
}

/* ── RENDER PROJECTS ── */
async function renderProjects(containerId, limit = 99) {
  const data = await loadData('projects');
  const container = document.getElementById(containerId);
  if (!container || !data || !data.projects) return;
  const items = data.projects.slice(0, limit);
  container.innerHTML = items.map(p => `
    <div class="project-card reveal" data-type="${p.filter || ''}">
      <div class="project-img">
        ${p.image ? `<img src="${p.image}" alt="${p.title}">` : `<div class="project-img-placeholder">${p.title}</div>`}
      </div>
      <div class="project-info">
        <div class="project-type">${p.type}</div>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        ${Array.isArray(p.tags) ? `<div class="project-tags">${p.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}</div>` : ''}
        ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener" class="project-link">View site</a>` : ''}
      </div>
    </div>`).join('');
  // Re-observe new elements for reveal
  document.querySelectorAll('.reveal:not(.in)').forEach(el => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    io.observe(el);
  });
}

/* ── FAQ TOGGLE ── */
function initFaq() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  injectLayout();
  initReveal();
  initFaq();
  initIdentity();
});
