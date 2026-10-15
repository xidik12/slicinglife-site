/* Incognito Generation v2: page engine.
   In-place navigation (music keeps playing), reveals, split headlines,
   holo tilt cards, parallax, magnetic buttons, cursor, star field,
   pinned horizontal rails, video picture-in-picture dock, contact form. */
(() => {
  "use strict";
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ROUTED = ["/", "/games/", "/arena/", "/ventures/", "/music/", "/about/", "/contact/"];
  const IG = (window.IG = window.IG || {});

  /* --------------------------------------------------------- star field */
  function stars() {
    const c = document.createElement("canvas");
    c.className = "stars";
    document.body.prepend(c);
    const x = c.getContext("2d");
    let w, h, pts = [];
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      w = c.width = innerWidth * d; h = c.height = innerHeight * d;
      c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
      pts = Array.from({ length: Math.round((innerWidth * innerHeight) / 9000) }, () => ({
        x: Math.random() * w, y: Math.random() * h, z: Math.random() * .8 + .2, t: Math.random() * 6.28,
      }));
    };
    size(); addEventListener("resize", size);
    let sy = scrollY;
    const tick = () => {
      const beat = IG.beat || 0, dy = (scrollY - sy); sy = scrollY;
      x.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.t += .02; p.y -= dy * p.z * .6;
        if (p.y < 0) p.y += h; if (p.y > h) p.y -= h;
        const a = (.35 + .35 * Math.sin(p.t)) * p.z + beat * .5;
        x.fillStyle = `rgba(210,220,255,${Math.min(a, 1)})`;
        x.fillRect(p.x, p.y, 1.4 * p.z + beat * 1.5, 1.4 * p.z + beat * 1.5);
      }
      requestAnimationFrame(tick);
    };
    if (!RM) tick();
  }

  /* ------------------------------------------------------- split headings */
  function split(root) {
    $$("[data-split]:not(.split)", root).forEach((el) => {
      let ci = 0;
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((word) => {
              if (!word) return;
              if (/^\s+$/.test(word)) { frag.append(word); return; }
              const wd = document.createElement("span"); wd.className = "wd";
              [...word].forEach((ch) => { const s = document.createElement("span"); s.className = "ch"; s.style.setProperty("--ci", ci++); s.textContent = ch; wd.append(s); });
              frag.append(wd);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
        });
      };
      el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
      walk(el);
      el.classList.add("split");
    });
  }

  /* --------------------------------------------------------------- reveals */
  let io;
  function reveals(root) {
    const els = $$("[data-reveal]:not(.in), .split:not(.in), [data-count]:not(.counted)", root);
    if (RM || !("IntersectionObserver" in window)) { els.forEach((e) => { e.classList.add("in"); count(e); }); return; }
    io = io || new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in"); count(en.target); io.unobserve(en.target);
    }), { rootMargin: "0px 0px -8% 0px", threshold: .12 });
    els.forEach((e) => io.observe(e));
  }
  function count(el) {
    if (!el.dataset.count || el.classList.contains("counted")) return;
    el.classList.add("counted");
    const to = parseFloat(el.dataset.count), suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1600;
    const fmt = (v) => Math.round(v).toLocaleString("en-US") + suf;
    if (RM) { el.textContent = fmt(to); return; }
    const step = (t) => { const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------ holo tilt */
  function tilt(root) {
    if (!FINE || RM) return;
    $$(".holo", root).forEach((el) => {
      if (el._t) return; el._t = 1;
      const max = parseFloat(el.dataset.tilt || 8);
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.classList.add("live");
        el.style.setProperty("--mx", px * 100 + "%"); el.style.setProperty("--my", py * 100 + "%");
        el.style.setProperty("--rx", (.5 - py) * max + "deg"); el.style.setProperty("--ry", (px - .5) * max + "deg");
      });
      el.addEventListener("pointerleave", () => { el.classList.remove("live"); el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });
  }

  /* ------------------------------------------------------------- magnetic */
  function magnetic(root) {
    if (!FINE || RM) return;
    $$(".btn, .socials a, .tile .go", root).forEach((el) => {
      if (el._m) return; el._m = 1;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ------------------------------------------------------------- parallax */
  let layers = [], px = 0, py = 0;
  function parallax(root) {
    layers = $$("[data-depth]", root);
    if (RM) return;
  }
  function frame() {
    const vh = innerHeight;
    for (const el of layers) {
      const d = parseFloat(el.dataset.depth), r = el.getBoundingClientRect();
      const lim = innerWidth < 760 ? 30 : 90, off = Math.max(-lim, Math.min(lim, (r.top + r.height / 2 - vh / 2) * d * -.25));
      el.style.transform = `translate3d(${px * d * 28}px, ${off + py * d * 22}px, 0)`;
    }
    $$(".hscroll").forEach((h) => {
      const rail = $(".rail", h); if (!rail || innerWidth < 760) return;
      const r = h.getBoundingClientRect(), total = h.offsetHeight - vh, p = Math.min(Math.max(-r.top / total, 0), 1);
      rail.style.transform = `translate3d(${-p * (rail.scrollWidth - innerWidth)}px,0,0)`;
    });
    requestAnimationFrame(frame);
  }

  /* --------------------------------------------------------------- cursor */
  function cursor() {
    if (!FINE || RM) return;
    const c = document.createElement("div"); c.className = "cur"; document.body.append(c);
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5;
      c.classList.toggle("big", !!e.target.closest("a, button, .holo, [data-play]"));
    });
    const loop = () => { cx += (tx - cx) * .2; cy += (ty - cy) * .2; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); };
    loop();
  }

  /* --------------------------------------------- video lite embeds + PiP */
  let vidBound = false;
  function videos() {
    if (vidBound) return; vidBound = true;
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".vid .box button[data-yt]"); if (!b) return;
      const box = b.closest(".box"), id = b.dataset.yt;
      IG.pause && IG.pause();
      $$(".vid .box iframe").forEach((f) => { const bx = f.closest(".box"); f.remove(); bx.classList.remove("docked"); bx.closest(".vid").classList.remove("pipped"); bx.querySelectorAll("img,button").forEach((n) => (n.hidden = false)); });
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true; f.title = b.getAttribute("aria-label") || "Video";
      box.querySelectorAll("img,button:not(.undock)").forEach((n) => (n.hidden = true));
      box.append(f);
      watchDock(box);
    });
  }
  let dockBox = null;
  function watchDock(box) {
    const vid = box.closest(".vid");
    if (!$(".undock", box)) {
      const u = document.createElement("button"); u.className = "undock"; u.textContent = "×"; u.setAttribute("aria-label", "Close video");
      u.addEventListener("click", () => { $("iframe", box)?.remove(); box.classList.remove("docked"); vid.classList.remove("pipped"); box.querySelectorAll("img,button").forEach((n) => (n.hidden = false)); });
      box.append(u);
    }
    dockBox = box; checkDock();
  }
  function checkDock() {
    if (!dockBox) return;
    if (!document.contains(dockBox) || !$("iframe", dockBox)) { dockBox = null; return; }
    const vid = dockBox.closest(".vid"), r = vid.getBoundingClientRect();
    const out = r.bottom < 70 || r.top > innerHeight - 40;
    dockBox.classList.toggle("docked", out); vid.classList.toggle("pipped", out);
  }
  addEventListener("scroll", checkDock, { passive: true }); addEventListener("resize", checkDock);

  /* ------------------------------------------------ arena: ring + beasts */
  const RING = ["fire", "ice", "air", "earth", "lightning", "water"];
  const VERB = { fire: "burns", ice: "freezes", air: "scatters", earth: "grounds", lightning: "strikes", water: "douses" };
  function arena(root) {
    $$("[data-ring]", root).forEach((w) => {
      const nodes = $$(".node", w), mult = $("[data-ring-mult]", w), txt = $("[data-ring-text]", w);
      const pick = (el) => {
        const i = RING.indexOf(el), prey = RING[(i + 1) % 6], pred = RING[(i + 5) % 6];
        nodes.forEach((n) => { n.classList.toggle("on", n.dataset.el === el); n.classList.toggle("prey", n.dataset.el === prey); n.classList.toggle("pred", n.dataset.el === pred); });
        txt.textContent = `${el[0].toUpperCase() + el.slice(1)} ${VERB[el]} ${prey}, fears ${pred}`; mult.textContent = "x1.75";
      };
      nodes.forEach((n) => { n.addEventListener("click", () => { w._auto = false; pick(n.dataset.el); }); n.addEventListener("pointerenter", () => { w._auto = false; pick(n.dataset.el); }); });
      let k = 0; w._auto = true; pick(RING[0]);
      if (!RM) { const t = setInterval(() => { if (!document.contains(w)) return clearInterval(t); if (w._auto) pick(RING[++k % 6]); }, 2200); }
    });
    $$("img[data-attack]", root).forEach((im) => {
      const idle = im.src, atk = im.dataset.attack, fig = im.closest("figure") || im;
      fig.addEventListener("pointerenter", () => (im.src = atk)); fig.addEventListener("pointerleave", () => (im.src = idle));
    });
  }
  function runScripts(root) {
    $$("script", root).forEach((old) => { const s = document.createElement("script"); s.textContent = old.textContent; old.replaceWith(s); });
  }

  /* ----------------------------------------------------------------- menu */
  function menu() {
    const b = $(".menu-btn"), ul = $("#nav-links");
    if (!b) return;
    b.addEventListener("click", () => { const o = b.getAttribute("aria-expanded") !== "true"; b.setAttribute("aria-expanded", o); ul.classList.toggle("open", o); });
    let last = scrollY;
    addEventListener("scroll", () => { const n = $(".nav"); n.classList.toggle("hide", scrollY > last && scrollY > 300); last = scrollY; }, { passive: true });
  }
  const closeMenu = () => { $(".menu-btn")?.setAttribute("aria-expanded", "false"); $("#nav-links")?.classList.remove("open"); };
  function markNav() {
    $$("#nav-links a").forEach((a) => {
      const p = new URL(a.href).pathname;
      if (p === location.pathname || (p !== "/" && location.pathname.startsWith(p))) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  /* ---------------------------------------------------------- contact form */
  function contact(root) {
    const form = $("form.form", root); if (!form) return;
    const status = $(".form-status", form);
    const topic = new URLSearchParams(location.search).get("topic");
    if (topic && [...form.topic.options].some((o) => o.value === topic)) form.topic.value = topic;
    const check = (el) => { const ok = el.checkValidity() && el.value.trim() !== ""; el.closest(".field").classList.toggle("invalid", !ok); el.setAttribute("aria-invalid", !ok); return ok; };
    $$("[required]", form).forEach((el) => el.addEventListener("blur", () => el.value && check(el)));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const bad = $$("[required]", form).filter((el) => !check(el));
      if (bad.length) { bad[0].focus(); return; }
      if (form._honey.value) return;
      const btn = $("button[type=submit]", form), label = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending...";
      const data = { name: form.name.value.trim(), email: form.email.value.trim(), topic: form.topic.value, message: form.message.value.trim(),
        _subject: `[incognitogeneration.com] ${form.topic.value}: ${form.name.value.trim()}`, _template: "table", _captcha: "false" };
      try {
        const r = await fetch("https://formsubmit.co/ajax/" + form.dataset.to, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || String(j.success) !== "true") throw new Error();
        form.reset(); status.className = "form-status ok"; status.textContent = "Thanks, your message is on its way. We usually reply within two working days.";
      } catch {
        const body = encodeURIComponent(`${data.message}\n\n${data.name}\n${data.email}`);
        status.className = "form-status bad";
        status.innerHTML = `We couldn't send that from here. <a href="mailto:${form.dataset.to}?subject=${encodeURIComponent(data._subject)}&body=${body}">Send it by email instead</a>, nothing you typed is lost.`;
      } finally { btn.disabled = false; btn.textContent = label; status.focus(); }
    });
  }

  /* -------------------------------------------------------------- waitlist */
  function waitlist(root) {
    $$("form[data-waitlist]", root).forEach((form) => {
      if (form._w) return; form._w = 1;
      const status = $(".form-status", form);
      const pre = new URLSearchParams(location.search).get("wl");
      if (pre) $$('input[name="games"]', form).forEach((c) => { if (pre.split(",").includes(c.value)) c.checked = true; });
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = form.email, games = $$('input[name="games"]:checked', form).map((c) => c.dataset.title);
        const okMail = email.checkValidity() && email.value.trim();
        email.closest(".field").classList.toggle("invalid", !okMail);
        const gf = $(".games-field", form); gf.classList.toggle("invalid", !games.length);
        if (!okMail) return email.focus();
        if (!games.length) return $('input[name="games"]', form).focus();
        if (form._honey.value) return;
        const btn = $("button[type=submit]", form), label = btn.textContent;
        btn.disabled = true; btn.textContent = "Joining...";
        const data = { email: email.value.trim(), name: form.name.value.trim(), games: games.join(", "), platform: form.platform.value,
          _subject: `[incognitogeneration.com] Waitlist: ${games.join(", ")}`, _template: "table", _captcha: "false" };
        try {
          const r = await fetch("https://formsubmit.co/ajax/" + form.dataset.to, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
          const j = await r.json().catch(() => ({}));
          if (!r.ok || String(j.success) !== "true") throw new Error();
          form.reset(); status.className = "form-status ok";
          status.textContent = `You're on the list for ${games.join(", ")}. We'll email you when there's news, and nothing else.`;
        } catch {
          status.className = "form-status bad";
          status.innerHTML = `We couldn't add you from here. <a href="mailto:${form.dataset.to}?subject=${encodeURIComponent(data._subject)}&body=${encodeURIComponent("Please add me to the waitlist: " + data.games + "\n" + data.email)}">Send it by email instead</a>.`;
        } finally { btn.disabled = false; btn.textContent = label; status.focus(); }
      });
    });
  }

  /* ------------------------------------------------------- page lifecycle */
  function init(root = document) {
    split(root); reveals(root); tilt(root); magnetic(root); parallax(root); videos(root); contact(root); arena(root); waitlist(root);
    IG.pageInit && IG.pageInit(root);
  }

  const routed = (u) => u.origin === location.origin && ROUTED.includes(u.pathname);
  const curtain = document.createElement("div"); curtain.className = "curtain";
  async function go(url, push = true, ev) {
    let html;
    try { const r = await fetch(url.pathname, { headers: { "X-Requested-With": "ig" } }); if (!r.ok) throw 0; html = await r.text(); } catch { location.href = url.href; return; }
    const doc = new DOMParser().parseFromString(html, "text/html");
    const swap = () => {
      $("main").replaceWith(document.adoptNode($("main", doc)));
      document.title = doc.title;
      const d = $('meta[name="description"]', doc); if (d) $('meta[name="description"]').setAttribute("content", d.content);
      if (push) history.pushState({}, "", url.href);
      if (url.hash) $(url.hash)?.scrollIntoView(); else scrollTo({ top: 0, behavior: "instant" });
      markNav(); closeMenu(); runScripts($("main")); init($("main"));
    };
    if (RM) return swap();
    if (document.startViewTransition) return document.startViewTransition(swap);
    if (ev) { curtain.style.setProperty("--cx", ev.clientX + "px"); curtain.style.setProperty("--cy", ev.clientY + "px"); }
    curtain.className = "curtain go";
    await new Promise((r) => setTimeout(r, 520));
    swap(); curtain.className = "curtain out";
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a"); if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || a.hasAttribute("download")) return;
    const u = new URL(a.href, location.href);
    if (!routed(u) || (u.pathname === location.pathname && u.hash)) return;
    e.preventDefault(); go(u, true, e);
  });
  addEventListener("popstate", () => { const u = new URL(location.href); if (routed(u)) go(u, false); else location.reload(); });

  document.addEventListener("DOMContentLoaded", () => {
    document.body.append(curtain);
    const sky = document.createElement("div"); sky.className = "sky"; sky.innerHTML = "<i></i><i></i><i></i>"; document.body.prepend(sky);
    const g = document.createElement("div"); g.className = "grain"; document.body.prepend(g);
    stars(); cursor(); menu(); markNav(); init(document);
    if (!RM) requestAnimationFrame(frame);
  });
})();
