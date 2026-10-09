/* Incognito Generation studio site.
   - Persistent music player (Apple Music 30s previews) that keeps playing
     while you move between studio pages (in-place page swaps, no reload).
   - Music page rendering, click-to-load YouTube videos, contact form. */
(() => {
  "use strict";

  const BASE = "/assets/studio/";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STUDIO_PATHS = ["/", "/games/", "/music/", "/about/", "/contact/"];

  // Extra videos on the YouTube channel that are not tied to a store track.
  const EXTRA_VIDEOS = [
    { id: "ItKTgqQkeDc", title: "Samurai Spirit", sub: "Album visuals" },
    { id: "e5Jkt2dqhY0", title: "Inauguration", sub: "Album visuals" },
    { id: "G5MlsY0Uens", title: "Innocent Daydream", sub: "Official music video" },
    { id: "YCFTOT42Il8", title: "Tyna Sinni", sub: "Official music video" },
    { id: "yBUz_Sc1WjI", title: "Voices", sub: "Official music video" },
    { id: "hsIYkTodj18", title: "Alfheimr", sub: "Official music video" },
  ];

  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.8-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 7.5v9l7.5-4.5z"/></svg>',
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };

  /* ------------------------------------------------------------ catalogue */
  let catalogue = null;
  let flat = [];
  const loadCatalogue = () => catalogue
    ? Promise.resolve(catalogue)
    : fetch(BASE + "music.json").then((r) => r.json()).then((d) => {
        catalogue = d;
        flat = [];
        d.releases.forEach((rel) => rel.tracks.forEach((t) => flat.push({ ...t, release: rel })));
        return d;
      });
  const indexOf = (preview) => flat.findIndex((t) => t.preview === preview);
  const fullLink = (t) => t.yt ? `https://www.youtube.com/watch?v=${t.yt}` : t.apple;

  /* --------------------------------------------------------------- player */
  const audio = new Audio();
  audio.preload = "none";
  audio.crossOrigin = "anonymous"; // Apple previews send CORS headers; lets fx.js read the spectrum
  window.IG = { audio };
  let current = -1;
  let playerEl = null;

  function buildPlayer() {
    playerEl = document.createElement("div");
    playerEl.className = "player";
    playerEl.setAttribute("role", "region");
    playerEl.setAttribute("aria-label", "Music player");
    playerEl.innerHTML = `
      <img alt="" width="52" height="52">
      <div class="info">
        <div class="t"><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="name"></span></div>
        <div class="s"><span class="rel"></span> &middot; 30s preview &middot; <a class="full" target="_blank" rel="noopener">Full song</a></div>
        <div class="bar" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><i></i></div>
      </div>
      <div class="ctrls">
        <button class="prev" type="button" aria-label="Previous track"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 6.2v11.6a.8.8 0 0 1-1.2.7L10 12.7a.8.8 0 0 1 0-1.4l8.8-5.8a.8.8 0 0 1 1.2.7z"/></svg></button>
        <button class="pp" type="button" aria-label="Play"><span class="ico-play">${ICON.play}</span><span class="ico-pause">${ICON.pause}</span></button>
        <button class="next" type="button" aria-label="Next track"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 6.2v11.6a.8.8 0 0 0 1.2.7l8.8-5.8a.8.8 0 0 0 0-1.4L5.2 5.5A.8.8 0 0 0 4 6.2z"/></svg></button>
        <button class="x" type="button" aria-label="Close player"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>`;
    document.body.appendChild(playerEl);
    playerEl.querySelector(".pp").addEventListener("click", toggle);
    playerEl.querySelector(".next").addEventListener("click", () => playIndex(current + 1));
    playerEl.querySelector(".prev").addEventListener("click", () => (audio.currentTime > 3 ? (audio.currentTime = 0) : playIndex(current - 1)));
    playerEl.querySelector(".x").addEventListener("click", () => { audio.pause(); playerEl.classList.remove("show"); setPad(false); store.set("ig-player", null); });
    const bar = playerEl.querySelector(".bar");
    const seek = (x) => { const r = bar.getBoundingClientRect(); if (audio.duration) audio.currentTime = Math.max(0, Math.min(1, (x - r.left) / r.width)) * audio.duration; };
    bar.addEventListener("click", (e) => seek(e.clientX));
    bar.addEventListener("keydown", (e) => {
      if (!audio.duration) return;
      if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + 3);
      if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 3);
    });
  }
  const setPad = (on) => document.documentElement.style.setProperty("--player-h", on ? (innerWidth < 560 ? "84px" : "96px") : "0px");

  function render() {
    if (!playerEl || current < 0) return;
    const t = flat[current];
    playerEl.querySelector("img").src = t.release.art;
    playerEl.querySelector(".name").textContent = t.title;
    playerEl.querySelector(".rel").textContent = t.release.title;
    const full = playerEl.querySelector(".full");
    full.href = fullLink(t);
    full.textContent = t.yt ? "Watch full video" : "Full song";
    playerEl.classList.add("show");
    setPad(true);
    syncButtons();
  }

  function syncButtons() {
    const playing = !audio.paused;
    playerEl && playerEl.classList.toggle("playing", playing);
    playerEl && playerEl.querySelector(".pp").setAttribute("aria-label", playing ? "Pause" : "Play");
    const now = current >= 0 ? flat[current] : null;
    document.querySelectorAll("[data-preview]").forEach((el) => {
      const on = now && el.dataset.preview === now.preview;
      el.classList.toggle("playing", !!on);
      el.classList.toggle("paused", !!on && !playing);
      if (el.matches(".track")) el.setAttribute("aria-pressed", on && playing ? "true" : "false");
    });
    document.dispatchEvent(new CustomEvent("ig:state", { detail: { release: now ? now.release.id : null, playing } }));
    document.querySelectorAll("[data-release-play]").forEach((el) => {
      const on = now && String(now.release.id) === el.dataset.releasePlay && playing;
      el.innerHTML = on ? ICON.pause : ICON.play;
      el.setAttribute("aria-label", (on ? "Pause " : "Play ") + el.dataset.title);
      el.closest(".single")?.classList.toggle("playing", !!(now && String(now.release.id) === el.dataset.releasePlay));
    });
  }

  function playIndex(i, startAt = 0, autoplay = true) {
    if (!flat.length) return;
    current = (i + flat.length) % flat.length;
    audio.src = flat[current].preview;
    audio.currentTime = startAt;
    render();
    if (autoplay) audio.play().catch(() => syncButtons());
    store.set("ig-player", { preview: flat[current].preview, t: startAt });
    pauseVideos();
  }
  function toggle() {
    if (current < 0) return loadCatalogue().then(() => playIndex(0));
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
  }
  function playPreview(preview) {
    loadCatalogue().then(() => {
      const i = indexOf(preview);
      if (i === current) return toggle();
      playIndex(i);
    });
  }
  function playRelease(id) {
    loadCatalogue().then(() => {
      const now = current >= 0 ? flat[current] : null;
      if (now && String(now.release.id) === String(id)) return toggle();
      playIndex(flat.findIndex((t) => String(t.release.id) === String(id)));
    });
  }

  audio.addEventListener("play", syncButtons);
  audio.addEventListener("pause", syncButtons);
  audio.addEventListener("ended", () => playIndex(current + 1));
  audio.addEventListener("error", () => { if (current >= 0 && !audio.paused) playIndex(current + 1); });
  let lastSave = 0;
  audio.addEventListener("timeupdate", () => {
    if (!playerEl || !audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    playerEl.querySelector(".bar i").style.width = pct + "%";
    playerEl.querySelector(".bar").setAttribute("aria-valuenow", Math.round(pct));
    if (Date.now() - lastSave > 2000) { lastSave = Date.now(); store.set("ig-player", { preview: flat[current].preview, t: audio.currentTime }); }
  });

  // Restore the last track (paused) after a full page load, so the bar is not lost.
  function restore() {
    const s = store.get("ig-player");
    if (!s) return;
    loadCatalogue().then(() => { const i = indexOf(s.preview); if (i >= 0) playIndex(i, s.t || 0, false); });
  }

  /* -------------------------------------------------------- page wiring */
  document.addEventListener("click", (e) => {
    const tr = e.target.closest("[data-preview]");
    if (tr && !e.target.closest("a")) { e.preventDefault(); return playPreview(tr.dataset.preview); }
    const rel = e.target.closest("[data-release-play], [data-release-card]");
    if (rel) { e.preventDefault(); return playRelease(rel.dataset.releasePlay || rel.dataset.releaseCard); }
    if (e.target.closest("[data-play-all]")) { e.preventDefault(); return loadCatalogue().then(() => (current < 0 ? playIndex(0) : toggle())); }
    const v = e.target.closest("[data-yt]");
    if (v) { e.preventDefault(); return openVideo(v); }
  });

  function pauseVideos() {
    document.querySelectorAll(".video iframe").forEach((f) => {
      const fig = f.closest(".video");
      f.remove();
      fig.querySelector(".frame button").hidden = false;
    });
  }
  function openVideo(btn) {
    audio.pause();
    pauseVideos();
    const frame = btn.closest(".frame");
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0&modestbranding=1`;
    f.title = btn.dataset.title || "Music video";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    btn.hidden = true;
    frame.appendChild(f);
  }

  const trackRow = (t, i) => `
    <li><button class="track" type="button" data-preview="${esc(t.preview)}" aria-pressed="false">
      <span class="n">${t.n || i + 1}</span>
      <span class="ic play">${ICON.play}</span><span class="ic pause">${ICON.pause}</span>
      <span class="ic bars"><span class="eq"><i></i><i></i><i></i></span></span>
      <span class="ttl">${esc(t.title)}</span><span class="dur">${fmt(t.ms)}</span>
    </button></li>`;

  function renderHomeMusic(root) {
    loadCatalogue().then((d) => {
      const feat = d.releases.find((r) => r.title === "Koi No Hajimari") || d.releases[0];
      const fc = root.querySelector("[data-feature]");
      if (fc) {
        fc.querySelector(".cover img").src = feat.art.replace("600x600", "800x800");
        fc.querySelector("[data-release-play]").dataset.releasePlay = feat.id;
        fc.querySelector(".tracks").innerHTML = feat.tracks.map(trackRow).join("");
      }
      const shelf = root.querySelector("[data-shelf]");
      if (shelf) shelf.innerHTML = d.releases.filter((r) => r.id !== feat.id).map((r) => `
        <button type="button" data-release-card="${r.id}" aria-label="Play ${esc(r.title)}">
          <img src="${esc(r.art.replace("600x600", "360x360"))}" alt="" width="180" height="180" loading="lazy">
          <b>${esc(r.title)}</b><small>${r.single ? "Single" : "Album"} &middot; ${r.year}</small>
        </button>`).join("");
      syncButtons();
    });
  }

  function renderMusicPage(root) {
    loadCatalogue().then((d) => {
      const albums = d.releases.filter((r) => !r.single);
      const singles = d.releases.filter((r) => r.single);
      const ra = root.querySelector("[data-albums]");
      ra.innerHTML = albums.map((r) => `
        <article class="release reveal" id="r-${r.id}">
          <div class="cover"><img src="${esc(r.art)}" alt="${esc(r.title)} cover art" width="600" height="600" loading="lazy">
            <button class="big-play" type="button" data-release-play="${r.id}" data-title="${esc(r.title)}" aria-label="Play ${esc(r.title)}">${ICON.play}</button></div>
          <div>
            <h3>${esc(r.title)}</h3>
            <p class="meta">Album &middot; ${r.year} &middot; ${r.tracks.length} tracks &middot; ${esc(r.genre)}</p>
            <ol class="tracks">${r.tracks.map(trackRow).join("")}</ol>
            <div class="links"><a class="textlink" href="${esc(r.apple)}" target="_blank" rel="noopener">Apple Music</a></div>
          </div>
        </article>`).join("");
      root.querySelector("[data-singles]").innerHTML = singles.map((r) => `
        <div class="single reveal" data-preview="${esc(r.tracks[0].preview)}" role="button" tabindex="0" aria-label="Play ${esc(r.title)}">
          <div class="cover"><img src="${esc(r.art.replace("600x600", "400x400"))}" alt="" width="400" height="400" loading="lazy">
            <span class="big-play" aria-hidden="true">${ICON.play}</span></div>
          <b>${esc(r.title)}</b><small>Single &middot; ${r.year}</small>
        </div>`).join("");
      root.querySelectorAll(".single").forEach((el) => el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playPreview(el.dataset.preview); } }));

      const vids = [];
      const seen = new Set();
      d.releases.forEach((r) => r.tracks.forEach((t) => {
        if (t.yt && !seen.has(t.yt)) { seen.add(t.yt); vids.push({ id: t.yt, title: t.title.replace(/ \(.*\)$/, ""), sub: `${r.single ? "Single" : r.title} &middot; ${r.year}` }); }
      }));
      EXTRA_VIDEOS.forEach((v) => !seen.has(v.id) && vids.push(v));
      root.querySelector("[data-videos]").innerHTML = vids.map((v) => `
        <figure class="video reveal">
          <div class="frame"><button type="button" data-yt="${v.id}" data-title="${esc(v.title)}" aria-label="Play video: ${esc(v.title)}">
            <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"><span class="yt">${ICON.yt}</span></button></div>
          <figcaption>${esc(v.title)}<small>${v.sub}</small></figcaption>
        </figure>`).join("");
      observeReveals(root);
      syncButtons();
    });
  }

  /* -------------------------------------------------------- contact form */
  function initContact(root) {
    const form = root.querySelector("form.contact");
    if (!form) return;
    const status = form.querySelector(".form-status");
    const topic = new URLSearchParams(location.search).get("topic");
    if (topic && [...form.topic.options].some((o) => o.value === topic)) form.topic.value = topic;
    const check = (el) => {
      const f = el.closest(".field");
      const ok = el.checkValidity() && el.value.trim() !== "";
      f.classList.toggle("invalid", !ok);
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      return ok;
    };
    form.querySelectorAll("[required]").forEach((el) => el.addEventListener("blur", () => el.value && check(el)));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const req = [...form.querySelectorAll("[required]")];
      const bad = req.filter((el) => !check(el));
      if (bad.length) { bad[0].focus(); return; }
      if (form._honey.value) return;
      const btn = form.querySelector("button[type=submit]");
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending...";
      status.className = "form-status";
      const data = {
        name: form.name.value.trim(), email: form.email.value.trim(), topic: form.topic.value,
        message: form.message.value.trim(), _subject: `[incognitogeneration.com] ${form.topic.value}: ${form.name.value.trim()}`,
        _template: "table", _captcha: "false",
      };
      try {
        const r = await fetch("https://formsubmit.co/ajax/" + form.dataset.to, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || String(j.success) !== "true") throw new Error(j.message || "send failed");
        form.reset();
        status.className = "form-status ok";
        status.textContent = "Thanks, your message is on its way. We usually reply within two working days.";
      } catch {
        const body = encodeURIComponent(`${data.message}\n\n${data.name}\n${data.email}`);
        status.className = "form-status bad";
        status.innerHTML = `We couldn't send that from here. <a href="mailto:${form.dataset.to}?subject=${encodeURIComponent(data._subject)}&body=${body}">Send it by email instead</a>, nothing you typed is lost.`;
      } finally {
        btn.disabled = false; btn.textContent = label;
        status.focus();
      }
    });
  }

  /* ------------------------------------------------------------ reveals */
  let io = null;
  function observeReveals(root) {
    const els = root.querySelectorAll(".reveal:not(.in)");
    if (reduceMotion || !("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("in"));
    io = io || new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------- menu */
  function initMenu() {
    const btn = document.querySelector(".menu-btn");
    const list = document.querySelector(".nav ul");
    if (!btn || !list) return;
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      list.classList.toggle("open", open);
    });
  }
  function closeMenu() {
    document.querySelector(".menu-btn")?.setAttribute("aria-expanded", "false");
    document.querySelector(".nav ul")?.classList.remove("open");
  }
  function markNav() {
    const p = location.pathname;
    document.querySelectorAll(".nav ul a").forEach((a) => {
      const here = new URL(a.href).pathname === p;
      here ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
  }

  function initPage(root = document) {
    if (root.querySelector("[data-feature]")) renderHomeMusic(root);
    if (root.querySelector("[data-albums]")) renderMusicPage(root);
    initContact(root);
    observeReveals(root);
    syncButtons();
    if (root !== document) document.dispatchEvent(new CustomEvent("ig:page", { detail: { root } }));
  }

  /* ---------------------------------------------- in-place navigation */
  // Studio pages swap <main> in place so the music never stops.
  const isStudio = (url) => url.origin === location.origin && STUDIO_PATHS.includes(url.pathname);
  async function go(url, push = true) {
    const leaving = window.IGfx && !reduceMotion ? window.IGfx.leave() : null; // curtain runs while the page loads
    try {
      const res = await fetch(url.pathname + url.search, { headers: { Accept: "text/html" } });
      if (!res.ok) throw 0;
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      const next = doc.querySelector("main#main");
      if (!next || !doc.body.hasAttribute("data-studio")) throw 0;
      const swap = () => {
        document.querySelector("main#main").replaceWith(next);
        document.title = doc.title;
        const d = doc.querySelector('meta[name="description"]');
        if (d) document.querySelector('meta[name="description"]')?.setAttribute("content", d.content);
        if (push) history.pushState({}, "", url.href);
        markNav();
        closeMenu();
        initPage(next);
        if (url.hash) document.querySelector(url.hash)?.scrollIntoView();
        else scrollTo({ top: 0, behavior: "instant" });
        next.setAttribute("tabindex", "-1");
        next.focus({ preventScroll: true });
      };
      if (leaving) { await leaving; swap(); window.IGfx.enter(); }
      else if (document.startViewTransition && !reduceMotion) document.startViewTransition(swap);
      else swap();
    } catch {
      location.href = url.href;
    }
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (!isStudio(url)) return;
    if (url.pathname === location.pathname && url.search === location.search) {
      if (url.hash) return closeMenu();
      e.preventDefault(); return scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
    }
    e.preventDefault();
    go(url);
  });
  addEventListener("popstate", () => { const u = new URL(location.href); isStudio(u) ? go(u, false) : location.reload(); });

  /* ---------------------------------------------------------------- boot */
  buildPlayer();
  initMenu();
  markNav();
  initPage();
  restore();
  addEventListener("resize", () => playerEl.classList.contains("show") && setPad(true));
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("nexttrack", () => playIndex(current + 1));
    navigator.mediaSession.setActionHandler("previoustrack", () => playIndex(current - 1));
    audio.addEventListener("play", () => {
      const t = flat[current];
      navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: "Incognito Generation", album: t.release.title, artwork: [{ src: t.release.art, sizes: "600x600", type: "image/jpeg" }] });
    });
  }
})();
