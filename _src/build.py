#!/usr/bin/env python3
"""Generates the studio pages of incognitogeneration.com (v2).
Run from the repo root:  python3 _src/build.py
Shared layout lives here; page bodies are below. _src/ is not served by GitHub Pages."""
import html, re, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
LEG = ROOT / "_src" / "legacy"
esc = html.escape

# ------------------------------------------------------------------ people
# Fill in missing links here; empty values are skipped.
XIDIK = {
    "linkedin": "https://www.linkedin.com/in/xidik",
    "instagram": "",
    "facebook": "",
    "x": "",
}
SLAVA = {"linkedin": "https://www.linkedin.com/in/viacheslav-zhovtenko-b3830b163/", "instagram": "", "facebook": "", "x": ""}
SLAVA_PHOTO = "/assets/ig/img/people/slava.jpg"
STUDIO = {
    "youtube": "https://www.youtube.com/@incognitogeneration",
    "apple": "https://music.apple.com/us/artist/incognito-generation/1588064683",
    "x": "https://x.com/incoggeneration",
}

ICON = {
    "linkedin": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.84-2.05 3.78-2.05 4.04 0 4.79 2.66 4.79 6.12V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H9z"/></svg>',
    "instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    "facebook": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.9c0-.6.4-.9 1-.9z"/></svg>',
    "x": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>',
    "youtube": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1z"/></svg>',
    "apple": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.15-2.8.85-3.5.85-.7 0-1.9-.83-3.1-.8-1.6.02-3 .93-3.8 2.36-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2-.05 1.6-.75 3-.75s1.8.75 3 .73c1.3-.02 2.1-1.14 2.8-2.27.9-1.3 1.3-2.6 1.3-2.65-.03-.01-2.5-.95-2.5-3.77zM14.2 5.9c.64-.78 1.07-1.85.95-2.9-.92.04-2.03.6-2.7 1.38-.6.68-1.12 1.77-.98 2.82 1.03.08 2.08-.52 2.73-1.3z"/></svg>',
    "mail": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/></svg>',
    "arrow": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    "play": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.8-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z"/></svg>',
}
LABEL = {"linkedin": "LinkedIn", "instagram": "Instagram", "facebook": "Facebook", "x": "X", "youtube": "YouTube", "apple": "Apple Music"}

def socials(d, who):
    items = [f'<a href="{esc(u)}" target="_blank" rel="noopener" aria-label="{who} on {LABEL[k]}">{ICON[k]}</a>' for k, u in d.items() if u]
    return f'<div class="socials">{"".join(items)}</div>' if items else ""

NAV = [("Games", "/games/"), ("Arena", "/arena/"), ("Music", "/music/"), ("Ventures", "/ventures/"), ("About", "/about/"), ("Contact", "/contact/")]

def layout(path, title, desc, body, extra_head=""):
    full = title if title.startswith("Incognito Generation") else f"{title} | Incognito Generation"
    nav = "".join(f'<li><a href="{h}">{n}</a></li>' for n, h in NAV)
    games = [("Final Stand", "/games/#final-stand"), ("Elemental Arena", "/arena/"), ("Slicing Life", "/games/#slicing-life"), ("Springbound", "/games/#springbound"), ("Little Secrets", "/games/#little-secrets"), ("Pose Runner", "/games/#pose-runner"), ("K.R.A.I", "/games/#krai")]
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(full)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#06060b">
<link rel="canonical" href="https://incognitogeneration.com{path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Incognito Generation">
<meta property="og:title" content="{esc(full)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="https://incognitogeneration.com{path}">
<meta property="og:image" content="https://incognitogeneration.com/assets/studio/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/studio/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/studio/img/apple-touch-icon.png">
<link rel="preload" href="/assets/studio/fonts/BarlowCondensed-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://is1-ssl.mzstatic.com">
<link rel="stylesheet" href="/assets/ig/ig.css">
<script src="/assets/ig/player.js" defer></script>
<script src="/assets/ig/ig.js" defer></script>{extra_head}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="nav"><div class="wrap"><div class="bar glass">
  <a class="brand" href="/" aria-label="Incognito Generation home"><img src="/assets/studio/img/emblem.png" alt="" width="30" height="30"><span>Incognito Generation</span></a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Menu"><span></span><span></span><span></span></button>
  <ul id="nav-links">{nav}</ul>
</div></div></header>
<main id="main">
{body}
</main>
<footer class="foot">
  <div class="wrap">
    <div class="word" aria-hidden="true">Incognito Generation</div>
    <div class="cols">
      <div><a class="brand" href="/"><img src="/assets/studio/img/emblem.png" alt="" width="30" height="30"><span>Incognito Generation</span></a>
        <p class="muted" style="margin-top:14px;max-width:34ch">An independent game and music studio, founded by Khidayotullo Salakhitdinov and Viacheslav Zhovtenko.</p>
        <p style="margin-top:10px"><a href="mailto:info@incognitogeneration.com">info@incognitogeneration.com</a></p>
        {socials(STUDIO, "Incognito Generation")}</div>
      <div><h4>Games</h4><ul>{"".join(f'<li><a href="{h}">{n}</a></li>' for n, h in games)}</ul></div>
      <div><h4>Music</h4><ul><li><a href="/music/">Albums and singles</a></li><li><a href="/music/#videos">Music videos</a></li><li><a href="{STUDIO['apple']}" target="_blank" rel="noopener">Apple Music</a></li><li><a href="{STUDIO['youtube']}" target="_blank" rel="noopener">YouTube</a></li></ul></div>
      <div><h4>Studio</h4><ul><li><a href="/about/">About</a></li><li><a href="/ventures/">Ventures</a></li><li><a href="/contact/">Contact</a></li><li><a href="/press/">Press kit</a></li><li><a href="/finalstand/">Final Stand support</a></li></ul></div>
    </div>
    <p class="legal">&copy; 2026 Incognito Generation. All games, music and artwork are the property of Incognito Generation and their respective creators.</p>
  </div>
