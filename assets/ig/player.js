/* Incognito Generation v2: music player.
   Apple Music 30s previews, dock + full-screen Now Playing, WebAudio
   visualizers that also drive the site's beat glow, Media Session,
   keyboard shortcuts, state kept across in-place navigation and reloads. */
(() => {
  "use strict";
  const IG = (window.IG = window.IG || {});
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (s) => !isFinite(s) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const fmtMs = (ms) => fmt(ms / 1000);
  const I = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.8-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 6.5v11a1 1 0 0 0 1.55.83L14 13.2V17a1 1 0 0 0 2 0V7a1 1 0 0 0-2 0v3.8L6.55 5.67A1 1 0 0 0 5 6.5z" transform="translate(2 0)"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.5v11a1 1 0 0 1-1.55.83L10 13.2V17a1 1 0 0 1-2 0V7a1 1 0 0 1 2 0v3.8l7.45-5.13A1 1 0 0 1 19 6.5z" transform="translate(-2 0)"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 7.5v9l7.5-4.5z"/></svg>',
  };
  IG.icon = I;
  const store = { get: (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} } };

  /* catalogue */
  let cat = null, flat = [];
  IG.catalogue = () => cat ? Promise.resolve(cat) : fetch("/assets/studio/music.json").then((r) => r.json()).then((d) => {
    cat = d; flat = [];
    d.releases.forEach((rel) => rel.tracks.forEach((t) => flat.push({ ...t, release: rel })));
    return d;
  });

  /* audio + analyser */
  const audio = new Audio(); audio.preload = "none"; audio.crossOrigin = "anonymous";
  IG.audio = audio;
  let ac, an, data, cur = -1, shuffle = false, repeat = false;
  audio.volume = store.get("ig-vol") ?? .9;
  function graph() {
    if (ac || !window.AudioContext) return;
    try { ac = new AudioContext(); const src = ac.createMediaElementSource(audio); an = ac.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = .8; src.connect(an); an.connect(ac.destination); data = new Uint8Array(an.frequencyBinCount); } catch { ac = null; }
  }

  /* UI */
  let dock, np;
  function build() {
    dock = document.createElement("div");
    dock.className = "dock glass edge"; dock.setAttribute("role", "region"); dock.setAttribute("aria-label", "Music player");
    dock.innerHTML = `
      <button class="disc" aria-label="Open now playing"><img alt=""></button>
      <div class="meta"><div class="t"></div><div class="prog" role="slider" aria-label="Seek" tabindex="0"><i></i><b></b></div></div>
      <div class="ctl">
        <canvas class="viz" width="240" height="80" aria-hidden="true"></canvas>
        <button class="ib hide-sm" data-a="prev" aria-label="Previous">${I.prev}</button>
        <button class="ib main" data-a="toggle" aria-label="Play">${I.play}</button>
        <button class="ib" data-a="next" aria-label="Next">${I.next}</button>
        <button class="ib hide-sm" data-a="open" aria-label="Full screen player">${I.expand}</button>
      </div>`;
    document.body.append(dock);
    np = document.createElement("div");
    np.className = "np"; np.setAttribute("role", "dialog"); np.setAttribute("aria-modal", "true"); np.setAttribute("aria-label", "Now playing");
    np.innerHTML = `
      <div class="backdrop"></div>
      <button class="ib close" data-a="close" aria-label="Close">${I.close}</button>
      <div class="vinyl"><canvas class="ring" width="900" height="900" aria-hidden="true"></canvas><div class="rec"></div><div class="label"><img alt=""></div></div>
      <div class="info">
        <span class="kicker">Now playing</span>
        <h2 class="np-t"></h2><p class="sub np-s"></p>
        <div class="prog" role="slider" aria-label="Seek" tabindex="0"><i></i><b></b></div>
        <div class="time"><span class="np-c">0:00</span><span class="np-d">0:30</span></div>
        <div class="bigctl">
          <button class="ib" data-a="shuffle" aria-label="Shuffle" aria-pressed="false">${I.shuffle}</button>
          <button class="ib" data-a="prev" aria-label="Previous">${I.prev}</button>
          <button class="ib main" data-a="toggle" aria-label="Play">${I.play}</button>
          <button class="ib" data-a="next" aria-label="Next">${I.next}</button>
          <button class="ib" data-a="repeat" aria-label="Repeat" aria-pressed="false">${I.repeat}</button>
          <label class="vol">${I.vol}<input type="range" min="0" max="1" step=".01" aria-label="Volume"></label>
        </div>
        <div class="btn-row"><a class="btn sm np-full" target="_blank" rel="noopener">${I.yt} Full track</a><a class="btn ghost sm np-apple" target="_blank" rel="noopener">Apple Music</a></div>
        <ol class="tracks queue"></ol>
      </div>`;
    document.body.append(np);
    $(".vol input", np).value = audio.volume;
    $(".vol input", np).addEventListener("input", (e) => { audio.volume = +e.target.value; store.set("ig-vol", audio.volume); });
    [dock, np].forEach((root) => root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]"); if (b) act(b.dataset.a);
      if (e.target.closest(".disc")) open(true);
      const q = e.target.closest(".trk[data-i]"); if (q && root === np) playIndex(+q.dataset.i);
    }));
    $$(".prog", document).forEach(seekable);
  }
  function seekable(bar) {
    const seek = (x) => { const r = bar.getBoundingClientRect(); if (audio.duration) audio.currentTime = Math.min(Math.max((x - r.left) / r.width, 0), 1) * audio.duration; };
    let drag = false;
    bar.addEventListener("pointerdown", (e) => { drag = true; bar.setPointerCapture(e.pointerId); seek(e.clientX); });
    bar.addEventListener("pointermove", (e) => drag && seek(e.clientX));
    bar.addEventListener("pointerup", () => (drag = false));
    bar.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") audio.currentTime += 5; if (e.key === "ArrowLeft") audio.currentTime -= 5; });
  }
  function act(a) {
    if (a === "toggle") toggle();
    if (a === "next") next(true);
    if (a === "prev") audio.currentTime > 3 ? (audio.currentTime = 0) : playIndex((cur - 1 + flat.length) % flat.length);
    if (a === "open") open(true);
    if (a === "close") open(false);
    if (a === "shuffle") { shuffle = !shuffle; sync(); }
    if (a === "repeat") { repeat = !repeat; sync(); }
  }
  function open(on) {
    np.classList.toggle("open", on); document.documentElement.style.overflow = on ? "hidden" : "";
    if (on) { renderQueue(); $("[data-a=close]", np).focus(); }
  }
  function renderQueue() {
    const q = $(".queue", np); if (!flat.length) return;
    const rel = flat[cur]?.release;
    q.innerHTML = flat.map((t, i) => t.release !== rel ? "" : `<li class="trk ${i === cur ? "on" : ""}" data-i="${i}" tabindex="0"><span class="n">${t.n}</span><span class="t">${esc(t.title)}</span><span class="d">${fmtMs(t.ms)}</span><span></span></li>`).join("");
  }

  function playIndex(i, at = 0, auto = true) {
    if (!flat[i]) return;
    cur = i; const t = flat[i];
    audio.src = t.preview; audio.currentTime = at;
    if (auto) { graph(); ac && ac.resume(); audio.play().catch(() => {}); }
    show(); renderQueue(); media(t); save();
  }
  IG.playIndex = playIndex;
  IG.playPreview = (p) => IG.catalogue().then(() => { const i = flat.findIndex((t) => t.preview === p); if (i >= 0) i === cur ? toggle() : playIndex(i); });
  IG.playRelease = (id) => IG.catalogue().then(() => { const i = flat.findIndex((t) => String(t.release.id) === String(id)); if (i < 0) return; flat[cur]?.release.id == id ? toggle() : playIndex(i); });
  IG.shuffleAll = () => IG.catalogue().then(() => { shuffle = true; playIndex(Math.floor(Math.random() * flat.length)); });
  IG.pause = () => audio.pause();
  function toggle() { if (cur < 0) return IG.shuffleAll(); graph(); ac && ac.resume(); audio.paused ? audio.play().catch(() => {}) : audio.pause(); }
  function next(manual) {
    if (!flat.length) return;
    if (repeat && !manual) return playIndex(cur);
    playIndex(shuffle ? Math.floor(Math.random() * flat.length) : (cur + 1) % flat.length);
  }
  audio.addEventListener("ended", () => next(false));
  ["play", "pause"].forEach((ev) => audio.addEventListener(ev, () => { sync(); save(); }));
  audio.addEventListener("timeupdate", () => {
    const p = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    $$(".prog b").forEach((b) => (b.style.width = p + "%"));
    $(".np-c", np).textContent = fmt(audio.currentTime); $(".np-d", np).textContent = fmt(audio.duration || 30);
    if (Math.round(audio.currentTime) % 3 === 0) save();
  });

  function show() {
    const t = flat[cur]; if (!t) return;
    const art = t.release.art.replace("600x600", "300x300");
    dock.classList.add("on"); document.documentElement.style.setProperty("--player-h", innerWidth < 640 ? "92px" : "100px");
    $(".disc img", dock).src = art;
    $(".meta .t", dock).innerHTML = `${esc(t.title)}<small>${esc(t.release.title)}</small>`;
    $(".label img", np).src = t.release.art; $(".backdrop", np).style.backgroundImage = `url("${t.release.art}")`;
    $(".np-t", np).textContent = t.title; $(".np-s", np).textContent = `${t.release.title} · ${t.release.year} · Incognito Generation`;
    $(".np-full", np).href = t.yt ? `https://www.youtube.com/watch?v=${t.yt}` : t.apple; $(".np-apple", np).href = t.apple;
    sync();
  }
  function sync() {
    const on = !audio.paused;
    dock.classList.toggle("playing", on); np.classList.toggle("playing", on);
    $$("[data-a=toggle]").forEach((b) => { b.innerHTML = on ? I.pause : I.play; b.setAttribute("aria-label", on ? "Pause" : "Play"); });
    $$("[data-a=shuffle]").forEach((b) => { b.classList.toggle("on", shuffle); b.setAttribute("aria-pressed", shuffle); });
    $$("[data-a=repeat]").forEach((b) => { b.classList.toggle("on", repeat); b.setAttribute("aria-pressed", repeat); });
    const t = flat[cur];
    $$("[data-preview]").forEach((el) => el.classList.toggle("on", !!t && el.dataset.preview === t.preview && on));
    $$("[data-release]").forEach((el) => el.classList.toggle("playing", !!t && String(t.release.id) === el.dataset.release && on));
    $$("[data-play-all]").forEach((b) => { const lab = $(".lab", b); if (lab) lab.textContent = on ? "Pause" : (b.dataset.label || "Play our music"); });
  }
  function media(t) {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: "Incognito Generation", album: t.release.title, artwork: [{ src: t.release.art, sizes: "600x600", type: "image/jpeg" }] });
    [["play", () => audio.play()], ["pause", () => audio.pause()], ["nexttrack", () => next(true)], ["previoustrack", () => act("prev")]].forEach(([a, f]) => { try { navigator.mediaSession.setActionHandler(a, f); } catch {} });
  }
  function save() { if (cur >= 0) store.set("ig-player", { p: flat[cur].preview, t: audio.currentTime, on: !audio.paused, shuffle, repeat }); }
  function restore() {
    const s = store.get("ig-player"); if (!s) return;
    IG.catalogue().then(() => { const i = flat.findIndex((t) => t.preview === s.p); if (i < 0) return; shuffle = s.shuffle; repeat = s.repeat; playIndex(i, s.t || 0, false); });
  }

  /* visualizers: dock bars, now-playing ring, global beat */
  function draw() {
    let beat = 0;
    if (an && !audio.paused) { an.getByteFrequencyData(data); for (let i = 0; i < 12; i++) beat += data[i]; beat = Math.max(0, beat / (12 * 255) - .35) * 1.6; }
    IG.beat = IG.beat ? IG.beat * .8 + beat * .2 : beat;
    document.documentElement.style.setProperty("--beat", IG.beat.toFixed(3));
    const v = $("canvas.viz", dock);
    if (v && dock.classList.contains("on")) {
      const x = v.getContext("2d"), n = 24, w = v.width / n; x.clearRect(0, 0, v.width, v.height);
      const g = x.createLinearGradient(0, 0, v.width, 0); g.addColorStop(0, "#6ff3ff"); g.addColorStop(.5, "#a98bff"); g.addColorStop(1, "#ff6fd8"); x.fillStyle = g;
      for (let i = 0; i < n; i++) { const val = an && !audio.paused ? data[Math.floor(i * 2.5)] / 255 : .06; const h = Math.max(4, val * v.height); x.beginPath(); x.roundRect(i * w + 2, (v.height - h) / 2, w - 4, h, 3); x.fill(); }
    }
    if (np.classList.contains("open")) {
      const c = $("canvas.ring", np), x = c.getContext("2d"), cx = c.width / 2, r0 = c.width * .36, n = 96;
      x.clearRect(0, 0, c.width, c.height);
      for (let i = 0; i < n; i++) {
        const val = an && !audio.paused ? data[Math.floor((i < n / 2 ? i : n - i) * 1.2)] / 255 : .05, a = i / n * Math.PI * 2 - Math.PI / 2, len = 8 + val * c.width * .11;
        x.strokeStyle = `hsl(${190 + i / n * 140},100%,${60 + val * 20}%)`; x.lineWidth = 5; x.lineCap = "round"; x.shadowBlur = 14; x.shadowColor = x.strokeStyle;
        x.beginPath(); x.moveTo(cx + Math.cos(a) * r0, cx + Math.sin(a) * r0); x.lineTo(cx + Math.cos(a) * (r0 + len), cx + Math.sin(a) * (r0 + len)); x.stroke();
      }
    }
    requestAnimationFrame(draw);
  }

  /* page renderers (called by ig.js on every page swap) */
  const trackRow = (t, i) => `<li class="trk" data-preview="${esc(t.preview)}" data-i="${i}" tabindex="0"><span class="n">${t.n}</span><span class="t">${esc(t.title)}<small>${esc(t.release.title)}</small></span><span class="d">${fmtMs(t.ms)}</span>${t.yt ? `<a href="https://www.youtube.com/watch?v=${t.yt}" target="_blank" rel="noopener">Video</a>` : "<span></span>"}</li>`;
  const albumCard = (r) => `<article class="album glass holo" data-release="${r.id}" data-tilt="10"><div class="art"><img src="${r.art.replace("600x600", "400x400")}" alt="${esc(r.title)} cover art" loading="lazy"><button class="play" data-play-release="${r.id}" aria-label="Play ${esc(r.title)}">${I.play}</button></div><h3>${esc(r.title)}</h3><p>${r.single ? "Single" : "Album"} · ${r.year} · ${r.tracks.length} track${r.tracks.length > 1 ? "s" : ""}</p></article>`;
  IG.pageInit = (root) => {
    IG.catalogue().then((d) => {
      $$("[data-albums]", root).forEach((el) => { const lim = +el.dataset.albums || 99; el.innerHTML = d.releases.slice(0, lim).map(albumCard).join(""); });
      $$("[data-tracks]", root).forEach((el) => { const lim = +el.dataset.tracks || 999; el.innerHTML = flat.slice(0, lim).map((t, i) => trackRow(t, i)).join(""); });
      $$("[data-videos]", root).forEach((el) => {
        const seen = new Set(), vids = [];
        flat.forEach((t) => { if (t.yt && !seen.has(t.yt)) { seen.add(t.yt); vids.push({ id: t.yt, title: t.title, sub: t.release.title }); } });
        (window.IG_EXTRA_VIDEOS || []).forEach((v) => !seen.has(v.id) && vids.push(v));
        el.innerHTML = vids.slice(0, +el.dataset.videos || 99).map((v) => `<div class="vid"><div class="box"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy"><button data-yt="${v.id}" aria-label="Play video: ${esc(v.title)}"><span>${I.play}</span></button></div><div class="cap"><b>${esc(v.title)}</b><span>${esc(v.sub)}</span></div></div>`).join("");
      });
      $$("[data-count-tracks]", root).forEach((el) => (el.dataset.count = flat.length));
      sync();
      if (window.IGpost) window.IGpost(root);
    });
  };
  document.addEventListener("click", (e) => {
    const r = e.target.closest("[data-play-release]"); if (r) { e.preventDefault(); IG.playRelease(r.dataset.playRelease); return; }
    const a = e.target.closest("[data-play-all]"); if (a) { e.preventDefault(); cur >= 0 ? toggle() : IG.shuffleAll(); return; }
    const t = e.target.closest(".trk[data-preview]"); if (t && !e.target.closest("a")) IG.playPreview(t.dataset.preview);
    const al = e.target.closest(".album[data-release]"); if (al && !e.target.closest("button")) IG.playRelease(al.dataset.release);
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (e.key === "Escape" && np?.classList.contains("open")) open(false);
    if (e.target.closest(".trk") && e.key === "Enter") e.target.click();
    if (cur < 0) return;
    if (e.code === "Space" && !e.target.closest("button, a")) { e.preventDefault(); toggle(); }
    if (e.key === "MediaTrackNext") next(true);
  });
  document.addEventListener("DOMContentLoaded", () => { build(); restore(); if (!RM) requestAnimationFrame(draw); });
})();
