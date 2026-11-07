/* Road to 2028 — EU funding clinic app (Buinho · Vulca 2026). Vanilla JS, offline-first. */
(function () {
  'use strict';
  var D = window.VULCA || { projects: [], actions: [], pillars: [], post2027: null, lessons: [], whys: [] };
  var app = document.getElementById('app');
  var KEY = 'vulca-clinic-v2';

  /* ---------- state ---------- */
  function blank() { return { lab: { code: '', name: '', country: '', exp: '', domains: [] }, fav: [], path: [], questions: [] }; }
  var S = load() || blank();
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
  function setTab(t) { var as = document.querySelectorAll('.tabs a'); for (var i = 0; i < as.length; i++) as[i].classList.toggle('on', as[i].getAttribute('data-tab') === t); }
  function render(html, tab, keepScroll) { var y = window.scrollY; app.innerHTML = html; setTab(tab || ''); window.scrollTo(0, keepScroll ? y : 0); }
  function famColor(f) { return { mobility: '#2364ff', cooperation: '#ff5050', culture: '#ffc850', volunteering: '#010101', national: '#d9d9d9' }[f] || '#010101'; }
  function famText(f) { return (f === 'mobility' || f === 'volunteering') ? '#ffffff' : '#010101'; }

  /* ---------- home ---------- */
  function home() {
    var l = S.lab;
    render(
      '<section class="hero"><div class="kicker">EU funding policy clinic</div>' +
      '<h1 class="h1">Find your lab\'s step on the road to 2028</h1>' +
      '<p>Eleven years of European projects at Buinho, a rural fablab in Messejana, Alentejo, read through the programmes that come after 2027.</p></section>' +
      '<ol class="steps">' +
      '<li><div><b>Star the projects that speak to you.</b> Each card is a real Buinho project: what it was for, who the partners were, what it took and what it left.</div></li>' +
      '<li><div><b>Turn your starred cards into a path.</b> Put them in order, up to three steps. Same numbers as your stickers on the wall.</div></li>' +
      '<li><div><b>Write down what you still need to know</b> and take it to the next clinics of the seminar.</div></li>' +
      '<li><div><b>Download your guide:</b> your path, how each step looks after 2027, partners, money and links.</div></li>' +
      '</ol>' +
      '<h2 class="h2">About your lab</h2><p class="muted">Optional. It stays on this phone and only goes into your PDF.</p>' +
      '<label class="f" for="code">Your sticker code (e.g. L07)</label><input type="text" id="code" maxlength="4" value="' + esc(l.code) + '">' +
      '<label class="f" for="name">Lab name</label><input type="text" id="name" maxlength="80" value="' + esc(l.name) + '">' +
      '<label class="f" for="country">Country</label><input type="text" id="country" maxlength="40" value="' + esc(l.country) + '">' +
      '<div class="f lab" style="margin-top:16px">Experience with EU projects</div>' +
      '<div class="chips" data-group="exp">' + [['none', 'Never applied'], ['partner', 'Partner before'], ['coordinator', 'Coordinated before']].map(function (o) { return '<button class="chip" data-v="' + o[0] + '" aria-pressed="' + (l.exp === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="f lab">Who you work with</div>' +
      '<div class="chips" data-group="domains">' + (D.domains || []).map(function (d) { return '<button class="chip" data-v="' + esc(d.id) + '" aria-pressed="' + (l.domains.indexOf(d.id) > -1) + '">' + esc(d.label) + '</button>'; }).join('') + '</div>' +
      '<div class="row" style="margin-top:18px"><a class="btn blue" href="#/cards">See the projects</a><a class="btn ghost" href="#/actions">The 2028 map</a></div>', '');
    ['code', 'name', 'country'].forEach(function (k) { document.getElementById(k).addEventListener('input', function (e) { S.lab[k] = k === 'code' ? e.target.value.toUpperCase() : e.target.value; save(); }); });
    chipGroup('exp', function (v) { S.lab.exp = S.lab.exp === v ? '' : v; save(); home(); });
    chipGroup('domains', function (v, b) { var i = S.lab.domains.indexOf(v); if (i > -1) S.lab.domains.splice(i, 1); else S.lab.domains.push(v); b.setAttribute('aria-pressed', i < 0); save(); });
  }
  function chipGroup(group, fn) {
    var box = app.querySelector('[data-group="' + group + '"]'); if (!box) return;
    box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) fn(b.getAttribute('data-v'), b); });
  }

  /* ---------- cards ---------- */
  var F = { dom: '', fam: '', mine: false };
  function cardHTML(p) {
    var f = pfam(p), pl = ppil(p), fav = isFav(p.id);
    return '<article class="card' + (fav ? ' is-fav' : '') + '">' +
      '<button class="fav" data-fav="' + esc(p.id) + '" aria-pressed="' + fav + '" aria-label="' + (fav ? 'Remove from my cards' : 'Add to my cards') + '">' + (fav ? '★' : '☆') + '</button>' +
      '<a href="#/p/' + esc(p.id) + '">' +
      '<div class="blk fam-' + f + '"><div class="prog">' + esc(pl ? pl.label + ' · 2028' : '') + '</div>' +
      '<div class="code">' + esc(famLabel(f)) + '</div><div class="dom">' + esc(p.domain) + '</div></div>' +
      '<div class="body"><div class="name">' + esc(p.name) + '</div><p class="obj">' + esc(p.objective) + '</p>' +
      '<div class="today">Today: ' + esc(p.today) + '</div>' +
      '<div class="meta"><span>' + esc(p.role) + '</span><span>' + esc(p.partnership ? p.partnership.size : '') + '</span><span>' + esc(p.years) + '</span></div></div></a></article>';
  }
  function bindFavs(rerender) {
    app.querySelectorAll('[data-fav]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); toggleFav(b.dataset.fav); rerender(); }); });
  }
  function cards() {
    var doms = []; D.projects.forEach(function (p) { if (doms.indexOf(p.domain) < 0) doms.push(p.domain); });
    var fams = []; D.projects.forEach(function (p) { var f = pfam(p); if (fams.indexOf(f) < 0) fams.push(f); });
    var ps = D.projects.filter(function (p) { return (!F.dom || p.domain === F.dom) && (!F.fam || pfam(p) === F.fam) && (!F.mine || isFav(p.id)); });
    render(
      '<div class="kicker">Buinho · 2016–2028</div><h1 class="h1">The projects</h1>' +
      '<p class="lead">A few real projects per sector. Colour is the kind of action as it looks after 2027. Star the ones that speak to you: they become your path.</p>' +
      '<div class="chips" data-group="dom">' + doms.map(function (d) { return '<button class="chip" data-v="' + esc(d) + '" aria-pressed="' + (F.dom === d) + '">' + esc(d) + '</button>'; }).join('') + '</div>' +
      '<div class="chips" data-group="fam">' + fams.map(function (f) { return '<button class="chip f-' + f + '" data-v="' + f + '" aria-pressed="' + (F.fam === f) + '">' + esc(famLabel(f)) + '</button>'; }).join('') +
      '<button class="chip" data-v="mine" aria-pressed="' + F.mine + '">★ My cards (' + S.fav.length + ')</button></div>' +
      (ps.length ? '<div class="grid">' + ps.map(cardHTML).join('') + '</div>' : '<div class="empty">' + (F.mine ? 'No starred cards yet.' : 'No project with this filter.') + '</div>') +
      (S.fav.length ? '<div class="row" style="margin-top:18px"><a class="btn blue" href="#/path">Build my path with ' + S.fav.length + ' card' + (S.fav.length > 1 ? 's' : '') + '</a></div>' : ''), 'cards', true);
    chipGroup('dom', function (v) { F.dom = F.dom === v ? '' : v; cards(); });
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
      '<div><div class="lab">Buinho\'s role</div><div class="v">' + esc(p.role) + '</div></div>' +
      '<div><div class="lab">Years</div><div class="v">' + esc(p.years) + '</div></div>' +
      '<div><div class="lab">Today</div><div class="v">' + esc(p.today) + '</div></div>' +
      (p.goodPractice ? '<div><div class="lab">Recognition</div><div class="v">Erasmus+ good practice</div></div>' : '') +
      '</div>' +
      '<div class="row" style="margin:16px 0"><button class="btn' + (fav ? ' ghost' : ' blue') + '" data-fav="' + esc(p.id) + '">' + (fav ? '★ In my cards' : '☆ Add to my cards') + '</button></div>' +
      sec('What it was for', para(p.objective)) +
      sec('What we did', para(p.did)) +
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
  function stepOf(id) { for (var i = 0; i < S.path.length; i++) if (S.path[i].project === id) return i; return -1; }
  function pathView() {
    var favs = S.fav.map(project).filter(Boolean);
    var html = '<div class="kicker">Your lab' + (S.lab.code ? ' · ' + esc(S.lab.code) : '') + '</div><h1 class="h1">My path</h1>';
    if (!favs.length) {
      render(html + '<div class="empty">Star a few projects first: they are the bricks of your path.<br><br><a class="btn blue" href="#/cards">See the projects</a></div>', 'path'); return;
    }
    html += '<p class="lead">Put your cards in order: which step first, which next. Up to three. Use the same numbers as your stickers on the wall.</p>';
    html += '<div class="slots">';
    for (var i = 0; i < 3; i++) {
      var st = S.path[i], p = st && project(st.project);
      if (p) {
        var f = pfam(p), pl = ppil(p);
        html += '<div class="slot"><div class="slot-h"><span class="dot" style="background:' + famColor(f) + ';color:' + famText(f) + '"><b>' + (i + 1) + '</b>' + (S.lab.code ? '<small>' + esc(S.lab.code) + '</small>' : '') + '</span>' +
          '<div><b>' + esc(p.name) + '</b><div class="muted">' + esc(famLabel(f)) + (pl ? ' · ' + esc(pl.label) : '') + ' · ' + esc(p.domain) + '</div></div>' +
          '<button class="x" data-unstep="' + i + '" aria-label="Remove from path">×</button></div><div class="step-b">' +
          '<div class="f lab">Why this step</div><div class="chips" data-why="' + i + '">' + (D.whys || []).map(function (w) { return '<button class="chip" data-v="' + esc(w.id) + '" aria-pressed="' + (st.why.indexOf(w.id) > -1) + '">' + esc(w.label) + '</button>'; }).join('') + '</div>' +
          '<div class="f lab">When</div><div class="chips" data-when="' + i + '">' + ['2027', '2028', 'Later'].map(function (w) { return '<button class="chip" data-v="' + w + '" aria-pressed="' + (st.when === w) + '">' + w + '</button>'; }).join('') + '</div>' +
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
    html += '<h2 class="h2">Where does your path stop?</h2><p class="muted">What would you need to know to take the next step? Take these questions to the next clinics.</p>' +
      '<div class="stack">' + S.questions.map(function (q, i) { return '<div class="q"><span>' + esc(q) + '</span><button aria-label="Remove question" data-dq="' + i + '">×</button></div>'; }).join('') + '</div>' +
      '<label class="f" for="nq">New question</label><textarea id="nq" maxlength="300"></textarea>' +
      '<div class="row" style="margin-top:10px"><button class="btn" id="addq">Add question</button></div>' +
      (D.questionPrompts && D.questionPrompts.length ? '<p class="muted" style="margin-top:14px">Stuck? Questions other labs often have:</p><div class="chips" data-group="qp">' + D.questionPrompts.map(function (q) { return '<button class="chip" data-v="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' : '') +
      '<hr><a class="btn blue" href="#/guide">Make my guide</a>';
    render(html, 'path', true);
    app.querySelectorAll('[data-addstep]').forEach(function (b) { b.addEventListener('click', function () { S.path.push({ project: b.dataset.addstep, why: [], when: '' }); save(); pathView(); }); });
    app.querySelectorAll('[data-unstep]').forEach(function (b) { b.addEventListener('click', function () { S.path.splice(+b.dataset.unstep, 1); save(); pathView(); }); });
    app.querySelectorAll('[data-up]').forEach(function (b) { b.addEventListener('click', function () { var i = +b.dataset.up, t = S.path[i - 1]; S.path[i - 1] = S.path[i]; S.path[i] = t; save(); pathView(); }); });
    app.querySelectorAll('[data-why]').forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var st = S.path[+box.dataset.why], v = b.dataset.v, k = st.why.indexOf(v); if (k > -1) st.why.splice(k, 1); else st.why.push(v); b.setAttribute('aria-pressed', k < 0); save(); }); });
    app.querySelectorAll('[data-when]').forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var st = S.path[+box.dataset.when]; st.when = st.when === b.dataset.v ? '' : b.dataset.v; box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === st.when); }); save(); }); });
    app.querySelectorAll('[data-dq]').forEach(function (b) { b.addEventListener('click', function () { S.questions.splice(+b.dataset.dq, 1); save(); pathView(); }); });
    document.getElementById('addq').addEventListener('click', function () { var t = document.getElementById('nq').value.trim(); if (t) { S.questions.push(t); save(); pathView(); } });
    chipGroup('qp', function (v) { if (S.questions.indexOf(v) < 0) { S.questions.push(v); save(); pathView(); } });
  }

  /* ---------- guide / PDF ---------- */
  function steps() { return S.path.filter(function (s) { return project(s.project); }); }
  function whyLabels(ids) { return (ids || []).map(function (id) { var w = byId(D.whys || [], id); return w ? w.label : id; }); }
  var PROG = { ka122: 'erasmus', ka1: 'erasmus', youth: 'erasmus', 'youth-acc': 'erasmus', ka210: 'erasmus', ka220: 'erasmus', esc: 'esc', crea: 'crea' };

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
      '<div class="kicker">Your take-away</div><h1 class="h1">My guide</h1>' +
      '<p class="lead">A PDF made from your choices: your path read against Buinho\'s strategy, practical advice for each step, your year of deadlines, the long-term questions behind every application, and your own questions.</p>' +
      (st.length ? '<div class="stack">' + st.map(function (s, i) { var p = project(s.project), f = pfam(p); return '<div class="aitem"><span class="sw fam-' + f + '">' + (i + 1) + '</span><span class="tx"><b>' + esc(p.name) + '</b><span>' + esc(famLabel(f) + (s.when ? ' · ' + s.when : '') + (s.why.length ? ' · ' + whyLabels(s.why).join(', ') : '')) + '</span></span></div>'; }).join('') + '</div>'
        : '<div class="empty">No path yet. <a href="#/path">Put your starred cards in order first.</a></div>') +
      (R.length ? '<h2 class="h2">What your path says</h2><div class="stack">' + R.map(function (t) { return '<div class="advice">' + esc(t) + '</div>'; }).join('') + '</div>' : '') +
      ((D.strategy && D.strategy.references) ? '<h2 class="h2">Official references</h2><p class="muted">The documents and tools behind this guide. Always read the current version.</p>' + D.strategy.references.map(function (g) { return '<h3 class="h3">' + esc(g.group) + '</h3><ul class="links">' + g.items.map(function (l) { return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a></li>'; }).join('') + '</ul>'; }).join('') : '') +
      '<p class="muted" style="margin-top:14px">' + S.fav.length + ' starred card(s) · ' + S.questions.length + ' question(s)</p>' +
      '<div class="row" style="margin-top:16px"><button class="btn blue" id="pdf"' + (st.length ? '' : ' disabled') + '>Download my guide (PDF)</button></div>' +
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
      font(true, 8.5); doc.text(kicker.toUpperCase(), M, 15); font(true, 23); doc.text(doc.splitTextToSize(title, CW)[0], M, 28);
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
    font(false, 14); doc.text(doc.splitTextToSize((S.lab.name || 'Your lab') + (S.lab.country ? ' · ' + S.lab.country : '') + (S.lab.code ? ' · ' + S.lab.code : ''), CW), M, 96);
    font(false, 10); doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), M, 104);
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

    /* ===== 3. reading your path ===== */
    newPage(); y = 0; band(RED, 'Practical advice', 'Reading your path', 'Inferences from your steps, their order, your reasons and your timing');
    var RD = readings();
    RD.forEach(function (t, i) { box('Note ' + (i + 1), t, { rule: i % 2 ? BLUE : RED, bg: WALL, size: 10.5 }); });
    if (T.buinho) { y += 2; box('How Buinho reads its own path', [T.buinho.intro, T.buinho.themes, T.buinho.base], { rule: INK, bg: '#ffffff', size: 10 }); }

    /* ===== 4. one spread per step ===== */
    st.forEach(function (s, i) {
      var p = ps[i], a = action(p.action), f = pfam(p), pl = ppil(p), P = p.partnership || {}, SP = (T.projects || {})[p.id] || {};
      newPage(); y = 0; band(famColor(f), 'Step ' + (i + 1) + (pl ? ' · ' + pl.label + ' · ' + pl.name : '') + (s.when ? ' · ' + s.when : ''), famLabel(f) + ' — like ' + p.name, 'Today: ' + p.today + ' · Buinho was ' + p.role.toLowerCase() + ' · ' + p.years);
      label('The Buinho example'); text(p.objective, 11, true, INK, 2); text(p.did, 10, false, G7, 3);
      if (SP.place) box('Where it sits in our strategy', [SP.place, SP.connects], { rule: famColor(f) === SUN ? INK : famColor(f), bg: WALL });
      label('The partnership');
      rows([['Partners', P.size + (list(P.countries).length ? ' (' + P.countries.join(', ') + ')' : '')], ['Who brings what', P.roles], ['Money', P.money], ['What it took', p.needed], ['What it left', p.left]]);
      if (p.lesson) box('Lesson', p.lesson, { rule: RED, bg: '#ffffff' });
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

    /* ===== 9. questions ===== */
    newPage(); y = 0; band(SUN, 'Where your path stops', 'What you still need to know', 'Take these to the next clinics, to your National Agency or to a lab that has done it before');
    if (S.questions.length) S.questions.forEach(function (q) { var L = lines(q, 11, false, CW - 12); var h = L.length * lh(11) + 9; need(h + 3); fill(NOTE); doc.rect(M, y - 4, CW, h, 'F'); font(false, 11); color(INK); L.forEach(function (ln, k) { doc.text(ln, M + 6, y + 2 + k * lh(11)); }); y += h + 3; });
    else text('(No questions written.)', 10, false, G5, 4);
    if (D.whereToAsk && D.whereToAsk.length) { y += 4; label('Where to look for answers'); D.whereToAsk.forEach(function (l) { linkLine(l); }); }

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
    doc.save('road-to-2028' + (S.lab.code ? '-' + S.lab.code : '') + '.pdf');
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
      default: return home();
    }
  }
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
})();