</footer>
</body>
</html>
"""

def sec_head(kicker, title, lede="", cls="h-lg"):
    return f'<div class="sec-head"><span class="kicker" data-reveal>{kicker}</span><h2 class="{cls}" data-split>{title}</h2>{f"<p class=lede data-reveal style=--i:2>{lede}</p>" if lede else ""}</div>'

# ------------------------------------------------------- stores + waitlist
STORES = {
    "slicing-life": {"ios": "https://apps.apple.com/app/id6805911559", "android": "https://play.google.com/store/apps/details?id=com.incognitogeneration.slicinglife"},
    "springbound": {"ios": "https://apps.apple.com/app/id6809342595"},
}
GP = '<svg viewBox="0 0 24 24"><path fill="#34A853" d="M3.6 2.2 13.4 12l-9.8 9.8c-.4-.2-.6-.6-.6-1.1V3.3c0-.5.2-.9.6-1.1z"/><path fill="#FBBC04" d="m17 8.4-3.6 3.6 3.6 3.6 3.9-2.2c.8-.5.8-1.6 0-2.1z"/><path fill="#4285F4" d="M13.4 12 3.6 21.8c.3.2.8.2 1.2 0L17 15.6z"/><path fill="#EA4335" d="M3.6 2.2c.4-.2.9-.2 1.2 0L17 8.4 13.4 12z"/></svg>'
def store_badges(sid):
    st = STORES.get(sid, {})
    out = ""
    if st.get("ios"): out += f'<a class="store" href="{st["ios"]}" target="_blank" rel="noopener">{ICON["apple"]}<span><small>Download on the</small>App Store</span></a>'
    if st.get("android"): out += f'<a class="store" href="{st["android"]}" target="_blank" rel="noopener">{GP}<span><small>Get it on</small>Google Play</span></a>'
    return f'<div class="stores">{out}</div>' if out else ""

WL = [("final-stand", "Final Stand", "Beta access", "/assets/studio/img/games/final-stand/app-icon.png"),
      ("elemental-arena", "Elemental Arena", "Voice puck launch", "/assets/ig/img/arena/beasts-gifs/beast1_idle.gif"),
      ("little-secrets", "Little Secrets", "Launch news", "/assets/studio/img/games/little-secrets/icon.png"),
      ("pose-runner", "Pose Runner", "Launch news", "/assets/studio/img/games/pose-runner/concept-neon-city.jpg"),
      ("krai", "K.R.A.I", "Playtest invite", "/assets/ig/img/krai/krai-motherland-key-art.webp")]
def wl_link(sid): return f"/games/?wl={sid}#waitlist"
def waitlist_form():
    picks = "".join(f'<label class="pick"><input type="checkbox" name="games" value="{v}" data-title="{t}"><span><img src="{img}" alt="" loading="lazy"><b>{t}<small>{sub}</small></b></span></label>' for v, t, sub, img in WL)
    return f"""<form class="form glass edge" data-waitlist data-to="info@incognitogeneration.com" novalidate data-reveal>
  <div class="field games-field"><label>Which games?</label><div class="picks">{picks}</div><span class="err">Pick at least one game.</span></div>
  <div class="two">
    <div class="field"><label for="wl-email">Email</label><input id="wl-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"><span class="err">We need a valid email address.</span></div>
    <div class="field"><label for="wl-name">Name <span class="muted">(optional)</span></label><input id="wl-name" name="name" autocomplete="name"></div>
  </div>
  <div class="field"><label for="wl-platform">Where do you play?</label><select id="wl-platform" name="platform"><option>Any</option><option>iPhone or iPad</option><option>Android</option><option>Windows PC</option><option>Mac</option><option>Browser</option></select></div>
  <input class="honey" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
  <div class="btn-row"><button class="btn" type="submit">Join the waitlist</button></div>
  <p class="muted" style="font-size:13px">We only email you about the games you pick. Unsubscribe any time by replying.</p>
  <div class="form-status" role="status" tabindex="-1"></div>
