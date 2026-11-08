/* Road to 2028 — EU funding clinic app (Buinho · Vulca 2026). Vanilla JS, offline-first. */
(function () {
  'use strict';
  var D = window.VULCA || { projects: [], actions: [], pillars: [], post2027: null, lessons: [], whys: [] };
  var app = document.getElementById('app');
  var KEY = 'vulca-clinic-v2';

  /* ---------- state ---------- */
  function blank() { return { lab: { code: '', name: '', country: '', exp: '', domains: [], needs: [], vision: '', cap: {}, targets: [] }, fav: [], path: [], questions: [], road: { ms: [], ready: {}, review: '', init: false } }; }
  var S = load() || blank();
  (function () { if (S.lab && !S.lab.targets) S.lab.targets = S.lab.target ? [S.lab.target] : []; if (!S.road) S.road = blank().road; var b = blank().lab; Object.keys(b).forEach(function (k) { if (S.lab[k] == null) S.lab[k] = b[k]; }); if (S.fav.length > 5) S.fav = S.fav.slice(0, 5); var r = S.road.ready || {}, nr = {}; Object.keys(r).forEach(function (k) { if (/^\d+$/.test(k)) { if (S.path[+k]) nr[S.path[+k].project] = r[k]; } else nr[k] = r[k]; }); S.road.ready = nr; delete S.told; })();
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY)); return s && s.fav ? s : null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function byId(list, id) { for (var i = 0; i < (list || []).length; i++) if (list[i].id === id) return list[i]; return null; }
  function action(id) { return byId(D.actions, id); }
  function project(id) { return byId(D.projects, id); }
  function pillar(id) { return byId(D.pillars, id); }
  function famLabel(f) { return (D.familyLabels || {})[f] || f; }
  function pfam(p) { var a = action(p.action); return p.family || (a ? a.family : 'national'); }
  function ppil(p) { var a = action(p.action); return a ? pillar(a.pillar) : null; }
  function list(arr) { return (arr || []).filter(Boolean); }
  function para(t) { return t ? '<p>' + esc(t) + '</p>' : ''; }
  function sec(label, html) { return html ? '<div class="sec"><div class="lab">' + esc(label) + '</div>' + html + '</div>' : ''; }
  function ul(arr) { arr = list(arr); return arr.length ? '<ul>' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
  function link(u, t) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(t || u) + '</a>'; }
  function isFav(id) { return S.fav.indexOf(id) > -1; }
  var MAXFAV = 5;
  function toast(t) { var el = document.getElementById('toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = t; el.className = 'show'; clearTimeout(toast.t); toast.t = setTimeout(function () { el.className = ''; }, 3200); }
  function toggleFav(id) { var i = S.fav.indexOf(id); if (i > -1) { S.fav.splice(i, 1); } else if (S.fav.length >= MAXFAV) { toast('You already have ' + MAXFAV + ' projects. Remove one star to add another.'); return; } else S.fav.push(id); save(); }
  var PR = D.priorities || { horizontal: [], sectors: {}, culture: { shorts: [], items: [] }, rules: [], future: { lines: [] }, reflect: [], links: [] };
  function prioOpts(p) {
    var o = PR.horizontal.map(function (h) { return { id: h.id, short: h.short, name: h.name, group: 'Horizontal' }; });
    if (p && p.action === 'crea') PR.culture.shorts.forEach(function (x, k) { o.push({ id: 'c-' + k, short: x, name: PR.culture.items[k], group: 'Creative Europe' }); });
    else if (p && p.action !== 'cerv') (S.lab.domains || []).forEach(function (d) { var sc = PR.sectors[d]; if (sc) sc.shorts.forEach(function (x, k) { o.push({ id: 's-' + d + '-' + k, short: x, name: sc.items[k], group: sc.field }); }); });
    return o;
  }
  function prioInfo(id) {
    var m = String(id).split('-');
    if (m[0] === 'h') { var h = byId(PR.horizontal, id); return h ? { short: h.short, name: h.name } : null; }
    if (m[0] === 'c') return PR.culture.items[+m[1]] ? { short: PR.culture.shorts[+m[1]], name: 'Creative Europe: ' + PR.culture.items[+m[1]] } : null;
    var sc = PR.sectors[m[1]]; return sc && sc.items[+m[2]] ? { short: sc.shorts[+m[2]], name: sc.field + ': ' + sc.items[+m[2]] } : null;
  }
  function prioList(st, full) { return (st.prio || []).map(prioInfo).filter(Boolean).map(function (x) { return full ? x.name : x.short; }); }
  function setTab(t) { var as = document.querySelectorAll('.tabs a'); for (var i = 0; i < as.length; i++) as[i].classList.toggle('on', as[i].getAttribute('data-tab') === t); }
  function render(html, tab, keepScroll) { var y = window.scrollY; app.innerHTML = html; setTab(tab || ''); window.scrollTo(0, keepScroll ? y : 0); }
  function famColor(f) { return { mobility: '#2364ff', cooperation: '#ff5050', culture: '#ffc850', volunteering: '#010101', national: '#d9d9d9', citizens: '#d9d9d9' }[f] || '#010101'; }
  function famText(f) { return (f === 'mobility' || f === 'volunteering') ? '#ffffff' : '#010101'; }

  /* ---------- fit to the lab's stage and needs; distance to each step ---------- */
  var FIT = { none: { now: ['ka122', 'youth', 'esc'], partner: ['ka210', 'ka220', 'crea', 'cerv'], later: ['ka1', 'youth-acc'] },
    partner: { now: ['ka122', 'youth', 'esc', 'ka210', 'cerv', 'ka1', 'youth-acc'], partner: ['ka220', 'crea'], later: [] },
    coordinator: { now: ['ka122', 'youth', 'esc', 'ka210', 'cerv', 'ka1', 'youth-acc', 'ka220', 'crea'], partner: [], later: [] } };
  var NEED_ACT = { team: ['ka122', 'ka1'], partners: ['youth', 'ka122', 'ka210'], test: ['ka210'], track: ['ka210', 'ka220'], young: ['youth', 'esc', 'youth-acc'], methods: ['ka122', 'ka220', 'ka1'], art: ['crea'], local: ['cerv', 'ka1', 'esc'] };
  var FIT_LABEL = { now: 'Fits your stage', partner: 'Join as partner first', later: 'A later step' };
  function fit(p) {
    var f = FIT[S.lab.exp], lvl = '';
    if (f) lvl = f.now.indexOf(p.action) > -1 ? 'now' : f.partner.indexOf(p.action) > -1 ? 'partner' : f.later.indexOf(p.action) > -1 ? 'later' : '';
    var needs = (S.lab.needs || []).filter(function (n) { return (NEED_ACT[n] || []).indexOf(p.action) > -1; }).map(function (n) { var w = byId(D.whys || [], n); return w ? w.label : n; });
    return { level: lvl, needs: needs, score: ({ now: 3, partner: 2, later: 1 }[lvl] || 0) + needs.length };
  }
  var REQ = { ka122: 'One organisation applies alone; you need hosts abroad for each activity.',
    youth: 'At least 2 organisations from different countries.',
    esc: 'A Quality Label first: free, and by 29 October to apply in February.',
    ka210: 'At least 2 organisations from 2 countries: a partner you trust abroad.',
    ka220: 'At least 3 organisations from 3 countries; the coordinator established for 2 years; above \u20ac60,000 its financial capacity can be checked.',
    crea: 'At least 3 organisations from 3 countries; the coordinator established for 2 years in the cultural sector; own funds for at least 20% of the costs.',
    ka1: 'At least 2 years of experience in the field and an Erasmus Plan for several years.',
    'youth-acc': 'Legally established and at least 2 years of experience in the youth field.',
    cerv: 'Your municipality or civil-society partners on board; calls run through the EU Funding & Tenders Portal.' };
  function distance(i) {
    var st = steps(), p = project(st[i].project), f = fit(p), out = [];
    if (REQ[p.action]) out.push('It asks for: ' + REQ[p.action]);
    if (f.level === 'partner') out.push('From where you are: join someone else\u2019s project as partner first, or keep coordinating this for later.');
    if (f.level === 'later') out.push('From where you are: build experience first, with a short mobility or a small partnership.');
    if (i > 0) { var q = project(st[i - 1].project); if (pfam(q) === 'mobility' && (pfam(p) === 'cooperation' || pfam(p) === 'culture')) out.push('Step ' + i + ' can give you the partners this step needs: invite them.'); if (fit(q).score < f.score - 1) out.push('Check the order: this step fits you better than step ' + i + '.'); }
    if (!f.level && !S.lab.exp) out.push('Tell the app your experience (start screen) to see how far this step is from where you are.');
    return out;
  }

  /* ---------- home ---------- */
  function home() {
    var l = S.lab;
    render(
      '<section class="hero"><div class="kicker">EU funding policy clinic</div>' +
      '<h1 class="h1">Find your lab\'s step on the road to 2028</h1>' +
      '<p>You leave with a short guide for your lab\'s next EU steps: what fits you now, in which order, what Europe looks for, and where to ask. Keep it for your next applications, long after Cuenca.</p></section>' +
      '<ol class="steps">' +
      '<li><div><b>Where you stand</b> and what your lab needs. <span class="muted">Just below.</span></div></li>' +
      '<li><div><b>Where you want to be</b> in 2030. <span class="muted">Your strategy, in one sentence.</span></div></li>' +
      '<li><div><b>Choose your reference projects:</b> star up to 5 that interest you. <span class="muted">Then 3 short questions for each, in My path.</span></div></li>' +
      '<li><div><b>Your roadmap:</b> what your lab must build to get there.</div></li>' +
      '<li><div><b>Your guidelines:</b> download them and keep them for your next applications.</div></li>' +
      '</ol>' +
      '<h2 class="h2">1 \u00b7 Where you stand</h2><p class="muted">It stays on this phone. It is only used to write your guide.</p>' +
      '<label class="f" for="name">Lab name</label><input type="text" id="name" maxlength="80" value="' + esc(l.name) + '">' +
      '<label class="f" for="country">Country</label><input type="text" id="country" maxlength="40" value="' + esc(l.country) + '">' +
      '<div class="f lab" style="margin-top:16px">Experience with EU projects</div>' +
      '<div class="chips" data-group="exp">' + [['none', 'Never applied'], ['partner', 'Partner before'], ['coordinator', 'Coordinated before']].map(function (o) { return '<button class="chip" data-v="' + o[0] + '" aria-pressed="' + (l.exp === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="capbox"><h3 class="h3">What you have today</h3><p class="small">Rate each one. <b>1 = little</b> (you have not done it yet) \u00b7 <b>2 = some</b> (you have done it once or twice) \u00b7 <b>3 = solid</b> (you do it well and often). Your guidelines give advice for each level.</p>' +
      (D.capacities || []).map(function (c) { var v = l.cap[c.id] || 0; return '<div class="caprow"><span>' + esc(c.label) + '</span><span class="chips" data-cap="' + c.id + '">' + [1, 2, 3].map(function (n) { return '<button class="chip dot' + (n <= v ? ' on' : '') + '" data-v="' + n + '" aria-pressed="' + (n === v) + '" aria-label="' + esc(c.label) + ' ' + n + '">' + n + '</button>'; }).join('') + '</span></div>'; }).join('') + '</div>' +
      '<div class="f lab">Who you work with</div>' +
      '<div class="chips" data-group="domains">' + (D.domains || []).map(function (d) { return '<button class="chip" data-v="' + esc(d.id) + '" aria-pressed="' + (l.domains.indexOf(d.id) > -1) + '">' + esc(d.label) + '</button>'; }).join('') + '</div>' +
      '<div class="f lab">What your organisation needs most (up to 3)</div>' +
      '<div class="chips" data-group="needs">' + (D.whys || []).map(function (w) { return '<button class="chip" data-v="' + esc(w.id) + '" aria-pressed="' + (l.needs.indexOf(w.id) > -1) + '">' + esc(w.label) + '</button>'; }).join('') + '</div>' +
      '<h2 class="h2">2 \u00b7 Where you want to be</h2><p class="muted">EU projects should serve your lab\'s plans, not the other way round.</p>' +
      '<label class="f" for="vision">Your lab in 2030, in one sentence</label><input type="text" id="vision" maxlength="160" placeholder="What will you be known for, and for whom?" value="' + esc(l.vision) + '">' +
      '<div class="f lab" style="margin-top:12px">Your role in EU projects by 2030 <span class="muted" style="text-transform:none;letter-spacing:0">(one or more)</span></div><div class="chips" data-group="target">' + (D.targets || []).map(function (t) { return '<button class="chip" data-v="' + t.id + '" aria-pressed="' + (l.targets.indexOf(t.id) > -1) + '">' + esc(t.label) + '</button>'; }).join('') + '</div>' +
      '<div class="row" style="margin-top:18px"><a class="btn blue" href="#/cards">3 \u00b7 Choose your reference projects</a></div><p class="muted" style="margin-top:10px">Background, when you need it: <a href="#/actions">the 2028 map</a> \u00b7 <a href="#/priorities">priorities in plain words</a></p>', 'home');
    ['name', 'country'].forEach(function (k) { document.getElementById(k).addEventListener('input', function (e) { S.lab[k] = e.target.value; save(); }); });
    chipGroup('exp', function (v) { S.lab.exp = S.lab.exp === v ? '' : v; save(); home(); });
    document.getElementById('vision').addEventListener('input', function (e) { S.lab.vision = e.target.value; save(); });
    chipGroup('needs', function (v, b) { var i = S.lab.needs.indexOf(v); if (i > -1) S.lab.needs.splice(i, 1); else if (S.lab.needs.length < 3) S.lab.needs.push(v); else return; b.setAttribute('aria-pressed', i < 0); save(); });
    chipGroup('target', function (v, b) { var i = S.lab.targets.indexOf(v); if (i > -1) S.lab.targets.splice(i, 1); else S.lab.targets.push(v); b.setAttribute('aria-pressed', i < 0); save(); });
    app.querySelectorAll('[data-cap]').forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var c = box.dataset.cap, n = +b.dataset.v; S.lab.cap[c] = S.lab.cap[c] === n ? 0 : n; save(); box.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', +x.dataset.v <= S.lab.cap[c]); x.setAttribute('aria-pressed', +x.dataset.v === S.lab.cap[c]); }); }); });
    chipGroup('domains', function (v, b) { var i = S.lab.domains.indexOf(v); if (i > -1) S.lab.domains.splice(i, 1); else S.lab.domains.push(v); b.setAttribute('aria-pressed', i < 0); save(); });
  }
  function chipGroup(group, fn) {
    var box = app.querySelector('[data-group="' + group + '"]'); if (!box) return;
    box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) fn(b.getAttribute('data-v'), b); });
  }

  /* ---------- cards ---------- */
  var F = { dom: '', fam: '', mine: false, src: '' };
  function cardHTML(p) {
    var f = pfam(p), pl = ppil(p), fav = isFav(p.id);
    return '<article class="card' + (fav ? ' is-fav' : '') + '">' +
      '<button class="fav" data-fav="' + esc(p.id) + '" aria-pressed="' + fav + '" aria-label="' + (fav ? 'Remove from my cards' : 'Add to my cards') + '">' + (fav ? '★' : '☆') + '</button>' +
      '<a href="#/p/' + esc(p.id) + '">' +
      '<div class="blk fam-' + f + '"><div class="prog">' + esc(pl ? pl.label + ' · 2028' : '') + '</div>' +
      '<div class="code">' + esc(famLabel(f)) + '</div><div class="dom">' + esc(p.domain) + '</div></div>' +
      '<div class="body">' + fitHTML(p) + '<div class="srcl">' + (p.external ? 'Other lab · ' + esc(p.coordinator ? p.coordinator.country : '') + (p.goodPractice ? ' · ★ good practice' : '') : 'Buinho project' + (p.goodPractice ? ' · ★ good practice' : '')) + '</div><div class="name">' + esc(p.name) + '</div><p class="obj">' + esc(p.objective) + '</p>' +
      '<div class="today">Today: ' + esc(p.today) + '</div>' +
      '<div class="meta"><span>' + esc(p.role) + '</span><span>' + esc(p.partnership ? p.partnership.size : '') + '</span><span>' + esc(p.years) + '</span></div></div></a></article>';
  }
  function fitHTML(p) { var f = fit(p); if (!f.level && !f.needs.length) return ''; return '<div class="fit">' + (f.level ? '<span class="fit-' + f.level + '">' + FIT_LABEL[f.level] + '</span>' : '') + (f.needs.length ? '<span class="fit-need">Your need: ' + esc(f.needs.join(', ')) + '</span>' : '') + '</div>'; }
  function bindFavs(rerender) {
    app.querySelectorAll('[data-fav]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); toggleFav(b.dataset.fav); rerender(); }); });
  }
  function cards() {
    var doms = []; D.projects.forEach(function (p) { if (doms.indexOf(p.domain) < 0) doms.push(p.domain); });
    var fams = []; D.projects.forEach(function (p) { var f = pfam(p); if (fams.indexOf(f) < 0) fams.push(f); });
    var ps = D.projects.filter(function (p) { return (!F.dom || p.domain === F.dom) && (!F.fam || pfam(p) === F.fam) && (!F.mine || isFav(p.id)) && (!F.src || (F.src === 'ext') === !!p.external); });
    if (S.lab.exp || S.lab.needs.length) ps = ps.map(function (p, k) { return [fit(p).score, k, p]; }).sort(function (a, b) { return b[0] - a[0] || a[1] - b[1]; }).map(function (x) { return x[2]; });
    render(
      '<div class="kicker">Buinho · 2016–2028</div><h1 class="h1">The projects</h1>' +
      '<div class="chips" data-group="src">' + [['buinho', 'Buinho projects'], ['ext', 'Other labs in Europe']].map(function (o) { return '<button class="chip" data-v="' + o[0] + '" aria-pressed="' + (F.src === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<p class="lead">All the projects are here. Star up to 5 that look like your next step: they become your reference projects. The ones that fit where you stand come first, with a badge.</p>' + (S.fav.length > MAXFAV ? '<p class="advice">You have ' + S.fav.length + ' starred: keep the 5 that matter most.</p>' : '') +
      '<div class="chips" data-group="dom">' + doms.map(function (d) { return '<button class="chip" data-v="' + esc(d) + '" aria-pressed="' + (F.dom === d) + '">' + esc(d) + '</button>'; }).join('') + '</div>' +
      '<div class="chips" data-group="fam">' + fams.map(function (f) { return '<button class="chip f-' + f + '" data-v="' + f + '" aria-pressed="' + (F.fam === f) + '">' + esc(famLabel(f)) + '</button>'; }).join('') +
      '<button class="chip" data-v="mine" aria-pressed="' + F.mine + '">★ My cards (' + S.fav.length + ' of ' + MAXFAV + ')</button></div>' +
      (ps.length ? '<div class="grid">' + ps.map(cardHTML).join('') + '</div>' : '<div class="empty">' + (F.mine ? 'No starred cards yet.' : 'No project with this filter.') + '</div>') +
      (S.fav.length ? '<div class="row" style="margin-top:18px"><a class="btn blue" href="#/path">Build my path with ' + S.fav.length + ' card' + (S.fav.length > 1 ? 's' : '') + '</a></div>' : ''), 'cards', true);
    chipGroup('dom', function (v) { F.dom = F.dom === v ? '' : v; cards(); });
    chipGroup('src', function (v) { F.src = F.src === v ? '' : v; cards(); });
    chipGroup('fam', function (v) { if (v === 'mine') F.mine = !F.mine; else F.fam = F.fam === v ? '' : v; cards(); });
    bindFavs(cards);
  }

  function projectView(id) {
    var p = project(id); if (!p) return cards();
    var a = action(p.action), f = pfam(p), pl = ppil(p), P = p.partnership || {}, fav = isFav(p.id);
    render(
      '<a class="back" href="#/cards">← All projects</a>' +
      '<div class="sheet-head fam-' + f + '"><div class="lab" style="color:inherit">' + esc(pl ? pl.label + ' · ' + pl.name : famLabel(f)) + '</div><div class="code">' + esc(famLabel(f)) + '</div><div class="name">' + esc(p.name) + '</div></div>' +
      '<div class="facts">' +
      '<div><div class="lab">Sector</div><div class="v">' + esc(p.domain) + '</div></div>' +
      (p.external ? '<div><div class="lab">Coordinator</div><div class="v">' + esc(p.coordinator ? p.coordinator.name + ' (' + p.coordinator.country + ')' : '') + '</div></div>' : '<div><div class="lab">Buinho\'s role</div><div class="v">' + esc(p.role) + '</div></div>') +
      '<div><div class="lab">Years</div><div class="v">' + esc(p.years) + '</div></div>' +
      '<div><div class="lab">Today</div><div class="v">' + esc(p.today) + '</div></div>' +
      (p.goodPractice ? '<div><div class="lab">Recognition</div><div class="v">Erasmus+ good practice</div></div>' : '') +
      '</div>' +
      '<div class="row" style="margin:16px 0"><button class="btn' + (fav ? ' ghost' : ' blue') + '" data-fav="' + esc(p.id) + '">' + (fav ? '★ In my cards' : '☆ Add to my cards') + '</button></div>' +
      sec('What it was for', para(p.objective)) +
      (p.formPrio && p.formPrio.length ? sec('Priorities in the application, and why', para(p.formPrio.join(' \u00b7 ')) + para(p.prioWhy)) : '') +
      sec(p.external ? 'What they did' : 'What we did', para(p.did)) +
      (p.whyMakers ? '<div class="blockq"><div class="lab">Why it matters for a lab</div>' + para(p.whyMakers) + '</div>' : '') +
      (p.url ? sec('Official page', '<p>' + link(p.url, p.number ? 'Project ' + p.number : 'Project page') + (p.extraUrl ? ' · ' + link(p.extraUrl, 'project website') : '') + '</p>') : '') +
      '<div class="partner"><div class="lab">The partnership</div>' +
      '<div class="pgrid"><div><div class="k">Partners</div><div>' + esc(P.size) + (list(P.countries).length ? ' · ' + esc(P.countries.join(' ')) : '') + '</div></div>' +
      '<div><div class="k">Who brings what</div><div>' + esc(P.roles) + '</div></div>' +
      '<div><div class="k">Money</div><div>' + esc(P.money) + '</div></div></div></div>' +
      sec('What it took to get there', para(p.needed)) +
      sec('What it left us', para(p.left)) +
      (p.lesson ? '<div class="blockq"><div class="lab">Lesson</div>' + para(p.lesson) + '</div>' : '') +
      (a ? sec('After 2027', para(a.future) + '<p><a href="#/a/' + esc(a.id) + '">How this kind of action works →</a></p>') : ''), 'cards');
    bindFavs(function () { projectView(id); });
  }

  /* ---------- actions: the 2028 map ---------- */
  function actions() {
    var html = '<div class="kicker">After 2027</div><h1 class="h1">The 2028 map</h1>' +
      '<p class="lead">The programmes are being redesigned. Key actions give way to pillars; Creative Europe and CERV join in AgoraEU. Here is where today\'s actions are heading, according to the proposals.</p>';
    (D.pillars || []).forEach(function (pl) {
      var as = D.actions.filter(function (a) { return a.pillar === pl.id; });
      html += '<section class="pillar"><div class="pil-h"><div class="lab">' + esc(pl.programme) + '</div><h2>' + esc(pl.label) + ' · ' + esc(pl.name) + '</h2><p class="muted">' + esc(pl.today) + '</p></div>' +
        '<div class="alist">' + as.map(function (a) { return '<a class="aitem" href="#/a/' + esc(a.id) + '"><span class="sw fam-' + a.family + '">' + esc(a.short) + '</span><span class="tx"><b>' + esc(a.name) + '</b><span>' + esc(a.purpose) + '</span></span></a>'; }).join('') + '</div></section>';
    });
    html += (D.post2027 ? '<a class="aitem" style="margin-top:14px" href="#/2028"><span class="sw fam-volunteering">2028+</span><span class="tx"><b>' + esc(D.post2027.title) + '</b><span>' + esc(D.post2027.summary) + '</span></span></a>' : '') +
      '<h2 class="h2">Choosing partners</h2><p class="muted">What we look at before we write anything together.</p>' +
      '<div class="crit">' + list(D.partnerCriteria).map(function (c) { return '<div><b>' + esc(c.label) + '</b><p>' + esc(c.text) + '</p></div>'; }).join('') + '</div>';
    render(html, 'actions');
  }

  function actionView(id) {
    var a = action(id); if (!a) return actions();
    var ex = D.projects.filter(function (p) { return p.action === a.id; }), pl = pillar(a.pillar);
    render(
      '<a class="back" href="#/actions">← The 2028 map</a>' +
      '<div class="sheet-head fam-' + a.family + '"><div class="lab" style="color:inherit">' + esc(a.programme) + '</div><div class="code">' + esc(a.short) + '</div><div class="name">' + esc(a.name) + '</div></div>' +
      (a.future ? '<div class="notice"><b>' + esc(pl ? pl.label + ' · ' + pl.name : 'After 2027') + '.</b> ' + esc(a.future) + '</div>' : '') +
      sec('What it is for', para(a.purpose)) +
      sec('Who can apply', para(a.who)) +
      sec('Partners', para(a.partners)) +
      sec('Duration', para(a.duration)) +
      sec('Money', para(a.funding)) +
      sec('Where to apply', para(a.where)) +
      sec('Deadlines', para(a.deadlines)) +
      sec('As a first step?', para(a.firstStep)) +
      sec('What it builds in your organisation', para(a.builds)) +
      sec('Links', list(a.links).map(function (l) { return '<div>' + link(l.url, l.label) + '</div>'; }).join('')) +
      (ex.length ? '<h2 class="h2">At Buinho</h2><div class="grid">' + ex.map(cardHTML).join('') + '</div>' : '') +
      (a.sources && a.sources.length ? '<hr><div class="src">Checked: ' + esc(a.sources.join(' · ')) + '</div>' : ''), 'actions');
    bindFavs(function () { actionView(id); });
  }

  function post2027() {
    var P = D.post2027; if (!P) return actions();
    render(
      '<a class="back" href="#/actions">← The 2028 map</a><div class="kicker">After 2027</div><h1 class="h1">' + esc(P.title) + '</h1>' +
      '<div class="notice">' + esc(P.status) + '</div>' +
      list(P.sections).map(function (s) { return sec(s.label, para(s.text)); }).join('') +
      sec('How to prepare, without betting on details', ul(P.implications)) +
      sec('Sources', list(P.links).map(function (l) { return '<div>' + link(l.url, l.label) + '</div>'; }).join('')), 'actions');
  }

  /* ---------- path: built from starred cards ---------- */
  function whyChips(i, st) {
    var ch = function (w) { return '<button class="chip" data-v="' + esc(w.id) + '" aria-pressed="' + (st.why.indexOf(w.id) > -1) + '">' + esc(w.label) + '</button>'; };
    var mine = (D.whys || []).filter(function (w) { return S.lab.needs.indexOf(w.id) > -1; }), rest = (D.whys || []).filter(function (w) { return S.lab.needs.indexOf(w.id) < 0; });
    if (!mine.length) return '<div class="chips" data-why="' + i + '">' + rest.map(ch).join('') + '</div>';
    return '<div class="chips" data-why="' + i + '">' + mine.map(ch).join('') + '</div><details class="more"><summary>Something else</summary><div class="chips" data-why="' + i + '">' + rest.map(ch).join('') + '</div></details>';
  }
  function stepOf(id) { for (var i = 0; i < S.path.length; i++) if (S.path[i].project === id) return i; return -1; }
  function pathView() {
    syncPath();
    var html = '<div class="kicker">' + esc(S.lab.name || 'Your lab') + '</div><h1 class="h1">My path</h1>' +
      '<p class="lead">Your reference projects (up to ' + MAXFAV + '). Three short questions for each: your answers shape your guidelines.</p>';
    if (!S.path.length) html += '<div class="empty">No reference projects yet. <a href="#/cards">Star up to ' + MAXFAV + ' projects first.</a></div>';
    html += '<div class="stack">' + S.path.map(function (st, i) {
      var p = project(st.project); if (!p) return ''; var f = pfam(p), a = action(p.action);
      return '<div class="slot"><div class="step-h" style="border-left:6px solid ' + famColor(f) + ';padding-left:10px"><div class="muted small">Reference project ' + (i + 1) + ' · ' + esc(famLabel(f)) + (a ? ' · ' + esc(a.short) : '') + '</div><b style="font-size:18px"><a href="#/p/' + esc(p.id) + '">' + esc(p.name) + '</a></b>' +
        '<div><button class="mini" data-unfav="' + esc(p.id) + '">☆ Remove</button></div></div>' +
        '<div class="qn"><b>1 · When would you like to do something like this?</b></div><div class="chips" data-when="' + i + '">' + ['2027', '2028', 'Later'].map(function (w) { return '<button class="chip" data-v="' + w + '" aria-pressed="' + (st.when === w) + '">' + w + '</button>'; }).join('') + '</div>' +
        '<div class="qn"><b>2 · Which of your needs would it serve?</b></div>' + whyChips(i, st) +
        '<div class="qn"><b>3 · What are your doubts about a project like this?</b> <span class="muted small">Your guidelines answer them.</span></div><div class="chips" data-doubt="' + i + '">' + (D.doubtAspects || []).map(function (d) { return '<button class="chip" data-v="' + d.id + '" aria-pressed="' + (st.doubts.indexOf(d.id) > -1) + '">' + esc(d.label) + '</button>'; }).join('') + '</div>' +
        (st.q ? '<div class="qcard"><div class="q"><span>' + esc(st.q) + '</span><button aria-label="Remove question" data-dqr="' + i + '">×</button></div></div>'
          : '<div class="row" style="gap:8px;align-items:stretch"><input type="text" data-dq="' + i + '" maxlength="200" placeholder="Or write your own question about it (optional)" style="flex:1"><button class="btn" data-dqa="' + i + '">Add</button></div>') +
        '</div>';
    }).join('') + '</div>';
    html += '<h2 class="h2">Other questions</h2><p class="muted">Anything else you want to know about EU funding. Your guidelines answer from our experience.</p>' +
      '<div class="stack">' + S.questions.map(function (q, i) { return '<div class="qcard"><div class="q"><span>' + esc(q) + '</span><button aria-label="Remove question" data-rq="' + i + '">×</button></div></div>'; }).join('') + '</div>' +
      '<label class="f" for="nq">Your question</label><textarea id="nq" maxlength="300"></textarea><div class="row" style="margin-top:8px"><button class="btn" id="addq">Add</button></div>' +
      (D.questionPrompts && D.questionPrompts.length ? '<p class="muted" style="margin-top:14px">Questions newcomers often ask (tap to add):</p><div class="chips" data-group="qp">' + D.questionPrompts.map(function (q) { return '<button class="chip" data-v="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' : '') +
      '<hr><a class="btn blue" href="#/road">4 · My roadmap</a>';
    render(html, 'path', true);
    function bindChips(sel, fn) { app.querySelectorAll(sel).forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; fn(box, b); save(); }); }); }
    bindChips('[data-when]', function (box, b) { var st = S.path[+box.dataset.when]; st.when = st.when === b.dataset.v ? '' : b.dataset.v; box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === st.when); }); });
    bindChips('[data-why]', function (box, b) { var st = S.path[+box.dataset.why], v = b.dataset.v, k = st.why.indexOf(v); if (k > -1) st.why.splice(k, 1); else st.why.push(v); b.setAttribute('aria-pressed', k < 0); });
    bindChips('[data-doubt]', function (box, b) { var st = S.path[+box.dataset.doubt], v = b.dataset.v, k = st.doubts.indexOf(v); if (k > -1) st.doubts.splice(k, 1); else st.doubts.push(v); b.setAttribute('aria-pressed', k < 0); });
    function keepY(f) { var y = window.scrollY; f(); window.scrollTo(0, y); }
    function addDq(i) { var el = app.querySelector('[data-dq="' + i + '"]'), t = el ? el.value.trim() : ''; if (t) keepY(function () { S.path[i].q = t; save(); pathView(); }); }
    app.querySelectorAll('[data-dq]').forEach(function (el) { el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addDq(+el.dataset.dq); } }); });
    app.querySelectorAll('[data-dqa]').forEach(function (b) { b.addEventListener('click', function () { addDq(+b.dataset.dqa); }); });
    app.querySelectorAll('[data-dqr]').forEach(function (b) { b.addEventListener('click', function () { keepY(function () { S.path[+b.dataset.dqr].q = ''; save(); pathView(); }); }); });
    app.querySelectorAll('[data-unfav]').forEach(function (b) { b.addEventListener('click', function () { toggleFav(b.dataset.unfav); pathView(); }); });
    app.querySelectorAll('[data-rq]').forEach(function (b) { b.addEventListener('click', function () { keepY(function () { S.questions.splice(+b.dataset.rq, 1); save(); pathView(); }); }); });
    function addQ() { var t = document.getElementById('nq').value.trim(); if (t) keepY(function () { S.questions.push(t); save(); pathView(); var n = document.getElementById('nq'); if (n) n.focus(); }); }
    document.getElementById('addq').addEventListener('click', addQ);
    document.getElementById('nq').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addQ(); } });
    chipGroup('qp', function (v) { if (S.questions.indexOf(v) < 0) { S.questions.push(v); save(); pathView(); } });
  }

  /* ---------- guide / PDF ---------- */
  function steps() { syncPath(); return S.path.filter(function (s) { return project(s.project); }); }
  function syncPath() {
    if (S.fav.length > MAXFAV) S.fav = S.fav.slice(0, MAXFAV);
    var old = {}, changed = false; S.path.forEach(function (s) { old[s.project] = s; });
    var np = S.fav.filter(function (id) { return project(id); }).map(function (id) { var s = old[id] || { project: id, when: '', why: [] }; if (!s.doubts) s.doubts = []; if (s.q == null) s.q = ''; if (!s.why) s.why = []; return s; });
    if (np.map(function (s) { return s.project; }).join() !== S.path.map(function (s) { return s.project; }).join()) { changed = true; (S.road.ms || []).forEach(function (m) { m.manual = false; }); }
    S.path = np; if (changed) save();
  }
  function whyLabels(ids) { return (ids || []).map(function (id) { var w = byId(D.whys || [], id); return w ? w.label : id; }); }
  /* ---------- answers to the lab's own questions ---------- */
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9,\s-]/g, ' ').replace(/\s+/g, ' '); }
  var STOP = ['which', 'where', 'there', 'their', 'about', 'would', 'could', 'should', 'these', 'those', 'other', 'every', 'before', 'after', 'apply', 'still', 'really', 'cuando', 'donde', 'quando', 'onde', 'porque', 'pour', 'avec', 'quale', 'dove'];
  function answerFor(q) {
    var t = ' ' + norm(q) + ' ', scored = [], words = norm(q).split(' ').filter(function (w) { return w.length >= 5 && STOP.indexOf(w) < 0; });
    (D.answers || []).forEach(function (a) {
      var sc = 0; a.kw.forEach(function (k) { var nk = norm(k); if (t.indexOf(nk) > -1) sc += nk.length * (nk.indexOf(' ') > -1 ? 2 : 1); });
      /* weaker evidence: shared word stems */
      var st = {}; a.kw.forEach(function (k) { norm(k).split(' ').forEach(function (w) { if (w.length >= 5 && STOP.indexOf(w) < 0) st[w.slice(0, 5)] = 1; }); });
      words.forEach(function (w) { if (st[w.slice(0, 5)]) sc += 2; });
      if (sc >= 5) scored.push([sc, a]);
    });
    scored.sort(function (x, y) { return y[0] - x[0]; });
    var res = scored.map(function (x) { return x[1]; });
    if (/advance|adiant|adelant|prefinanc|pre-financ|cash|when .*pa(y|id)|quando pag|cuando pag|tesour|tesor/.test(t)) { var mA = byId(D.answers, 'money'); res = [mA].concat(res.filter(function (a) { return a !== mA; })); return res.slice(0, 2); }
    if (/\b(money|grant|budget|euro|euros|fund|funding|pay|paid|receive|cost|costs|how much|dinheiro|dinero|quanto|cuanto|argent|soldi|financ)/.test(t)) {
      var acts = []; ACT_WORDS.forEach(function (w) { if (w[0].test(t) && acts.indexOf(w[1]) < 0) acts.push(w[1]); });
      if (!acts.length) steps().forEach(function (s) { var p = project(s.project); if (p && acts.indexOf(p.action) < 0) acts.push(p.action); });
      var mo = acts.map(moneyAnswer).filter(Boolean);
      if (mo.length) return mo.slice(0, 2).concat(res.filter(function (a) { return a.id === 'money' || a.id === 'fincap'; })).slice(0, 3);
    }
    return res.slice(0, 2);
  }
  var ACT_WORDS = [[/volunt|solidarity|\besc\b|pocket money|quality label/, 'esc'], [/youth exchange|youth worker|ka152|ka153|intercambio/, 'youth'], [/accredit|acredit|ka120|ka121/, 'ka1'], [/\bka1\b|ka122|mobility|mobilidade|movilidad|job shadow|course|curso/, 'ka122'], [/ka210|small.scale|pequena escala|pequena parceria/, 'ka210'], [/ka220|cooperation partnership|parceria de coopera/, 'ka220'], [/creative europe|europa criativa|europa creativa|crea\b|culture/, 'crea'], [/cerv|town.twinning|geminac|hermanamiento/, 'cerv']];
  function moneyAnswer(act) {
    var m = (D.money || {})[act], a = action(act); if (!m) return null;
    return { id: 'm-' + act, topic: 'What your lab would receive: ' + (a ? a.short + ' \u00b7 ' + a.name : act), a: m.model, lines: m.lines, next: m.note, links: [{ label: 'Official rules (2026)', url: m.url }] };
  }
  var ANS_ACT = { accreditation: ['ka1', 'youth-acc'], youth2028: ['youth', 'esc'], volunteers: ['esc'], art: ['crea'], mobilitycosts: ['ka122', 'ka1'], fincap: ['ka220', 'crea'], rolechoice: ['ka220', 'crea'], partnersnum: ['ka210', 'ka220', 'crea'], caps: ['ka210', 'crea'], newcomer: ['ka210', 'ka122', 'youth'] };
  function pathLink(a) {
    var acts = ANS_ACT[a.id] || [], out = [];
    steps().forEach(function (s, i) { var p = project(s.project); if (p && acts.indexOf(p.action) > -1) out.push('step ' + (i + 1) + ' (' + famLabel(pfam(p)) + ', like ' + p.name + ')'); });
    return out.length ? 'This touches ' + out.join(' and ') + ' of your path.' : '';
  }

  var PROG = { ka122: 'erasmus', ka1: 'erasmus', youth: 'erasmus', 'youth-acc': 'erasmus', ka210: 'erasmus', ka220: 'erasmus', esc: 'esc', crea: 'crea', cerv: 'cerv' };

  /* personalised reading of the path: returns texts in priority order */
  function readings() {
    var T = (D.strategy || {}).readings || {}, out = [], st = steps();
    if (!st.length) return out;
    var ps = st.map(function (s) { return project(s.project); });
    var fams = ps.map(pfam), acts = ps.map(function (p) { return p.action; });
    var progs = {}; acts.forEach(function (a) { if (PROG[a]) progs[PROG[a]] = 1; });
    var whys = {}; st.forEach(function (s) { s.why.forEach(function (w) { whys[w] = 1; }); });
    var years = {}; st.forEach(function (s) { if (s.when) years[s.when] = (years[s.when] || 0) + 1; });
    function add(k) { if (T[k] && out.indexOf(T[k]) < 0) out.push(T[k]); }
    if (S.lab.exp === 'none' && (fams[0] === 'cooperation' || fams[0] === 'culture')) add('startPartner');
    if (fams[0] === 'mobility' && fams.slice(1).some(function (f) { return f === 'cooperation' || f === 'culture'; })) add('mobilityFirst');
    if (fams.filter(function (f) { return f === 'cooperation'; }).length > 1) add('coopAfterCoop');
    if (Object.keys(progs).length > 1) add('manyProgrammes'); else if (st.length > 1) add('onlyOneProgramme');
    if (acts.indexOf('crea') > -1) add('culture');
    if (acts.indexOf('ka1') > -1 || acts.indexOf('youth-acc') > -1) add('accreditation');
    if (acts.indexOf('ka220') > -1) add('ka220');
    if (acts.indexOf('ka210') > -1) add('ka210');
    if (acts.indexOf('esc') > -1) add('esc');
    if (Object.keys(years).some(function (y) { return years[y] > 1; })) add('sameYear');
    if (years['2028'] || years.Later) add('in2028');
    [['partners', 'whyPartners'], ['team', 'whyTeam'], ['track', 'whyTrack'], ['test', 'whyTest'], ['local', 'whyLocal'], ['art', 'whyArt']].forEach(function (w) { if (whys[w[0]]) add(w[1]); });
    return out;
  }

  function guide() {
    var st = steps();
    render(
      '<div class="kicker">Your take-away</div><h1 class="h1">My guidelines</h1>' +
      (st.length ? '<p class="lead">Your guidelines are made from what you entered: a PDF of about ten pages to keep and come back to when you prepare your next applications.</p>' +
        '<div class="advice"><b>Inside:</b> what your position means · your roadmap · your guidelines · your ' + st.length + ' reference project' + (st.length > 1 ? 's' : '') + ' and the answers to your doubts · your year of deadlines · a checklist from our experience.</div>' +
        '<div class="row" style="margin-top:16px"><button class="btn blue" id="pdf">Download my guidelines (PDF)</button></div><p class="muted" id="pdfmsg" role="status"></p><p class="muted small">To write the parts about your lab, what you entered is sent once to our server and to Claude (Anthropic). We do not keep it.</p>' +
        '<h2 class="h2">Next steps</h2>' + ul(['Read the guidelines with your team, and decide your first move for 2027.', 'Check the dates of the 2027 calls when they are published (links in the PDF).', 'Talk to the people you met here: partners start from people you already know.'])
        : '<div class="empty">Your guidelines need at least one reference project. <a href="#/cards">Choose your reference projects first.</a></div>') +
      '<hr><button class="btn ghost" id="reset">Start again</button>', 'guide');
    var pb = document.getElementById('pdf'); if (pb) pb.addEventListener('click', makePDF);
    document.getElementById('reset').addEventListener('click', function () { if (window.confirm('Clear everything you entered on this phone?')) { S = blank(); save(); home(); } });
  }

  var FONT_R = 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/asap@0.4.3/400Regular/Asap_400Regular.ttf';
  var FONT_B = 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/asap@0.4.3/700Bold/Asap_700Bold.ttf';
  function logoPNG() {
    return new Promise(function (ok, ko) {
      var img = new Image(); img.onload = function () { try { var c = document.createElement('canvas'); c.width = 800; c.height = 200; var x = c.getContext('2d'); x.drawImage(img, 0, 0, 800, 200); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#ffffff'; x.fillRect(0, 0, 800, 200); ok(c.toDataURL('image/png').split(',')[1]); } catch (e) { ko(e); } };
      img.onerror = ko; img.src = 'logo.svg';
    });
  }
  var fontsB64 = null;
  function loadFonts() {
    if (fontsB64) return Promise.resolve(fontsB64);
    function b64(url) { return fetch(url).then(function (r) { return r.arrayBuffer(); }).then(function (buf) { var s = '', u = new Uint8Array(buf); for (var i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }); }
    return Promise.all([b64(FONT_R), b64(FONT_B), logoPNG().catch(function () { return null; })]).then(function (r) { fontsB64 = r; return r; });
  }
  /* personal texts written by Claude on the server (cuenca.buinho.pt/ai/); the guide works without them */
  var AI = null;
  function aiPayload() {
    var st = steps(), lab = S.lab;
    return {
      lab: { name: lab.name, country: lab.country, experience: lab.exp, vision: lab.vision, roles: targetsTxt(),
        works_with: (lab.domains || []).map(function (d) { return (byId(D.domains || [], d) || {}).label || d; }).join(', '),
        needs: whyLabels(lab.needs).join(', '),
        capacities: (D.capacities || []).map(function (c) { var v = lab.cap[c.id] || 0; return { label: c.label, level: v ? v + ' ' + LV[v] : 'not rated' }; }) },
      roadmap: (S.road.ms || []).map(function (m) { return capLabel(m.cap) + ': from ' + (lab.cap[m.cap] ? LV[lab.cap[m.cap]] : 'not rated') + ' to ' + LV[m.to] + (m.by ? ' by ' + m.by : '') + (m.proof ? ' (' + m.proof + ')' : ''); }),
      projects: st.map(function (s, i) { var p = project(s.project), a = action(p.action), g = goCheck(i);
        return { id: p.id, name: p.name, action: a ? a.short + ' ' + a.name : p.action, when: s.when, needs: whyLabels(s.why).join(', '),
          readiness: g ? g.badge + (g.todo.length ? ': ' + g.todo.join(' ') : '') : '',
          doubts: (s.doubts || []).map(function (d) { return (byId(D.doubtAspects || [], d) || {}).label || d; }), question: s.q }; }),
      questions: S.questions.slice()
    };
  }
  function fetchAI() {
    var test = false; try { test = !!localStorage.getItem('vulca-ai-test'); } catch (e) {}
    if (!window.fetch || (!test && (location.protocol !== 'https:' || !/buinho\.pt$/.test(location.hostname)))) return Promise.resolve(null);
    var ctl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, 75000);
    return fetch('/ai/guide', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(aiPayload()), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { clearTimeout(t); return r.ok ? r.json() : null; }).catch(function () { clearTimeout(t); return null; });
  }
  function makePDF() {
    var msg = document.getElementById('pdfmsg'); msg.textContent = 'Writing your guide… this can take up to a minute.';
    var pb = document.getElementById('pdf'); if (pb) pb.disabled = true;
    Promise.all([loadFonts().catch(function () { return null; }), fetchAI()]).then(function (r) { if (pb) pb.disabled = false; AI = r[1] && r[1].projects ? r[1] : null; return r[0]; }).then(function (f) {
      try { buildPDF(f); msg.textContent = 'Done. Check your downloads.'; }
      catch (e) { console.error('pdf', e && e.stack); try { buildPDF(null); msg.textContent = 'Done (basic font). Check your downloads.'; } catch (e2) { console.error('pdf2', e2 && e2.stack); msg.textContent = 'Sorry, the PDF could not be made on this phone.'; } }
    });
  }

  function buildPDF(fonts) {
    var J = window.jspdf.jsPDF; var doc = new J({ unit: 'mm', format: 'a4' });
    var R = 'helvetica', B = 'helvetica', T = D.strategy || {};
    if (fonts) { doc.addFileToVFS('Asap-Regular.ttf', fonts[0]); doc.addFont('Asap-Regular.ttf', 'Asap', 'normal'); doc.addFileToVFS('Asap-Bold.ttf', fonts[1]); doc.addFont('Asap-Bold.ttf', 'Asap', 'bold'); R = B = 'Asap'; }
    var W = 210, H = 297, M = 18, CW = W - 2 * M, y = 0, page = 1;
    var BLUE = '#2364ff', RED = '#ff5050', SUN = '#ffc850', INK = '#010101', G7 = '#2b2b2b', G5 = '#595959', G2 = '#d9d9d9', WALL = '#fafafa', NOTE = '#ffe066';
    function rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
    function fill(h) { doc.setFillColor.apply(doc, rgb(h)); }
    function stroke(h) { doc.setDrawColor.apply(doc, rgb(h)); }
    function color(h) { doc.setTextColor.apply(doc, rgb(h)); }
    function font(bold, size) { doc.setFont(bold ? B : R, bold ? 'bold' : 'normal'); doc.setFontSize(size); }
    function lh(size) { return size * 0.42; }
    function lines(t, size, bold, w) { font(bold, size); return doc.splitTextToSize(String(t || ''), w); }
    function footer() { font(false, 7.5); color(G5); doc.text('Road to 2028 · EU funding clinic · Vulca 2026 · Buinho Creative Hub, Messejana · buinho.pt', M, 290); doc.text(String(page), W - M, 290, { align: 'right' }); }
    function newPage() { footer(); doc.addPage(); page++; y = 20; }
    function need(h) { if (y + h > 280) newPage(); }
    function text(t, size, bold, col, gap, x, w) { if (!t) return; x = x || M; w = w || CW; var L = lines(t, size, bold, w); color(col || INK); L.forEach(function (ln) { need(lh(size) + 1); font(bold, size); color(col || INK); doc.text(ln, x, y); y += lh(size); }); y += gap == null ? 2 : gap; }
    function label(t, col) { need(9); font(true, 7.5); color(col || G5); doc.text(String(t).toUpperCase(), M, y); y += 4.4; }
    function linkLine(l, x, w) { x = x || M; w = w || CW; font(false, 9); color(BLUE); doc.splitTextToSize(l.label + ' — ' + l.url, w).forEach(function (ln) { need(5); doc.textWithLink(ln, x, y, { url: l.url }); y += 4.1; }); y += 1; }
    function band(hex, kicker, title, sub) {
      fill(hex); doc.rect(0, 0, W, 44, 'F'); var tc = (hex === BLUE || hex === INK) ? '#ffffff' : INK; color(tc);
      font(true, 8.5); doc.text(kicker.toUpperCase(), M, 15); font(true, 23); var TL = doc.splitTextToSize(title, CW); if (TL.length > 1) { font(true, 16); TL = doc.splitTextToSize(title, CW).slice(0, 2); doc.text(TL, M, TL.length > 1 ? 24 : 28); } else doc.text(TL[0], M, 28);
      if (sub) { font(false, 10.5); doc.text(doc.splitTextToSize(sub, CW)[0], M, 37); } y = 56;
    }
    /* a box with a coloured left rule; measures its own height; moves to a new page if needed */
    function box(title, body, opt) {
      opt = opt || {}; var rule = opt.rule || RED, bg = opt.bg || '#ffffff', pad = 4, x = M, w = CW, tw = w - 2 * pad - 2;
      var items = Array.isArray(body) ? body : [body];
      var bl = items.map(function (b) { return lines((opt.bullets ? '• ' : '') + b, opt.size || 10, false, tw); });
      var h = pad + (title ? lh(9) + 3 : 0) + bl.reduce(function (s, L) { return s + L.length * lh(opt.size || 10) + 1.6; }, 0) + pad - 1;
      need(h + 3);
      fill(bg); doc.rect(x, y - 3.5, w, h, 'F'); fill(rule); doc.rect(x, y - 3.5, 1.6, h, 'F');
      var yy = y + pad - 3.5 + 3;
      if (title) { font(true, 8); color(opt.titleColor || G5); doc.text(title.toUpperCase(), x + pad + 2, yy); yy += lh(9) + 3; }
      bl.forEach(function (L) { font(false, opt.size || 10); color(INK); L.forEach(function (ln) { doc.text(ln, x + pad + 2, yy); yy += lh(opt.size || 10); }); yy += 1.6; });
      y += h + 2;
    }
    function rows(pairs, size) {
      size = size || 9.5; var kw = 42;
      pairs.forEach(function (r) { if (!r[1]) return; var L = lines(r[1], size, false, CW - kw); need(L.length * lh(size) + 2); font(true, 8); color(G5); doc.text(r[0].toUpperCase(), M, y); font(false, size); color(INK); L.forEach(function (ln, k) { doc.text(ln, M + kw, y + k * lh(size)); }); y += L.length * lh(size) - lh(size) + 2; stroke(G2); doc.setLineWidth(0.2); doc.line(M, y, M + CW, y); y += 4.6; });
    }

    var st = steps(), ps = st.map(function (s) { return project(s.project); });
    roadInit(); S.road.ms.forEach(function (m) { if (!m.manual) autoBuild(m); });
    var RM = S.road, GC = st.map(function (s, i) { return goCheck(i); }), CAPS = D.capacities || [], CA = D.capAdvice || {};
    function capLevel(id) { return S.lab.cap[id] || 0; }
    function dots(x, yy, v, r) { for (var n = 1; n <= 3; n++) { var cx = x + (n - 1) * (r * 2 + 1.6); if (n <= v) { fill(BLUE); doc.circle(cx, yy, r, 'F'); } else { stroke(G2); doc.setLineWidth(0.4); doc.circle(cx, yy, r, 'S'); } } }
    function pname(i) { return ps[i].name; }
    function rule(n, head, why, col) { var L1 = lines(head, 11, true, CW - 12), L2 = why ? lines(why, 9.5, false, CW - 12) : []; need(L1.length * lh(11) + L2.length * lh(9.5) + 6); fill(col || BLUE); doc.circle(M + 3.5, y - 1.3, 3.5, 'F'); color('#ffffff'); font(true, 9); doc.text(String(n), M + 3.5, y + 0.1, { align: 'center' }); font(true, 11); color(INK); L1.forEach(function (ln) { doc.text(ln, M + 11, y); y += lh(11); }); y += 0.6; font(false, 9.5); color(G5); L2.forEach(function (ln) { doc.text(ln, M + 11, y); y += lh(9.5); }); y += 4.5; }
    function trim(t, n) { t = String(t || ''); if (t.length <= n) return t; var c = t.slice(0, n), k = c.lastIndexOf('. '); return (k > n * 0.5 ? c.slice(0, k + 1) : c.replace(/\s+\S*$/, '') + '\u2026'); }
    function ansText(a) { return trim([a.a].concat((a.lines || []).slice(0, 2)).join(' '), 420); }
    function aiProj(p) { return AI ? (AI.projects || []).filter(function (x) { return x.id === p.id; })[0] : null; }
    function aiDoubt(p, label) { var a = aiProj(p); if (!a) return null; var d = (a.doubts || []).filter(function (x) { return x.doubt === label || (x.doubt || '').indexOf(label) === 0; })[0]; return d ? d.answer : null; }
    function aiQ(q) { if (!AI) return null; var x = (AI.questions || []).filter(function (z) { return z.q === q; })[0]; return x ? x.a : null; }
    function ansShort(id) { var a = byId(D.answers || [], id); return a ? a : null; }
    function doubtAnswers(p, d) {
      var out = [], add = function (id) { var a = ansShort(id); if (a) out.push(trim(a.a, 420)); };
      if (d === 'partners') { add('coordinator'); add('partnersnum'); }
      else if (d === 'role') add('rolechoice');
      else if (d === 'money') { var mo = (D.money || {})[p.action]; if (mo) out.push(mo.model + ' ' + mo.lines.slice(0, 2).join(' ')); if (p.action === 'ka220' || p.action === 'crea') add('fincap'); }
      else if (d === 'rules') { if (REQ[p.action]) out.push('What it asks for: ' + REQ[p.action]); add('eligible'); }
      else if (d === 'priorities') { add('priorities'); if (p.formPrio && p.formPrio.length) out.push('In its application: ' + p.formPrio.join(' \u00b7 ') + (p.prioWhy ? ' Why: ' + p.prioWhy : '')); }
      else if (d === 'writing') { add('criteria'); add('time'); }
      else if (d === 'deadlines') { var ev = ((D.strategy || {}).calendar || {})[p.action] || []; if (ev.length) out.push('In the 2026 calls: ' + ev.map(function (e) { return e.l + ' (' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][e.m - 1] + ')'; }).join('; ') + '. Check the 2027 call when it is published.'); add('deadlines'); }
      else if (d === 'after') { add('after2027'); if (p.action === 'youth' || p.action === 'esc') add('youth2028'); }
      return out;
    }

    /* ===== cover ===== */
    fill(BLUE); doc.rect(0, 0, W, 150, 'F'); color('#ffffff');
    font(true, 9); doc.text('ROAD TO 2028 · EU FUNDING CLINIC · VULCA 2026, CUENCA', M, 24);
    font(true, 30); doc.text(doc.splitTextToSize('Guidelines for ' + (S.lab.name || 'your lab'), CW), M, 52);
    font(false, 12); var cy = 86; if (S.lab.country) { doc.text(S.lab.country, M, cy); cy += 8; }
    if (S.lab.vision) { font(true, 13); var VL = doc.splitTextToSize('“' + S.lab.vision + '”', CW); doc.text(VL, M, cy + 6); cy += 8 + VL.length * 6; }
    if (S.lab.targets.length) { font(false, 11); doc.text(doc.splitTextToSize('By 2030: ' + targetsTxt(), CW), M, cy + 6); }
    font(false, 9); doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), M, 140);
    y = 166; label('Inside');
    ['1 · Where you stand, and what it means', '2 · Your roadmap to 2030', '3 · Your guidelines', '4 · Your reference projects, and the answers to your doubts', (S.questions.length ? '5 · Your questions, answered' : null), 'Your year of deadlines, with links to the calls', 'Before you apply: a checklist from our experience'].filter(Boolean).forEach(function (t) { text(t, 11.5, false, INK, 1.5); });
    y += 4; text('Made with the Road to 2028 app by Buinho Creative Hub (Messejana, Portugal), from what you entered. Rules and amounts are those of the 2026 calls: always check the current call.', 9, false, G5, 2);

    /* ===== 1. where you stand ===== */
    newPage(); y = 0; band(BLUE, '1 · Where you stand', 'What your position means', 'Your answers on the start screen, read with our experience');
    var EN = (D.expNotes || {})[S.lab.exp]; if (EN) box('Your experience with EU projects', EN, { rule: INK, bg: WALL, size: 10 });
    label('What you have today, and what to do about it');
    CAPS.forEach(function (c) {
      var v = capLevel(c.id), adv = v ? (CA[c.id] || [])[v - 1] : 'Not rated on the start screen.', L = lines(adv, 9.5, false, CW - 58);
      var CL = lines(c.label, 9.5, true, 50), dy = CL.length * lh(9.5) + 1.5; need(Math.max(L.length * lh(9.5), dy + 4) + 5); font(true, 9.5); color(INK); doc.text(CL, M, y); dots(M + 2, y + dy, v, 1.6); font(false, 8); color(G5); doc.text(v ? ['', 'little', 'some', 'solid'][v] : '', M + 14, y + dy + 0.9);
      font(false, 9.5); color(INK); L.forEach(function (ln, k) { doc.text(ln, M + 58, y + k * lh(9.5)); }); y += Math.max(L.length * lh(9.5), dy + 4) + 3; stroke(G2); doc.setLineWidth(0.2); doc.line(M, y - 2, M + CW, y - 2); y += 2;
    });
    if (S.lab.needs.length) {
      y += 2; label('What you need most, and which reference project serves it');
      S.lab.needs.forEach(function (n) { var w = byId(D.whys || [], n), by = st.map(function (s, i) { return s.why.indexOf(n) > -1 ? pname(i) : null; }).filter(Boolean); text((w ? w.label : n) + ': ' + (by.length ? by.join(', ') : 'none of your reference projects yet. Look for a project that does, or a resource outside the EU.'), 10, false, by.length ? INK : RED, 1.5); });
    }

    /* ===== 2. roadmap ===== */
    newPage(); y = 0; band(BLUE, '2 · Your roadmap', 'From where you stand to your 2030', 'What your lab must build, by when, and what builds it');
    if (S.lab.vision) box('Where you want to be', ['“' + S.lab.vision + '”'].concat(S.lab.targets.length ? ['Your role by 2030: ' + targetsTxt()] : []), { rule: INK, bg: WALL, size: 10.5 });
    var gx = M + 44, gw = (CW - 44) / 3, colOf = function (w) { return w === '2027' || !w ? 0 : w === '2028' ? 1 : 2; };
    need(40); font(true, 8.5); ['2027', '2028', '2029–2034'].forEach(function (c, j) { fill(j === 1 ? '#eef3ff' : WALL); doc.rect(gx + j * gw, y - 4, gw - 2, 6, 'F'); color(INK); doc.text(c, gx + j * gw + 2, y); });
    font(false, 6.8); color(G5); ['last calls under today’s rules', 'new Erasmus+ with the Solidarity Corps', 'the new programmes run'].forEach(function (t, j) { doc.text(t, gx + j * gw + 2, y + 4.5); }); y += 11;
    function disc(cx, cy2, i, r) { var f = pfam(ps[i]); fill(famColor(f)); doc.circle(cx, cy2, r, 'F'); color(famText(f)); font(true, r > 3 ? 9 : 7); doc.text(String(i + 1), cx, cy2 + (r > 3 ? 1.2 : 0.9), { align: 'center' }); }
    font(true, 8.5); color(INK); doc.text('Reference projects', M, y + 1);
    var used = [0, 0, 0]; st.forEach(function (s, i) { var j = colOf(s.when), cx = gx + j * gw + 5 + used[j] * 10; used[j]++; if (s.when) disc(cx, y, i, 3.6); else { stroke(G5); doc.setLineWidth(0.4); doc.setLineDashPattern([0.8, 0.8], 0); doc.circle(cx, y, 3.6, 'S'); doc.setLineDashPattern([], 0); color(G5); font(true, 9); doc.text(String(i + 1), cx, y + 1.2, { align: 'center' }); } });
    y += 7; font(false, 7.5); color(G5); doc.splitTextToSize(st.map(function (s, i) { return (i + 1) + ' = ' + pname(i) + (s.when ? '' : ' (no date yet, dashed)'); }).join('   ·   '), CW).forEach(function (ln) { doc.text(ln, M, y); y += 3.4; }); y += 5;
    RM.ms.forEach(function (m) {
      need(24); stroke(G2); doc.setLineWidth(0.2); doc.line(M, y - 6, M + CW, y - 6);
      font(true, 8.5); color(INK); doc.text(doc.splitTextToSize(capLabel(m.cap), 40), M, y); font(false, 7.5); color(G5); doc.text('today ' + (capLevel(m.cap) ? LV[capLevel(m.cap)] : '?') + ' → ' + LV[m.to], M, y + 8);
      var j = colOf(m.by === '2030' ? 'Later' : m.by), bx = gx + j * gw, txt = doc.splitTextToSize(m.proof || 'Not defined yet: how will you know you got there?', gw - 6).slice(0, 3);
      fill(m.proof ? '#ffffff' : WALL); stroke(m.proof ? INK : G2); doc.setLineWidth(0.4); doc.rect(bx, y - 3.5, gw - 2, 4 + txt.length * 3.4, 'FD'); font(false, 7.5); color(m.proof ? INK : G5); txt.forEach(function (ln, k) { doc.text(ln, bx + 2, y + k * 3.4); });
      if (m.by) { font(true, 6.5); color(G5); doc.text('by ' + m.by, bx + gw - 3, y - 4.5, { align: 'right' }); }
      var ixb = m.steps.filter(function (i) { return st[i]; }), by = (ixb.length ? [(ixb.length > 1 ? 'reference projects ' : 'reference project ') + ixb.map(function (i) { return i + 1; }).join(', ')] : []).concat(m.other.map(otherLabel)); font(false, 7.5); var BL = doc.splitTextToSize('Built by: ' + (by.length ? by.join(' · ') : 'nothing yet'), CW - 44).slice(0, 3);
      font(false, 7.5); color(by.length ? G7 : RED); BL.forEach(function (ln, k) { doc.text(ln, gx, y + 5 + txt.length * 3.4 + k * 3.4); });
      y += Math.max(16, 5 + txt.length * 3.4 + BL.length * 3.4) + 10;
    });
    if (!RM.ms.length) text('No roadmap yet: in the app, open “My roadmap” and pick what your lab must build.', 9.5, false, G5, 3);

    /* ===== 3. guidelines ===== */
    newPage(); y = 0; band(INK, '3 · Your guidelines', 'Rules for your next initiatives', 'Drawn from your position, your 2030, your roadmap and your reference projects');
    var n = 0;
    if (S.lab.vision) rule(++n, 'Say yes to a project only if it moves you towards your 2030.', '“' + S.lab.vision + '” Projects that do not serve it cost the same work and leave less behind.', RED);
    function refs(ix) { return ix.length ? (ix.length > 1 ? 'reference projects ' : 'reference project ') + ix.map(function (i) { return i + 1; }).join(', ') : ''; }
    RM.ms.forEach(function (m) { var v = capLevel(m.cap), ix = m.steps.filter(function (i) { return st[i]; }), by = (ix.length ? [refs(ix)] : []).concat(m.other.map(otherLabel)); rule(++n, 'Until ' + (m.by || '2028') + ', build “' + capLabel(m.cap) + '”: from ' + (v ? LV[v] : 'not rated') + ' to ' + LV[m.to] + '.', (v && CA[m.cap] ? CA[m.cap][v - 1] + ' ' : '') + (by.length ? 'In your path: ' + by.join(', ') + '.' : 'Nothing in your path builds it yet.'), BLUE); });
    var weak = CAPS.filter(function (c) { return capLevel(c.id) === 1 && !RM.ms.some(function (m) { return m.cap === c.id; }); });
    weak.slice(0, 2).forEach(function (c) { rule(++n, 'Watch your weakest point: “' + c.label + '”.', CA[c.id][0], RED); });
    if (S.lab.targets.indexOf('coordinator') > -1) rule(++n, 'Coordinate a small project before a large one.', 'Large partnerships and Creative Europe ask for a track record and financial capacity; a small-scale partnership builds both.', BLUE);
    if (S.lab.targets.indexOf('accredited') > -1) rule(++n, 'Start the record for an accreditation now.', 'Accreditation asks for experience in the field and a plan for several years: short mobility projects are the usual way in. Today’s accreditations are valid until 31 December 2027; the new rules come with the next programme.', BLUE);
    if (S.lab.targets.indexOf('partner') > -1) rule(++n, 'Join good projects as a partner, and lead one clear part of the work.', 'Ask the coordinator which part you lead, what money comes to you, and what stays in your lab afterwards.', BLUE);
    var prep = [], bf = {}; GC.forEach(function (g, i) { if (g.lacks.length) { var k = g.lacks.map(capLabel).join(' and ').toLowerCase(); (bf[k] = bf[k] || []).push(i); } }); Object.keys(bf).forEach(function (k) { prep.push('before ' + refs(bf[k]) + ', build ' + k); });
    rule(++n, 'Go only when: a partner you trust is on board three months before the deadline, someone has the time to write, and you can advance the costs.', prep.length ? 'In your path: ' + prep.join('; ') + '.' : 'Check it again for each call.', RED);
    readings().slice(0, 2).forEach(function (t) { rule(++n, t.split('. ')[0] + '.', t.split('. ').slice(1).join('. '), BLUE); });
    if (AI && AI.advice) AI.advice.slice(0, 5).forEach(function (t) { rule(++n, String(t), '', BLUE); });
    rule(++n, 'Argue only for the priorities you select, and show them in the activities, the public and the results.', 'Inclusion is expected in almost every funded project: name who takes part and which barrier you lower. We found the opposite slip in our own forms, more than once.', RED);
    rule(++n, 'Prepare for 2028 without betting on details.', 'The new Erasmus+ (with the Solidarity Corps) and AgoraEU are still being negotiated. Trusted partners, results you can show and the horizontal priorities will count in any version.', BLUE);
    rule(++n, 'Review this roadmap with your team in ' + (RM.review || 'November 2027') + '.', 'By then the 2028 calls and the new Programme Guide should be known. Change the projects, keep the rules.', RED);

    /* ===== 4. reference projects ===== */
    newPage(); y = 0; band(RED, '4 · Your reference projects', 'What each one means for your lab', 'What it would build, what it pays, and the answers to your doubts');
    st.forEach(function (s, i) {
      var p = ps[i], a = action(p.action), f = pfam(p), g = GC[i], mo = (D.money || {})[p.action];
      need(40); fill(famColor(f)); doc.rect(M, y - 4, CW, 9, 'F'); color(famText(f)); font(true, 10.5); doc.text(doc.splitTextToSize((i + 1) + ' · ' + p.name, CW - 50)[0], M + 3, y + 2); font(true, 8); doc.text((a ? a.short : '') + (s.when ? ' · ' + s.when : ''), M + CW - 3, y + 2, { align: 'right' }); y += 11;
      var pairs = [];
      pairs.push(['Ready?', g.badge + (g.todo.length ? ': ' + g.todo.join(' ') : '. Nothing missing from what you entered.')]);
      var bl = RM.ms.filter(function (m) { return m.steps.indexOf(i) > -1; }).map(function (m) { return capLabel(m.cap); });
      pairs.push(['It would build', bl.length ? bl.join(', ') : 'none of what you want to build yet']);
      if (s.why.length) pairs.push(['Your needs it serves', whyLabels(s.why).join(', ')]);
      if (p.formPrio && p.formPrio.length) pairs.push(['Priorities in its application', p.formPrio.join(' · ') + (p.prioWhy ? '. Why: ' + p.prioWhy : '')]);
      else if (p.external) pairs.push(['Priorities', 'Partnerships choose one main priority and up to two more; inclusion is in almost all funded projects. The Results Platform lists this project’s topics.']);
      if (mo) pairs.push(['What it pays', mo.model + ' ' + mo.lines[0]]);
      var ap = aiProj(p); if (ap && ap.parallel) pairs.unshift(['For your lab', ap.parallel]);
      rows(pairs, 9);
      var ds = (s.doubts || []).map(function (d) { var lab = (byId(D.doubtAspects || [], d) || {}).label || d, ai = aiDoubt(p, lab); return [lab, ai ? [ai] : doubtAnswers(p, d)]; }).filter(function (x) { return x[1].length; });
      if (s.q) { var aq = answerFor(s.q), aiq = aiDoubt(p, s.q); ds.push(['Your question: ' + s.q, aiq ? [aiq] : aq.length ? aq.slice(0, 1).map(ansText) : ['No ready answer in our material: ask the National Agency or a Creative Europe Desk.']]); }
      if (ds.length) { label('Your doubts, answered'); ds.forEach(function (d) { box(d[0], d[1].slice(0, 1), { rule: famColor(f) === SUN ? INK : famColor(f), bg: WALL, size: 9 }); }); }
      y += 4;
    });

    /* ===== 5. questions ===== */
    if (S.questions.length) {
      newPage(); y = 0; band(SUN, '5 · Your questions', 'Your questions, answered', 'From our experience and the official rules');
      S.questions.forEach(function (q) { var an = answerFor(q), aq = aiQ(q); need(30); text(q, 11, true, INK, 1.5); if (aq) { box('From our experience', aq, { rule: INK, bg: WALL, size: 9.5 }); if (an[0] && an[0].links && an[0].links[0]) linkLine(an[0].links[0]); } else if (an.length) an.slice(0, 2).forEach(function (a) { box(a.topic, [a.a].concat(a.lines || []).concat(a.next ? [a.next] : []), { rule: INK, bg: WALL, size: 9.5 }); if (a.links && a.links[0]) linkLine(a.links[0]); }); else text('No ready answer in our material. A good next stop: your National Agency or Creative Europe Desk.', 9.5, false, G5, 3); y += 2; });
    }

    /* ===== calendar ===== */
    newPage(); y = 0; band(SUN, 'Your year of deadlines', 'When to apply, and where', 'A typical year based on the 2026 calls, for the actions in your path');
    var CAL = (D.strategy || {}).calendar || {}, acts = []; ps.forEach(function (p) { if (p.action && acts.indexOf(p.action) < 0) acts.push(p.action); });
    var MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], cx0 = M + 50, mw = (CW - 50) / 12;
    font(true, 7.5); color(G5); MN.forEach(function (m, k) { doc.text(m, cx0 + k * mw + mw / 2, y, { align: 'center' }); }); y += 3;
    acts.forEach(function (aid) {
      var a = action(aid), ev = CAL[aid] || []; need(14);
      font(true, 8.5); color(INK); doc.text(doc.splitTextToSize(a.short + ' · ' + a.name, 48).slice(0, 2), M, y + 4);
      stroke(G2); doc.setLineWidth(0.2); for (var k = 0; k <= 12; k++) doc.line(cx0 + k * mw, y, cx0 + k * mw, y + 8); doc.line(cx0, y + 8, cx0 + 12 * mw, y + 8);
      ev.forEach(function (e) { var x0 = cx0 + (e.m - 1) * mw; if (e.t === 'deadline' || e.t === 'optional') { fill('#e6ecff'); var s0 = Math.max(0, e.m - 4); doc.rect(cx0 + s0 * mw, y + 1, (e.m - 1 - s0) * mw, 6, 'F'); } if (e.t === 'deadline') { fill(RED); doc.rect(x0 + 1, y + 1, mw - 2, 6, 'F'); } else if (e.t === 'optional') { stroke(RED); doc.setLineWidth(0.6); doc.rect(x0 + 1, y + 1, mw - 2, 6, 'S'); } else { fill(INK); doc.rect(x0 + 1, y + 1, mw - 2, 6, 'F'); } });
      y += 11; ev.forEach(function (e) { font(false, 8); color(G7); doc.text(MN[e.m - 1] + ': ' + e.l, cx0, y); y += 3.6; }); y += 3;
    });
    font(false, 8); color(G5); fill(RED); doc.rect(M, y - 3, 5, 3.5, 'F'); doc.text('deadline', M + 7, y); stroke(RED); doc.setLineWidth(0.6); doc.rect(M + 26, y - 3, 5, 3.5, 'S'); doc.text('second round (some agencies)', M + 33, y); fill(INK); doc.rect(M + 78, y - 3, 5, 3.5, 'F'); doc.text('results', M + 85, y); fill('#e6ecff'); doc.rect(M + 102, y - 3, 8, 3.5, 'F'); doc.text('find partners and write', M + 112, y); y += 9;
    label('Where the calls are published'); (D.callLinks || []).forEach(function (l) { linkLine(l); });
    text('Talk to partners three months before each deadline. Results of partnerships usually arrive in summer, Creative Europe in November, and projects start months later: plan cash for the gap.', 9.5, false, G7, 2);

    /* ===== checklist and lessons ===== */
    newPage(); y = 0; band(INK, 'Before you apply', 'A checklist for the long term', 'For competent applications, and for projects that connect into a path');
    function check(t) { var L = lines(t, 9.5, false, CW - 9); need(L.length * lh(9.5) + 3); stroke(INK); doc.setLineWidth(0.4); doc.rect(M, y - 3, 3.6, 3.6, 'S'); font(false, 9.5); color(INK); L.forEach(function (ln, k) { doc.text(ln, M + 7, y + k * lh(9.5)); }); y += L.length * lh(9.5) + 2.2; }
    label('Every application'); ((D.strategy || {}).checklist || []).forEach(check);
    y += 2; label('Your long-term view'); ((D.strategy || {}).dimensions || []).forEach(function (d) { check(d.title + ': ' + d.ask[0]); });
    y += 2; label('Choosing partners'); (D.partnerCriteria || []).forEach(function (c) { check(c.label + ': ' + c.text); });
    y += 2; label('What we learned on the way (Buinho, since 2015)'); (D.lessons || []).forEach(function (t) { text('• ' + t, 9.5, false, G7, 1.2); });
    footer();
    doc.save('road-to-2028' + (S.lab.name ? '-' + S.lab.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) : '') + '.pdf');
  }

  /* ---------- roadmap ---------- */
  function targetsTxt() { return (S.lab.targets || []).map(function (t) { return (byId(D.targets, t) || {}).label; }).filter(Boolean).join(' \u00b7 '); }
  function capOf(id) { return byId(D.capacities || [], id); }
  function capLabel(id) { var c = capOf(id); return c ? c.label : id; }
  function otherLabel(id) { var o = byId(D.otherRes || [], id); return o ? o.label : id; }
  var NEED_CAP = { team: 'team', partners: 'partners', track: 'track', local: 'local' };
  function roadInit() {
    if (S.road.init) return; S.road.init = true;
    var pick = []; S.lab.needs.forEach(function (n) { if (NEED_CAP[n] && pick.indexOf(NEED_CAP[n]) < 0) pick.push(NEED_CAP[n]); });
    (D.capacities || []).slice().sort(function (a, b) { return (S.lab.cap[a.id] || 0) - (S.lab.cap[b.id] || 0); }).forEach(function (c) { if (pick.length < 3 && pick.indexOf(c.id) < 0 && (S.lab.cap[c.id] || 0) > 0 && (S.lab.cap[c.id] || 0) < 3) pick.push(c.id); });
    S.road.ms = pick.slice(0, 3).map(function (c) { return { cap: c, to: Math.min(3, (S.lab.cap[c] || 0) + 1) || 2, by: '', proof: '', steps: [], other: [], otherTxt: '' }; });
    save();
  }
  function goCheck(i) {
    var st = S.path[i], p = st && project(st.project); if (!p) return null;
    var a = p.action, c = S.lab.cap, lacks = [];
    function low(k, acts) { if (acts.indexOf(a) > -1 && c[k] && c[k] < 2) lacks.push(k); }
    low('partners', ['ka210', 'ka220', 'crea', 'youth', 'cerv']); low('track', ['ka220', 'crea', 'ka1', 'youth-acc']); low('money', ['crea', 'ka220']); low('label', ['ka220', 'crea']);
    var feeds = null;
    var builds = S.road.ms.some(function (m) { return m.steps.indexOf(i) > -1; });
    var w = S.road.ready[st.project]; if (w === true) w = 'team'; if (w === false) w = 'none';
    var todo = [], big = a === 'ka220' || a === 'crea' || a === 'ka1' || a === 'youth-acc';
    lacks.forEach(function (k) { todo.push(TODO[k]); });
    if (!builds) todo.push('Say above what it should build for your lab. If it builds nothing you want, it may not be worth the work.');
    if (w === 'none') todo.push(big ? 'Nobody to write it: join a project like this as a partner (the coordinator writes), or start with something smaller.' : 'Nobody to write it: book the time now, or find a partner who coordinates. Ask the labs here how many days it took them.');
    var badge = todo.length ? 'Build first' : 'Ready to apply';
    return { feeds: feeds, builds: builds, lacks: lacks, who: w, todo: todo, badge: badge };
  }
  var LV = ['', 'little', 'some', 'solid'];
  var TODO = {
    partners: 'Find partners first: partner searches (Otlas, EPALE), contact seminars, or a short mobility that takes you to them.',
    track: 'Start smaller: a short mobility (KA122) or a small-scale partnership (KA210), or join a project like this as a partner.',
    money: 'Check your financial capability: above \u20ac60,000 the EU can check the coordinator\u2019s accounts. Be a partner, or plan the cash advance.',
    label: 'Get international experience as a partner before you coordinate a project like this.'
  };
  function roadLevel(m, k) {
    var t = S.lab.cap[m.cap] || 0, h = '<div class="f lab">From where you are to where you want to be</div>';
    if (!t) return h + '<p class="muted small">You did not rate this on the start screen. <a href="#/">Rate it there first</a>, then come back.</p>';
    h += '<div class="fromto"><span class="ft-now">Today: ' + t + ' \u00b7 ' + LV[t] + '</span><span class="muted small">you said this on the start screen</span></div>';
    if (t >= 3) return h + '<p class="muted small">Already solid. Keep it: pick another thing to build if you want to grow.</p>';
    return h + '<div class="muted small" style="margin:6px 0 4px">By the date below, you want it to be:</div><div class="chips" data-mto="' + k + '">' + [2, 3].filter(function (n) { return n > t; }).map(function (n) { return '<button class="chip" data-v="' + n + '" aria-pressed="' + (m.to === n) + '">\u2192 ' + n + ' \u00b7 ' + LV[n] + '</button>'; }).join('') + '</div>';
  }
  /* which kinds of action build which capacity, and which resources outside the EU help */
  var CAP_ACT = { team: ['ka122', 'ka1', 'youth', 'youth-acc', 'esc'], partners: ['ka122', 'youth', 'ka210', 'ka220', 'crea', 'cerv', 'esc'], track: ['ka210', 'ka220', 'crea', 'cerv', 'ka122', 'youth'], money: [], label: ['ka122', 'ka1', 'youth', 'youth-acc', 'ka210', 'ka220', 'crea', 'esc', 'cerv'], local: ['cerv', 'esc', 'ka210', 'youth', 'crea'] };
  var CAP_OTHER = { team: ['volunteers'], partners: ['network'], track: [], money: ['own', 'national', 'foundation', 'town'], label: ['network'], local: ['town', 'volunteers'] };
  var CAP_NEED = { team: 'team', partners: 'partners', track: 'track', local: 'local' };
  function autoBuild(m) {
    var acts = CAP_ACT[m.cap] || [], need = CAP_NEED[m.cap];
    m.steps = []; steps().forEach(function (st, i) { var p = project(st.project); if (p && (acts.indexOf(p.action) > -1 || (need && st.why.indexOf(need) > -1))) m.steps.push(i); });
    m.other = (CAP_OTHER[m.cap] || []).slice();
  }
  function roadView() {
    roadInit();
    S.road.ms.forEach(function (m) { if (!m.manual) autoBuild(m); }); save();
    var st = steps(), R = S.road, html = '<div class="kicker">' + esc(S.lab.name || 'Your lab') + '</div><h1 class="h1">My roadmap</h1>' +
      '<p class="lead">What must your lab be able to do to reach your 2030? Pick up to 3 things to build, then say what builds each one.</p>' +
      (S.lab.vision ? '<div class="advice"><b>2030:</b> ' + esc(S.lab.vision) + (S.lab.targets.length ? '<br><span class="muted">' + esc(targetsTxt()) + '</span>' : '') + '</div>' : '<p class="muted">No 2030 sentence yet. <a href="#/">Write it on the start screen.</a></p>');
    html += '<div class="qn"><b>1 \u00b7 What to build</b> <span class="muted">(up to 3)</span></div><div class="chips" data-msel>' + (D.capacities || []).map(function (c) { var on = R.ms.some(function (m) { return m.cap === c.id; }); return '<button class="chip" data-v="' + c.id + '" aria-pressed="' + on + '">' + esc(c.label) + ' <span class="muted">\u00b7 today ' + (S.lab.cap[c.id] ? LV[S.lab.cap[c.id]] : 'not rated') + '</span></button>'; }).join('') + '</div>';
    html += '<div class="stack">' + R.ms.map(function (m, k) { var c = capOf(m.cap) || {};
      return '<div class="slot"><div class="step-b"><div class="qn"><b>' + esc(c.label) + '</b></div>' +
        roadLevel(m, k) +
        '<div class="f lab">By when</div><div class="chips" data-mby="' + k + '">' + ['2027', '2028', '2030'].map(function (y) { return '<button class="chip" data-v="' + y + '" aria-pressed="' + (m.by === y) + '">' + y + '</button>'; }).join('') + '</div>' +
        '<div class="f lab">How you will know</div><input type="text" data-mproof="' + k + '" maxlength="80" placeholder="' + esc(c.proof || '') + '" value="' + esc(m.proof) + '">' +
        '<div class="f lab">What builds it</div><p class="muted small">' + (m.manual ? 'Your own choice. <a href="#" data-mreset="' + k + '">Go back to the suggestion</a>' : 'Suggested from your reference projects and what they give your lab. Tap to change.') + '</p><div class="chips" data-msteps="' + k + '">' + st.map(function (s, i) { var p = project(s.project); return '<button class="chip" data-v="' + i + '" aria-pressed="' + (m.steps.indexOf(i) > -1) + '">Reference ' + (i + 1) + ' \u00b7 ' + esc(p.name) + '</button>'; }).join('') +
        (D.otherRes || []).map(function (o) { return '<button class="chip" data-o="' + o.id + '" aria-pressed="' + (m.other.indexOf(o.id) > -1) + '">' + esc(o.label) + '</button>'; }).join('') + '</div>' +
        (st.length ? '' : '<p class="muted small"><a href="#/path">Put steps in your path</a> to link them here.</p>') + '</div></div>'; }).join('') + '</div>';
    if (st.length) {
      html += '<div class="qn" style="margin-top:20px"><b>2 \u00b7 Can you apply for something like this?</b></div><p class="muted small">A quick reading of each reference project in your path, against what you said you have today. It tells you what to build before you apply.</p><div class="stack">' + st.map(function (s, i) { var g = goCheck(i), p = project(s.project);
        return '<div class="advice"><div><b>Reference project ' + (i + 1) + '</b> \u00b7 ' + esc(p.name) + '</div>' +
          '<div class="chips" data-ready="' + i + '" style="margin-top:8px"><span class="muted small" style="align-self:center">Who would write the application?</span>' + [['team', 'Someone in our team'], ['partner', 'A partner coordinates'], ['none', 'Nobody yet']].map(function (o) { return '<button class="chip" data-v="' + o[0] + '" aria-pressed="' + (g.who === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
          '<p style="margin-top:8px"><span class="badge ' + (g.todo.length ? 'b-prepare' : 'b-go') + '">' + g.badge + '</span></p>' + (g.todo.length ? ul(g.todo) : '<p class="small">Nothing missing from what you told the app. Check the call when it opens.</p>') + '</div>'; }).join('') + '</div>';
    }
    html += '<div class="qn" style="margin-top:20px"><b>3 \u00b7 When will you look at this roadmap again?</b></div><p class="muted small">Plans change, and the 2028 calls and the new Programme Guide come out during 2027. Pick a date to review it with your team.</p><div class="chips" data-review>' + ['June 2027', 'November 2027', 'Early 2028'].map(function (r) { return '<button class="chip" data-v="' + r + '" aria-pressed="' + (R.review === r) + '">' + r + '</button>'; }).join('') + '</div>' +
      '<hr><div class="row"><a class="btn blue" href="#/guide">5 \u00b7 My guidelines</a><a class="btn ghost" href="#/path">Back to my path</a></div>';
    render(html, 'road', true);
    function bind(sel, fn) { app.querySelectorAll(sel).forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { fn(box, b); save(); roadView(); } }); }); }
    bind('[data-msel]', function (box, b) { var v = b.dataset.v, k = -1; R.ms.forEach(function (m, j) { if (m.cap === v) k = j; }); if (k > -1) R.ms.splice(k, 1); else if (R.ms.length < 3) R.ms.push({ cap: v, to: Math.min(3, (S.lab.cap[v] || 0) + 1) || 2, by: '', proof: '', steps: [], other: [], otherTxt: '' }); });
    bind('[data-mto]', function (box, b) { R.ms[+box.dataset.mto].to = +b.dataset.v; });
    bind('[data-mby]', function (box, b) { var m = R.ms[+box.dataset.mby]; m.by = m.by === b.dataset.v ? '' : b.dataset.v; });
    bind('[data-msteps]', function (box, b) { var m = R.ms[+box.dataset.msteps]; m.manual = true; if (b.dataset.o) { var j = m.other.indexOf(b.dataset.o); if (j > -1) m.other.splice(j, 1); else m.other.push(b.dataset.o); } else { var v = +b.dataset.v, q = m.steps.indexOf(v); if (q > -1) m.steps.splice(q, 1); else m.steps.push(v); } });
    bind('[data-ready]', function (box, b) { var pid = S.path[+box.dataset.ready].project, v = b.dataset.v; R.ready[pid] = R.ready[pid] === v ? undefined : v; });
    bind('[data-review]', function (box, b) { R.review = R.review === b.dataset.v ? '' : b.dataset.v; });
    app.querySelectorAll('[data-mreset]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var m = R.ms[+a.dataset.mreset]; m.manual = false; save(); roadView(); }); });
    app.querySelectorAll('[data-mproof]').forEach(function (el) { el.addEventListener('input', function () { R.ms[+el.dataset.mproof].proof = el.value; save(); }); });
  }

  /* ---------- priorities ---------- */
  function priorities() {
    var mine = (S.lab.domains || []).filter(function (d) { return PR.sectors[d]; }), keys = mine.length ? mine : Object.keys(PR.sectors);
    render('<div class="kicker">What Europe reads in your idea</div><h1 class="h1">Priorities in plain words</h1><p class="lead">' + esc(PR.intro) + '</p>' +
      sec('How they are used', ul(PR.rules)) +
      '<h2 class="h2">The four horizontal priorities</h2><div class="stack">' + PR.horizontal.map(function (h) { return '<div class="advice"><b>' + esc(h.name) + '</b><p>' + esc(h.plain) + '</p><p class="muted">In a lab: ' + esc(h.lab) + '</p><p><b>To discuss:</b> ' + esc(h.q) + '</p></div>'; }).join('') + '</div>' +
      '<h2 class="h2">Specific priorities ' + (mine.length ? 'of your fields' : 'per field') + '</h2>' + keys.map(function (d) { var sc = PR.sectors[d]; return sec(sc.field, ul(sc.items) + '<p class="muted">' + esc(sc.lab) + '</p>'); }).join('') + '<p class="muted small">' + esc(PR.ukraineNote) + '</p>' +
      sec(PR.culture.field, ul(PR.culture.items) + '<p class="muted">' + esc(PR.culture.rule) + ' ' + esc(PR.culture.lab) + '</p>') +
      '<h2 class="h2">' + esc(PR.future.title) + '</h2>' + ul(PR.future.lines) + '<p class="muted">' + esc(PR.future.status) + '</p><div class="advice">' + esc(PR.future.reading) + '</div>' +
      (PR.buinho ? '<h2 class="h2">' + esc(PR.buinho.title) + '</h2><p class="muted small">' + esc(PR.buinho.source) + '</p>' + ul(PR.buinho.lines) : '') +
      sec('Before you choose', ul(PR.reflect)) +
      sec('Sources', PR.links.map(function (l) { return '<div>' + link(l.url, l.label) + '</div>'; }).join('')) +
      '<div class="row" style="margin-top:16px"><a class="btn blue" href="#/path">Back to my path</a></div>', 'actions');
  }

  /* ---------- router ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, '').split('/');
    switch (h[0]) {
      case 'cards': return cards();
      case 'p': return projectView(decodeURIComponent(h[1] || ''));
      case 'actions': return actions();
      case 'a': return actionView(decodeURIComponent(h[1] || ''));
      case '2028': return post2027();
      case 'path': return pathView();
      case 'guide': return guide();
      case 'priorities': return priorities();
      case 'road': return roadView();
      default: return home();
    }
  }
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
})();
