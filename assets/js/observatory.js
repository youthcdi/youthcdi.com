/* =========================================================
   State of Democracy Observatory — interactive map
   Data: data/world-50m.json (map), data/countries.json
   (country profiles), data/articles.json (articles index)
   ========================================================= */
(function () {
  const { SITE, ICONS } = window.YCDI;
  const W = 960, H = 540;
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtDate = d => { const [y, m, day] = String(d).split("-"); return [day ? +day : "", m ? MONTHS[+m - 1] : "", y].filter(Boolean).join(" "); };
  const pct = v => (v == null ? "—" : `${v}%`);

  let features = [], byId = new Map(), profiles = {}, articles = [], artsBy = new Map();
  let svg, gRoot, zoom, path, active = null;

  const getJSON = async url => { const r = await fetch(url, { cache: "no-cache" }); if (!r.ok) throw new Error(url); return r.json(); };

  /* ---------- Map ---------- */
  function largestPolygonCentroid(f) {
    if (f.geometry.type !== "MultiPolygon") return path.centroid(f);
    let best = null, area = -1;
    f.geometry.coordinates.forEach(c => {
      const poly = { type: "Feature", geometry: { type: "Polygon", coordinates: c } };
      const a = path.area(poly); if (a > area) { area = a; best = poly; }
    });
    return path.centroid(best);
  }

  function drawMap(world) {
    const fc = topojson.feature(world, world.objects.countries);
    features = fc.features.filter(f => f.id);
    features.forEach(f => byId.set(f.id, f));

    const proj = d3.geoNaturalEarth1().fitExtent([[8, 8], [W - 8, H - 8]], { type: "Sphere" });
    path = d3.geoPath(proj);

    svg = d3.select("#map").insert("svg", ":first-child")
      .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img").attr("aria-label", "World map of the State of Democracy Observatory");
    gRoot = svg.append("g");
    gRoot.append("path").attr("class", "sphere").attr("d", path({ type: "Sphere" }));
    gRoot.append("path").attr("class", "graticule").attr("d", path(d3.geoGraticule10()));

    gRoot.append("g").selectAll("path").data(features).join("path")
      .attr("class", d => "country" + (profiles[d.id] ? " has-data" : ""))
      .attr("d", path)
      .attr("data-id", d => d.id)
      .on("pointermove", (ev, d) => { if (ev.pointerType === "mouse") showTip(ev, d); hover(d.id); })
      .on("pointerleave", () => { hideTip(); hover(null); })
      .on("click", (ev, d) => { hideTip(); select(d.id, true); });

    // Article markers
    const dots = [...artsBy.entries()].filter(([id]) => byId.has(id)).map(([id, list]) => {
      const [x, y] = largestPolygonCentroid(byId.get(id));
      return { id, x, y, n: list.length };
    });
    const gd = gRoot.append("g");
    gd.selectAll("circle.dot-pulse").data(dots).join("circle").attr("class", "dot-pulse").attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 3.5);
    gd.selectAll("circle.dot").data(dots).join("circle").attr("class", "dot").attr("cx", d => d.x).attr("cy", d => d.y).attr("r", d => 3 + Math.min(d.n, 6) * 0.6).attr("stroke-width", 3);

    zoom = d3.zoom().scaleExtent([1, 12]).translateExtent([[0, 0], [W, H]])
      .on("zoom", ev => {
        gRoot.attr("transform", ev.transform);
        gd.selectAll("circle.dot").attr("r", d => (3 + Math.min(d.n, 6) * 0.6) / Math.sqrt(ev.transform.k));
        gd.selectAll("circle.dot-pulse").attr("r", 3.5 / Math.sqrt(ev.transform.k));
      });
    svg.call(zoom).on("dblclick.zoom", null);
    document.getElementById("zoom-in").onclick = () => svg.transition().duration(350).call(zoom.scaleBy, 1.6);
    document.getElementById("zoom-out").onclick = () => svg.transition().duration(350).call(zoom.scaleBy, 1 / 1.6);
    document.getElementById("zoom-reset").onclick = () => { select(null); svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity); };
  }

  function hover(id) { gRoot.selectAll(".country").classed("is-hover", d => d.id === id); }

  function zoomTo(id) {
    const f = byId.get(id); if (!f) return;
    let [[x0, y0], [x1, y1]] = path.bounds(f);
    // Countries spanning the antimeridian (e.g. Russia, Fiji) → use the largest polygon
    if (x1 - x0 > W * 0.5 && f.geometry.type === "MultiPolygon") {
      let best = null, area = -1;
      f.geometry.coordinates.forEach(c => { const p = { type: "Feature", geometry: { type: "Polygon", coordinates: c } }; const a = path.area(p); if (a > area) { area = a; best = p; } });
      [[x0, y0], [x1, y1]] = path.bounds(best);
    }
    const k = Math.max(1, Math.min(8, 0.55 / Math.max((x1 - x0) / W, (y1 - y0) / H)));
    const t = d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    svg.transition().duration(750).call(zoom.transform, t);
  }

  /* ---------- Tooltip ---------- */
  const tip = () => document.getElementById("tip");
  function showTip(ev, f) {
    const p = profiles[f.id], arts = artsBy.get(f.id) || [];
    const el = tip();
    el.innerHTML = `
      <div class="tip__region">${esc(p ? p.region : "Country")}</div>
      <h4>${esc(p ? p.name : f.properties.name)}</h4>
      ${p ? `<dl>
        <dt>Democracy index</dt><dd>${p.democracy?.index ?? "—"}</dd>
        <dt>Regime type</dt><dd>${esc(p.democracy?.category ?? "—")}</dd>
        <dt>MPs under 40</dt><dd>${pct(p.youth?.mps_under_40_pct)}</dd>
        <dt>Articles</dt><dd>${arts.length}</dd>
      </dl>` : `<dl><dt>Country profile</dt><dd>No data yet</dd><dt>Articles</dt><dd>${arts.length}</dd></dl>`}
      <div class="tip__cta">Click to open the country profile${p && p.sample ? " · example data" : ""}</div>`;
    const pad = 18, r = el.getBoundingClientRect();
    let x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - pad;
    if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - pad;
    el.style.left = x + "px"; el.style.top = y + "px";
    el.classList.add("is-on");
  }
  function hideTip() { tip().classList.remove("is-on"); }

  /* ---------- Panel ---------- */
  function articleLink(a) {
    return `<a class="mini-art" href="article.html?a=${encodeURIComponent(a.slug)}">
      <strong>${esc(a.title)}</strong>
      <span>${esc(a.author)} · ${esc(fmtDate(a.date))}${a.sample ? " · Example" : ""}</span></a>`;
  }

  function panelIntro() {
    const nProfiles = Object.keys(profiles).length;
    const nCountriesArt = [...artsBy.keys()].length;
    document.getElementById("panel").innerHTML = `
      <div class="panel__head"><span class="tag">Overview</span><h3 style="margin-top:8px">Democracy and youth, country by country</h3></div>
      <div class="panel__body panel__intro">
        <p class="panel__empty">Hover over a country for a quick summary, or select it to see its full profile and the articles written about it.</p>
        <div class="kpis">
          <div class="kpi"><b>${nProfiles}</b><span>Country profiles</span></div>
          <div class="kpi"><b>${articles.length}</b><span>Articles published</span></div>
          <div class="kpi"><b>${nCountriesArt}</b><span>Countries covered by articles</span></div>
          <div class="kpi"><b>${features.length}</b><span>Countries and territories on the map</span></div>
        </div>
        <div class="panel__sec" style="margin-top:12px">
          <h4>Latest articles</h4>
          ${articles.length ? articles.slice(0, 3).map(articleLink).join("") : '<p class="panel__empty">No articles yet.</p>'}
        </div>
      </div>`;
  }

  function panelCountry(id) {
    const f = byId.get(id); if (!f) return panelIntro();
    const p = profiles[id], arts = artsBy.get(id) || [];
    const name = p ? p.name : f.properties.name;
    const sampleBadge = p && p.sample ? ' <span class="pill pill--sample">Example data</span>' : "";
    let body = "";
    if (p) {
      const idx = p.democracy?.index;
      body += `
        ${p.summary ? `<div class="panel__sec"><p>${esc(p.summary)}</p></div>` : ""}
        <div class="panel__sec">
          <h4>State of democracy</h4>
          <div class="kpis">
            <div class="kpi"><b>${idx ?? "—"}</b><span>Democracy index (0–1)</span></div>
            <div class="kpi"><b style="font-size:17px;line-height:1.3">${esc(p.democracy?.category ?? "—")}</b><span>Regime type</span></div>
          </div>
          ${idx != null ? `<div class="meter" role="img" aria-label="Index ${idx} out of 1"><i style="width:${idx * 100}%"></i></div><div class="meter-scale"><span>0 · Autocracy</span><span>1 · Democracy</span></div>` : ""}
          ${p.freedom ? `<p style="margin-top:14px;font-size:14px">Freedom status: <strong>${esc(p.freedom.status)}</strong>${p.freedom.score != null ? ` (${p.freedom.score}/100)` : ""}</p>` : ""}
          <p class="src">Sources: ${esc(p.democracy?.source || "")}${p.democracy?.year ? ", " + p.democracy.year : ""}${p.freedom ? " · " + esc(p.freedom.source) : ""}</p>
        </div>
        <div class="panel__sec">
          <h4>Youth political participation</h4>
          <div class="kpis">
            <div class="kpi"><b>${pct(p.youth?.mps_under_30_pct)}</b><span>MPs under 30</span></div>
            <div class="kpi"><b>${pct(p.youth?.mps_under_40_pct)}</b><span>MPs under 40</span></div>
            <div class="kpi"><b>${p.youth?.min_candidacy_age ?? "—"}</b><span>Minimum age to run for parliament</span></div>
            <div class="kpi"><b>${p.youth?.voting_age ?? "—"}</b><span>Voting age</span></div>
          </div>
          <p class="src">Source: ${esc(p.youth?.source || "")}${p.youth?.year ? ", " + p.youth.year : ""}</p>
        </div>
        ${p.elections?.length ? `<div class="panel__sec"><h4>Upcoming elections</h4><ul class="plain">${p.elections.map(e => `<li><strong>${esc(e.type)}</strong> · ${esc(fmtDate(e.date))}</li>`).join("")}</ul></div>` : ""}
        ${p.members?.length ? `<div class="panel__sec"><h4>YCDI / IDC-CDI members</h4><ul class="plain">${p.members.map(m => `<li>${esc(m.party)}${m.youth_wing ? ` · <span style="color:var(--tinta-suave)">${esc(m.youth_wing)}</span>` : ""}</li>`).join("")}</ul></div>` : ""}`;
    } else {
      body += `<div class="panel__sec"><p class="panel__empty">There is no country profile for ${esc(name)} yet. Indicators will be added as the Observatory grows.</p></div>`;
    }
    body += `<div class="panel__sec"><h4>Articles (${arts.length})</h4>${arts.length ? arts.map(articleLink).join("") : `<p class="panel__empty">No articles about ${esc(name)} yet. <a href="#" data-submit>Write the first one</a>.</p>`}</div>`;

    document.getElementById("panel").innerHTML = `
      <div class="panel__head">
        <span class="tag">${esc(p ? p.region : "Country")}</span>${sampleBadge}
        <h3 style="margin-top:8px; padding-right:40px">${esc(name)}</h3>
        <button class="panel__close" type="button" aria-label="Close country profile">${ICONS.close}</button>
      </div>
      <div class="panel__body">${body}</div>`;
    document.querySelector(".panel__close").onclick = () => { select(null); svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity); };
    document.querySelectorAll("[data-submit]").forEach(a => a.onclick = e => { e.preventDefault(); location.href = submitHref(); });
  }

  function select(id, fromMap) {
    active = id;
    gRoot.selectAll(".country").classed("is-active", d => d.id === id);
    if (id) { panelCountry(id); if (!fromMap || innerWidth > 1000) zoomTo(id); history.replaceState(null, "", "#" + id); }
    else { panelIntro(); history.replaceState(null, "", location.pathname); }
    if (id && innerWidth <= 1000) document.getElementById("panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- Country search ---------- */
  function initSearch() {
    const input = document.getElementById("country-q"), list = document.getElementById("suggest");
    const names = features.map(f => ({ id: f.id, name: profiles[f.id]?.name || f.properties.name })).sort((a, b) => a.name.localeCompare(b.name));
    let idx = -1, current = [];
    const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const close = () => { list.hidden = true; input.setAttribute("aria-expanded", "false"); idx = -1; };
    const pick = c => { input.value = c.name; close(); select(c.id); };
    input.addEventListener("input", () => {
      const q = norm(input.value.trim());
      if (!q) return close();
      current = names.filter(n => norm(n.name).includes(q) || n.id.toLowerCase() === q).slice(0, 8);
      list.innerHTML = current.map((c, i) => `<li role="option" id="opt-${i}" data-i="${i}">${esc(c.name)}<small>${profiles[c.id] ? "Profile" : ""}${artsBy.has(c.id) ? " · " + artsBy.get(c.id).length + " art." : ""}</small></li>`).join("") || '<li aria-disabled="true">No match</li>';
      list.hidden = false; input.setAttribute("aria-expanded", "true"); idx = -1;
    });
    input.addEventListener("keydown", e => {
      if (list.hidden || !current.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + current.length) % current.length;
        list.querySelectorAll("li").forEach((li, i) => li.setAttribute("aria-selected", i === idx));
        input.setAttribute("aria-activedescendant", "opt-" + idx);
      } else if (e.key === "Enter") { e.preventDefault(); pick(current[Math.max(idx, 0)]); }
      else if (e.key === "Escape") close();
    });
    list.addEventListener("mousedown", e => { const li = e.target.closest("li[data-i]"); if (li) pick(current[+li.dataset.i]); });
    input.addEventListener("blur", () => setTimeout(close, 120));
  }

  /* ---------- Articles feed ---------- */
  function renderArticles() {
    const grid = document.getElementById("art-grid"), chips = document.getElementById("topic-chips");
    if (!articles.length) {
      grid.innerHTML = `<div class="art-empty" style="grid-column:1/-1"><h3 style="margin-bottom:8px">No articles yet</h3><p class="panel__empty">The first contributions from our members will appear here.</p></div>`;
      return;
    }
    const topics = ["All", ...new Set(articles.map(a => a.topic).filter(Boolean))];
    let topic = "All";
    chips.innerHTML = topics.map(t => `<button class="chip" aria-pressed="${t === "All"}" data-t="${esc(t)}">${esc(t)}</button>`).join("");
    const draw = () => {
      const list = articles.filter(a => topic === "All" || a.topic === topic);
      grid.innerHTML = list.map((a, i) => `
        <a class="art reveal" style="--d:${(i % 3) * 0.08}s" href="article.html?a=${encodeURIComponent(a.slug)}">
          <div class="ph">${a.image ? `<img src="assets/img/articles/${esc(a.image)}" alt="" loading="lazy">` : "<span>Article image</span>"}</div>
          <div class="art__meta"><span class="tag">${esc(a.topic || "Analysis")}</span><span>${esc(fmtDate(a.date))}</span>${a.sample ? '<span class="pill pill--sample">Example</span>' : ""}</div>
          <h3>${esc(a.title)}</h3>
          <p>${esc(a.summary)}</p>
          <div class="chips" style="margin-bottom:14px">${(a.countries || []).map(c => `<span class="pill">${esc(profiles[c]?.name || byId.get(c)?.properties.name || c)}</span>`).join("")}</div>
          <div class="art__by">${esc(a.author)}${a.party ? ` · <span style="font-weight:500;color:var(--tinta-suave)">${esc(a.party)}</span>` : ""}</div>
        </a>`).join("");
      YCDI.initReveal();
    };
    chips.onclick = e => { const b = e.target.closest(".chip"); if (!b) return; topic = b.dataset.t; chips.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c === b)); draw(); };
    draw();
  }

  /* ---------- Method / sources ---------- */
  function renderMethod(sources) {
    const blocks = [
      { t: "Democracy index", d: "A 0–1 score of how close each country is to a full liberal democracy, with its regime type (liberal democracy, electoral democracy, electoral autocracy, closed autocracy)." },
      { t: "Freedom status", d: "Political rights and civil liberties, scored 0–100 and classified as Free, Partly Free or Not Free." },
      { t: "Youth in parliament", d: "Share of members of parliament under 30 and under 40, minimum age to stand for election and voting age." },
      { t: "Member articles", d: "Signed opinion and analysis by young leaders of YCDI member parties. Authors' views do not necessarily reflect the official position of the YCDI." }
    ];
    document.getElementById("method").innerHTML = blocks.map(b => `<div class="reveal"><h3>${b.t}</h3><p>${b.d}</p></div>`).join("") +
      `<div class="reveal"><h3>Sources</h3>${(sources || []).map(s => `<p style="margin:0 0 8px"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></p>`).join("")}</div>`;
    YCDI.initReveal();
  }

  const submitHref = () => SITE.articleSubmissionForm || `mailto:${SITE.email}?subject=${encodeURIComponent("Article for the State of Democracy Observatory")}`;

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("submit-btn").href = submitHref();
    try {
      const [world, cData, aData] = await Promise.all([getJSON("data/world-50m.json"), getJSON("data/countries.json"), getJSON("data/articles.json")]);
      profiles = cData.countries || {};
      articles = (aData.articles || []).sort((a, b) => String(b.date).localeCompare(String(a.date)));
      articles.forEach(a => (a.countries || []).forEach(c => { if (!artsBy.has(c)) artsBy.set(c, []); artsBy.get(c).push(a); }));
      document.getElementById("sample-note").hidden = !Object.values(profiles).some(p => p.sample);
      drawMap(world);
      initSearch();
      renderArticles();
      renderMethod(cData.sources);
      const hash = location.hash.slice(1).toUpperCase();
      if (hash && byId.has(hash)) select(hash); else panelIntro();
    } catch (err) {
      console.error(err);
      document.getElementById("panel").innerHTML = '<div class="panel__body"><p class="panel__empty">The map could not be loaded. If you opened this file directly from your computer, run a local server (see README).</p></div>';
    }
  });
})();