</form>"""

# ------------------------------------------------------------ legacy games
def legacy_games():
    t = (LEG / "games.html").read_text()
    out = {}
    for m in re.finditer(r'<section class="game" id="([^"]+)".*?</section>', t, re.S):
        s, sid = m.group(0), m.group(1)
        info = re.search(r'<div class="game-info[^"]*"[^>]*>(.*)</div>\s*</div>\s*</section>', s, re.S)
        info = info.group(1) if info else ""
        out[sid] = {
            "imgs": re.findall(r'<img(?![^>]*class="icon")[^>]*src="([^"]+)"[^>]*alt="([^"]*)"', s),
            "icon": (re.search(r'<img class="icon" src="([^"]+)"', s) or [None, ""])[1],
            "title": re.sub(r"<[^>]+>", "", re.search(r"<h2[^>]*>(.*?)</h2>", s, re.S).group(1)),
            "tag": (re.search(r'<p class="tag">(.*?)</p>', s, re.S) or [None, ""])[1],
            "paras": [p for p in re.findall(r"<p>(.*?)</p>", info, re.S)],
            "facts": (re.search(r'(<div class="facts">.*?</div></div>)', info, re.S) or [None, ""])[1],
            "platforms": (re.search(r'(<p class="platforms">.*?</p>)', info, re.S) or [None, ""])[1],
            "btns": (re.search(r'<div class="btn-row">(.*?)</div>', info, re.S) or [None, ""])[1],
        }
    return out

STATUS = {"final-stand": ("beta", "In beta"), "slicing-life": ("live", "Out now"), "springbound": ("live", "Out now"),
          "little-secrets": ("dev", "In development"), "elemental-arena": ("live", "Award winner"), "pose-runner": ("dev", "In development"), "krai": ("dev", "In development")}

def game_section(sid, g, i):
    imgs = g["imgs"]
    key = imgs[0] if imgs else ("", "")
    insets = imgs[1:3]
    portrait = sid in ("springbound", "final-stand")
    inset_html = ""
    if insets:
        inset_html += f'<div class="inset frame holo {"tall" if portrait else ""}" data-depth=".5"><img src="{insets[0][0]}" alt="{esc(insets[0][1])}" loading="lazy"></div>'
    if len(insets) > 1:
        inset_html += f'<div class="inset tl frame holo {"tall" if portrait else ""}" data-depth=".9" style="width:{"22%" if portrait else "34%"}"><img src="{insets[1][0]}" alt="{esc(insets[1][1])}" loading="lazy"></div>'
    st = STATUS.get(sid, ("live", ""))
    icon = f'<img src="{g["icon"]}" alt="" width="64" height="64" style="border-radius:16px;margin-bottom:18px;box-shadow:0 10px 30px -10px #000">' if g["icon"] else ""
    paras = "".join(f"<p style='margin-top:14px;color:var(--ink2)'>{p}</p>" for p in g["paras"])
    btns = g["btns"].replace("/contact/?topic=Beta%20access", wl_link(sid))
    if sid in STORES:
        pages = {"slicing-life": '<a class="btn ghost sm" href="/slicing-life/">Game page</a>'}
        btns = store_badges(sid) + pages.get(sid, "")
    rest = "".join(f'<div class="frame holo" style="aspect-ratio:{"9/16" if portrait else "16/10"}"><img src="{u}" alt="{esc(a)}" loading="lazy"></div>' for u, a in imgs[3:6])
    strip = f'<div style="display:grid;grid-template-columns:repeat({max(len(imgs[3:6]),1)},1fr);gap:14px;margin-top:70px" data-reveal>{rest}</div>' if rest else ""
    return f"""
<section class="sec" id="{sid}" aria-labelledby="{sid}-h">
  <div class="wrap row2 {"rev" if i % 2 else ""}">
    <div>
      <div class="pip" data-reveal="zoom">
        <div class="main frame holo" data-tilt="5"><img src="{key[0]}" alt="{esc(key[1])}" loading="lazy"><span class="chip {st[0]}">{st[1]}</span></div>
        {inset_html}
      </div>
      {strip}
    </div>
    <div data-reveal style="--i:1">
      {icon}
      <h2 class="h-md" id="{sid}-h" data-split>{esc(g["title"])}</h2>
      <p class="holo-text" style="font-family:var(--display);font-size:22px;letter-spacing:.06em;text-transform:uppercase;margin-top:10px">{g["tag"]}</p>
      {paras}
      {g["facts"]}
      <div style="color:var(--ink2);margin:6px 0 24px">{g["platforms"]}</div>
      <div class="btn-row">{btns}</div>
    </div>
  </div>
</section>"""

# ------------------------------------------------------------------- pages
def page_home():
    body = f"""
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="kicker" data-reveal>Independent game and music studio</span>
      <h1 class="h-xl" data-split>Games, worlds <span class="holo-text">and the music</span> behind them.</h1>
      <p class="lede" data-reveal style="--i:3">Incognito Generation makes games for phones, PC and the living room, builds voice-controlled worlds, and has released its own music since 2021. Founded by Khidayotullo Salakhitdinov and Viacheslav Zhovtenko.</p>
      <div class="btn-row" data-reveal style="--i:4">
        <a class="btn" href="/games/">Explore the games {ICON['arrow']}</a>
        <button class="btn ghost" data-play-all data-label="Play our music">{ICON['play']}<span class="lab">Play our music</span></button>
      </div>
    </div>
    <div class="stage" aria-hidden="true">
      <div class="layer frame holo" data-depth=".25" style="left:4%;top:6%;width:78%;aspect-ratio:16/10"><img src="/assets/studio/img/games/final-stand/key-art.jpg" alt=""></div>
      <div class="layer frame holo" data-depth=".7" style="right:0;top:0;width:28%;aspect-ratio:9/16"><img src="/assets/ig/img/krai/krai-motherland-key-art.webp" alt=""></div>
      <div class="layer frame holo" data-depth="1.1" style="left:0;bottom:4%;width:44%;aspect-ratio:16/10"><img src="/assets/studio/img/games/elemental-arena/key-art-creatures.jpg" alt=""></div>
      <div class="layer frame holo" data-depth=".9" style="right:6%;bottom:0;width:22%;aspect-ratio:9/16"><img src="/assets/studio/img/games/springbound/shot-02-journey.jpg" alt=""></div>
    </div>
  </div>
  <div class="scroll-cue" aria-hidden="true">SCROLL<i></i></div>
</section>

<div class="marquee" aria-hidden="true"><div class="track">{"".join(f"<span>{w}</span>" for w in ["Final Stand","Koi No Hajimari","Elemental Arena","Slicing Life","Samurai Spirit","Springbound","K.R.A.I","Macabre Life","Little Secrets","Inauguration","Pose Runner"]*2)}</div></div>

