"""Elemental Arena showcase page, migrated from the arena's own landing,
waitlist, guide, setup and shop pages. Play/sign-up links go to the live app."""
import html
esc = html.escape

LIVE = "https://arena.incognitogeneration.com"
DESC = "Elemental Arena: a palm-sized voice puck with two lives. An AI companion that talks, feels and remembers, and a fighter that duels other players by voice. Winner, Robotics & Physical AI track, Agentic AI Build Week 2026."
HEAD = ""
A = "/assets/ig/img/arena/"

ELEMENTS = [("fire", "#ff5a1f", "\U0001F525"), ("ice", "#38e0e0", "❄️"), ("air", "#7fd4ff", "\U0001F32C️"), ("earth", "#a9805a", "⛰️"),
            ("lightning", "#f4d92b", "⚡"), ("water", "#2e86ff", "\U0001F30A")]
BEASTS = "dragon wolf phoenix kraken golem tiger serpent raven scorpion bear fox monkey lion fish shark owl rabbit turtle frog cat panda deer octopus hawk lizard".split()
FEATURES = [
    ("A real AI assistant", "Ask it anything: dinosaurs, space, the time, the weather, a translation. It answers from what it knows and looks up what it doesn't."),
    ("Real conversation", "Not scripted buttons. A natural back-and-forth voice companion that listens, answers and talks like it means it."),
    ("40+ emotions", "Its own animated face and voice for every feeling. It laughs, cries, dances, sulks after a loss and throws its own attack in a fight."),
    ("Voice battles", "Two companions' AIs duel over spoken energy rounds. Momentum builds to elemental ultimates and sudden death decides the close ones."),
    ("They notice each other", "Put two together and they talk on their own, becoming friends or rivals based on who they are and past battles."),
    ("Stories, riddles and games", "A brand-new tale every time, plus riddles, quizzes, word games and songs, in its own character's voice."),
    ("Remembers and grows", "Your name, your favourites, the moments that mattered. It levels up the more you use it, and its whole self travels with it."),
    ("Artifacts and ranks", "Unique serial-numbered artifacts merge into your companion: its art is reforged wearing them and it climbs from C to legendary SSS."),
    ("Parents stay in control", "Pick exactly what each companion can do. Grown-up tools are off for kids by default, plus bedtime mode and topic controls."),
    ("Bring your own brain", "Runs on your own AI key: your data, your model, your privacy. Fully bilingual in English and Russian, switching mid-sentence."),
]
EMOTIONS = ["happy", "laughing", "dancing", "loving", "silly", "shocked", "crying", "angry", "resting"]

