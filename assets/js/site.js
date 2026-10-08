/* =========================================================
   YCDI — shared site script
   Edit SITE below to change contact details, social links
   and the newsletter form for every page at once.
   ========================================================= */
const SITE = {
  name: "Youth of the Centrist Democrat International",
  short: "YCDI",
  email: "youth@idc-cdi.com",
  city: "Brussels, Belgium",
  instagram: "https://www.instagram.com/youth_idc_cdi/",
  x: "https://x.com/youth_idc_cdi",
  // Paste the Microsoft Forms "Share → Link" URL here once the form exists.
  // Example: "https://forms.office.com/r/AbCdEf1234"
  newsletterForm: "",
  // Optional: Microsoft Forms "Share → Embed" URL (iframe src). Leave "" to show the button only.
  newsletterEmbed: "",
  // Optional: form for members who want to submit an article to the Observatory.
  articleSubmissionForm: ""
};

const NAV = [
  { href: "index.html", label: "The Organization", key: "home" },
  { href: "resolutions.html", label: "Resolutions & Projects", key: "resolutions" },
  { href: "observatory.html", label: "State of Democracy Observatory", key: "observatory" }
];

const ICONS = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14"/><path d="M3 7l9 6 9-6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'
};

function renderHeader() {
  const el = document.querySelector("[data-site-header]");
  if (!el) return;
  const page = document.body.dataset.page;
  el.className = "site-header" + (document.body.dataset.header === "solid" ? " is-solid" : "");
  el.innerHTML = `
    <a class="skip" href="#main">Skip to content</a>
    <div class="wrap">
      <a class="brand" href="index.html" aria-label="YCDI home">
        <img class="logo-white" src="assets/logos/ycdi-logo-simple-blanco.svg" alt="YCDI" width="70" height="44">
        <img class="logo-blue" src="assets/logos/ycdi-logo-simple.svg" alt="YCDI" width="70" height="44">
      </a>
      <button class="menu-btn" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">${ICONS.menu}</button>
      <nav class="nav" id="site-nav" aria-label="Main">
        ${NAV.map(n => `<a href="${n.href}"${n.key === page ? ' aria-current="page"' : ""}>${n.label}</a>`).join("")}
      </nav>
    </div>`;
  const btn = el.querySelector(".menu-btn"), nav = el.querySelector(".nav");
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open);
    btn.innerHTML = open ? ICONS.close : ICONS.menu;
    if (open) el.classList.add("is-solid"); else onScroll();
  });
}

function renderFooter() {
  const el = document.querySelector("[data-site-footer]");
  if (!el) return;
  el.className = "site-footer";
  const year = new Date().getFullYear();
  el.innerHTML = `
    <img class="flame-mark" src="assets/logos/ycdi-isotipo-blanco.svg" alt="" aria-hidden="true">
    <div class="wrap">
      <div class="footer__top">
        <div class="footer__logo">
          <img src="assets/logos/ycdi-logo-oficial-blanco.png" alt="Youth of the Centrist Democrat International" width="240" height="143">
        </div>
        <div class="footer__col">
          <h4>Explore</h4>
          ${NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join("")}
        </div>
        <div class="footer__col">
          <h4>Contact</h4>
          <a href="mailto:${SITE.email}">${SITE.email}</a>
          <p>${SITE.city}</p>
        </div>
        <div class="footer__col">
          <h4>Follow</h4>
          <div class="footer__social">
            <a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
            <a href="${SITE.x}" target="_blank" rel="noopener" aria-label="X">${ICONS.x}</a>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© ${year} Youth of the Centrist Democrat International</span>
        <span>Youth organization of the IDC-CDI</span>
      </div>
    </div>`;
}

/* Header turns solid once the hero has scrolled away */
const header = () => document.querySelector(".site-header");
function onScroll() {
  const h = header();
  if (!h || document.body.dataset.header === "solid") return;
  if (document.querySelector(".nav.is-open")) return;
  const hero = document.querySelector(".hero");
  const limit = hero ? hero.offsetHeight - 90 : 40;
  h.classList.toggle("is-solid", window.scrollY > limit);
}

/* Slow parallax on the flame watermark */
function parallax() {
  const mark = document.querySelector(".hero .flame-mark");
  if (!mark || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const y = Math.min(window.scrollY, 1200);
  mark.style.setProperty("--parallax", (y * 0.25) + "px");
}

function fillIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach(el => { if (!el.dataset.filled) { el.innerHTML = ICONS[el.dataset.icon] || ""; el.dataset.filled = 1; } });
  root.querySelectorAll("[data-icon-before]").forEach(el => { if (!el.dataset.filled) { el.insertAdjacentHTML("afterbegin", ICONS[el.dataset.iconBefore] || ""); el.dataset.filled = 1; } });
}

function initReveal() {
  const els = document.querySelectorAll(".reveal, .reveal-line");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("is-in")); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach(e => io.observe(e));
}
window.YCDI = { SITE, ICONS, initReveal, fillIcons };

/* Escape text before inserting it into HTML */
window.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  fillIcons();
  onScroll(); parallax();
  window.addEventListener("scroll", () => { onScroll(); parallax(); }, { passive: true });
  initReveal();
});