<section class="sec">
  <div class="wrap">
    {sec_head("What we make", "Seven worlds. <span class=holo-text>Built in house.</span>", "Two games out now, one in beta, an award-winning voice game, and more in the workshop. Every one designed, coded, drawn and scored by us.")}
    <div class="bento">
      <a class="tile holo t-8 tall" href="/games/#final-stand" data-tilt="4"><div class="bg" data-depth=".15"><img src="/assets/studio/img/games/final-stand/key-art.jpg" alt=""></div><span class="chip beta">In beta</span><h3>Final Stand: Heart of the Grove</h3><p>Hero defense for one to five players. Pick a champion, hold the line and keep the ancient tree alive.</p><span class="go">{ICON['arrow']}</span></a>
      <a class="tile holo t-4 tall" href="/arena/" data-tilt="6"><div class="bg"><img src="/assets/studio/img/games/elemental-arena/creature-fire-dragon.jpg" alt=""></div><span class="chip live">Award winner</span><h3>Elemental Arena</h3><p>Raise an elemental beast and battle by voice.</p><span class="go">{ICON['arrow']}</span></a>
      <a class="tile holo t-4" href="/games/#slicing-life" data-tilt="6"><div class="bg"><img src="/assets/screens/2_play.jpg" alt=""></div><span class="chip live">Out now</span><h3>Slicing Life</h3><p>Cut the shape. Dodge the rest.</p><span class="go">{ICON['arrow']}</span></a>
      <a class="tile holo t-4" href="/games/#springbound" data-tilt="6"><div class="bg"><img src="/assets/studio/img/games/springbound/shot-02-journey.jpg" alt=""></div><span class="chip live">Out now</span><h3>Springbound</h3><p>Aim, launch, land, climb.</p><span class="go">{ICON['arrow']}</span></a>
      <a class="tile holo t-4" href="/games/#krai" data-tilt="6"><div class="bg"><img src="/assets/ig/img/krai/kyiv-central-square.webp" alt=""></div><span class="chip dev">In development</span><h3>K.R.A.I</h3><p>Tactical MMORPG. Kyiv, 2126.</p><span class="go">{ICON['arrow']}</span></a>
      <a class="tile holo t-6" href="/games/#little-secrets" data-tilt="5"><div class="bg"><img src="/assets/studio/img/games/little-secrets/hero-library.jpg" alt=""></div><span class="chip dev">In development</span><h3>Little Secrets</h3><p>A hidden-object mystery across 120 hand-built rooms.</p><span class="go">{ICON['arrow']}</span></a>
      <a class="tile holo t-6" href="/games/#pose-runner" data-tilt="5"><div class="bg"><img src="/assets/studio/img/games/pose-runner/concept-neon-city.jpg" alt=""></div><span class="chip dev">In development</span><h3>Pose Runner</h3><p>A TV runner you play with your whole body.</p><span class="go">{ICON['arrow']}</span></a>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0"><div class="wrap">
  {sec_head("Out now", "Play them <span class=holo-text>today.</span>", "", "h-md")}
  <div class="outnow">
    <div class="card glass holo" data-tilt="5" data-reveal><img class="ic" src="/assets/icon-192.png" alt=""><div><h3>Slicing Life</h3><p>Cut the shape, dodge the hazards, 100 levels deep.</p>{store_badges("slicing-life")}</div></div>
    <div class="card glass holo" data-tilt="5" data-reveal style="--i:1"><img class="ic" src="/assets/studio/img/games/springbound/icon.png" alt=""><div><h3>Springbound</h3><p>Aim, launch, land and keep climbing.</p>{store_badges("springbound")}</div></div>
    <a class="card glass edge holo" data-tilt="5" data-reveal style="--i:2" href="/games/#waitlist"><img class="ic" src="/assets/studio/img/games/final-stand/app-icon.png" alt=""><div><h3>Join a waitlist</h3><p>Final Stand beta, the Elemental Arena puck, Little Secrets, Pose Runner and K.R.A.I.</p><span class="btn sm">Get early access {ICON['arrow']}</span></div></a>
  </div>
</div></section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="row2">
      <div>
        {sec_head("Music", "Four albums. <span class=holo-text>Fifty-four tracks.</span>", "Drum and bass, hip-hop, downtempo and cinematic soundtracks, all written by Slava. Press play: the player follows you around the site.", "h-lg")}
        <div class="btn-row" data-reveal style="--i:3"><button class="btn" data-play-all data-label="Shuffle everything">{ICON['play']}<span class="lab">Shuffle everything</span></button><a class="btn ghost" href="/music/">All music</a></div>
      </div>
      <div class="albums" data-albums="4" style="grid-template-columns:1fr 1fr"></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    {sec_head("The founders", "Two founders. <span class=holo-text>Two companies.</span> One studio.")}
    <div class="founders">
      <a class="founder glass edge holo" href="/about/#xidik" data-tilt="5" data-reveal>
        <div class="ring"><img src="/assets/ig/img/people/xidik.jpg" alt="Khidayotullo Salakhitdinov" style="object-position:50% 22%"></div>
        <div class="fi"><span class="kicker">Co-founder</span><h3>Khidayotullo Salakhitdinov</h3>
          <div class="roles"><span class="chip">Founder &amp; CEO, PharmKulen</span><span class="chip">Games &amp; engineering</span></div>
          <p>Builds the studio's games end to end, from prototype to store page. Built Elemental Arena, the Robotics &amp; Physical AI track winner at Agentic AI Build Week 2026.</p>
          <div class="mini"><span><b>2026</b>ASEAN Outstanding Visionary Leader</span><span><b>2026</b>Best Startup, PharmKulen</span></div>
          <span class="more">Read more {ICON['arrow']}</span></div>
      </a>
      <a class="founder glass edge holo" href="/about/#slava" data-tilt="5" data-reveal style="--i:1">
        <div class="ring"><img src="{SLAVA_PHOTO}" alt="Viacheslav Zhovtenko" style="object-position:40% 35%"></div>
        <div class="fi"><span class="kicker">Co-founder</span><h3>Viacheslav Zhovtenko</h3>
          <div class="roles"><span class="chip">Founder &amp; CEO, MiyZapis</span><span class="chip">Music &amp; characters</span></div>
          <p>Wrote all of the studio's music, every album and single since 2021, helps design and animate our characters, and is building K.R.A.I.</p>
          <div class="mini"><span><b>54</b>tracks released</span><span><b>4</b>albums</span></div>
          <span class="more">Read more {ICON['arrow']}</span></div>
      </a>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="glass edge" style="padding:clamp(30px,5vw,70px);text-align:center;overflow:hidden" data-reveal="zoom">
      <span class="kicker">Get in touch</span>
      <h2 class="h-lg" style="margin:18px 0" data-split>Have a game, a track or a story for us?</h2>
      <p class="lede" style="margin:0 auto 30px">Publishing, press, partnerships, music licensing or player support. We read every message.</p>
      <a class="btn" href="/contact/">Contact us {ICON['arrow']}</a>
    </div>
  </div>
