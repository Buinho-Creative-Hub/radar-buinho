/* Road to 2028 — EU funding clinic app (Buinho · Vulca 2026). Vanilla JS, offline-first. */
(function () {
  'use strict';
  var D = window.VULCA || { projects: [], actions: [], pillars: [], post2027: null, lessons: [], whys: [] };
  var app = document.getElementById('app');
  var KEY = 'vulca-clinic-v2';

  /* ---------- state ---------- */
  function blank() { return { lab: { code: '', name: '', country: '', exp: '', domains: [], needs: [], vision: '', themes: ['', '', ''], cap: {}, target: '' }, fav: [], path: [], questions: [], told: {}, road: { ms: [], ready: {}, review: '', init: false } }; }
  var S = load() || blank();
  (function () { if (!S.told) S.told = {}; if (!S.road) S.road = blank().road; var b = blank().lab; Object.keys(b).forEach(function (k) { if (S.lab[k] == null) S.lab[k] = b[k]; }); S.path.forEach(function (st) { if (!st.themes) st.themes = []; if (!st.prio) st.prio = []; if (st.how == null) st.how = ''; if (st.peer == null) st.peer = ''; }); })();
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
  function toggleFav(id) { var i = S.fav.indexOf(id); if (i > -1) { S.fav.splice(i, 1); S.path = S.path.filter(function (s) { return s.project !== id; }); } else S.fav.push(id); save(); }
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
      '<li><div><b>What fits:</b> star projects and put up to 3 in order. <span class="muted">Your path.</span></div></li>' +
      '<li><div><b>Your roadmap:</b> what your lab must build to get there. <span class="muted">Ask Carlos and the other labs as you go.</span></div></li>' +
      '<li><div><b>Your guidelines:</b> download them and keep them for your next applications.</div></li>' +
      '</ol>' +
      '<h2 class="h2">1 \u00b7 Where you stand</h2><p class="muted">It stays on this phone and only goes into your guide.</p>' +
      '<label class="f" for="name">Lab name</label><input type="text" id="name" maxlength="80" value="' + esc(l.name) + '">' +
      '<label class="f" for="country">Country</label><input type="text" id="country" maxlength="40" value="' + esc(l.country) + '">' +
      '<div class="f lab" style="margin-top:16px">Experience with EU projects</div>' +
      '<div class="chips" data-group="exp">' + [['none', 'Never applied'], ['partner', 'Partner before'], ['coordinator', 'Coordinated before']].map(function (o) { return '<button class="chip" data-v="' + o[0] + '" aria-pressed="' + (l.exp === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="f lab">Who you work with</div>' +
      '<div class="chips" data-group="domains">' + (D.domains || []).map(function (d) { return '<button class="chip" data-v="' + esc(d.id) + '" aria-pressed="' + (l.domains.indexOf(d.id) > -1) + '">' + esc(d.label) + '</button>'; }).join('') + '</div>' +
      '<div class="f lab">What your organisation needs most (up to 3)</div>' +
      '<div class="chips" data-group="needs">' + (D.whys || []).map(function (w) { return '<button class="chip" data-v="' + esc(w.id) + '" aria-pressed="' + (l.needs.indexOf(w.id) > -1) + '">' + esc(w.label) + '</button>'; }).join('') + '</div>' +
      '<div class="f lab">What you have today</div><p class="muted small">For each: 1 little \u00b7 2 some \u00b7 3 solid. Sheet 2 helps you think it through.</p>' +
      (D.capacities || []).map(function (c) { var v = l.cap[c.id] || 0; return '<div class="caprow"><span>' + esc(c.label) + '</span><span class="chips" data-cap="' + c.id + '">' + [1, 2, 3].map(function (n) { return '<button class="chip dot' + (n <= v ? ' on' : '') + '" data-v="' + n + '" aria-pressed="' + (n === v) + '" aria-label="' + esc(c.label) + ' ' + n + '">' + n + '</button>'; }).join('') + '</span></div>'; }).join('') +
      '<h2 class="h2">2 \u00b7 Where you want to be</h2><p class="muted">EU projects should serve your lab\'s plans, not the other way round.</p>' +
      '<label class="f" for="vision">Your lab in 2030, in one sentence</label><input type="text" id="vision" maxlength="160" placeholder="What will you be known for, and for whom?" value="' + esc(l.vision) + '">' +
      '<div class="f lab" style="margin-top:12px">Your role in EU projects by 2030</div><div class="chips" data-group="target">' + (D.targets || []).map(function (t) { return '<button class="chip" data-v="' + t.id + '" aria-pressed="' + (l.target === t.id) + '">' + esc(t.label) + '</button>'; }).join('') + '</div>' +
      '<div class="f lab" style="margin-top:12px">What your lab is about (up to 3)</div><p class="muted small">The few things you keep working on, project after project, whatever the funding. Each EU project should feed at least one.</p>' + [0, 1, 2].map(function (k) { return '<input type="text" id="theme' + k + '" maxlength="40" placeholder="' + ['e.g. Repair', 'e.g. Citizen science', 'e.g. Young people and technology'][k] + '" value="' + esc(l.themes[k] || '') + '" style="margin-bottom:8px">'; }).join('') +
      '<div class="row" style="margin-top:18px"><a class="btn blue" href="#/cards">3 \u00b7 See what fits</a></div><p class="muted" style="margin-top:10px">Background, when you need it: <a href="#/actions">the 2028 map</a> \u00b7 <a href="#/priorities">priorities in plain words</a></p>', 'home');
    ['name', 'country'].forEach(function (k) { document.getElementById(k).addEventListener('input', function (e) { S.lab[k] = e.target.value; save(); }); });
    chipGroup('exp', function (v) { S.lab.exp = S.lab.exp === v ? '' : v; save(); home(); });
    document.getElementById('vision').addEventListener('input', function (e) { S.lab.vision = e.target.value; save(); });
    [0, 1, 2].forEach(function (k) { document.getElementById('theme' + k).addEventListener('input', function (e) { S.lab.themes[k] = e.target.value; save(); }); });
    chipGroup('needs', function (v, b) { var i = S.lab.needs.indexOf(v); if (i > -1) S.lab.needs.splice(i, 1); else if (S.lab.needs.length < 3) S.lab.needs.push(v); else return; b.setAttribute('aria-pressed', i < 0); save(); });
    chipGroup('target', function (v) { S.lab.target = S.lab.target === v ? '' : v; save(); app.querySelectorAll('[data-group="target"] button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === S.lab.target); }); });
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
      '<p class="lead">Star 3 to 5 projects that look like your next step. Colour is the kind of action; the badge says how well it fits where you are.</p>' +
      '<div class="chips" data-group="dom">' + doms.map(function (d) { return '<button class="chip" data-v="' + esc(d) + '" aria-pressed="' + (F.dom === d) + '">' + esc(d) + '</button>'; }).join('') + '</div>' +
      '<div class="chips" data-group="fam">' + fams.map(function (f) { return '<button class="chip f-' + f + '" data-v="' + f + '" aria-pressed="' + (F.fam === f) + '">' + esc(famLabel(f)) + '</button>'; }).join('') +
      '<button class="chip" data-v="mine" aria-pressed="' + F.mine + '">★ My cards (' + S.fav.length + ')</button></div>' +
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
  function prioHTML(i, st, p) {
    var o = prioOpts(p), g = '', h = '<div class="qn"><b>3 \u00b7 What will Europe see in it?</b> <span class="muted">Pick a priority. <a href="#/priorities">What are they?</a></span></div><div class="chips" data-prio="' + i + '">';
    if (p && p.formPrio && p.formPrio.length) h += '<p class="muted small">In the real application of ' + esc(p.name) + ': ' + esc(p.formPrio.join(' \u00b7 ')) + '.' + (p.prio && p.prio.length ? ' Already marked below: keep what fits your step.' : '') + (p.prioWhy ? ' <b>Why:</b> ' + esc(p.prioWhy) : '') + '</p>';
    o.forEach(function (x) { if (x.group !== g) { if (g) h += '</div><div class="muted small">' + esc(x.group) + '</div><div class="chips" data-prio="' + i + '">'; g = x.group; } h += '<button class="chip" data-v="' + esc(x.id) + '" aria-pressed="' + (st.prio.indexOf(x.id) > -1) + '" title="' + esc(x.name) + '">' + esc(x.short) + '</button>'; });
    h += '</div>' + (S.lab.domains.length ? '' : '<p class="muted small">Tell the app who you work with (start screen) to see the priorities of your field.</p>');
    h += '<input type="text" data-how="' + i + '" maxlength="140" placeholder="In one line: who takes part, what you will show" value="' + esc(st.how) + '">';
    return h;
  }
  function stepOf(id) { for (var i = 0; i < S.path.length; i++) if (S.path[i].project === id) return i; return -1; }
  function pathView() {
    var favs = S.fav.map(project).filter(Boolean);
    var html = '<div class="kicker">' + esc(S.lab.name || 'Your lab') + '</div><h1 class="h1">My path</h1>';
    if (!favs.length) {
      render(html + '<div class="empty">Star a few projects first: they are the bricks of your path.<br><br><a class="btn blue" href="#/cards">See the projects</a></div>', 'path'); return;
    }
    html += '<p class="lead">Put up to 3 cards in order, then answer 3 short questions for each step.</p>';
    html += '<div class="slots">';
    for (var i = 0; i < 3; i++) {
      var st = S.path[i], p = st && project(st.project);
      if (p) {
        var f = pfam(p), pl = ppil(p);
        html += '<div class="slot"><div class="slot-h"><span class="dot" style="background:' + famColor(f) + ';color:' + famText(f) + '"><b>' + (i + 1) + '</b>' + '' + '</span>' +
          '<div><b>' + esc(p.name) + '</b><div class="muted">' + esc(famLabel(f)) + (pl ? ' · ' + esc(pl.label) : '') + ' · ' + esc(p.domain) + '</div></div>' +
          '<button class="x" data-unstep="' + i + '" aria-label="Remove from path">×</button></div><div class="step-b">' +
          '<div class="dist">' + distance(i).map(function (d) { return '<p>' + esc(d) + '</p>'; }).join('') + '</div>' +
          '<details class="stepd"' + (!st.when || !st.why.length || !st.prio.length ? ' open' : '') + '><summary>' + (st.when && st.why.length && st.prio.length ? '\u2713 3 questions answered' : 'Answer 3 short questions') + '</summary>' +
          '<div class="qn"><b>1 \u00b7 When?</b></div><div class="chips" data-when="' + i + '">' + ['2027', '2028', 'Later'].map(function (w) { return '<button class="chip" data-v="' + w + '" aria-pressed="' + (st.when === w) + '">' + w + '</button>'; }).join('') + '</div>' +
          '<div class="qn"><b>2 \u00b7 Which of your needs does it serve?</b></div>' + whyChips(i, st) +
          prioHTML(i, st, p) +
          (S.lab.themes.filter(Boolean).length ? '<div class="qn">Optional \u00b7 which part of what your lab is about does it feed?</div><div class="chips" data-theme="' + i + '">' + S.lab.themes.map(function (t, k) { return t ? '<button class="chip" data-v="' + k + '" aria-pressed="' + (st.themes.indexOf(k) > -1) + '">' + esc(t) + '</button>' : ''; }).join('') + '</div>' : '') +
          '</details>' +
          (i > 0 ? '<button class="mini" data-up="' + i + '">↑ Move up</button>' : '') + '</div></div>';
      } else {
        html += '<div class="slot empty-slot"><span class="dot ghost"><b>' + (i + 1) + '</b></span><span class="muted">Step ' + (i + 1) + ': pick a card below</span></div>';
      }
    }
    html += '</div><h2 class="h2">My cards</h2><div class="mycards">' + favs.map(function (p) {
      var k = stepOf(p.id), f = pfam(p);
      return '<div class="mc"><span class="bar" style="background:' + famColor(f) + '"></span><div class="mc-t"><b>' + esc(p.name) + '</b><span class="muted">' + esc(famLabel(f)) + ' · ' + esc(p.domain) + '</span></div>' +
        (k > -1 ? '<span class="inpath">Step ' + (k + 1) + '</span>' : (S.path.length < 3 ? '<button class="btn" data-addstep="' + esc(p.id) + '" style="min-height:40px;padding:0 12px">+ Step ' + (S.path.length + 1) + '</button>' : '')) + '</div>';
    }).join('') + '</div><p class="muted" style="margin-top:8px"><a href="#/cards">Star more cards</a></p>';
    html += '<h2 class="h2">Your doubts</h2><p class="muted">Write what you do not know yet. Ask Carlos or another lab during the clinic, and note the answer: it goes into your guide.</p>' +
      '<div class="stack">' + S.questions.map(function (q, i) { var an = answerFor(q); return '<div class="qcard"><div class="q"><span>' + esc(q) + '<span class="qa">' + (an.length ? '\u2192 Your guide answers part of it: ' + esc(an.map(function (a) { return a.topic; }).join(' \u00b7 ')) : '\u2192 Ask it today') + '</span></span><button aria-label="Remove question" data-dq="' + i + '">\u00d7</button></div>' +
        '<input type="text" data-told="' + i + '" maxlength="300" placeholder="Answer from today, and who gave it" value="' + esc(S.told[q] || '') + '"></div>'; }).join('') + '</div>' +
      '<label class="f" for="nq">New doubt</label><textarea id="nq" maxlength="300"></textarea>' +
      '<div class="row" style="margin-top:10px"><button class="btn" id="addq">Add</button></div>' +
      (D.questionPrompts && D.questionPrompts.length ? '<p class="muted" style="margin-top:14px">Doubts other labs often have:</p><div class="chips" data-group="qp">' + D.questionPrompts.map(function (q) { return '<button class="chip" data-v="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' : '') +
      '<hr><a class="btn blue" href="#/road">4 \u00b7 My roadmap</a>';
    render(html, 'path', true);
    app.querySelectorAll('[data-addstep]').forEach(function (b) { b.addEventListener('click', function () { var pp = project(b.dataset.addstep); S.path.push({ project: b.dataset.addstep, why: [], when: '', themes: [], prio: (pp && pp.prio ? pp.prio.slice() : []), how: '', peer: '' }); save(); pathView(); }); });
    app.querySelectorAll('[data-unstep]').forEach(function (b) { b.addEventListener('click', function () { var u = +b.dataset.unstep; S.path.splice(u, 1); S.road.ms.forEach(function (m) { m.steps = m.steps.filter(function (x) { return x !== u; }).map(function (x) { return x > u ? x - 1 : x; }); }); S.road.ready = {}; save(); pathView(); }); });
    app.querySelectorAll('[data-up]').forEach(function (b) { b.addEventListener('click', function () { var i = +b.dataset.up, t = S.path[i - 1]; S.path[i - 1] = S.path[i]; S.path[i] = t; S.road.ms.forEach(function (m) { m.steps = m.steps.map(function (x) { return x === i ? i - 1 : x === i - 1 ? i : x; }); }); var r0 = S.road.ready[i - 1]; S.road.ready[i - 1] = S.road.ready[i]; S.road.ready[i] = r0; save(); pathView(); }); });
    app.querySelectorAll('[data-why]').forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var st = S.path[+box.dataset.why], v = b.dataset.v, k = st.why.indexOf(v); if (k > -1) st.why.splice(k, 1); else st.why.push(v); b.setAttribute('aria-pressed', k < 0); save(); }); });
    app.querySelectorAll('[data-theme]').forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var st = S.path[+box.dataset.theme], v = +b.dataset.v, k = st.themes.indexOf(v); if (k > -1) st.themes.splice(k, 1); else st.themes.push(v); b.setAttribute('aria-pressed', k < 0); save(); }); });
    app.querySelectorAll('[data-prio]').forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var st = S.path[+box.dataset.prio], v = b.dataset.v, k = st.prio.indexOf(v); if (k > -1) st.prio.splice(k, 1); else st.prio.push(v); b.setAttribute('aria-pressed', k < 0); save(); }); });
    app.querySelectorAll('[data-how]').forEach(function (el) { el.addEventListener('input', function () { S.path[+el.dataset.how].how = el.value; save(); }); });
    app.querySelectorAll('[data-when]').forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var st = S.path[+box.dataset.when]; st.when = st.when === b.dataset.v ? '' : b.dataset.v; box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === st.when); }); save(); }); });
    app.querySelectorAll('[data-told]').forEach(function (el) { el.addEventListener('input', function () { var q = S.questions[+el.dataset.told]; if (el.value.trim()) S.told[q] = el.value; else delete S.told[q]; save(); }); });
    app.querySelectorAll('[data-dq]').forEach(function (b) { b.addEventListener('click', function () { delete S.told[S.questions[+b.dataset.dq]]; S.questions.splice(+b.dataset.dq, 1); save(); pathView(); }); });
    document.getElementById('addq').addEventListener('click', function () { var t = document.getElementById('nq').value.trim(); if (t) { S.questions.push(t); save(); pathView(); } });
    chipGroup('qp', function (v) { if (S.questions.indexOf(v) < 0) { S.questions.push(v); save(); pathView(); } });
  }

  /* ---------- guide / PDF ---------- */
  function steps() { return S.path.filter(function (s) { return project(s.project); }); }
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
    return scored.slice(0, 2).map(function (x) { return x[1]; });
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
    var st = steps(), R = readings();
    render(
      '<div class="kicker">Your take-away</div><h1 class="h1">My guidelines</h1>' +
      '<p class="lead">Made from your choices. It is not a summary of today: it is a map to come back to when you prepare your next applications.</p>' +
      (st.length ? '<div class="stack">' + st.map(function (s, i) { var p = project(s.project), f = pfam(p); return '<div class="aitem"><span class="sw fam-' + f + '">' + (i + 1) + '</span><span class="tx"><b>' + esc(p.name) + '</b><span>' + esc(famLabel(f) + (s.when ? ' · ' + s.when : '') + (s.why.length ? ' · ' + whyLabels(s.why).join(', ') : '')) + '</span></span></div>'; }).join('') + '</div>'
        : '<div class="empty">No path yet. <a href="#/path">Put your starred cards in order first.</a></div>') +
      (S.questions.length ? '<h2 class="h2">Your questions, answered</h2><div class="stack">' + S.questions.map(function (q) { var an = answerFor(q); return '<div class="qcard"><div class="q"><span>' + esc(q) + '</span></div>' + (S.told[q] ? '<div class="ans"><div class="lab">Answered today</div><p>' + esc(S.told[q]) + '</p></div>' : '') + (an.length ? an.map(function (a) { var pl = pathLink(a); return '<div class="ans"><div class="lab">' + esc(a.topic) + '</div><p>' + esc(a.a) + '</p>' + (a.next ? '<p class="muted">' + esc(a.next) + '</p>' : '') + (pl ? '<p><b>' + esc(pl) + '</b></p>' : '') + '<p>' + a.links.map(function (l) { return link(l.url, l.label); }).join(' · ') + '</p></div>'; }).join('') : '<div class="ans"><p>No ready answer in this guide. Take it to the next clinics, or ask your National Agency or Creative Desk (links in your PDF). That is exactly what the clinics are for.</p></div>') + '</div>'; }).join('') + '</div>' : '') +
      (st.length ? '<h2 class="h2">Priorities your path answers</h2><div class="stack">' + st.map(function (s, i) { var pr = prioList(s); return '<div class="advice"><b>Step ' + (i + 1) + ':</b> ' + (pr.length ? esc(pr.join(' \u00b7 ')) + (s.how ? '<br><span class="muted">' + esc(s.how) + '</span>' : '') : '<span class="muted">No priority chosen yet. <a href="#/path">Which one would an expert see in it?</a></span>') + '</div>'; }).join('') + '</div>' : '') +
      (R.length ? '<h2 class="h2">What your path says</h2><div class="stack">' + R.map(function (t) { return '<div class="advice">' + esc(t) + '</div>'; }).join('') + '</div>' : '') +
      ((D.strategy && D.strategy.references) ? '<h2 class="h2">Official references</h2><p class="muted">The documents and tools behind this guide. Always read the current version.</p>' + D.strategy.references.map(function (g) { return '<h3 class="h3">' + esc(g.group) + '</h3><ul class="links">' + g.items.map(function (l) { return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a></li>'; }).join('') + '</ul>'; }).join('') : '') +
      '<p class="muted" style="margin-top:14px">' + S.fav.length + ' starred card(s) · ' + S.questions.length + ' question(s)</p>' +
      '<div class="row" style="margin-top:16px"><button class="btn blue" id="pdf"' + (st.length ? '' : ' disabled') + '>Download my guidelines (PDF)</button></div>' +
      '<p class="muted" id="pdfmsg" role="status"></p>' +
      '<hr><button class="btn ghost" id="reset">Start again</button>', 'guide');
    document.getElementById('pdf').addEventListener('click', makePDF);
    document.getElementById('reset').addEventListener('click', function () { if (window.confirm('Clear your cards, path and questions on this phone?')) { S = blank(); save(); home(); } });
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
  function makePDF() {
    var msg = document.getElementById('pdfmsg'); msg.textContent = 'Preparing your guide…';
    loadFonts().catch(function () { return null; }).then(function (f) {
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
      size = size || 9.5; var kw = 34;
      pairs.forEach(function (r) { if (!r[1]) return; var L = lines(r[1], size, false, CW - kw); need(L.length * lh(size) + 2); font(true, 8); color(G5); doc.text(r[0].toUpperCase(), M, y); font(false, size); color(INK); L.forEach(function (ln, k) { doc.text(ln, M + kw, y + k * lh(size)); }); y += L.length * lh(size) - lh(size) + 2; stroke(G2); doc.setLineWidth(0.2); doc.line(M, y, M + CW, y); y += 4.6; });
    }

    var st = steps(), ps = st.map(function (s) { return project(s.project); });

    /* ===== 1. cover with path diagram ===== */
    fill(BLUE); doc.rect(0, 0, W, H, 'F');
    if (fonts && fonts[2]) { try { doc.addImage('data:image/png;base64,' + fonts[2], 'PNG', W - M - 44, 14, 44, 11); } catch (e) {} }
    color('#ffffff'); font(true, 9); doc.text('EU FUNDING POLICY CLINIC · VULCA SEMINAR 2026 · CUENCA', M, 20);
    font(true, 40); doc.text('Your lab\'s', M, 62); doc.text('road to 2028', M, 78);
    font(false, 14); doc.text(doc.splitTextToSize((S.lab.name || 'Your lab') + (S.lab.country ? ' · ' + S.lab.country : '') + '', CW), M, 96);
    font(false, 10); doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), M, 104);
    if (S.lab.vision) { font(true, 12); doc.text(doc.splitTextToSize('\u201c' + S.lab.vision + '\u201d', CW), M, 118); }
    if (S.lab.target) { font(false, 10.5); doc.text('By 2030: ' + ((byId(D.targets, S.lab.target) || {}).label || ''), M, 136); }
    /* path diagram */
    var n = Math.max(st.length, 1), gx0 = M + 14, gx1 = W - M - 14, gy = 168, stepW = n > 1 ? (gx1 - gx0) / (n - 1) : 0;
    doc.setLineWidth(1.2); stroke('#ffffff');
    if (n > 1) doc.line(gx0, gy, gx1, gy);
    st.forEach(function (s, i) {
      var p = ps[i], f = pfam(p), pl = ppil(p), cx = n > 1 ? gx0 + i * stepW : (gx0 + gx1) / 2;
      fill('#ffffff'); doc.circle(cx, gy, 13, 'F'); fill(famColor(f)); doc.circle(cx, gy, 11, 'F');
      color(famText(f)); font(true, 18); doc.text(String(i + 1), cx, gy + 2.4, { align: 'center' });
      color('#ffffff'); font(true, 12); doc.text(doc.splitTextToSize(famLabel(f), 52), cx, gy + 22, { align: 'center' });
      font(false, 9.5); doc.text(doc.splitTextToSize('like ' + p.name, 52), cx, gy + 28, { align: 'center' });
      font(false, 8.5); doc.text(doc.splitTextToSize((pl ? pl.label : '') + (s.when ? ' · ' + s.when : ''), 52), cx, gy + 38, { align: 'center' });
    });
    font(false, 10.5); color('#ffffff');
    doc.text(doc.splitTextToSize('This guide reads the path you sketched during the clinic against eleven years of Buinho\'s European projects. It is a starting point, not a recommendation: rules and amounts refer to the 2021–2027 programmes, and what comes after 2027 is still a proposal.', CW), M, 232);
    footer();

    /* ===== R. your roadmap ===== */
    roadInit();
    var RM = S.road, GC = st.map(function (s, i) { return goCheck(i); });
    doc.addPage(); page++; band(BLUE, 'Your roadmap', 'From where you stand to your 2030', 'What your lab must build, by when, and what builds it');
    box('Where you want to be', [(S.lab.vision ? '\u201c' + S.lab.vision + '\u201d' : 'No 2030 sentence yet: what will your lab be known for, and for whom?')].concat(S.lab.target ? ['Your role by 2030: ' + (byId(D.targets, S.lab.target) || {}).label] : []), { rule: INK, bg: WALL, size: 11 });
    label('Where you stand today');
    var capList = D.capacities || [], cw2 = CW / 3;
    capList.forEach(function (c, k) { var cx = M + (k % 3) * cw2, cy = y + Math.floor(k / 3) * 9, v = S.lab.cap[c.id] || 0; font(false, 8.5); color(INK); doc.text(c.label, cx, cy); for (var n = 1; n <= 3; n++) { if (n <= v) { fill(BLUE); doc.circle(cx + cw2 - 20 + n * 4.5, cy - 1.2, 1.5, 'F'); } else { stroke(G2); doc.setLineWidth(0.4); doc.circle(cx + cw2 - 20 + n * 4.5, cy - 1.2, 1.5, 'S'); } } });
    y += 22;
    /* timeline grid */
    var COLS = ['2027', '2028', '2029\u20132034'], gx = M + 44, gw = (CW - 44) / 3, colOf = function (w) { return w === '2027' || !w ? 0 : w === '2028' ? 1 : 2; };
    need(40); font(true, 8.5); color(INK); COLS.forEach(function (c, j) { fill(j === 1 ? '#eef3ff' : WALL); doc.rect(gx + j * gw, y - 4, gw - 2, 6, 'F'); color(INK); doc.text(c, gx + j * gw + 2, y); });
    font(false, 6.8); color(G5); doc.text(['last calls under today\u2019s rules', 'new Erasmus+ with the Solidarity Corps', 'the new programmes run'][0], gx + 2, y + 4.5); doc.text('new Erasmus+ with the Solidarity Corps', gx + gw + 2, y + 4.5); doc.text('the new programmes run', gx + 2 * gw + 2, y + 4.5); y += 11;
    function disc(cx, cy, i, r) { var f = pfam(ps[i]); fill(famColor(f)); doc.circle(cx, cy, r, 'F'); color(famText(f)); font(true, r > 3 ? 9 : 7); doc.text(String(i + 1), cx, cy + (r > 3 ? 1.2 : 0.9), { align: 'center' }); }
    font(true, 8.5); color(INK); doc.text('EU steps', M, y + 1);
    var used = [0, 0, 0]; st.forEach(function (s, i) { var j = colOf(s.when), cx = gx + j * gw + 6 + used[j] * 22; used[j]++; disc(cx, y, i, 4); font(true, 7); color(G5); doc.text(GC[i].badge, cx + 5.5, y + 1.2); });
    y += 12;
    RM.ms.forEach(function (m) {
      need(22); stroke(G2); doc.setLineWidth(0.2); doc.line(M, y - 6, M + CW, y - 6);
      font(true, 8.5); color(INK); doc.text(doc.splitTextToSize(capLabel(m.cap), 40), M, y); font(false, 7.5); color(G5); doc.text((S.lab.cap[m.cap] || '?') + ' \u2192 ' + m.to + ' of 3', M, y + 8);
      var j = colOf(m.by === '2030' ? 'Later' : m.by), bx = gx + j * gw, txt = doc.splitTextToSize(m.proof || 'How will you know?', gw - 6).slice(0, 3);
      fill(m.proof ? '#ffffff' : '#fff1f1'); stroke(INK); doc.setLineWidth(0.4); doc.rect(bx, y - 3.5, gw - 2, 4 + txt.length * 3.4, 'FD'); font(false, 7.5); color(INK); txt.forEach(function (ln, k) { doc.text(ln, bx + 2, y + k * 3.4); });
      if (m.by) { font(true, 6.5); color(G5); doc.text('by ' + m.by, bx + gw - 3, y - 4.5, { align: 'right' }); }
      var by = m.steps.filter(function (i) { return st[i]; }).map(function (i) { return 'Step ' + (i + 1); }).concat(m.other.map(otherLabel)); font(false, 7); color(by.length ? G5 : RED); doc.text(doc.splitTextToSize('Built by: ' + (by.length ? by.join(' \u00b7 ') : 'nothing yet'), gw * 3 - 4)[0], gx, y + 6 + txt.length * 3.4);
      y += 19;
    });
    if (!RM.ms.length) text('No roadmap yet: in the app, open \u201cMy roadmap\u201d and pick what your lab must build.', 9.5, false, G5, 3);
    var warn = []; RM.ms.forEach(function (m) { if (!m.steps.length && !m.other.length) warn.push('Nothing builds \u201c' + capLabel(m.cap) + '\u201d yet: which step, or which resource outside the EU?'); });
    GC.forEach(function (g, i) { if (!g.builds) warn.push('Step ' + (i + 1) + ' builds none of your roadmap: a good project, but what does it leave behind?'); });
    if (warn.length) box('What this says', warn.slice(0, 3), { rule: RED, bg: WALL, size: 9.5 });
    var TH = S.lab.themes.map(function (t, k) { return [t, k]; }).filter(function (x) { return x[0]; });
    if (TH.length && st.length) { label('Which step feeds what your lab is about'); var tw2 = (CW - 50) / TH.length; font(true, 8); color(INK); TH.forEach(function (x, j) { doc.text(doc.splitTextToSize(x[0], tw2 - 4)[0], M + 50 + j * tw2, y); }); y += 6;
      st.forEach(function (s, i) { need(8); font(true, 8.5); color(INK); doc.text('Step ' + (i + 1), M, y); TH.forEach(function (x, j) { var on = (s.themes || []).indexOf(x[1]) > -1, cx = M + 50 + j * tw2 + 4; if (on) { fill(INK); doc.circle(cx, y - 1, 2.2, 'F'); } else { stroke(G2); doc.setLineWidth(0.4); doc.circle(cx, y - 1, 2.2, 'S'); } }); y += 7; }); }

    /* ===== G. your guidelines (the deliverable) ===== */
    newPage(); y = 0; band(INK, 'Your guidelines', 'Rules for your next initiatives', 'Drawn from your position, your 2030 and your roadmap');
    var GL = [], th3 = S.lab.themes.filter(Boolean);
    if (th3.length) GL.push(['Say yes to a project only if it feeds: ' + th3.join(' \u00b7 ') + '.', 'Projects that do not feed what your lab is about cost the same work and leave less behind.']);
    else GL.push(['Write down the 2 or 3 things your lab is about, and test every project against them.', 'Without them, each call decides your direction for you.']);
    RM.ms.forEach(function (m) { GL.push(['Until ' + (m.by || '2028') + ', put \u201c' + capLabel(m.cap) + '\u201d first' + (m.proof ? ': ' + m.proof + '.' : '.'), (m.steps.length || m.other.length ? 'Built by ' + m.steps.map(function (i) { return 'step ' + (i + 1); }).concat(m.other.map(otherLabel)).join(', ') + '.' : 'Nothing builds it yet: find a step or a resource outside the EU.')]); });
    var prep = []; GC.forEach(function (g, i) { if (g.lacks.length) prep.push('step ' + (i + 1) + ' needs more ' + g.lacks.map(capLabel).join(' and ').toLowerCase()); });
    GL.push(['Go only when: a partner you trust is on board three months before the deadline, someone has the time to write, and you can advance the costs.', prep.length ? 'Before you go: ' + prep.join('; ') + '.' : 'Check it again for each call.']);
    if (S.lab.target === 'coordinator') GL.push(['Coordinate a small project before a large one.', 'Large partnerships and Creative Europe ask for a track record and financial capacity; a small-scale partnership builds both.']);
    else if (S.lab.target === 'accredited') GL.push(['Start the record for an accreditation now.', 'Accreditation asks for experience in the field and a plan for several years: short mobility projects are the usual way in.']);
    else if (S.lab.target === 'partner') GL.push(['Join good projects as a partner, and lead one clear part of the work.', 'Ask the coordinator which part you lead, what money comes to you, and what stays in your lab afterwards.']);
    GL.push(['In every application, argue only for the priorities you selected, and show them in the activities, the public and the results.', 'Inclusion is expected in almost every funded project: name who takes part and which barrier you lower.']);
    GL.push(['Prepare for 2028 without betting on details.', 'The horizontal priorities, trusted partners and results you can show will count in any version of the new programmes.']);
    GL.push(['Redraw this roadmap in ' + (RM.review || 'November 2027') + '. Change the steps, keep the rules.', 'By then the 2028 calls and the new Programme Guide should be known.']);
    GL.forEach(function (g, k) { var L1 = lines(g[0], 11.5, true, CW - 14), L2 = lines(g[1], 9.5, false, CW - 14); need(L1.length * lh(11.5) + L2.length * lh(9.5) + 8); fill(k % 2 ? BLUE : RED); doc.circle(M + 4, y - 1.4, 4, 'F'); color('#ffffff'); font(true, 10); doc.text(String(k + 1), M + 4, y + 0.2, { align: 'center' }); font(true, 11.5); color(INK); L1.forEach(function (ln) { doc.text(ln, M + 12, y); y += lh(11.5); }); y += 0.8; font(false, 9.5); color(G5); L2.forEach(function (ln) { doc.text(ln, M + 12, y); y += lh(9.5); }); y += 6; });

    /* ===== 1b. your plan on one page ===== */
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    doc.addPage(); page++; band(BLUE, 'Your plan on one page', 'Where you stand, where you go next', 'The rest of this guide explains each line');
    var stageTxt = { none: 'Never applied to EU programmes', partner: 'Partner in EU projects before', coordinator: 'Coordinated EU projects before' }[S.lab.exp] || 'Not given';
    rows([['Where you stand', stageTxt], ['What you need', (S.lab.needs || []).map(function (n) { var w = byId(D.whys || [], n); return w ? w.label : n; }).join(', ') || 'Not given'], ['Your lab in 2030', S.lab.vision || 'Not written yet: it is the question this guide ends with'], ['What your lab is about', S.lab.themes.filter(Boolean).join(' \u00b7 ') || 'Not written yet']]);
    st.forEach(function (s, i) {
      var p = ps[i], a = action(p.action), f = fit(p), ev = ((T.calendar || {})[p.action] || []).filter(function (e) { return e.t === 'deadline'; })[0];
      var body = [(a ? a.short + ' \u00b7 ' + a.name : p.today) + (s.when ? ' \u00b7 ' + s.when : '') + (f.level ? ' \u00b7 ' + FIT_LABEL[f.level] : ''),
        'Example: ' + p.name + (p.external && p.coordinator ? ' (' + p.coordinator.name + ', ' + p.coordinator.country + ')' : ' (Buinho)')];
      if (REQ[p.action]) body.push('It asks for: ' + REQ[p.action]);
      var prl = prioList(s); body.push('Answers: ' + (prl.length ? prl.join(', ') + (s.how ? ' \u2014 ' + s.how : '') : 'no priority chosen yet'));
      if (ev) { var prep = (ev.m + 8) % 12 + 1; body.push('Next move: talk to partners from ' + MONTHS.at(prep - 1) + '; the deadline was in ' + MONTHS.at(ev.m - 1) + ' in the 2026 calls (check the 2027 call).'); }
      box('Step ' + (i + 1) + ' \u00b7 ' + famLabel(pfam(p)), body, { rule: famColor(pfam(p)) === SUN ? INK : famColor(pfam(p)), bg: WALL, size: 9.8 });
    });
    if (S.questions.length) { var qs = S.questions.slice(0, 3).map(function (q) { var an = answerFor(q); return q + (S.told[q] ? '  \u2192 answered today' : '') + (an.length ? '  \u2192 in this guide: ' + an.map(function (a) { return a.topic; }).join(', ') : '  \u2192 take it to the clinics'); }); box('Your questions (answers on the next pages)', qs, { rule: SUN === SUN ? INK : INK, bg: '#fff8d6', bullets: true, size: 9.8 }); }

    /* ===== 2. path at a glance: map against 2028 pillars ===== */
    doc.addPage(); page++; band(INK, 'Your path at a glance', 'Where your steps sit after 2027', 'Erasmus+ pillars and AgoraEU, according to the proposals for 2028–2034');
    var cols = D.pillars || [], cw3 = (CW - 8) / 3;
    cols.forEach(function (pl, k) {
      var x = M + k * (cw3 + 4); fill(WALL); doc.rect(x, y, cw3, 112, 'F');
      font(true, 11); color(INK); doc.text(pl.label, x + 4, y + 8); font(false, 8.5); color(G5); doc.text(doc.splitTextToSize(pl.name, cw3 - 8), x + 4, y + 13);
      font(false, 7.5); doc.text(doc.splitTextToSize(pl.today, cw3 - 8), x + 4, y + 22);
    });
    var colY = cols.map(function () { return y + 40; });
    st.forEach(function (s, i) {
      var p = ps[i], a = action(p.action), k = Math.max(0, cols.map(function (c) { return c.id; }).indexOf(a ? a.pillar : '')), x = M + k * (cw3 + 4) + 4, f = pfam(p), yy = colY[k];
      fill(famColor(f)); doc.rect(x, yy, cw3 - 8, 20, 'F'); color(famText(f));
      font(true, 14); doc.text(String(i + 1), x + 4, yy + 8); font(true, 9.5); doc.text(doc.splitTextToSize(famLabel(f), cw3 - 22)[0], x + 12, yy + 7);
      font(false, 8); doc.text(doc.splitTextToSize(p.name, cw3 - 18)[0], x + 12, yy + 12); doc.text(doc.splitTextToSize('Today: ' + (a ? a.short : p.today) + (s.when ? ' · ' + s.when : ''), cw3 - 18)[0], x + 12, yy + 16.5);
      colY[k] += 24;
    });
    y += 120;
    label('About your lab');
    rows([['Experience', { none: 'Never applied to EU programmes', partner: 'Partner in EU projects before', coordinator: 'Coordinated EU projects before' }[S.lab.exp] || 'Not given'],
      ['Works with', (S.lab.domains || []).map(function (d) { var x = byId(D.domains || [], d); return x ? x.label : d; }).join(', ') || 'Not given'],
      ['Why these steps', st.map(function (s, i) { return (i + 1) + ': ' + (whyLabels(s.why).join(', ') || '—'); }).join('   ')]]);
    if (S.lab.exp && D.expNotes) box('A first reading', D.expNotes[S.lab.exp], { rule: BLUE, bg: WALL });

    /* ===== 2b. priorities ===== */
    if (PR.horizontal.length) {
      newPage(); y = 0; band(BLUE, 'What Europe reads in your path', 'The priorities your path speaks to', 'Horizontal priorities for every action, specific ones for each field');
      text(PR.intro, 10, false, G7, 3);
      box('How they are used', PR.rules, { rule: BLUE, bg: WALL, bullets: true, size: 9.5 });
      label('Which step answers which horizontal priority');
      var hc = (CW - 50) / PR.horizontal.length; font(true, 8.5); color(INK); PR.horizontal.forEach(function (h, j) { doc.text(h.short, M + 50 + j * hc, y); }); y += 7;
      st.forEach(function (s, i) { need(10); font(true, 9.5); color(INK); doc.text('Step ' + (i + 1), M, y); font(false, 8); color(G5); doc.text(doc.splitTextToSize(ps[i].name, 44)[0], M, y + 4); PR.horizontal.forEach(function (h, j) { var on = (s.prio || []).indexOf(h.id) > -1, ex = (ps[i].prio || []).indexOf(h.id) > -1, cx = M + 50 + j * hc + 4; if (on) { fill(BLUE); doc.circle(cx, y - 1, 2.6, 'F'); } else { stroke(G2); doc.setLineWidth(0.4); doc.circle(cx, y - 1, 2.6, 'S'); } if (ex) { stroke(INK); doc.setLineWidth(0.5); doc.circle(cx, y - 1, 4, 'S'); } }); y += 11; });
      if (ps.some(function (p) { return p.prio && p.prio.length; })) { fill(BLUE); doc.circle(M + 2, y - 4, 1.6, 'F'); font(false, 7.5); color(G5); doc.text('your choice', M + 5, y - 3); stroke(INK); doc.setLineWidth(0.4); doc.circle(M + 30, y - 4, 2.4, 'S'); doc.text('chosen in the example project\u2019s real application', M + 34, y - 3); y += 3; }
      var other = []; st.forEach(function (s, i) { var x = (s.prio || []).filter(function (id) { return id.indexOf('h-') !== 0; }).map(prioInfo).filter(Boolean).map(function (z) { return z.name; }); if (x.length) other.push('Step ' + (i + 1) + ': ' + x.join('; ')); if (s.how) other.push('Step ' + (i + 1) + ', how: ' + s.how); });
      if (other.length) box('Field priorities and how', other, { rule: INK, bg: WALL, size: 9.5 });
      var unused = PR.horizontal.filter(function (h) { return !st.some(function (s) { return (s.prio || []).indexOf(h.id) > -1; }); }).map(function (h) { return h.short; });
      var none = st.filter(function (s) { return !(s.prio || []).length; }).length, pn = [];
      if (none) pn.push(none + ' step(s) without a priority. Funded projects usually answer several: look at the example card, then choose the ones you can really show.');
      if (!st.some(function (s) { return (s.prio || []).indexOf('h-inc') > -1; })) pn.push('No step marks Inclusion. In practice almost every funded project addresses it, and experts look for it: name who is missing today and which barrier you lower.');
      else pn.push('Inclusion is in almost every funded project, so experts expect it. What makes it count is naming who takes part and which barrier you lower.');
      if (unused.length && unused.length < PR.horizontal.length) pn.push('Not in your path yet: ' + unused.join(', ') + '. You do not need all four; but is one of them already part of how your lab works?');
      if (!none && st.length) pn.push('Every step has a priority. Now check that each one shows in the activities, the public and the results, not only in the text.');
      if (pn.length) box('What this says', pn, { rule: RED, bg: WALL, size: 10 });
      box('To discuss with your neighbour', PR.horizontal.map(function (h) { return h.short + ': ' + h.q; }), { rule: SUN === SUN ? INK : INK, bg: '#fff8d6', bullets: true, size: 10 });
      var mine = (S.lab.domains || []).filter(function (d) { return PR.sectors[d]; });
      mine.forEach(function (d) { var sc = PR.sectors[d]; box(sc.field + ' \u00b7 specific priorities (2026)', sc.items.concat([sc.lab]), { rule: BLUE, bg: '#ffffff', bullets: true, size: 9.5 }); });
      if (!mine.length) text('Tell the app who you work with (start screen) and the specific priorities of your fields appear here.', 9.5, false, G5, 3);
      if (acts0().indexOf('crea') > -1) box(PR.culture.field + ' (2026)', PR.culture.items.concat([PR.culture.rule]), { rule: famColor('culture') === SUN ? INK : famColor('culture'), bg: '#ffffff', bullets: true, size: 9.5 });
      if (PR.buinho) box(PR.buinho.title, PR.buinho.lines.concat([PR.buinho.source]), { rule: RED, bg: '#ffffff', bullets: true, size: 9.5 });
      box(PR.future.title, PR.future.lines.concat([PR.future.status, PR.future.reading]), { rule: INK, bg: WALL, bullets: true, size: 9.5 });
      label('Official sources'); PR.links.slice(0, 6).forEach(function (l) { linkLine(l); });
    }
    function acts0() { return ps.map(function (p) { return p.action; }); }

    /* ===== 3. reading your path ===== */
    newPage(); y = 0; band(RED, 'Practical advice', 'Reading your path', 'Inferences from your steps, their order, your reasons and your timing');
    var RD = readings();
    RD.forEach(function (t, i) { box('Note ' + (i + 1), t, { rule: i % 2 ? BLUE : RED, bg: WALL, size: 10.5 }); });
    if (T.buinho) { y += 2; box('How Buinho reads its own path', [T.buinho.intro, T.buinho.themes, T.buinho.base], { rule: INK, bg: '#ffffff', size: 10 }); }

    /* ===== 3b. your questions, answered ===== */
    newPage(); y = 0; band(SUN, 'Where your path stops', 'Your questions, answered', 'What this guide can already tell you, and where to take the rest');
    function notes(n, lb) { need(n * 7 + 6); font(true, 7.5); color(G5); doc.text(lb || 'NOTES FROM THE CLINIC', M, y); y += 2; stroke(G2); doc.setLineWidth(0.3); for (var k = 0; k < n; k++) { y += 7; doc.line(M, y, M + CW, y); } y += 7; }
    if (S.questions.length) S.questions.forEach(function (q, qi) {
      var L = lines(q, 11.5, true, CW - 12), h = L.length * lh(11.5) + 9; need(h + 40);
      fill(NOTE); doc.rect(M, y - 4, CW, h, 'F'); font(true, 11.5); color(INK); L.forEach(function (ln, k) { doc.text(ln, M + 6, y + 2 + k * lh(11.5)); }); y += h + 3;
      var an = answerFor(q);
      if (S.told[q]) box('Answered today', S.told[q], { rule: INK, bg: '#fff8d6', size: 10.5 });
      if (an.length) an.forEach(function (a) {
        var body = [a.a]; if (a.next) body.push(a.next); var pl = pathLink(a); if (pl) body.push(pl);
        box(a.topic, body, { rule: SUN === SUN ? INK : INK, bg: '#ffffff', size: 10 });
        a.links.forEach(function (l) { linkLine(l, M + 6, CW - 6); });
      });
      else if (!S.told[q]) box('No ready answer in this guide', ['That is what the clinics are for: bring this question to the next sessions of the seminar, to a lab that has done it, or to your National Agency or Creative Europe Desk.'], { rule: RED, bg: WALL, size: 10 });
      if (!S.told[q]) notes(3); y += 2;
    });
    else text('(No questions written in the app. Write them in "My path" and download the guide again.)', 10, false, G5, 4);
    if (D.whereToAsk && D.whereToAsk.length) { y += 2; label('Where to look for answers'); D.whereToAsk.forEach(function (l) { linkLine(l); }); }

    /* ===== 4. one spread per step ===== */
    st.forEach(function (s, i) {
      var p = ps[i], a = action(p.action), f = pfam(p), pl = ppil(p), P = p.partnership || {}, SP = (T.projects || {})[p.id] || {};
      newPage(); y = 0; band(famColor(f), 'Step ' + (i + 1) + (pl ? ' · ' + pl.label + ' · ' + pl.name : '') + (s.when ? ' · ' + s.when : ''), famLabel(f) + ' — like ' + p.name, 'Today: ' + p.today + (p.external ? ' · ' + (p.coordinator ? p.coordinator.name + ' (' + p.coordinator.country + ')' : '') : ' · Buinho was ' + p.role.toLowerCase()) + ' · ' + p.years);
      label(p.external ? 'An example from another lab' + (p.goodPractice ? ' · good practice' : '') : 'The Buinho example'); text(p.objective, 11, true, INK, 2); text(p.did, 10, false, G7, 3);
      if (p.external) { if (p.whyMakers) box('What a lab can take from it', p.whyMakers, { rule: famColor(f) === SUN ? INK : famColor(f), bg: WALL }); if (p.url) linkLine({ label: 'Official project page' + (p.number ? ' ' + p.number : ''), url: p.url }); if (p.extraUrl) linkLine({ label: 'Project website', url: p.extraUrl }); }
      if (SP.place) box('Where it sits in our strategy', [SP.place, SP.connects], { rule: famColor(f) === SUN ? INK : famColor(f), bg: WALL });
      label('The partnership');
      rows([['Partners', P.size + (list(P.countries).length ? ' (' + P.countries.join(', ') + ')' : '')], ['Who brings what', P.roles], ['Money', P.money], ['What it took', p.needed], ['What it left', p.left]]);
      if (p.lesson) box('Lesson', p.lesson, { rule: RED, bg: '#ffffff' });
      var dd = distance(i); if (dd.length) box('Distance from where you are', dd, { rule: BLUE, bg: WALL, size: 10 });
      var th = (s.themes || []).map(function (k) { return S.lab.themes[k]; }).filter(Boolean); if (S.lab.themes.filter(Boolean).length) box('Feeds what your lab is about', th.length ? th.join(' \u00b7 ') : 'Nothing marked yet. Is this step worth it, or does it need a different angle?', { rule: th.length ? INK : RED, bg: '#ffffff', size: 10 });
      if (p.formPrio && p.formPrio.length) box('Priorities in the real application of ' + p.name + ', and why', p.formPrio.concat(p.prioWhy ? [p.prioWhy] : []), { rule: G2, bg: WALL, size: 9.5 });
      var gc = goCheck(i), bl = S.road.ms.filter(function (m) { return m.steps.indexOf(i) > -1; }).map(function (m) { return capLabel(m.cap) + (m.proof ? ' \u2192 ' + m.proof : ''); });
      box(gc.badge + ' \u00b7 what this step builds', (bl.length ? bl : ['None of your roadmap yet.']).concat(gc.lacks.length ? ['Build first: ' + gc.lacks.map(capLabel).join(', ')] : []), { rule: gc.badge === 'Go' ? BLUE : gc.badge === 'Prepare' ? SUN : RED, bg: '#ffffff', size: 10 });
      var prf = prioList(s, true); box('Priorities this step answers', prf.length ? prf.concat(s.how ? ['How: ' + s.how] : []) : ['No priority chosen yet. Which one would an expert see in this step, and what would you show for it?'], { rule: prf.length ? BLUE : RED, bg: '#ffffff', size: 10, bullets: !!prf.length });
      if (SP.advice) box('If this is your step: practical advice', SP.advice, { rule: RED, bg: WALL, bullets: true, size: 10.5 });
      if (a) {
        box('After 2027', a.future, { rule: INK, bg: '#ffffff' });
        label('How this kind of action works today · ' + a.short + ' · ' + a.name);
        rows([['For', a.purpose], ['Who can apply', a.who], ['Partners', a.partners], ['Duration', a.duration], ['Money', a.funding], ['Where', a.where], ['Deadlines', a.deadlines], ['First step?', a.firstStep], ['It builds', a.builds]], 9);
        if (a.links && a.links.length) { label('Official links'); a.links.forEach(function (l) { linkLine(l); }); }
        var dom = (S.lab.domains || []).map(function (d) { return byId(D.domains || [], d); }).filter(Boolean);
        if (a.searchUrl && dom.length) { label('Find similar projects in your field'); dom.forEach(function (d) { linkLine({ label: d.label, url: a.searchUrl(d) }); }); }
      }
    });

    /* ===== reference part ===== */
    newPage(); fill(WALL); doc.rect(0, 0, W, H, 'F'); color(INK); font(true, 9); doc.text('PART 2', M, 120); font(true, 30); doc.text('Reference', M, 136); font(false, 11); color(G7); doc.text(doc.splitTextToSize('The yearly calendar, the long-term questions behind every application, choosing partners, a checklist, what changes after 2027, official sources and what Buinho learned. Keep it for when you write.', CW - 20), M, 148);

    /* ===== 5. your year ===== */
    newPage(); y = 0; band(SUN, 'Annual planning', 'Your year of deadlines', 'A typical year, based on the 2026 calls, for the actions on your path');
    var CAL = T.calendar || {}, acts = []; ps.forEach(function (p) { if (p.action && acts.indexOf(p.action) < 0) acts.push(p.action); });
    var gx = M + 46, gw = CW - 46, mw = gw / 12, MON = 'JFMAMJJASOND';
    font(true, 8); color(G5); for (var mi = 0; mi < 12; mi++) doc.text(MON[mi], gx + mi * mw + mw / 2, y, { align: 'center' });
    y += 3;
    acts.forEach(function (aid) {
      var a = action(aid), ev = CAL[aid] || []; need(16);
      font(true, 9); color(INK); doc.text(doc.splitTextToSize(a.short + ' · ' + a.name, 44), M, y + 5);
      fill(WALL); doc.rect(gx, y, gw, 12, 'F'); stroke(G2); doc.setLineWidth(0.2); for (var k = 1; k < 12; k++) doc.line(gx + k * mw, y, gx + k * mw, y + 12);
      ev.forEach(function (e) {
        var cx = gx + (e.m - 1) * mw + mw / 2;
        if (e.t === 'deadline') { fill(famColor(a.family) === SUN ? '#e0a800' : famColor(a.family)); for (var b = 1; b <= 3; b++) { var pm = e.m - b; if (pm >= 1) { doc.setGState && doc.setGState(new doc.GState({ opacity: 0.18 })); doc.rect(gx + (pm - 1) * mw, y, mw, 12, 'F'); doc.setGState && doc.setGState(new doc.GState({ opacity: 1 })); } } doc.circle(cx, y + 6, 2.6, 'F'); }
        else if (e.t === 'optional') { stroke(INK); doc.setLineWidth(0.5); doc.circle(cx, y + 6, 2.4, 'S'); }
        else { fill(INK); doc.rect(cx - 2, y + 4, 4, 4, 'F'); }
      });
      y += 15;
      ev.forEach(function (e) { font(false, 8); color(G7); doc.text('· ' + MON.charAt(e.m - 1) + ' (' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][e.m - 1] + '): ' + e.l, gx, y); y += 3.8; });
      y += 2;
    });
    y += 2; font(false, 8.5); color(G5);
    fill(INK); doc.circle(M + 2, y - 1, 2, 'F'); doc.text('deadline', M + 6, y); stroke(INK); doc.circle(M + 32, y - 1, 2, 'S'); doc.text('optional second round', M + 36, y); fill(INK); doc.rect(M + 80, y - 3, 3.5, 3.5, 'F'); doc.text('results', M + 86, y); fill('#c9d7ff'); doc.rect(M + 106, y - 3, 6, 3.5, 'F'); doc.text('3 months to find partners and write', M + 114, y);
    y += 8;
    box('Planning the year', ['Talk to partners three months before each deadline; the first months of the year are the busiest.', 'Results of partnerships usually arrive in summer; Creative Europe in November. Projects start months later: plan cash for the gap.', 'The Erasmus+ Programme Guide for the next year is published in late autumn. Read it before you plan.', 'Running projects need reporting at the same time as new applications. Count both.'], { rule: SUN === SUN ? INK : INK, bg: WALL, bullets: true });

    /* ===== 6. long-term dimensions ===== */
    newPage(); y = 0; band(BLUE, 'Behind every application', 'The long-term questions', 'What we look at beyond the forms, and questions for your lab');
    (T.dimensions || []).forEach(function (d) {
      var bl = lines(d.buinho, 9.5, false, CW - 8), ql = d.ask.map(function (q) { return lines('→ ' + q, 9.5, true, CW - 8); });
      var h = 9 + bl.length * lh(9.5) + 2 + ql.reduce(function (s, L) { return s + L.length * lh(9.5) + 1; }, 0) + 4;
      need(h + 3); fill(WALL); doc.rect(M, y - 4, CW, h, 'F'); fill(BLUE); doc.rect(M, y - 4, 1.6, h, 'F');
      var yy = y + 1; font(true, 11.5); color(INK); doc.text(d.title, M + 5, yy); yy += 6;
      font(false, 9.5); color(G7); bl.forEach(function (ln) { doc.text(ln, M + 5, yy); yy += lh(9.5); }); yy += 2;
      font(true, 9.5); color(INK); ql.forEach(function (L) { L.forEach(function (ln) { doc.text(ln, M + 5, yy); yy += lh(9.5); }); yy += 1; });
      y += h + 1;
      if (d.sources && d.sources.length) { need(16); font(true, 7.5); color(G5); doc.text('OFFICIAL SOURCES', M + 5, y + 1); y += 4.5; d.sources.forEach(function (l) { linkLine(l, M + 5, CW - 8); }); }
      y += 3;
    });

    /* ===== 7. partners + other starred cards ===== */
    newPage(); y = 0; band(RED, 'Before you write anything together', 'Choosing partners', 'The five things we check');
    (D.partnerCriteria || []).forEach(function (c, k) { need(18); fill(RED); doc.circle(M + 4, y - 1, 4, 'F'); color(INK); font(true, 11); doc.text(String(k + 1), M + 4, y + 0.6, { align: 'center' }); font(true, 11.5); doc.text(c.label, M + 12, y); y += 5.5; text(c.text, 10, false, G7, 4, M + 12, CW - 12); });
    var other = S.fav.filter(function (id) { return stepOf(id) < 0; }).map(project).filter(Boolean);
    if (other.length) { y += 2; label('Other cards you starred: their partnerships'); other.forEach(function (p) { box(p.name + ' · ' + famLabel(pfam(p)) + ' · ' + p.domain, [p.partnership ? p.partnership.size + '. ' + p.partnership.roles : p.objective].concat(((T.projects || {})[p.id] || {}).advice ? [((T.projects || {})[p.id]).advice[0]] : []), { rule: famColor(pfam(p)) === SUN ? INK : famColor(pfam(p)), bg: WALL, size: 9.5 }); }); }

    /* ===== 8. checklist ===== */
    newPage(); y = 0; band(INK, 'Before you apply', 'A practical checklist', 'Small things that sink good projects');
    (T.checklist || []).forEach(function (c) { var L = lines(c, 10.5, false, CW - 12); need(L.length * lh(10.5) + 5); stroke(INK); doc.setLineWidth(0.5); doc.rect(M, y - 4, 5, 5, 'S'); font(false, 10.5); color(INK); L.forEach(function (ln, k) { doc.text(ln, M + 10, y + k * lh(10.5)); }); y += L.length * lh(10.5) + 5; });

    /* ===== 10. after 2027 ===== */
    if (D.post2027) {
      newPage(); y = 0; band(INK, 'After 2027', D.post2027.title, 'Proposals and negotiating positions, not law');
      box('Status', D.post2027.status, { rule: RED, bg: WALL });
      list(D.post2027.sections).forEach(function (s) { label(s.label); text(s.text, 10, false, INK, 3); });
      box('How to prepare, without betting on details', D.post2027.implications, { rule: BLUE, bg: WALL, bullets: true });
      label('Sources'); list(D.post2027.links).forEach(function (l) { linkLine(l); });
    }

    /* ===== 10b. official references ===== */
    if (T.references && T.references.length) {
      newPage(); y = 0; band(BLUE, 'Check it yourself', 'Official references', 'The documents and tools behind this guide. Rules change every year: always read the current version.');
      T.references.forEach(function (g) { label(g.group); g.items.forEach(function (l) { linkLine(l); }); y += 2; });
    }

    /* ===== 11. Buinho ===== */
    newPage(); y = 0; band(BLUE, 'From Buinho\'s experience', 'What we learned on the way', 'Eleven years of European projects from a rural fablab');
    if (T.buinho) { (T.buinho.branches || []).forEach(function (b) { need(12); font(true, 11); color(INK); doc.text(b.name, M, y); font(false, 10); color(G7); doc.text(doc.splitTextToSize(b.text, CW - 34), M + 34, y); y += 8; }); y += 2; }
    (D.lessons || []).forEach(function (t, k) { box('Lesson ' + (k + 1), t, { rule: k % 2 ? BLUE : RED, bg: WALL, size: 10.5 }); });
    y += 4; text('Buinho Creative Hub · Rua Nova de São Brás, Messejana, Alentejo, Portugal · info@buinho.pt · buinho.pt', 9.5, false, G5, 2);
    footer();
    doc.save('road-to-2028' + (S.lab.name ? '-' + S.lab.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) : '') + '.pdf');
  }

  /* ---------- roadmap ---------- */
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
    var hasTh = S.lab.themes.filter(Boolean).length > 0, feeds = hasTh ? (st.themes || []).length > 0 : null;
    var builds = S.road.ms.some(function (m) { return m.steps.indexOf(i) > -1; });
    var people = S.road.ready[i], x = lacks.length + (builds ? 0 : 1) + (feeds === false ? 1 : 0);
    var badge = people === false || x >= 2 ? 'Wait' : x === 1 ? 'Prepare' : 'Go';
    return { feeds: feeds, builds: builds, lacks: lacks, people: people, badge: badge };
  }
  function roadView() {
    roadInit();
    var st = steps(), R = S.road, html = '<div class="kicker">' + esc(S.lab.name || 'Your lab') + '</div><h1 class="h1">My roadmap</h1>' +
      '<p class="lead">What must your lab be able to do to reach your 2030? Pick up to 3 things to build, then say what builds each one.</p>' +
      (S.lab.vision ? '<div class="advice"><b>2030:</b> ' + esc(S.lab.vision) + (S.lab.target ? '<br><span class="muted">' + esc((byId(D.targets, S.lab.target) || {}).label) + '</span>' : '') + '</div>' : '<p class="muted">No 2030 sentence yet. <a href="#/">Write it on the start screen.</a></p>');
    html += '<div class="qn"><b>1 \u00b7 What to build</b> <span class="muted">(up to 3; today\'s level in brackets)</span></div><div class="chips" data-msel>' + (D.capacities || []).map(function (c) { var on = R.ms.some(function (m) { return m.cap === c.id; }); return '<button class="chip" data-v="' + c.id + '" aria-pressed="' + on + '">' + esc(c.label) + ' (' + (S.lab.cap[c.id] || '?') + ')</button>'; }).join('') + '</div>';
    html += '<div class="stack">' + R.ms.map(function (m, k) { var c = capOf(m.cap) || {};
      return '<div class="slot"><div class="step-b"><div class="qn"><b>' + esc(c.label) + '</b> <span class="muted">today ' + (S.lab.cap[m.cap] || '?') + ' of 3</span></div>' +
        '<div class="f lab">Where you want it</div><div class="chips" data-mto="' + k + '">' + [1, 2, 3].map(function (n) { return '<button class="chip" data-v="' + n + '" aria-pressed="' + (m.to === n) + '">' + n + '</button>'; }).join('') + '</div>' +
        '<div class="f lab">By when</div><div class="chips" data-mby="' + k + '">' + ['2027', '2028', '2030'].map(function (y) { return '<button class="chip" data-v="' + y + '" aria-pressed="' + (m.by === y) + '">' + y + '</button>'; }).join('') + '</div>' +
        '<div class="f lab">How you will know</div><input type="text" data-mproof="' + k + '" maxlength="80" placeholder="' + esc(c.proof || '') + '" value="' + esc(m.proof) + '">' +
        '<div class="f lab">What builds it</div><div class="chips" data-msteps="' + k + '">' + st.map(function (s, i) { var p = project(s.project); return '<button class="chip" data-v="' + i + '" aria-pressed="' + (m.steps.indexOf(i) > -1) + '">Step ' + (i + 1) + ' \u00b7 ' + esc(famLabel(pfam(p))) + '</button>'; }).join('') +
        (D.otherRes || []).map(function (o) { return '<button class="chip" data-o="' + o.id + '" aria-pressed="' + (m.other.indexOf(o.id) > -1) + '">' + esc(o.label) + '</button>'; }).join('') + '</div>' +
        (st.length ? '' : '<p class="muted small"><a href="#/path">Put steps in your path</a> to link them here.</p>') + '</div></div>'; }).join('') + '</div>';
    if (st.length) {
      html += '<div class="qn" style="margin-top:20px"><b>2 \u00b7 Go, prepare or wait?</b> <span class="muted">One check per step.</span></div><div class="stack">' + st.map(function (s, i) { var g = goCheck(i), p = project(s.project);
        return '<div class="advice"><span class="badge b-' + g.badge.toLowerCase() + '">' + g.badge + '</span> <b>Step ' + (i + 1) + '</b> \u00b7 ' + esc(p.name) +
          '<p class="small">' + (g.feeds === null ? '' : (g.feeds ? '\u2713' : '\u2717') + ' feeds what your lab is about \u00b7 ') + (g.builds ? '\u2713' : '\u2717') + ' builds your roadmap' + (g.lacks.length ? ' \u00b7 \u2717 needs more: ' + esc(g.lacks.map(capLabel).join(', ')) : '') + '</p>' +
          '<div class="chips" data-ready="' + i + '"><span class="muted small" style="align-self:center">Someone has the time to write it?</span>' + [['y', 'Yes'], ['n', 'No']].map(function (o) { return '<button class="chip" data-v="' + o[0] + '" aria-pressed="' + (g.people === (o[0] === 'y')) + '">' + o[1] + '</button>'; }).join('') + '</div></div>'; }).join('') + '</div>';
    }
    html += '<div class="qn" style="margin-top:20px"><b>3 \u00b7 When will you redraw it?</b></div><div class="chips" data-review>' + ['June 2027', 'November 2027', 'Early 2028'].map(function (r) { return '<button class="chip" data-v="' + r + '" aria-pressed="' + (R.review === r) + '">' + r + '</button>'; }).join('') + '</div>' +
      '<hr><div class="row"><a class="btn blue" href="#/guide">5 \u00b7 My guidelines</a><a class="btn ghost" href="#/path">Back to my path</a></div>';
    render(html, 'road', true);
    function bind(sel, fn) { app.querySelectorAll(sel).forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { fn(box, b); save(); roadView(); } }); }); }
    bind('[data-msel]', function (box, b) { var v = b.dataset.v, k = -1; R.ms.forEach(function (m, j) { if (m.cap === v) k = j; }); if (k > -1) R.ms.splice(k, 1); else if (R.ms.length < 3) R.ms.push({ cap: v, to: Math.min(3, (S.lab.cap[v] || 0) + 1) || 2, by: '', proof: '', steps: [], other: [], otherTxt: '' }); });
    bind('[data-mto]', function (box, b) { R.ms[+box.dataset.mto].to = +b.dataset.v; });
    bind('[data-mby]', function (box, b) { var m = R.ms[+box.dataset.mby]; m.by = m.by === b.dataset.v ? '' : b.dataset.v; });
    bind('[data-msteps]', function (box, b) { var m = R.ms[+box.dataset.msteps]; if (b.dataset.o) { var j = m.other.indexOf(b.dataset.o); if (j > -1) m.other.splice(j, 1); else m.other.push(b.dataset.o); } else { var v = +b.dataset.v, q = m.steps.indexOf(v); if (q > -1) m.steps.splice(q, 1); else m.steps.push(v); } });
    bind('[data-ready]', function (box, b) { var i = +box.dataset.ready, v = b.dataset.v === 'y'; R.ready[i] = R.ready[i] === v ? undefined : v; });
    bind('[data-review]', function (box, b) { R.review = R.review === b.dataset.v ? '' : b.dataset.v; });
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
