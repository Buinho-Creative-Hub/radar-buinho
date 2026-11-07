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
  function guide() {
    var st = steps();
    render(
      '<div class="kicker">Your take-away</div><h1 class="h1">My guide</h1>' +
      '<p class="lead">A PDF made from your choices: your path, how each step looks after 2027, the partnership and money behind it, your questions and where to look next.</p>' +
      (st.length ? '<div class="stack">' + st.map(function (s, i) { var p = project(s.project), f = pfam(p); return '<div class="aitem"><span class="sw fam-' + f + '">' + (i + 1) + '</span><span class="tx"><b>' + esc(p.name) + '</b><span>' + esc(famLabel(f) + (s.when ? ' · ' + s.when : '') + (s.why.length ? ' · ' + whyLabels(s.why).join(', ') : '')) + '</span></span></div>'; }).join('') + '</div>'
        : '<div class="empty">No path yet. <a href="#/path">Put your starred cards in order first.</a></div>') +
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
    var R = 'helvetica', B = 'helvetica';
    if (fonts) { doc.addFileToVFS('Asap-Regular.ttf', fonts[0]); doc.addFont('Asap-Regular.ttf', 'Asap', 'normal'); doc.addFileToVFS('Asap-Bold.ttf', fonts[1]); doc.addFont('Asap-Bold.ttf', 'Asap', 'bold'); R = B = 'Asap'; }
    var W = 210, M = 18, CW = W - 2 * M, y = 0;
    function rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
    function fill(h) { doc.setFillColor.apply(doc, rgb(h)); }
    function color(h) { doc.setTextColor.apply(doc, rgb(h)); }
    function font(bold, size) { doc.setFont(bold ? B : R, bold ? 'bold' : 'normal'); doc.setFontSize(size); }
    function need(h) { if (y + h > 282) { footer(); doc.addPage(); y = 20; } }
    function text(t, size, bold, col, gap) { if (!t) return; font(bold, size); color(col || '#010101'); doc.splitTextToSize(String(t), CW).forEach(function (ln) { need(size * 0.45); doc.text(ln, M, y); y += size * 0.43; }); y += gap == null ? 2 : gap; }
    function label(t) { need(10); font(true, 7.5); color('#595959'); doc.text(String(t).toUpperCase(), M, y); y += 4.2; }
    function linkLine(l) { font(false, 9.5); color('#2364ff'); doc.splitTextToSize(l.label + ' — ' + l.url, CW).forEach(function (ln) { need(5); doc.textWithLink(ln, M, y, { url: l.url }); y += 4.3; }); y += 1; }
    function band(hex, kicker, title, sub) { fill(hex); doc.rect(0, 0, W, 40, 'F'); var tc = (hex === '#2364ff' || hex === '#010101') ? '#ffffff' : '#010101'; color(tc); font(true, 9); doc.text(kicker.toUpperCase(), M, 14); font(true, 22); doc.text(doc.splitTextToSize(title, CW)[0], M, 26); if (sub) { font(false, 11); doc.text(doc.splitTextToSize(sub, CW)[0], M, 34); } y = 52; }
    function footer() { font(false, 7.5); color('#595959'); doc.text('Road to 2028 · EU funding clinic · Vulca 2026 · Buinho Creative Hub, Messejana · buinho.pt', M, 290); }

    // cover
    fill('#2364ff'); doc.rect(0, 0, W, 96, 'F');
    if (fonts && fonts[2]) { try { doc.addImage('data:image/png;base64,' + fonts[2], 'PNG', W - M - 40, 10, 40, 10); } catch (e) {} }
    color('#ffffff'); font(true, 9); doc.text('EU FUNDING POLICY CLINIC · VULCA 2026 · CUENCA', M, 18);
    font(true, 30); doc.text('Your lab\'s road to 2028', M, 44);
    font(false, 12); doc.text(doc.splitTextToSize((S.lab.name || 'Your lab') + (S.lab.country ? ' · ' + S.lab.country : '') + (S.lab.code ? ' · ' + S.lab.code : ''), CW), M, 74);
    font(false, 9); doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), M, 86);
    y = 110;
    text('This guide comes from the choices you made during the clinic: the Buinho projects you starred, the order you put them in and the questions you still have. It is a starting point, not a recommendation. Rules and amounts refer to the 2021–2027 programmes; what comes after 2027 is still a proposal.', 11, false, '#2b2b2b', 6);
    label('Your path');
    steps().forEach(function (s, i) {
      var p = project(s.project), f = pfam(p), pl = ppil(p); need(18);
      fill(famColor(f)); doc.circle(M + 6, y + 3, 6, 'F');
      color(famText(f)); font(true, 12); doc.text(String(i + 1), M + 6, y + 5, { align: 'center' });
      color('#010101'); font(true, 13); doc.text(famLabel(f) + ' — like ' + p.name, M + 16, y + 2);
      font(false, 9.5); color('#2b2b2b'); var sub = [pl ? pl.label + ' · ' + pl.name : '', s.when, whyLabels(s.why).join(', ')].filter(Boolean).join(' · ');
      if (sub) doc.text(doc.splitTextToSize(sub, CW - 16)[0], M + 16, y + 7);
      y += 16;
    });
    y += 2;
    if (S.lab.exp && D.expNotes) text(D.expNotes[S.lab.exp], 10.5, false, '#2b2b2b', 4);

    // one page per step
    steps().forEach(function (s, i) {
      var p = project(s.project), a = action(p.action), f = pfam(p), pl = ppil(p), P = p.partnership || {};
      footer(); doc.addPage(); band(famColor(f), 'Step ' + (i + 1) + (pl ? ' · ' + pl.label + ' · ' + pl.name : ''), famLabel(f) + ' — like ' + p.name, 'Today: ' + p.today);
      label('The Buinho example'); text(p.objective, 10.5, false, '#010101', 2); text(p.did, 10, false, '#2b2b2b', 3);
      label('What it took'); text(p.needed, 10.5, false, '#010101', 3);
      if (p.left) { label('What it left'); text(p.left, 10.5, false, '#010101', 3); }
      label('The partnership'); text('Partners: ' + P.size + (list(P.countries).length ? ' (' + P.countries.join(', ') + ')' : ''), 10.5, true, '#010101', 1); text('Who brings what: ' + P.roles, 10.5, false, '#010101', 1); text('Money: ' + P.money, 10.5, false, '#010101', 3);
      if (p.lesson) { label('Lesson'); text(p.lesson, 10.5, false, '#010101', 3); }
      if (a) {
        label('After 2027'); text(a.future, 10.5, false, '#010101', 3);
        label('How this kind of action works today (' + a.short + ')');
        [['For', a.purpose], ['Who can apply', a.who], ['Partners', a.partners], ['Money', a.funding], ['Deadlines', a.deadlines], ['As a first step?', a.firstStep]].forEach(function (r) { if (r[1]) text(r[0] + ': ' + r[1], 10, false, '#2b2b2b', 1.5); });
        y += 2; if (a.links && a.links.length) { label('Links'); a.links.forEach(linkLine); }
        var dom = (S.lab.domains || []).map(function (d) { return byId(D.domains || [], d); }).filter(Boolean);
        if (a.searchUrl && dom.length) { label('Find similar projects in your field'); dom.forEach(function (d) { linkLine({ label: d.label, url: a.searchUrl(d) }); }); }
      }
    });

    // partners
    if (D.partnerCriteria && D.partnerCriteria.length) {
      footer(); doc.addPage(); band('#ff5050', 'Before you write anything together', 'Choosing partners', '');
      D.partnerCriteria.forEach(function (c) { text(c.label, 12, true, '#010101', 1); text(c.text, 10.5, false, '#2b2b2b', 4); });
      var other = S.fav.filter(function (id) { return stepOf(id) < 0; }).map(project).filter(Boolean);
      if (other.length) { y += 2; label('Other cards you starred'); other.forEach(function (p) { text(p.name + ' (' + famLabel(pfam(p)) + ', ' + p.domain + ') — ' + (p.partnership ? p.partnership.size + '. ' + p.partnership.roles : p.objective), 10, false, '#2b2b2b', 2); }); }
    }

    // questions
    footer(); doc.addPage(); band('#ffc850', 'Where your path stops', 'What you still need to know', '');
    text('Take these to the next clinics of the seminar, to the National Agency of your country, or to a lab that has done it before.', 10.5, false, '#2b2b2b', 5);
    if (S.questions.length) S.questions.forEach(function (q) { var lines = doc.splitTextToSize(q, CW - 10); var h = lines.length * 4.6 + 8; need(h + 3); fill('#ffe066'); doc.rect(M, y - 4, CW, h, 'F'); font(false, 10.5); color('#010101'); lines.forEach(function (ln, k) { doc.text(ln, M + 5, y + 1 + k * 4.6); }); y += h + 3; });
    else text('(No questions written.)', 10, false, '#595959', 4);
    if (D.whereToAsk && D.whereToAsk.length) { y += 4; label('Where to look for answers'); D.whereToAsk.forEach(linkLine); }

    // 2028
    if (D.post2027) { footer(); doc.addPage(); band('#010101', 'After 2027', D.post2027.title, '');
      text(D.post2027.status, 10.5, true, '#010101', 4);
      list(D.post2027.sections).forEach(function (s) { label(s.label); text(s.text, 10.5, false, '#010101', 3); });
      label('How to prepare'); list(D.post2027.implications).forEach(function (t) { text('— ' + t, 10.5, false, '#010101', 2); });
      label('Sources'); list(D.post2027.links).forEach(linkLine); }

    // lessons
    if (D.lessons && D.lessons.length) { footer(); doc.addPage(); band('#2364ff', 'From Buinho\'s experience', 'What we learned on the way', '');
      D.lessons.forEach(function (t) { text('— ' + t, 11, false, '#010101', 3); });
      y += 4; text('Buinho Creative Hub · Rua Nova de São Brás, Messejana, Portugal · info@buinho.pt · buinho.pt', 9.5, false, '#595959', 2); }

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