</section>"""
    return layout("/", "Incognito Generation | Independent games and music", "Incognito Generation is an independent game and music studio: Final Stand, Elemental Arena, Slicing Life, Springbound, K.R.A.I and four albums of original music.", body)

KRAI = {
    "imgs": [("/assets/ig/img/krai/kyiv-central-square.webp", "Isometric art of Kyiv's central square in 2126"), ("/assets/ig/img/krai/krai-motherland-key-art.webp", "K.R.A.I key art: a monumental figure with a tryzub shield"), ("/assets/ig/img/krai/combat-ui.webp", "Hex-grid tactical combat"),
             ("/assets/ig/img/krai/mine-arena.webp", "A torch-lit mine arena"), ("/assets/ig/img/krai/operative-and-mutants.webp", "An operative facing mutants"), ("/assets/ig/img/krai/kyiv-university-district.webp", "Kyiv's university district")],
    "icon": "", "title": "K.R.A.I", "tag": "Tactical MMORPG. Kyiv, 2126.",
    "paras": ["After an artificial-intelligence uprising, Kyiv survives behind its walls, rebuilt by its people. You are an operative: pack a kit, pick a route and a level of risk, fight mutants in short turn-based battles on a hex grid, and try to bring your loot home.",
              "You plan your actions, then watch them play out, so you shoot where an enemy will be. Injuries to arms, legs and head change what you can do. Six professional factions share one economy of trade, crafting and conflict. Developed by Viacheslav Zhovtenko."],
    "facts": '<div class="facts"><div class="fact"><b>Hex</b><span>predictive turn-based combat</span></div><div class="fact"><b>6</b><span>professional factions</span></div><div class="fact"><b>20-40</b><span>minute expeditions</span></div></div>',
    "platforms": '<p class="platforms"><strong>Platform:</strong> PC browser first. <strong>Status:</strong> in development, playtest not open to the public.</p>',
    "btns": '<a class="btn" href="/games/?wl=krai#waitlist">Join the waitlist</a>',
}

def page_games():
    g = legacy_games()
    g["elemental-arena"]["btns"] = f'<a class="btn" href="/arena/">Explore Elemental Arena {ICON["arrow"]}</a>' + g["elemental-arena"]["btns"].replace('class="btn"', 'class="btn ghost"')
    order = ["final-stand", "elemental-arena", "slicing-life", "springbound", "krai", "little-secrets", "pose-runner"]
    g["krai"] = KRAI
    secs = "".join(game_section(s, g[s], i) for i, s in enumerate(order))
    lw = re.search(r'<section class="game" id="little-wanderers".*?</section>', (LEG / "games.html").read_text(), re.S).group(0)
    lw_text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", re.sub(r"<svg.*?</svg>", "", lw, flags=re.S))).strip()
    body = f"""
<section class="hero" style="min-height:70svh">
  <div class="wrap">
    <span class="kicker" data-reveal>The games</span>
    <h1 class="h-xl" data-split>Seven worlds, <span class="holo-text">one studio.</span></h1>
    <p class="lede" data-reveal style="--i:3;margin-top:24px">From one-thumb arcade games to five-player hero defense, a voice-battle game and a tactical MMORPG set in Kyiv. Here is everything we have out, in beta and in the workshop.</p>
    <div class="btn-row" data-reveal style="--i:4;margin-top:30px">{"".join(f'<a class="btn ghost sm" href="#{s}">{esc(g[s]["title"].split(":")[0])}</a>' for s in order)}</div>
  </div>
</section>
{secs}
<section class="sec" id="waitlist"><div class="wrap row2" style="align-items:start">
  <div>{sec_head("Waitlist", "Be first <span class=holo-text>to play.</span>", "Pick the games you want and we'll email you when there's a beta, a playtest or a launch. For games that are already out, grab them from the stores below.")}
    <div class="glass" style="padding:24px;display:grid;gap:18px" data-reveal>
      <div><b style="font-family:var(--display);font-size:24px;text-transform:uppercase">Slicing Life</b><p class="muted" style="font-size:14px;margin-bottom:10px">Out now on iOS and Android</p>{store_badges("slicing-life")}</div>
      <div><b style="font-family:var(--display);font-size:24px;text-transform:uppercase">Springbound</b><p class="muted" style="font-size:14px;margin-bottom:10px">Out now on iOS, Android coming</p>{store_badges("springbound")}</div>
    </div></div>
  {waitlist_form()}
</div></section>
<section class="sec" id="little-wanderers" style="padding-top:0">
  <div class="wrap"><div class="glass edge" style="padding:40px" data-reveal>
    <span class="kicker">Where it started</span>
    <h2 class="h-md" style="margin:14px 0">Little Wanderers Flights</h2>
    <p class="lede">Our first game, released on the App Store and Google Play, with a single of the same name.</p>
    <div class="btn-row" style="margin-top:24px"><a class="btn" href="https://www.youtube.com/watch?v=cWHMvQbmDWI" target="_blank" rel="noopener">{ICON['play']} Watch the trailer</a><a class="btn ghost" href="/music/">Hear the theme</a></div>
  </div></div>
