/* Road to 2028 — EU funding clinic app (Buinho · Vulca 2026). Vanilla JS, offline-first. */
(function () {
  'use strict';
  var D = window.VULCA || { projects: [], actions: [], post2027: null, lessons: [], whys: [], meta: {} };
  var app = document.getElementById('app');
  var KEY = 'vulca-clinic-v1';

  /* ---------- state ---------- */
  var S = load() || { lab: { code: '', name: '', country: '', exp: '', domains: [] }, path: [], questions: [], saved: [] };
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function action(id) { return byId(D.actions, id); }
  function project(id) { return byId(D.projects, id); }
  var FAM = { mobility: 'Mobility', partnership: 'Partnership', culture: 'Culture', volunteering: 'Volunteering', national: 'National' };
  function famOf(a) { return a ? a.family : 'national'; }
  function pfam(p) { return p.family || famOf(action(p.action)); }
  function list(arr) { return (arr || []).filter(Boolean); }
  function para(t) { return t ? '<p>' + esc(t) + '</p>' : ''; }
  function sec(label, html) { return html ? '<div class="sec"><div class="lab">' + esc(label) + '</div>' + html + '</div>' : ''; }
  function ul(arr) { arr = list(arr); return arr.length ? '<ul>' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
  function link(u, t) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(t || u) + '</a>'; }
  function setTab(t) { var as = document.querySelectorAll('.tabs a'); for (var i = 0; i < as.length; i++) as[i].classList.toggle('on', as[i].getAttribute('data-tab') === t); }
  function render(html, tab) { app.innerHTML = html; setTab(tab || ''); window.scrollTo(0, 0); app.focus({ preventScroll: true }); }

  /* ---------- views ---------- */
  function home() {
    var l = S.lab;
    render(
      '<section class="hero"><div class="kicker">EU funding policy clinic</div>' +
      '<h1 class="h1">Find your lab\'s step on the road to 2028</h1>' +
      '<p>Eleven years of European projects at Buinho, a rural fablab in Messejana, Alentejo. Use them to sketch your own path.</p></section>' +
      '<ol class="steps">' +
      '<li><div><b>Explore the projects.</b> Each card is a real Buinho project: what it was for, what it took, what it left behind.</div></li>' +
      '<li><div><b>Sketch your path.</b> Up to three steps, in the order that makes sense for your lab. Same numbers as your stickers on the wall.</div></li>' +
      '<li><div><b>Write down what you still need to know.</b> Take those questions to the next clinics of the seminar.</div></li>' +
      '<li><div><b>Download your guide.</b> A PDF with the actions you chose, what they require, where to look next.</div></li>' +
      '</ol>' +
      '<h2 class="h2">About your lab</h2><p class="muted">Optional. It stays on this phone and only goes into your PDF.</p>' +
      '<label class="f" for="code">Your sticker code (e.g. L07)</label><input type="text" id="code" maxlength="4" value="' + esc(l.code) + '">' +
      '<label class="f" for="name">Lab name</label><input type="text" id="name" maxlength="80" value="' + esc(l.name) + '">' +
      '<label class="f" for="country">Country</label><input type="text" id="country" maxlength="40" value="' + esc(l.country) + '">' +
      '<div class="f lab" style="margin-top:16px">Experience with EU projects</div>' +
      '<div class="chips" data-group="exp">' + [['none', 'Never applied'], ['partner', 'Partner before'], ['coordinator', 'Coordinated before']].map(function (o) { return '<button class="chip" data-v="' + o[0] + '" aria-pressed="' + (l.exp === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="f lab">Who you work with</div>' +
      '<div class="chips" data-group="domains">' + (D.domains || []).map(function (d) { return '<button class="chip" data-v="' + esc(d.id) + '" aria-pressed="' + (l.domains.indexOf(d.id) > -1) + '">' + esc(d.label) + '</button>'; }).join('') + '</div>' +
      '<div class="row" style="margin-top:18px"><a class="btn blue" href="#/cards">Explore the projects</a><a class="btn ghost" href="#/path">My path</a></div>', '');
    ['code', 'name', 'country'].forEach(function (k) { document.getElementById(k).addEventListener('input', function (e) { S.lab[k] = k === 'code' ? e.target.value.toUpperCase() : e.target.value; save(); }); });
    bindChips('exp', function (v) { S.lab.exp = S.lab.exp === v ? '' : v; save(); home(); }, true);
    bindChips('domains', function (v) { var i = S.lab.domains.indexOf(v); if (i > -1) S.lab.domains.splice(i, 1); else S.lab.domains.push(v); save(); });
  }

  function bindChips(group, fn, single) {
    var box = app.querySelector('[data-group="' + group + '"]'); if (!box) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (!single) b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
      fn(b.getAttribute('data-v'), b);
    });
  }

  var F = { fam: '', dom: '' };
  function cardHTML(p) {
    var a = action(p.action);
    return '<a class="card" href="#/p/' + esc(p.id) + '">' +
      '<div class="blk fam-' + pfam(p) + '"><div class="prog"><span>' + esc(p.programme) + '</span><span>' + esc(list(p.countries).join(' ')) + '</span></div>' +
      '<div class="code">' + esc(p.code) + '</div><div class="dom">' + esc(p.domain) + '</div></div>' +
      '<div class="body"><div class="name">' + esc(p.name) + '</div><p class="obj">' + esc(p.objective) + '</p>' +
      '<div class="meta"><span>' + esc(p.role) + '</span><span>' + esc(p.years) + '</span></div></div></a>';
  }
  function cards() {
    var doms = {}; D.projects.forEach(function (p) { doms[p.domain] = 1; });
    var ps = D.projects.filter(function (p) { var a = action(p.action); return (!F.fam || pfam(p) === F.fam) && (!F.dom || p.domain === F.dom); });
    render(
      '<div class="kicker">Buinho · 2015–2026</div><h1 class="h1">The projects</h1>' +
      '<p class="lead">Real projects, sorted by the kind of action. Colour tells you the family; tap a card for the whole story.</p>' +
      '<div class="chips" data-group="fam">' + Object.keys(FAM).filter(function (f) { return D.projects.some(function (p) { return pfam(p) === f; }); }).map(function (f) { return '<button class="chip f-' + f + '" data-v="' + f + '" aria-pressed="' + (F.fam === f) + '">' + FAM[f] + '</button>'; }).join('') + '</div>' +
      '<div class="chips" data-group="dom">' + Object.keys(doms).sort().map(function (d) { return '<button class="chip" data-v="' + esc(d) + '" aria-pressed="' + (F.dom === d) + '">' + esc(d) + '</button>'; }).join('') + '</div>' +
      (ps.length ? '<div class="grid">' + ps.map(cardHTML).join('') + '</div>' : '<div class="empty">No project with this filter.</div>'), 'cards');
    bindChips('fam', function (v) { F.fam = F.fam === v ? '' : v; cards(); }, true);
    bindChips('dom', function (v) { F.dom = F.dom === v ? '' : v; cards(); }, true);
  }

  function projectView(id) {
    var p = project(id); if (!p) return cards();
    var a = action(p.action); var saved = S.saved.indexOf(p.id) > -1;
    render(
      '<a class="back" href="#/cards">← All projects</a>' +
      '<div class="sheet-head fam-' + pfam(p) + '"><div class="lab" style="color:inherit">' + esc(p.programme) + ' · ' + esc(p.actionLabel || '') + '</div><div class="code">' + esc(p.code) + '</div><div class="name">' + esc(p.name) + '</div></div>' +
      '<div class="facts">' +
      '<div><div class="lab">Domain</div><div class="v">' + esc(p.domain) + '</div></div>' +
      '<div><div class="lab">Buinho\'s role</div><div class="v">' + esc(p.role) + '</div></div>' +
      '<div><div class="lab">Years</div><div class="v">' + esc(p.years) + '</div></div>' +
      (p.countries && p.countries.length ? '<div><div class="lab">Partner countries</div><div class="v">' + esc(p.countries.join(' · ')) + '</div></div>' : '') +
      (p.budget ? '<div><div class="lab">Budget</div><div class="v">' + esc(p.budget) + '</div></div>' : '') +
      (p.goodPractice ? '<div><div class="lab">Recognition</div><div class="v">Erasmus+ good practice</div></div>' : '') +
      '</div>' +
      sec('What it was for', para(p.objective)) +
      sec('What we did', para(p.did)) +
      sec('What it took to get there', para(p.needed)) +
      sec('What it left us', para(p.left)) +
      (p.lesson ? '<div class="blockq"><div class="lab">Lesson</div>' + para(p.lesson) + '</div>' : '') +
      '<div class="row" style="margin:18px 0"><button class="btn" id="use">' + (saved ? '✓ In my shortlist' : 'Add to my shortlist') + '</button>' +
      (a ? '<a class="btn ghost" href="#/a/' + esc(a.id) + '">About ' + esc(a.short) + '</a>' : '') + '</div>' +
      (p.sources && p.sources.length ? '<div class="src">Sources: ' + esc(p.sources.join(' · ')) + '</div>' : ''), 'cards');
    document.getElementById('use').addEventListener('click', function () {
      var i = S.saved.indexOf(p.id); if (i > -1) S.saved.splice(i, 1); else S.saved.push(p.id); save(); projectView(id);
    });
  }

  function actions() {
    render(
      '<div class="kicker">Programmes 2021–2027</div><h1 class="h1">Kinds of action</h1>' +
      '<p class="lead">What each one is for, who can apply, how much, and what it builds in your organisation.</p>' +
      '<div class="alist">' + D.actions.map(function (a) {
        return '<a class="aitem" href="#/a/' + esc(a.id) + '"><span class="sw fam-' + a.family + '">' + esc(a.short) + '</span><span class="tx"><b>' + esc(a.name) + '</b><span>' + esc(a.purpose) + '</span></span></a>';
      }).join('') + '</div>' +
      (D.post2027 ? '<a class="aitem" style="margin-top:14px" href="#/2028"><span class="sw fam-volunteering">2028+</span><span class="tx"><b>' + esc(D.post2027.title) + '</b><span>' + esc(D.post2027.summary) + '</span></span></a>' : ''), 'actions');
  }

  function actionView(id) {
    var a = action(id); if (!a) return actions();
    var ex = D.projects.filter(function (p) { return p.action === a.id; });
    render(
      '<a class="back" href="#/actions">← All actions</a>' +
      '<div class="sheet-head fam-' + a.family + '"><div class="lab" style="color:inherit">' + esc(a.programme) + '</div><div class="code">' + esc(a.short) + '</div><div class="name">' + esc(a.name) + '</div></div>' +
      sec('What it is for', para(a.purpose)) +
      sec('Who can apply', para(a.who)) +
      sec('Partners', para(a.partners)) +
      sec('Duration', para(a.duration)) +
      sec('Money', para(a.funding)) +
      sec('Where to apply', para(a.where)) +
      sec('Deadlines', para(a.deadlines)) +
      sec('As a first step?', para(a.firstStep)) +
      sec('What it builds in your organisation', para(a.builds)) +
      sec('Links', ul([]) + list(a.links).map(function (l) { return '<div>' + link(l.url, l.label) + '</div>'; }).join('')) +
      (ex.length ? '<h2 class="h2">At Buinho</h2><div class="grid">' + ex.map(cardHTML).join('') + '</div>' : '') +
      (a.sources && a.sources.length ? '<hr><div class="src">Checked: ' + esc(a.sources.join(' · ')) + '</div>' : ''), 'actions');
  }

  function post2027() {
    var P = D.post2027; if (!P) return actions();
    render(
      '<a class="back" href="#/actions">← All actions</a><div class="kicker">After 2027</div><h1 class="h1">' + esc(P.title) + '</h1>' +
      '<div class="notice">' + esc(P.status) + '</div>' +
      list(P.sections).map(function (s) { return sec(s.label, para(s.text)); }).join('') +
      sec('How to prepare, without betting on details', ul(P.implications)) +
      sec('Sources', list(P.links).map(function (l) { return '<div>' + link(l.url, l.label) + '</div>'; }).join('')), 'actions');
  }

  /* ---------- path ---------- */
  function pathView() {
    while (S.path.length < 1) S.path.push(blankStep());
    var html = '<div class="kicker">Your lab' + (S.lab.code ? ' · ' + esc(S.lab.code) : '') + '</div><h1 class="h1">My path</h1>' +
      '<p class="lead">Up to three steps, in order. You can stop at one. Use the same numbers as your stickers on the wall.</p>';
    S.path.forEach(function (st, i) {
      var a = action(st.action);
      html += '<div class="step"><div class="step-h"><span class="dot"' + (a ? ' style="background:' + famColor(a.family) + ';color:' + famText(a.family) + '"' : '') + '><b>' + (i + 1) + '</b>' + (S.lab.code ? '<small>' + esc(S.lab.code) + '</small>' : '') + '</span>' +
        '<b style="font-size:18px">Step ' + (i + 1) + (a ? ': ' + esc(a.short) : '') + '</b></div><div class="step-b">' +
        '<label class="f" for="act' + i + '">Kind of action</label><select id="act' + i + '" data-i="' + i + '" data-k="action"><option value="">Choose…</option>' +
        D.actions.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === st.action ? ' selected' : '') + '>' + esc(x.short + ' · ' + x.name) + '</option>'; }).join('') + '</select>' +
        '<label class="f" for="prj' + i + '">Inspired by (optional)</label><select id="prj' + i + '" data-i="' + i + '" data-k="project"><option value="">—</option>' +
        D.projects.filter(function (p) { return p.action; }).map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === st.project ? ' selected' : '') + '>' + esc(p.name + ' (' + p.code + ')') + '</option>'; }).join('') + '</select>' +
        '<div class="f lab" style="margin-top:14px">Why this step</div><div class="chips" data-why="' + i + '">' +
        (D.whys || []).map(function (w) { return '<button class="chip" data-v="' + esc(w.id) + '" aria-pressed="' + (st.why.indexOf(w.id) > -1) + '">' + esc(w.label) + '</button>'; }).join('') + '</div>' +
        '<div class="f lab">When</div><div class="chips" data-when="' + i + '">' +
        ['2027', '2028', 'Later'].map(function (w) { return '<button class="chip" data-v="' + w + '" aria-pressed="' + (st.when === w) + '">' + w + '</button>'; }).join('') + '</div>' +
        (S.path.length > 1 ? '<button class="btn ghost" data-del="' + i + '" style="min-height:40px">Remove step</button>' : '') +
        '</div></div>';
    });
    if (S.path.length < 3) html += '<button class="btn ghost" id="add">+ Add step ' + (S.path.length + 1) + '</button>';
    html += '<h2 class="h2">Where does your path stop?</h2><p class="muted">What would you need to know to take the next step? Take these questions to the next clinics.</p>' +
      '<div class="stack">' + S.questions.map(function (q, i) { return '<div class="q"><span>' + esc(q) + '</span><button aria-label="Remove question" data-dq="' + i + '">×</button></div>'; }).join('') + '</div>' +
      '<label class="f" for="nq">New question</label><textarea id="nq" maxlength="300"></textarea>' +
      '<div class="row" style="margin-top:10px"><button class="btn" id="addq">Add question</button></div>' +
      (D.questionPrompts && D.questionPrompts.length ? '<p class="muted" style="margin-top:14px">Stuck? Questions other labs often have:</p><div class="chips" data-group="qp">' + D.questionPrompts.map(function (q) { return '<button class="chip" data-v="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' : '') +
      '<hr><a class="btn blue" href="#/guide">Make my guide</a>';
    render(html, 'path');

    app.querySelectorAll('select').forEach(function (s) { s.addEventListener('change', function () { S.path[+s.dataset.i][s.dataset.k] = s.value; if (s.dataset.k === 'project' && s.value && !S.path[+s.dataset.i].action) { var p = project(s.value); if (p) S.path[+s.dataset.i].action = p.action; } save(); pathView(); }); });
    app.querySelectorAll('[data-why]').forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var st = S.path[+box.dataset.why]; var v = b.dataset.v; var k = st.why.indexOf(v); if (k > -1) st.why.splice(k, 1); else st.why.push(v); b.setAttribute('aria-pressed', k < 0); save(); }); });
    app.querySelectorAll('[data-when]').forEach(function (box) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var st = S.path[+box.dataset.when]; st.when = st.when === b.dataset.v ? '' : b.dataset.v; save(); pathView(); }); });
    app.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () { S.path.splice(+b.dataset.del, 1); save(); pathView(); }); });
    app.querySelectorAll('[data-dq]').forEach(function (b) { b.addEventListener('click', function () { S.questions.splice(+b.dataset.dq, 1); save(); pathView(); }); });
    var add = document.getElementById('add'); if (add) add.addEventListener('click', function () { S.path.push(blankStep()); save(); pathView(); });
    document.getElementById('addq').addEventListener('click', function () { var t = document.getElementById('nq').value.trim(); if (t) { S.questions.push(t); save(); pathView(); } });
    var qp = app.querySelector('[data-group="qp"]'); if (qp) qp.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (S.questions.indexOf(b.dataset.v) < 0) { S.questions.push(b.dataset.v); save(); pathView(); } });
  }
  function blankStep() { return { action: '', project: '', why: [], when: '' }; }
  function famColor(f) { return { mobility: '#2364ff', partnership: '#ff5050', culture: '#ffc850', volunteering: '#010101', national: '#d9d9d9' }[f] || '#010101'; }
  function famText(f) { return (f === 'mobility' || f === 'volunteering') ? '#ffffff' : '#010101'; }

  /* ---------- guide / PDF ---------- */
  function steps() { return S.path.filter(function (s) { return s.action; }); }
  function guide() {
    var st = steps();
    render(
      '<div class="kicker">Your take-away</div><h1 class="h1">My guide</h1>' +
      '<p class="lead">A PDF made from your choices: your path, what each action asks for, Buinho projects you can look at, your questions and where to look next.</p>' +
      (st.length ? '<div class="stack">' + st.map(function (s, i) { var a = action(s.action); return '<div class="aitem"><span class="sw fam-' + a.family + '">' + (i + 1) + ' · ' + esc(a.short) + '</span><span class="tx"><b>' + esc(a.name) + '</b><span>' + esc((s.when ? s.when + ' · ' : '') + whyLabels(s.why).join(', ')) + '</span></span></div>'; }).join('') + '</div>'
        : '<div class="empty">No steps yet. <a href="#/path">Sketch your path first.</a></div>') +
      '<p class="muted" style="margin-top:14px">' + S.questions.length + ' question(s) · ' + S.saved.length + ' project(s) in your shortlist</p>' +
      '<div class="row" style="margin-top:16px"><button class="btn blue" id="pdf"' + (st.length ? '' : ' disabled') + '>Download my guide (PDF)</button></div>' +
      '<p class="muted" id="pdfmsg" role="status"></p>' +
      '<hr><button class="btn ghost" id="reset">Start again</button>', 'guide');
    document.getElementById('pdf').addEventListener('click', makePDF);
    document.getElementById('reset').addEventListener('click', function () { if (window.confirm('Clear your path and questions on this phone?')) { S = { lab: { code: '', name: '', country: '', exp: '', domains: [] }, path: [], questions: [], saved: [] }; save(); home(); } });
  }
  function whyLabels(ids) { return (ids || []).map(function (id) { var w = byId(D.whys || [], id); return w ? w.label : id; }); }

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
    function text(t, size, bold, col, gap) { if (!t) return; font(bold, size); color(col || '#010101'); var lines = doc.splitTextToSize(String(t), CW); lines.forEach(function (ln) { need(size * 0.45); doc.text(ln, M, y); y += size * 0.43; }); y += gap == null ? 2 : gap; }
    function label(t) { need(10); font(true, 7.5); color('#595959'); doc.text(String(t).toUpperCase(), M, y); y += 4.2; }
    function linkLine(l) { font(false, 9.5); color('#2364ff'); var s = l.label + ' — ' + l.url; var lines = doc.splitTextToSize(s, CW); lines.forEach(function (ln) { need(5); doc.textWithLink(ln, M, y, { url: l.url }); y += 4.3; }); y += 1; }
    var pageNo = 1;
    function footer() { font(false, 7.5); color('#595959'); doc.text('Road to 2028 · EU funding clinic · Vulca 2026 · Buinho Creative Hub, Messejana · buinho.pt', M, 290); pageNo++; }

    // cover
    fill('#2364ff'); doc.rect(0, 0, W, 96, 'F');
    if (fonts && fonts[2]) { try { doc.addImage('data:image/png;base64,' + fonts[2], 'PNG', W - M - 40, 10, 40, 10); } catch (e) {} }
    color('#ffffff'); font(true, 9); doc.text('EU FUNDING POLICY CLINIC · VULCA 2026 · CUENCA', M, 18);
    font(true, 30); doc.text(doc.splitTextToSize('Your lab\'s road to 2028', CW), M, 44);
    font(false, 12); doc.text(doc.splitTextToSize((S.lab.name || 'Your lab') + (S.lab.country ? ' · ' + S.lab.country : '') + (S.lab.code ? ' · ' + S.lab.code : ''), CW), M, 74);
    font(false, 9); doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), M, 86);
    y = 110;
    text('This guide comes from the choices you made during the clinic: the path you sketched, the projects you looked at and the questions you still have. It is a starting point, not a recommendation. Rules and amounts refer to the 2021–2027 programmes; check the official links before you apply.', 11, false, '#2b2b2b', 6);

    // path overview
    label('Your path');
    steps().forEach(function (s, i) {
      var a = action(s.action); need(18);
      fill(famColor(a.family)); doc.circle(M + 6, y + 3, 6, 'F');
      color(famText(a.family)); font(true, 12); doc.text(String(i + 1), M + 6, y + 5, { align: 'center' });
      color('#010101'); font(true, 13); doc.text(a.short + ' · ' + a.name, M + 16, y + 2);
      font(false, 9.5); color('#2b2b2b'); var sub = [s.when, whyLabels(s.why).join(', ')].filter(Boolean).join(' · ');
      if (sub) doc.text(doc.splitTextToSize(sub, CW - 16), M + 16, y + 7);
      y += 16;
    });
    y += 2;
    if (S.lab.exp) text(D.expNotes && D.expNotes[S.lab.exp] ? D.expNotes[S.lab.exp] : '', 10.5, false, '#2b2b2b', 4);

    // one section per step
    steps().forEach(function (s, i) {
      var a = action(s.action); footer(); doc.addPage(); y = 0;
      fill(famColor(a.family)); doc.rect(0, 0, W, 40, 'F'); color(famText(a.family));
      font(true, 9); doc.text(('Step ' + (i + 1) + ' · ' + a.programme).toUpperCase(), M, 14);
      font(true, 24); doc.text(a.short, M, 26); font(false, 12); doc.text(doc.splitTextToSize(a.name, CW), M, 34);
      y = 52;
      [['What it is for', a.purpose], ['Who can apply', a.who], ['Partners', a.partners], ['Duration', a.duration], ['Money', a.funding], ['Where to apply', a.where], ['Deadlines', a.deadlines], ['As a first step?', a.firstStep], ['What it builds in your organisation', a.builds]].forEach(function (r) { if (r[1]) { label(r[0]); text(r[1], 10.5, false, '#010101', 3); } });
      var ex = D.projects.filter(function (p) { return p.action === a.id; });
      if (s.project) { var pp = project(s.project); if (pp && ex.indexOf(pp) < 0) ex.unshift(pp); }
      if (ex.length) { label('At Buinho'); ex.slice(0, 4).forEach(function (p) { text(p.name + ' (' + p.code + ', ' + p.years + ', ' + p.role.toLowerCase() + ') — ' + p.objective, 10, false, '#2b2b2b', 2); if (p.left) text('What it left: ' + p.left, 9.5, false, '#595959', 3); }); }
      if (a.links && a.links.length) { label('Links'); a.links.forEach(linkLine); }
      var dom = (S.lab.domains || []).map(function (d) { var x = byId(D.domains || [], d); return x; }).filter(Boolean);
      if (a.searchUrl && dom.length) { label('Find similar projects in your field'); dom.forEach(function (d) { linkLine({ label: d.label, url: a.searchUrl(d) }); }); }
    });

    // shortlist
    var sl = S.saved.map(project).filter(Boolean);
    if (sl.length) { footer(); doc.addPage(); y = 20; text('Buinho projects you shortlisted', 18, true, '#010101', 4);
      sl.forEach(function (p) { need(30); var a = action(p.action); fill(famColor(pfam(p))); doc.rect(M, y - 4, 3, 22, 'F'); var x0 = M; y += 0; doc.setFont(B, 'bold'); doc.setFontSize(12); color('#010101'); doc.text(p.name + ' · ' + p.code + ' · ' + p.years, x0 + 6, y); y += 5; font(false, 9.5); color('#2b2b2b'); doc.splitTextToSize(p.objective + (p.left ? ' What it left: ' + p.left : ''), CW - 6).forEach(function (ln) { need(5); doc.text(ln, x0 + 6, y); y += 4.2; }); y += 6; }); }

    // questions
    footer(); doc.addPage(); y = 20;
    text('What you still need to know', 18, true, '#010101', 3);
    text('Take these to the next clinics of the seminar, to the National Agency of your country, or to a lab that has done it before.', 10.5, false, '#2b2b2b', 5);
    if (S.questions.length) S.questions.forEach(function (q) { var lines = doc.splitTextToSize(q, CW - 10); var h = lines.length * 4.6 + 8; need(h + 3); fill('#ffe066'); doc.rect(M, y - 4, CW, h, 'F'); font(false, 10.5); color('#010101'); lines.forEach(function (ln, k) { doc.text(ln, M + 5, y + 1 + k * 4.6); }); y += h + 3; });
    else text('(No questions written.)', 10, false, '#595959', 4);
    if (D.whereToAsk && D.whereToAsk.length) { y += 4; label('Where to look for answers'); D.whereToAsk.forEach(function (l) { if (l.url) linkLine(l); else text(l.label, 10, false, '#010101', 2); }); }

    // 2028
    if (D.post2027) { footer(); doc.addPage(); y = 0; fill('#010101'); doc.rect(0, 0, W, 34, 'F'); color('#ffffff'); font(true, 9); doc.text('AFTER 2027', M, 14); font(true, 20); doc.text(doc.splitTextToSize(D.post2027.title, CW), M, 26); y = 46;
      text(D.post2027.status, 10.5, true, '#010101', 4);
      list(D.post2027.sections).forEach(function (s) { label(s.label); text(s.text, 10.5, false, '#010101', 3); });
      label('How to prepare'); list(D.post2027.implications).forEach(function (t) { text('— ' + t, 10.5, false, '#010101', 2); });
      label('Sources'); list(D.post2027.links).forEach(linkLine); }

    // lessons
    if (D.lessons && D.lessons.length) { footer(); doc.addPage(); y = 0; fill('#ff5050'); doc.rect(0, 0, W, 34, 'F'); color('#010101'); font(true, 9); doc.text('FROM BUINHO\'S EXPERIENCE', M, 14); font(true, 20); doc.text('What we learned on the way', M, 26); y = 46;
      D.lessons.forEach(function (t) { text('— ' + t, 11, false, '#010101', 3); });
      y += 4; text('Buinho Creative Hub · Rua Nova de São Brás, Messejana, Portugal · info@buinho.pt · buinho.pt', 9.5, false, '#595959', 2); }

    footer();
    var fn = 'road-to-2028' + (S.lab.code ? '-' + S.lab.code : '') + '.pdf';
    doc.save(fn);
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
