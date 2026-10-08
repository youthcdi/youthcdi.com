/* Home page: events, board, observatory teaser and newsletter */
(function () {
  const { SITE, ICONS } = window.YCDI;

  const initials = name => name.split(/\s+/).filter(w => /^[A-ZÀ-Ý]/.test(w)).slice(0, 2).map(w => w[0]).join("") || "YC";

  async function getJSON(url) {
    const r = await fetch(url, { cache: "no-cache" });
    if (!r.ok) throw new Error(url + " " + r.status);
    return r.json();
  }

  async function renderEvents() {
    const box = document.getElementById("events");
    try {
      const { events } = await getJSON("data/events.json");
      box.innerHTML = events.map((e, i) => `
        <article class="event reveal" style="--d:${i * 0.08}s">
          <div class="ph">${e.photo ? `<img src="assets/img/events/${esc(e.photo)}" alt="${esc(e.title)}" loading="lazy">` : `<span>Event photo</span>`}</div>
          <div class="event__body">
            <div class="event__meta">
              <span>${ICONS.pin}${esc(e.place)}</span><span>${esc(e.date)}</span>
              ${e.sample ? '<span class="pill pill--sample">Example</span>' : ""}
            </div>
            <h3>${esc(e.title)}</h3>
            <p>${esc(e.summary)}</p>
            ${e.link ? `<p style="margin-top:12px"><a href="${esc(e.link)}">Read more →</a></p>` : ""}
          </div>
        </article>`).join("");
    } catch (err) { box.innerHTML = `<p class="leyenda">Events could not be loaded.</p>`; console.error(err); }
    document.querySelectorAll("[data-ev]").forEach(b => b.addEventListener("click", () => {
      const card = box.querySelector(".event");
      const step = card ? card.getBoundingClientRect().width + 24 : 400;
      box.scrollBy({ left: step * Number(b.dataset.ev), behavior: "smooth" });
    }));
  }

  async function renderBoard() {
    const box = document.getElementById("board-grid");
    try {
      const { members } = await getJSON("data/board.json");
      box.innerHTML = members.map((m, i) => `
        <article class="member reveal${i < 2 ? " member--lead" : ""}" style="--d:${(i % 4) * 0.06}s">
          <div class="member__photo">
            ${m.photo ? `<img src="assets/img/board/${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">` : `<span class="member__initials" aria-hidden="true">${esc(initials(m.name))}</span>`}
          </div>
          <h3>${esc(m.name)}</h3>
          <div class="member__role">${esc(m.role)}</div>
          <div class="member__country">${esc(m.country)}</div>
        </article>`).join("");
    } catch (err) { box.innerHTML = `<p class="leyenda">Board could not be loaded.</p>`; console.error(err); }
  }

  async function renderTeaserMap() {
    const box = document.getElementById("teaser-map");
    if (!box || !window.d3 || !window.topojson) return;
    try {
      const [world, data] = await Promise.all([getJSON("data/world-50m.json"), getJSON("data/countries.json")]);
      const has = new Set(Object.keys(data.countries || {}));
      const fc = topojson.feature(world, world.objects.countries);
      const w = 960, h = 600;
      const proj = d3.geoNaturalEarth1().fitSize([w, h], fc);
      const path = d3.geoPath(proj);
      const svg = d3.select(box).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("preserveAspectRatio", "xMidYMid meet");
      svg.selectAll("path").data(fc.features).join("path")
        .attr("d", path).attr("class", d => has.has(d.id) ? "has" : null);
    } catch (err) { console.error(err); }
  }

  function setupNewsletter() {
    const btn = document.getElementById("newsletter-btn");
    const note = document.getElementById("newsletter-note");
    if (SITE.newsletterForm) {
      btn.href = SITE.newsletterForm;
      note.textContent = "The form opens in Microsoft Forms.";
    } else {
      btn.href = `mailto:${SITE.email}?subject=${encodeURIComponent("Newsletter subscription")}`;
      btn.removeAttribute("target");
      note.textContent = "Until the online form is published, this button opens an email to " + SITE.email + ".";
    }
    if (SITE.newsletterEmbed) {
      const f = document.createElement("iframe");
      f.className = "newsletter__embed";
      f.src = SITE.newsletterEmbed;
      f.title = "Newsletter subscription form";
      f.loading = "lazy";
      document.getElementById("newsletter-embed").appendChild(f);
    }
  }

  function countUp() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll("[data-count]").forEach(el => {
      const end = Number(el.dataset.count), t0 = performance.now(), dur = 1400;
      const tick = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      el.textContent = "0"; requestAnimationFrame(tick);
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    setupNewsletter();
    countUp();
    await Promise.all([renderEvents(), renderBoard(), renderTeaserMap()]);
    window.YCDI.initReveal();
  });
})();