</section>"""
    return layout("/games/", "Games", "Final Stand: Heart of the Grove, Elemental Arena, Slicing Life, Springbound, K.R.A.I, Little Secrets and Pose Runner, the games of Incognito Generation.", body)

def page_music():
    extra = json.dumps([{"id": "ItKTgqQkeDc", "title": "Samurai Spirit", "sub": "Album visuals"}, {"id": "e5Jkt2dqhY0", "title": "Inauguration", "sub": "Album visuals"},
                        {"id": "G5MlsY0Uens", "title": "Innocent Daydream", "sub": "Official music video"}, {"id": "YCFTOT42Il8", "title": "Tyna Sinni", "sub": "Official music video"},
                        {"id": "yBUz_Sc1WjI", "title": "Voices", "sub": "Official music video"}, {"id": "hsIYkTodj18", "title": "Alfheimr", "sub": "Official music video"},
                        {"id": "cWHMvQbmDWI", "title": "Little Wanderers Flights", "sub": "Game trailer"}])
    body = f"""
<script>window.IG_EXTRA_VIDEOS={extra}</script>
<section class="hero" style="min-height:80svh">
  <div class="wrap hero-grid">
    <div>
      <span class="kicker" data-reveal>Music by Incognito Generation</span>
      <h1 class="h-xl" data-split>Press play. <span class="holo-text">Keep browsing.</span></h1>
      <p class="lede" data-reveal style="--i:3;margin:24px 0 30px">Four albums and a shelf of singles since 2021, all written and produced by Slava: drum and bass, hip-hop, downtempo and cinematic soundtracks. The player stays with you on every page, and the whole site pulses to the beat.</p>
      <div class="btn-row" data-reveal style="--i:4"><button class="btn" data-play-all data-label="Shuffle everything">{ICON['play']}<span class="lab">Shuffle everything</span></button><a class="btn ghost" href="{STUDIO['apple']}" target="_blank" rel="noopener">{ICON['apple']} Apple Music</a><a class="btn ghost" href="{STUDIO['youtube']}" target="_blank" rel="noopener">{ICON['youtube']} YouTube</a></div>
    </div>
    <div class="stats" style="grid-template-columns:1fr 1fr">
      <div class="stat glass holo" data-reveal style="--i:1"><b data-count="4">4</b><span>albums</span></div>
      <div class="stat glass holo" data-reveal style="--i:2"><b data-count="54">54</b><span>tracks on streaming services</span></div>
      <div class="stat glass holo" data-reveal style="--i:3"><b data-count="30" data-suffix="+">30+</b><span>music videos on YouTube</span></div>
      <div class="stat glass holo" data-reveal style="--i:4"><b>2021</b><span>first release, Inauguration</span></div>
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0"><div class="wrap">{sec_head("Albums and singles", "Pick a record.", "Click any cover to play its 30-second previews. Open the full-screen player from the disc in the corner.", "h-lg")}<div class="albums" data-albums></div></div></section>
<section class="sec" style="padding-top:0"><div class="wrap">{sec_head("Every track", "The full catalogue.", "", "h-md")}<div class="glass" style="padding:14px"><ol class="tracks" data-tracks></ol></div></div></section>
<section class="sec" id="videos" style="padding-top:0"><div class="wrap">{sec_head("Music videos", "Watch them, then scroll on.", "Start a video and keep scrolling: it pops out into a picture-in-picture window so you can browse while it plays.", "h-md")}<div class="videos" data-videos></div></div></section>"""
    return layout("/music/", "Music", "Albums, singles and music videos by Incognito Generation. Play the whole catalogue right here.", body)

ACH = [
    ("2026", "ASEAN Outstanding Visionary Leader Award", "Presented by G 1% Cambodia."),
    ("2026", "Winner, Robotics & Physical AI track", "Agentic AI Build Week 2026, Ho Chi Minh City, the largest buildathon held in ASEAN (3,000+ builders, 400+ projects), with Elemental Arena. Covered by Nhân Dân and VietnamPlus."),
    ("2026", "Best Startup 2026", "PharmKulen, at the Cambodia Entrepreneur Showcase by Khmer Enterprise and 2080 Ventures."),
    ("2026", "Supernova Pitch Competition semi-finalist", "PharmKulen at GITEX AI Asia, Singapore."),
    ("2026", "Echelon Asia Summit", "Pitched PharmKulen at Echelon Asia Summit 2026."),
    ("2026", "NVIDIA Inception, Plug and Play, Claude for Startups", "PharmKulen joined NVIDIA Inception, the Plug and Play Cambodia accelerator and Anthropic's Claude for Startups programme."),
    ("Earlier", "First game shipped", "Little Wanderers Flights released on the App Store and Google Play."),
]

def page_about():
    tl = "".join(f'<div class="tl glass holo" data-reveal style="--i:{i}" data-tilt="3"><em>{y}</em><b>{esc(t)}</b><span>{esc(d)}</span></div>' for i, (y, t, d) in enumerate(ACH))
    slava_av = f'<img src="{SLAVA_PHOTO}" alt="Viacheslav Zhovtenko">' if SLAVA_PHOTO else '<div class="mono holo-text">VZ</div>'
    body = f"""
<section class="hero" style="min-height:76svh">
  <div class="wrap">
    <span class="kicker" data-reveal>About the studio</span>
    <h1 class="h-xl" data-split>Two founders. <span class="holo-text">Games, music,</span> and companies of their own.</h1>
    <p class="lede" data-reveal style="--i:3;margin-top:26px">Incognito Generation started with music: Inauguration came out in 2021, followed by Samurai Spirit, Macabre Life, Koi No Hajimari and a run of singles. Then came the games. Little Wanderers Flights was the first. Today the studio has two games in stores, a hero-defense game in beta, an award-winning voice game and more in the workshop. Everything is made in house: design, code, art, animation and sound.</p>
  </div>
