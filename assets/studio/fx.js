/* Incognito Generation: motion layer (parallax, tilt, beat-reactive music
   visuals, page curtain). Talks to studio.js through window.IG and the
   ig:page / ig:state events. Does nothing under prefers-reduced-motion. */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;

  /* ---------------------------------------------------------- chrome */
  const add = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return document.body.appendChild(t.content.firstChild); };
  if (!reduce) add('<div class="grain" aria-hidden="true"></div>');
  add('<div class="progress" aria-hidden="true"></div>');
  const curtain = add('<div class="curtain" aria-hidden="true"><img src="/assets/studio/img/emblem.png" alt=""></div>');

  // Page curtain used by studio.js around in-place navigation.
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  window.IGfx = {
    async leave() {
      if (reduce) return;
      curtain.className = "curtain cover-in";
      await wait(430);
    },
    enter() {
      if (reduce) return;
      curtain.className = "curtain cover-out";
      setTimeout(() => { curtain.className = "curtain"; }, 600);
    },
  };

  /* ------------------------------------------------- hero parallax */
  function initHero(scope) {
    const hero = scope.querySelector(".hero");
    const col = hero && hero.querySelector(".collage");
    if (!col || reduce || !fine) return;
    let raf = 0, tx = 0, ty = 0;
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(() => { col.style.setProperty("--px", tx.toFixed(3)); col.style.setProperty("--py", ty.toFixed(3)); raf = 0; });
    });
    hero.addEventListener("pointerleave", () => { col.style.setProperty("--px", 0); col.style.setProperty("--py", 0); });
  }

  /* --------------------------------------------- tilt + spotlight */
  function initTiles(scope) {
    if (reduce || !fine) return;
    scope.querySelectorAll(".tile").forEach((t) => {
      if (t.dataset.fx) return;
      t.dataset.fx = "1";
      t.insertAdjacentHTML("afterbegin", '<span class="spot" aria-hidden="true"></span>');
      let raf = 0;
      t.addEventListener("pointermove", (e) => {
        const r = t.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          t.classList.add("tilting");
          t.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - 0.5) * 9).toFixed(2)}deg) translateY(-4px)`;
          t.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
          t.style.setProperty("--my", (y * 100).toFixed(1) + "%");
          raf = 0;
        });
      });
      t.addEventListener("pointerleave", () => { t.classList.remove("tilting"); t.style.transform = ""; });
    });
  }

  /* ---------------------------------------------- magnetic buttons */
  function initMagnets(scope) {
    if (reduce || !fine) return;
    scope.querySelectorAll(".btn:not(form .btn)").forEach((b) => {
      if (b.dataset.mag) return;
      b.dataset.mag = "1";
      b.classList.add("mag");
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = `translate(${(x * 0.18).toFixed(1)}px, ${(y * 0.28).toFixed(1)}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* --------------------------------- heading wipes + number count-up */
  let io = null;
  const wipeOf = new WeakMap();
  function initReveals(scope) {
    const heads = scope.querySelectorAll("section:not(.hero):not(.page-head) h2");
    const nums = scope.querySelectorAll(".fact b");
    if (reduce || !("IntersectionObserver" in window)) return;
    io = io || new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      io.unobserve(el);
      // headings are clipped to nothing, so their parent is what gets observed
      const h = wipeOf.get(el);
      if (h) h.classList.add("in");
      if (el.dataset.count) countUp(el);
    }), { rootMargin: "0px 0px -10% 0px", threshold: 0.2 });
    heads.forEach((h) => { if (h.classList.contains("sr-only")) return; h.classList.remove("reveal"); h.classList.add("wipe"); wipeOf.set(h.parentElement, h); io.observe(h.parentElement); });
    nums.forEach((b) => {
      const m = /^(\d{1,3})(\D*)$/.exec(b.textContent.trim());
      if (!m || b.dataset.count) return;
      b.dataset.count = m[1]; b.dataset.suffix = m[2];
      b.textContent = "0" + m[2];
      io.observe(b);
    });
  }
  function countUp(el) {
    const end = +el.dataset.count, suf = el.dataset.suffix, t0 = performance.now(), dur = 1100;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------- vinyl discs */
  function initDiscs(scope) {
    scope.querySelectorAll(".cover").forEach((c) => {
      if (c.classList.contains("has-disc") || !c.querySelector("[data-release-play]") || c.closest(".single")) return;
      const img = c.querySelector("img");
      c.classList.add("has-disc");
      const d = document.createElement("span");
      d.className = "disc spin";
      d.setAttribute("aria-hidden", "true");
      d.innerHTML = "<i></i>";
      c.insertBefore(d, c.firstChild);
      const label = () => { d.firstChild.style.backgroundImage = img && img.currentSrc ? `url("${img.currentSrc}")` : ""; };
      img && (img.complete ? label() : img.addEventListener("load", label, { once: true }));
    });
    applyState();
  }
  let state = { release: null, playing: false };
  function applyState() {
    document.querySelectorAll(".cover.has-disc").forEach((c) => {
      const btn = c.querySelector("[data-release-play]");
      const on = btn && state.release && btn.dataset.releasePlay === String(state.release);
      c.classList.toggle("playing-cover", !!on);
      c.classList.toggle("paused-cover", !!on && !state.playing);
      const img = c.querySelector("img"), lab = c.querySelector(".disc i");
      if (on && lab && img && !lab.style.backgroundImage) lab.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    });
  }
  document.addEventListener("ig:state", (e) => { state = e.detail; applyState(); state.playing ? startViz() : stopViz(); });

  /* ------------------------------------- beat-reactive visualizer */
  let ctx = null, analyser = null, data = null, vizRaf = 0, beat = 0, canvas = null;
  function ensureAudioGraph() {
    if (ctx || !window.IG || !window.AudioContext) return !!ctx;
    try {
      ctx = new AudioContext();
      const src = ctx.createMediaElementSource(window.IG.audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      data = new Uint8Array(analyser.frequencyBinCount);
    } catch { ctx = null; }
    return !!ctx;
  }
  function ensureCanvas() {
    const p = document.querySelector(".player");
    if (!p) return null;
    if (!canvas) { canvas = document.createElement("canvas"); canvas.className = "viz"; canvas.setAttribute("aria-hidden", "true"); p.prepend(canvas); }
    const dpr = Math.min(2, devicePixelRatio || 1), w = p.clientWidth, h = p.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    return canvas;
  }
  function startViz() {
    if (reduce || vizRaf) return;
    if (!ensureAudioGraph()) return;
    if (ctx.state === "suspended") ctx.resume();
    const accent = getComputedStyle(root).getPropertyValue("--accent").trim() || "#f0533c";
    const loop = () => {
      analyser.getByteFrequencyData(data);
      let bass = 0;
      for (let i = 1; i < 9; i++) bass += data[i];
      bass = Math.max(0, (bass / 8 - 120) / 135);
      beat += (Math.min(1, bass) - beat) * (bass > beat ? 0.55 : 0.12);
      root.style.setProperty("--beat", beat.toFixed(3));
      const c = ensureCanvas();
      if (c) {
        const g = c.getContext("2d"), W = c.width, H = c.height, n = 48, bw = W / n;
        g.clearRect(0, 0, W, H);
        g.fillStyle = accent;
        for (let i = 0; i < n; i++) {
          const v = data[Math.floor(4 + i * 1.6)] / 255;
          const h = Math.max(2, v * v * H * 0.9);
          g.globalAlpha = 0.18 + v * 0.35;
          g.fillRect(i * bw + bw * 0.2, H - h, bw * 0.6, h);
        }
      }
      vizRaf = requestAnimationFrame(loop);
    };
    vizRaf = requestAnimationFrame(loop);
  }
  function stopViz() {
    cancelAnimationFrame(vizRaf); vizRaf = 0;
    const fade = () => { beat *= 0.85; root.style.setProperty("--beat", beat.toFixed(3)); if (beat > 0.01 && !vizRaf) requestAnimationFrame(fade); else if (!vizRaf) root.style.setProperty("--beat", 0); };
    fade();
  }
  addEventListener("resize", () => canvas && ensureCanvas());

  /* ------------------------------------------------------------ boot */
  function initAll(scope) {
    initHero(scope); initTiles(scope); initMagnets(scope); initReveals(scope); initDiscs(scope);
  }
  document.addEventListener("ig:page", (e) => initAll(e.detail.root || document));
  initAll(document);
})();
