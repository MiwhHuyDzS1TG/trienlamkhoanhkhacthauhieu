// src/js/main.js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Smooth scroll for anchor links */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (target) {
    e.preventDefault();
    if (prefersReduced) target.scrollIntoView();
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* Fade-up reveal */
if (!prefersReduced) {
  const reveals = document.querySelectorAll('[data-animate="fade-up"]');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-up');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => io.observe(r));
}

/* Parallax micro-shift for panels */
if (!prefersReduced) {
  document.querySelectorAll('.room-panel').forEach(panel => {
    const img = panel.querySelector('img');
    const aura = panel.querySelector('.room-aura');
    panel.addEventListener('mousemove', (ev) => {
      const r = panel.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width - 0.5;
      const y = (ev.clientY - r.top) / r.height - 0.5;
      const tx = (x * 6).toFixed(2);
      const ty = (y * 6).toFixed(2);
      if (img) img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.03)`;
      if (aura) aura.style.transform = `translate3d(${tx * -1.5}px, ${ty * -1.5}px, 0)`;
    });
    panel.addEventListener('mouseleave', () => {
      if (img) img.style.transform = '';
      if (aura) aura.style.transform = '';
    });
  });
}

/* MOBILE DRAWER (open/close) */
const drawer = document.getElementById("mobileDrawer");
const openBtn = document.getElementById("mobileMenuBtn");
const closeBtn = document.getElementById("drawerClose");
if (drawer && openBtn && closeBtn) {
  openBtn.addEventListener("click", () => drawer.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => drawer.classList.add("hidden"));
  drawer.addEventListener("click", (e) => { if (e.target === drawer) drawer.classList.add("hidden"); });
}

/* Focus-visible: show focus only when tabbing */
(function() {
  const body = document.body;
  function onFirstTab(e) {
    if (e.key === 'Tab') {
      body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', onFirstTab);
      window.addEventListener('mousedown', onMouseDownOnce);
    }
  }
  function onMouseDownOnce() {
    body.classList.remove('user-is-tabbing');
    window.removeEventListener('mousedown', onMouseDownOnce);
    window.addEventListener('keydown', onFirstTab);
  }
  window.addEventListener('keydown', onFirstTab);
})();