</section>
<section class="sec" style="padding-top:0"><div class="wrap stats">
  <div class="stat glass holo" data-reveal><b data-count="7">7</b><span>games out, in beta or in development</span></div>
  <div class="stat glass holo" data-reveal style="--i:1"><b data-count="4">4</b><span>albums released</span></div>
  <div class="stat glass holo" data-reveal style="--i:2"><b data-count="54">54</b><span>tracks on streaming services</span></div>
  <div class="stat glass holo" data-reveal style="--i:3"><b>2021</b><span>first release</span></div>
</div></section>

<section class="sec" id="xidik" style="padding-top:0"><div class="wrap">
  <div class="person glass edge" data-reveal>
    <div class="avatar holo" data-tilt="8"><img src="/assets/ig/img/people/xidik.jpg" alt="Khidayotullo Salakhitdinov"></div>
    <div>
      <span class="kicker">Co-founder</span>
      <h2 class="h-lg" style="margin:12px 0 6px">Khidayotullo Salakhitdinov</h2>
      <p class="holo-text" style="font-family:var(--display);font-size:22px;letter-spacing:.08em;text-transform:uppercase">Co-founder, Incognito Generation · Founder & CEO, PharmKulen</p>
      <p style="margin-top:18px;color:var(--ink2)">Known as Xidik. Co-founded Incognito Generation and builds its games end to end, from the first prototype and gameplay code to art direction and the store page. He built Elemental Arena, the voice-battle game that won the Robotics & Physical AI track at Agentic AI Build Week 2026.</p>
      <p style="margin-top:12px;color:var(--ink2)">He is also the founder and CEO of <a href="/ventures/#pharmkulen" style="text-decoration:underline">PharmKulen</a>, Cambodia's medicine search and pharmacy management platform. A software engineer (Computer Software Engineering, Wuhan University) who has lived in Cambodia for more than 18 years, he works in English, Russian, Uzbek and Chinese and is based in Phnom Penh.</p>
      {socials(XIDIK, "Khidayotullo Salakhitdinov")}
    </div>
  </div>
  <div style="margin-top:40px">
    <span class="kicker" data-reveal>Achievements</span>
    <div class="timeline" style="margin-top:24px">{tl}</div>
  </div>
</div></section>

<section class="sec" id="slava" style="padding-top:0"><div class="wrap">
  <div class="person glass edge" data-reveal>
    <div class="avatar holo" data-tilt="8">{slava_av}</div>
    <div>
      <span class="kicker">Co-founder</span>
      <h2 class="h-lg" style="margin:12px 0 6px">Viacheslav Zhovtenko</h2>
      <p class="holo-text" style="font-family:var(--display);font-size:22px;letter-spacing:.08em;text-transform:uppercase">Co-founder, Incognito Generation · Founder & CEO, MiyZapis</p>
      <p style="margin-top:18px;color:var(--ink2)">Known as Slava. Co-founded Incognito Generation and wrote all of its music, every album and single since Inauguration in 2021. He also helps design and animate the studio's characters. Originally from Ukraine, he studied International Economy and Trade at Wuhan University.</p>
      <p style="margin-top:12px;color:var(--ink2)">He is the founder and CEO of <a href="/ventures/#miyzapis" style="text-decoration:underline">MiyZapis</a>, a booking marketplace and business platform for appointment-based services, and is developing <a href="/games/#krai" style="text-decoration:underline">K.R.A.I</a>, a tactical MMORPG set in Kyiv in 2126.</p>
      <ul class="list"><li>Composer and producer of all Incognito Generation music</li><li>Character design and animation</li><li>Founder and CEO of MiyZapis</li><li>Creator of K.R.A.I, in development</li></ul>
      {socials(SLAVA, "Viacheslav Zhovtenko")}
    </div>
  </div>
</div></section>"""
    return layout("/about/", "About", "Incognito Generation was founded by Khidayotullo Salakhitdinov (founder and CEO of PharmKulen) and Viacheslav Zhovtenko (founder and CEO of MiyZapis).", body)

def page_ventures():
    body = f"""
<section class="hero" style="min-height:70svh">
  <div class="wrap">
    <span class="kicker" data-reveal>Ventures</span>
    <h1 class="h-xl" data-split>Beyond games: <span class="holo-text">the founders' companies.</span></h1>
    <p class="lede" data-reveal style="--i:3;margin-top:24px">Each founder also runs a company of his own. Same habit as the studio: design it, build it, ship it.</p>
  </div>
</section>

<section class="sec" id="miyzapis" style="padding-top:0"><div class="wrap row2">
  <div class="pip" data-reveal="zoom">
    <div class="main frame holo" data-tilt="5"><img src="/assets/ig/img/miyzapis/landing-desktop.webp" alt="The MiyZapis home page" loading="lazy"><span class="chip live">Live</span></div>
    <div class="inset tall frame holo" data-depth=".6"><img src="/assets/ig/img/miyzapis/landing-mobile.webp" alt="MiyZapis on a phone" loading="lazy"></div>
  </div>
  <div data-reveal style="--i:1">
    <img src="/assets/ig/img/miyzapis/miyzapis_logo.png" alt="" width="64" height="64" style="border-radius:16px;margin-bottom:18px">
    <span class="kicker">Founded by Viacheslav Zhovtenko</span>
    <h2 class="h-md" style="margin:12px 0" data-split>MiyZapis</h2>
    <p class="holo-text" style="font-family:var(--display);font-size:22px;letter-spacing:.06em;text-transform:uppercase">Book a specialist in one conversation</p>
    <p style="margin-top:14px;color:var(--ink2)">A booking marketplace and business platform for appointment-based services. Customers search for a specialist, or simply describe what they need to an AI concierge that checks live availability and books. Specialists and salons run their whole day on the same system: calendar, clients, loyalty, staff, stock, payroll and accounting.</p>
    <ul class="list"><li>Marketplace with live availability from real calendars</li><li>AI concierge that searches, checks and books in Ukrainian, English or Russian</li><li>Loyalty, gift cards and memberships</li><li>CRM, HR, payroll, inventory and accounting for salons</li><li>Web app, mobile app and Telegram mini-app</li></ul>
    <div class="btn-row"><a class="btn" href="https://miyzapis.com" target="_blank" rel="noopener">Visit miyzapis.com {ICON['arrow']}</a></div>
  </div>