def body(ICON, sec_head):
    ring = "".join(f'<button class="node" style="--c:{c};--k:{i}" data-el="{n}" aria-label="{n.title()}: beats {ELEMENTS[(i + 1) % 6][0]}"><i>{e}</i><b>{n}</b></button>' for i, (n, c, e) in enumerate(ELEMENTS))
    gifs = [1, 2, 3, 6, 7, 21]
    gal = "".join(f'<figure class="beast holo" data-tilt="10"><img src="{A}beasts-gifs/beast{g}_idle.gif" data-attack="{A}beasts-gifs/beast{g}_attack.gif" alt="Generated pixel-art beast" loading="lazy"></figure>' for g in gifs)
    emos = "".join(f'<figure class="emo" style="--i:{i}"><img src="{A}companion-emotions/47-{e}.webp" alt="Companion feeling {e}" loading="lazy"><figcaption>{e}</figcaption></figure>' for i, e in enumerate(EMOTIONS))
    feats = "".join(f'<div class="glass holo feat" data-reveal style="--i:{i % 3}" data-tilt="6"><span class="num holo-text">{i + 1:02d}</span><h3>{esc(t)}</h3><p>{esc(d)}</p></div>' for i, (t, d) in enumerate(FEATURES))
    beasts = "".join(f"<span class='chip'>{b}</span>" for b in BEASTS)
    items = "".join(f'<img src="{A}items/{n}.png" alt="{n.replace("_", " ")}" class="float" style="--i:{i}" loading="lazy">' for i, n in enumerate(["party_hat", "starlight_halo", "star_scepter", "robo_helper", "hot_spring", "wise_tree"]))
    tiles = "".join(f'<div class="frame holo" data-tilt="8" style="aspect-ratio:1"><img src="{A}realm-tiles/home_{n}.png" alt="{n} realm" loading="lazy" style="image-rendering:pixelated"></div>' for n in ["volcano", "ice", "sea", "forest"])
    ranks = "".join(f"<div class='rk' style='--i:{i}'>{r}</div>" for i, r in enumerate(["C", "B", "A", "S", "SS", "SSS"]))
    return f"""
<style>
.arena-hero .stage{{height:min(72vh,660px)}}
.puck{{position:relative;width:min(340px,70vw);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 25%,#3a3550,#14121f 60%,#08070d);box-shadow:inset 0 -18px 40px #000a,inset 0 6px 14px #ffffff22,0 40px 90px -20px #000,0 0 calc(30px + var(--beat)*80px) #6ff3ff55;display:grid;place-items:center;margin:auto}}
.puck::before{{content:"";position:absolute;inset:-10px;border-radius:50%;background:conic-gradient(from var(--a),#ff5a1f,#38e0e0,#7fd4ff,#a9805a,#f4d92b,#2e86ff,#9b4fd6,#ff5a1f);filter:blur(14px);opacity:.55;z-index:-1;animation:ringSpin 6s linear infinite}}
@keyframes ringSpin{{to{{--a:360deg}}}}
.puck .screen{{width:58%;aspect-ratio:1;border-radius:18px;overflow:hidden;background:#000;box-shadow:0 0 0 6px #0b0a12,0 0 0 7px #ffffff22}}
.puck .screen img{{width:100%;height:100%;object-fit:cover;image-rendering:pixelated}}
.puck .mic{{position:absolute;bottom:9%;width:22%;height:6px;border-radius:6px;background:repeating-linear-gradient(90deg,#000 0 4px,#2a2838 4px 8px)}}
.ringwrap{{position:relative;width:min(520px,86vw);aspect-ratio:1;margin:auto}}
.ringwrap .node{{--r:min(210px,34vw);position:absolute;left:50%;top:50%;width:104px;height:104px;margin:-52px;border-radius:50%;display:grid;place-items:center;align-content:center;background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--c) 45%,transparent),rgba(10,10,20,.8) 70%);border:1px solid color-mix(in srgb,var(--c) 60%,transparent);transform:rotate(calc(var(--k)*60deg - 90deg)) translate(var(--r)) rotate(calc(var(--k)*-60deg + 90deg));transition:box-shadow .3s,scale .3s;color:#fff}}
.ringwrap .node i{{font-style:normal;font-size:30px;filter:drop-shadow(0 0 10px var(--c))}}
.ringwrap .node b{{font-family:var(--display);letter-spacing:.1em;text-transform:uppercase;font-size:13px}}
.ringwrap .node.on{{scale:1.15;box-shadow:0 0 40px var(--c)}}.ringwrap .node.prey{{scale:.92;opacity:.65}}.ringwrap .node.pred{{box-shadow:0 0 0 3px #ff4d5e}}
.ringwrap svg{{position:absolute;inset:0;width:100%;height:100%;overflow:visible}}
.ringwrap .core{{position:absolute;left:50%;top:50%;translate:-50% -50%;text-align:center;width:200px}}
.ringwrap .core b{{font-family:var(--display);font-size:54px;line-height:1;display:block}}
.feats{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}}
.feat{{padding:28px}}.feat .num{{font-family:var(--display);font-size:42px;font-weight:700}}.feat h3{{font-size:26px;margin:8px 0 10px}}.feat p{{color:var(--ink2);font-size:16px}}
.emos{{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}}
.emo{{width:118px;text-align:center;animation:bob 3.2s ease-in-out infinite;animation-delay:calc(var(--i)*-.35s)}}
.emo img{{width:118px;height:118px;object-fit:contain;filter:drop-shadow(0 12px 18px #0008)}}
.emo figcaption{{font-family:var(--display);letter-spacing:.14em;text-transform:uppercase;font-size:12px;color:var(--muted)}}
@keyframes bob{{50%{{transform:translateY(-12px) rotate(-3deg)}}}}
.beasts img{{transition:opacity .2s}}
.chips{{display:flex;flex-wrap:wrap;gap:8px}}
.float{{position:absolute;width:clamp(70px,9vw,120px);animation:bob 4s ease-in-out infinite;animation-delay:calc(var(--i)*-.6s);filter:drop-shadow(0 16px 20px #000a)}}
.ranks{{display:flex;gap:10px;align-items:flex-end;margin-top:24px}}
.rk{{flex:1;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:28px;border-radius:14px;height:calc(50px + var(--i)*22px);background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.03));border:1px solid var(--line)}}
.rk:last-child{{background:var(--holo);background-size:200% 100%;animation:holoShift 5s linear infinite;color:#0a0a12;box-shadow:0 0 40px #ff6fd888}}
.steps .card{{padding:30px}}.steps .card .n{{font-family:var(--display);font-size:90px;line-height:1;font-weight:700}}
.rules{{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}}.rules .glass{{padding:24px}}.rules h3{{font-size:24px;margin-bottom:8px}}.rules p{{color:var(--ink2);font-size:16px}}
@media(max-width:700px){{.rules{{grid-template-columns:1fr}}}}
</style>

<section class="hero arena-hero">
  <div class="wrap hero-grid">
    <div>
      <span class="chip live" data-reveal>Winner · Agentic AI Build Week 2026</span>
      <h1 class="h-xl" style="margin-top:18px" data-split>A creature that <span class="holo-text">talks, feels</span> and remembers.</h1>
      <p class="lede" data-reveal style="--i:3">Elemental Arena turns a palm-sized puck into a one-of-a-kind AI companion: a conversational assistant, a storyteller, and a fighter that duels other players in real time, narrating every round out loud. Browser players fight in the same arena with no hardware at all.</p>
      <div class="btn-row" data-reveal style="--i:4;margin-top:30px">
        <a class="btn" href="{LIVE}/create" target="_blank" rel="noopener">Create your companion {ICON['arrow']}</a>
        <a class="btn ghost" href="/games/?wl=elemental-arena#waitlist">Join the waitlist</a>
        <a class="btn ghost" href="#how">How it works</a>
      </div>
    </div>
    <div class="stage" aria-hidden="true">
      <div class="layer" data-depth=".4" style="left:50%;top:50%;translate:-50% -50%"><div class="puck"><div class="screen"><img src="{A}beasts-gifs/beast1_idle.gif" alt=""></div><div class="mic"></div></div></div>
      <div class="layer frame holo" data-depth="1.1" style="left:0;top:4%;width:30%;aspect-ratio:1"><img src="{A}beasts-gifs/beast21_attack.gif" alt="" style="image-rendering:pixelated"></div>
      <div class="layer frame holo" data-depth=".9" style="right:0;bottom:6%;width:30%;aspect-ratio:1"><img src="{A}beasts-gifs/beast3_attack.gif" alt="" style="image-rendering:pixelated"></div>
      <img class="layer" data-depth="1.5" src="{A}companion-emotions/47-dancing.webp" alt="" style="right:4%;top:2%;width:22%">
      <img class="layer" data-depth="1.8" src="{A}companion-emotions/47-loving.webp" alt="" style="left:6%;bottom:2%;width:20%">
    </div>
  </div>
</section>

<section class="sec" style="padding-top:20px"><div class="wrap">
  <div class="glass edge" style="padding:clamp(28px,4vw,56px)" data-reveal="zoom">
    <div class="row2">
      <div><span class="kicker">The win</span><h2 class="h-md" style="margin:14px 0" data-split>Winner, Robotics &amp; Physical AI track</h2>
        <p class="lede">Agentic AI Build Week 2026 by GenAI Fund in Ho Chi Minh City, 8 to 12 July 2026, the largest buildathon held in ASEAN. Covered by Nhân Dân, VietnamPlus, CafeF and vietnam.vn.</p></div>
      <div class="stats" style="grid-template-columns:1fr 1fr">
        <div class="stat glass holo"><b data-count="3000" data-suffix="+">3,000+</b><span>builders</span></div>
        <div class="stat glass holo"><b data-count="400" data-suffix="+">400+</b><span>projects</span></div>
        <div class="stat glass holo"><b>1st</b><span>Robotics &amp; Physical AI</span></div>
        <div class="stat glass holo"><b data-count="7">7</b><span>elements to master</span></div>
      </div>
    </div>
  </div>
</div></section>

<section class="sec"><div class="wrap row2">
  <div>{sec_head("Two lives", "One puck. <span class=holo-text>A friend and a fighter.</span>", "Say its name and it wakes up: it tells a story, runs a quiz in your language, remembers what you talked about yesterday, or looks at what you're holding. Say &quot;start a battle&quot; and the same device becomes a fighter: its beast appears on screen, an AI strategist plans each round, and it narrates the fight while your opponent's puck, across the table or across the world, narrates the other side.")}
    <ul class="list"><li>240x240 screen where the beast lives, microphone and speaker</li><li>Wake word on device, updates over WiFi, no app needed</li><li>Messages to friends: &quot;tell Frost I said hi&quot;</li><li>Camera build that can see what you're holding</li></ul></div>
  <div data-reveal="zoom"><div class="puck" style="width:min(420px,80vw)"><div class="screen"><img src="{A}beasts-gifs/beast6_attack.gif" alt="A beast attacking on the puck's screen"></div><div class="mic"></div></div></div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap">
  {sec_head("It really feels", "Over 40 hand-drawn <span class=holo-text>expressions.</span>", "It laughs at your jokes, cries when it's sad, dances when it wins and sulks after a lost battle. You see every feeling on its face.")}
  <div class="emos" data-reveal>{emos}</div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap">
  {sec_head("Everything it can do", "A companion, an assistant <span class=holo-text>and a game.</span>")}
  <div class="feats">{feats}</div>
</div></section>

<section class="hscroll" id="how" style="--n:4"><div class="pin">
  <div class="wrap" style="margin-bottom:34px">{sec_head("How it works", "Four steps <span class=holo-text>to your companion.</span>", "", "h-lg")}</div>
  <div class="rail steps">
    <div class="card glass edge"><span class="n holo-text">01</span><h3 class="h-sm" style="margin:10px 0">Pair your puck</h3><p class="muted">One step puts Elemental Arena on the device. It shows a pairing code: type it in and the puck is yours. No puck? Play in the browser.</p><div class="frame" style="margin-top:18px;aspect-ratio:16/9"><img src="{A}landing-desktop-1440.webp" alt="The Elemental Arena home page" loading="lazy" style="object-position:top"></div></div>
    <div class="card glass edge"><span class="n holo-text">02</span><h3 class="h-sm" style="margin:10px 0">Summon a character</h3><p class="muted">Pick an element, a beast and a temperament. The arena forges a one-of-a-kind companion with its own art, voice, lore and signature moves.</p><div class="frame" style="margin-top:18px;aspect-ratio:16/9"><img src="{A}create-desktop-1440.webp" alt="Creating a companion" loading="lazy" style="object-position:top"></div></div>
    <div class="card glass edge"><span class="n holo-text">03</span><h3 class="h-sm" style="margin:10px 0">Talk, play, battle</h3><p class="muted">Ask it anything, ask for a story, or say &quot;challenge Storm&quot; and let two minds duel. Win to climb the leaderboard.</p><div class="frame" style="margin-top:18px;aspect-ratio:16/9"><img src="{A}guide-battle-demo-desktop-1440.webp" alt="A live battle from the game's own engine" loading="lazy" style="object-position:top"></div></div>
    <div class="card glass edge"><span class="n holo-text">04</span><h3 class="h-sm" style="margin:10px 0">Grow together</h3><p class="muted">It remembers you and levels up: Hatchling, Scout, Adventurer, Guardian, Champion, Sage, Legend.</p><div class="frame" style="margin-top:18px;aspect-ratio:16/9"><img src="{A}shop-desktop-1440.webp" alt="The artifact shop" loading="lazy" style="object-position:top"></div></div>
  </div>
</div></section>

<section class="sec"><div class="wrap row2">
  <div>{sec_head("Rock, paper, scissors with six hands", "Seven elements. <span class=holo-text>One ring.</span>", "Each element beats the next one around the circle: fire, ice, air, earth, lightning, water, then fire again. Hit someone you're strong against for x1.75 damage, someone you're weak against for x0.67. Poison is the odd one out: strong against water and earth, weak against fire and air, and nothing is strong against it.")}
    <p class="muted" data-reveal>Tap an element to see what it beats.</p></div>
  <div class="ringwrap" data-ring data-reveal="zoom">
    <svg viewBox="-260 -260 520 520" aria-hidden="true"><circle r="210" fill="none" stroke="url(#rg)" stroke-width="2" stroke-dasharray="6 10"/><defs><linearGradient id="rg"><stop offset="0" stop-color="#6ff3ff"/><stop offset=".5" stop-color="#a98bff"/><stop offset="1" stop-color="#ff6fd8"/></linearGradient></defs></svg>
    {ring}
    <div class="core"><b class="holo-text" data-ring-mult>x1.75</b><span class="muted" data-ring-text>Fire burns ice</span><div style="margin-top:10px"><span class="chip" style="border-color:#9b4fd6">☠️ Poison: venom, 1 damage a round for 2 rounds</span></div></div>
  </div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap">
  {sec_head("Beasts", "Twenty-five beasts. <span class=holo-text>No two alike.</span>", "Every beast is generated: species, stats, personality, art and voice, plus a parts roll for crest, armour, natural weapon, aura, stance and eye glow. Hover a beast to see it attack.")}
  <div class="beasts" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))" data-reveal>{gal}</div>
  <div class="chips" style="margin-top:26px" data-reveal>{beasts}</div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap row2 rev">
  <div class="pip" data-reveal="zoom"><div class="main frame holo" data-tilt="5"><img src="{A}guide-battle-demo-desktop-1440.webp" alt="A battle played live by the game's engine" loading="lazy" style="object-position:top"></div><div class="inset frame holo" data-depth=".6" style="aspect-ratio:1;width:34%"><img src="{A}beasts-gifs/beast7_attack.gif" alt="" style="image-rendering:pixelated"></div></div>
  <div>{sec_head("The Momentum Duel", "Plan together. <span class=holo-text>Strike together.</span>", "Both players plan at the same time. By voice you just say &quot;start a battle&quot; and the AI strategist plans and narrates every round.", "h-md")}
    <div class="rules">
      <div class="glass holo" data-tilt="5"><h3>Energy</h3><p>Every round each creature spends energy on attacks and guards. More energy, harder hit. Swift fighters get more, tough ones get more health.</p></div>
      <div class="glass holo" data-tilt="5"><h3>Guards</h3><p>A guard softens a hit, never by more than three quarters. At least 1 damage always gets through.</p></div>
      <div class="glass holo" data-tilt="5"><h3>Momentum</h3><p>Clean hits fill the bar. At 100 your creature fires its Ultimate by itself, for about double damage.</p></div>
      <div class="glass holo" data-tilt="5"><h3>Sudden death</h3><p>Nobody goes home with a draw. Past the round cap both drop to 6 health and the next clean hit ends it.</p></div>
    </div></div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap row2">
  <div>{sec_head("Realm, artifacts and ranks", "Collect. Merge. <span class=holo-text>Ascend.</span>", "Your companion lives in a realm shaped by its element. Fifty-four things to find: wearables that become part of your companion forever when merged, its art redrawn wearing them, and artifacts that turn its land into a home. Ranks climb from C to legendary SSS, and the bonus is deliberately small: buying things never simply buys wins.")}
    <div class="ranks" data-reveal>{ranks}</div></div>
  <div style="position:relative" data-reveal="zoom"><div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">{tiles}</div><div style="position:absolute;inset:0;pointer-events:none">{items.replace('class="float"', 'class="float"')}</div></div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap">
  <div class="bento">
    <div class="glass edge t-6" style="padding:34px" data-reveal><span class="kicker">For parents</span><h3 class="h-sm" style="margin:12px 0">Parents stay in control</h3><ul class="list"><li>Pick exactly what each companion can do; unchecked abilities are hidden entirely</li><li>Email, messaging and calendar are off for kids by default</li><li>Bedtime mode: it speaks softly, offers sleepy stories and won't start chats</li><li>Topic controls</li></ul></div>
    <div class="glass edge t-6" style="padding:34px" data-reveal style="--i:1"><span class="kicker">Privacy</span><h3 class="h-sm" style="margin:12px 0">Bring your own brain</h3><ul class="list"><li>Runs on your own AI key: OpenAI, Anthropic, Gemini or open-source models</li><li>Your data, your model, your privacy</li><li>Fully bilingual in English and Russian, switching mid-sentence</li><li>A new bedtime story every night, in its own voice</li></ul></div>
  </div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap">
  <div class="glass edge" style="padding:clamp(30px,5vw,70px);text-align:center" data-reveal="zoom">
    <span class="kicker">Meet yours first</span>
    <h2 class="h-lg" style="margin:18px 0" data-split>Summon your companion.</h2>
    <p class="lede" style="margin:0 auto 30px">Play in the browser today. The puck hardware is being finished: join the waitlist to be first in line.</p>
    <div class="btn-row" style="justify-content:center"><a class="btn" href="{LIVE}/create" target="_blank" rel="noopener">Create your companion {ICON['arrow']}</a><a class="btn ghost" href="/games/?wl=elemental-arena#waitlist">Join the waitlist</a><a class="btn ghost" href="{LIVE}/guide" target="_blank" rel="noopener">Read the guide</a><a class="btn ghost" href="{LIVE}/flash" target="_blank" rel="noopener">I already have a puck</a></div>
  </div>
</div></section>"""
