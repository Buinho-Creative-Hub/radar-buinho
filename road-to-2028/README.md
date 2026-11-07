# Road to 2028 — EU funding clinic app

Mobile web app for Buinho's *EU funding policy clinic* at the Vulca Seminar 2026 (Cuenca).
Participants browse Buinho's real European projects as cards, sketch their lab's path (up to three steps),
note their open questions and download a personalised PDF guide.

- Static PWA, no backend, no login. Data stays in the participant's browser (localStorage).
- jsPDF and the Asap font load from jsDelivr and are cached by the service worker for offline use.
- `data.js` is generated: edit the content source in `buinho-os/tools/albano/website-road-to-2028/content/` and run `node build.js`.

Buinho Creative Hub · Messejana · info@buinho.pt