</div></section>

<section class="sec" id="pharmkulen" style="padding-top:0"><div class="wrap row2 rev">
  <div class="pip" data-reveal="zoom">
    <div class="main frame holo" data-tilt="5"><img src="/assets/ig/img/pharmkulen/search.jpg" alt="PharmKulen medicine search results" loading="lazy"><span class="chip live">Live in Cambodia</span></div>
    <div class="inset frame holo" data-depth=".6"><img src="/assets/ig/img/pharmkulen/ai.jpg" alt="PharmKulen AI sales and inventory coach" loading="lazy"></div>
  </div>
  <div data-reveal style="--i:1">
    <img src="/assets/ig/img/pharmkulen/logo.png" alt="PharmKulen" style="height:54px;width:auto;margin-bottom:18px;background:#fff;padding:8px 14px;border-radius:14px">
    <span class="kicker">Founded by Khidayotullo Salakhitdinov</span>
    <h2 class="h-md" style="margin:12px 0" data-split>PharmKulen</h2>
    <p class="holo-text" style="font-family:var(--display);font-size:22px;letter-spacing:.06em;text-transform:uppercase">Find any medicine at a licensed pharmacy near you</p>
    <p style="margin-top:14px;color:var(--ink2)">Cambodia's medicine search and pharmacy management platform. Patients type or photograph a medicine, in Khmer or English, and see which licensed pharmacies nearby have it in stock and at what price, then reserve it and pay by KHQR. Pharmacies run inventory, point of sale, expiry alerts and AI sales analytics on PharmKulen, and their live shelf data powers the search.</p>
    <div class="facts"><div class="fact"><b>49</b><span>pharmacies digitised</span></div><div class="fact"><b>31,000+</b><span>medicines catalogued</span></div><div class="fact"><b>6</b><span>languages</span></div></div>
    <div class="btn-row" style="margin-bottom:18px"><span class="chip">Best Startup 2026</span><span class="chip">GITEX AI Asia Supernova semi-finalist</span><span class="chip">NVIDIA Inception</span><span class="chip">Plug and Play Cambodia</span></div>
    <div class="btn-row"><a class="btn" href="https://pharmkulen.com" target="_blank" rel="noopener">Visit pharmkulen.com {ICON['arrow']}</a></div>
  </div>
</div></section>"""
    return layout("/ventures/", "Ventures", "MiyZapis, founded by Viacheslav Zhovtenko, and PharmKulen, founded by Khidayotullo Salakhitdinov: the companies of the Incognito Generation founders.", body)

def page_contact():
    leg = (LEG / "contact.html").read_text()
    form = re.search(r'<form class="contact.*?</form>', leg, re.S).group(0)
    form = form.replace('class="contact reveal"', 'class="form glass edge" data-reveal')
    body = f"""
<section class="hero" style="min-height:auto;padding-top:160px">
  <div class="wrap row2" style="align-items:start">
    <div>
      <span class="kicker" data-reveal>Contact</span>
      <h1 class="h-xl" data-split>Say <span class="holo-text">hello.</span></h1>
      <p class="lede" data-reveal style="--i:3;margin:24px 0 30px">Press, publishing, partnerships, music licensing or a question about one of our games. Write to us and a person will reply.</p>
      <div style="display:grid;gap:14px" data-reveal style="--i:4">
        <a class="glass holo" style="padding:20px 22px;display:flex;gap:16px;align-items:center" href="mailto:info@incognitogeneration.com" data-tilt="4"><span style="width:26px">{ICON['mail']}</span><span><b>info@incognitogeneration.com</b><br><span class="muted">Email us directly</span></span></a>
        <a class="glass holo" style="padding:20px 22px;display:flex;gap:16px;align-items:center" href="/press/" data-tilt="4"><span style="width:26px">{ICON['arrow']}</span><span><b>Press kit</b><br><span class="muted">Fact sheet, logos, key art and screenshots</span></span></a>
        <a class="glass holo" style="padding:20px 22px;display:flex;gap:16px;align-items:center" href="/finalstand/" data-tilt="4"><span style="width:26px">{ICON['arrow']}</span><span><b>Final Stand support</b><br><span class="muted">Help, privacy and account deletion</span></span></a>
        <a class="glass holo" style="padding:20px 22px;display:flex;gap:16px;align-items:center" href="/slicing-life/" data-tilt="4"><span style="width:26px">{ICON['arrow']}</span><span><b>Slicing Life support</b><br><span class="muted">Help and privacy for Slicing Life</span></span></a>
      </div>
    </div>
    {form}
  </div>
</section>"""
    return layout("/contact/", "Contact", "Contact Incognito Generation: press, publishing, partnerships, music licensing and player support.", body)

PAGES = {"index.html": page_home, "games/index.html": page_games, "music/index.html": page_music, "about/index.html": page_about,
         "ventures/index.html": page_ventures, "contact/index.html": page_contact}

if __name__ == "__main__":
    import sys
    sys.path.insert(0, str(ROOT / "_src"))
    try:
        import arena
        PAGES["arena/index.html"] = lambda: layout("/arena/", "Elemental Arena", arena.DESC, arena.body(ICON, sec_head), arena.HEAD)
    except ImportError:
        print("arena.py missing, skipping /arena/")
    for f, fn in PAGES.items():
        p = ROOT / f
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(fn())
        print("wrote", f)
