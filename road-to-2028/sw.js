/* Offline cache: everything the app needs is precached on first visit. */
var CACHE = 'vulca-clinic-v22';
var FILES = ['./', 'index.html', 'styles.css', 'app.js', 'data.js', 'logo.svg', 'icon.svg', 'manifest.webmanifest'];
var CDN = ['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@expo-google-fonts/asap@0.4.3/400Regular/Asap_400Regular.ttf',
  'https://cdn.jsdelivr.net/npm/@expo-google-fonts/asap@0.4.3/700Bold/Asap_700Bold.ttf'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES).then(function () { return Promise.all(CDN.map(function (u) { return fetch(u, { mode: 'cors' }).then(function (r) { if (r.ok) return c.put(u, r); }).catch(function () {}); })); }); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
/* Network first for data/app files (so updates arrive), cache fallback offline. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var same = new URL(e.request.url).origin === location.origin;
  e.respondWith((same ? fetch(e.request, { cache: 'no-cache' }) : fetch(e.request)).then(function (r) {
    var copy = r.clone(); var u = new URL(e.request.url); if (r.ok && (u.origin === location.origin || u.host === 'cdn.jsdelivr.net' || u.host.indexOf('fonts.g') === 0)) caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match('index.html'); }); }));
});
