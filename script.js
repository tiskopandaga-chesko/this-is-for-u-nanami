(function () {
  'use strict';

  var TOTAL = 22;
  var W = 1920, H = 1080; // original Canva slide size

  /* Transparent click areas placed over the NEXT buttons painted into each PNG.
     Coordinates are in original-image pixels (1920x1080): [centerX, centerY, width, height].
     To nudge a button, edit its numbers here. Open index.html?debug to see them in red. */
  var HOTSPOTS = {
    2:  [[594, 564, 260, 100], [1269, 564, 260, 100]],  // the two "YES" buttons
    3:  [[1539, 429, 290, 100]],
    4:  [[1401, 792, 290, 100]],
    5:  [[1416, 768, 290, 100]],
    6:  [[1353, 816, 290, 100]],
    7:  [[1437, 753, 290, 100]],
    8:  [[1353, 816, 290, 100]],
    9:  [[1353, 816, 290, 100]],
    10: [[1308, 708, 290, 100]],
    11: [[1308, 708, 290, 100]],
    12: [[1353, 720, 290, 100]],
    13: [[1575, 654, 290, 100]],
    14: [[1326, 837, 290, 100]],
    15: [[1167, 756, 290, 100]],
    16: [[1323, 771, 290, 100]],
    17: [[1326, 837, 290, 100]],
    18: [[1353, 753, 290, 100]],
    19: [[996, 609, 560, 120]],                         // "lesss gooooo" text
    20: [[1647, 663, 240, 90]],
    21: [[1617, 612, 240, 90]]
  };
  // Slides with no printed button get a small button below the card instead.
  var CTA = { 1: 'Open your card 🎁', 22: 'Read again ↺' };

  var $ = function (id) { return document.getElementById(id); };
  var layers = [$('layerA'), $('layerB')];
  var hot = $('hotspots'), counter = $('counter'), prevBtn = $('prevBtn'), cta = $('cta'), backdrop = $('backdrop');
  var current = 0, front = 0, busy = false, timers = [null, null];

  if (/[?&]debug/.test(location.search)) document.body.classList.add('debug');

  function src(n) { return 'images/' + n + '.png'; }

  /* ---------- preload ---------- */
  var loaded = 0;
  function tick() {
    loaded++;
    var pct = Math.round(loaded / TOTAL * 100);
    $('barFill').style.width = pct + '%';
    $('loaderPct').textContent = pct + '%';
    if (loaded === TOTAL) start();
  }
  var cache = [];
  for (var i = 1; i <= TOTAL; i++) {
    (function (n) {
      var im = new Image();
      im.onload = tick;
      im.onerror = function () { console.warn('Could not load ' + src(n)); tick(); };
      im.src = src(n);
      cache.push(im);
    })(i);
  }

  function start() {
    $('app').hidden = false;
    var from = parseInt((location.hash.match(/\d+/) || [1])[0], 10);
    show(from >= 1 && from <= TOTAL ? from : 1, 0, true);
    setTimeout(function () { $('loader').classList.add('done'); }, 250);
  }

  /* ---------- rendering ---------- */
  function buildHotspots(n) {
    hot.innerHTML = '';
    (HOTSPOTS[n] || []).forEach(function (r) {
      var b = document.createElement('button');
      b.className = 'hot';
      b.type = 'button';
      b.setAttribute('aria-label', 'Next slide');
      b.style.left = ((r[0] - r[2] / 2) / W * 100) + '%';
      b.style.top = ((r[1] - r[3] / 2) / H * 100) + '%';
      b.style.width = (r[2] / W * 100) + '%';
      b.style.height = (r[3] / H * 100) + '%';
      b.addEventListener('click', function (e) { e.stopPropagation(); next(); });
      hot.appendChild(b);
    });
  }

  function show(n, dir, instant) {
    current = n;
    var inIdx = 1 - front, outIdx = front;
    var incoming = layers[inIdx], outgoing = layers[outIdx];
    clearTimeout(timers[inIdx]); clearTimeout(timers[outIdx]); // drop stale fade-out timers
    incoming.src = src(n);
    incoming.alt = 'Birthday card slide ' + n + ' of ' + TOTAL;
    incoming.className = 'layer show' + (instant ? '' : (dir < 0 ? ' in-back' : ' in-fwd'));
    incoming.style.zIndex = 2;
    outgoing.style.zIndex = 1;
    if (!instant) outgoing.className = 'layer show out';
    timers[outIdx] = setTimeout(function () { outgoing.className = 'layer'; }, instant ? 0 : 500);
    front = 1 - front;

    backdrop.style.backgroundImage = 'url(' + src(n) + ')';
    counter.textContent = n + ' / ' + TOTAL;
    prevBtn.disabled = n === 1;
    buildHotspots(n);
    if (CTA[n]) { cta.textContent = CTA[n]; cta.hidden = false; } else { cta.hidden = true; }
    try { history.replaceState(null, '', '#' + n); } catch (e) {}
  }

  function go(n, dir) {
    if (busy || n < 1 || n > TOTAL || n === current) return; // no going past first/last
    busy = true;
    show(n, dir);
    setTimeout(function () { busy = false; }, 350);
  }
  function next() { go(current + 1, 1); }
  function prev() { go(current - 1, -1); }

  /* ---------- controls ---------- */
  prevBtn.addEventListener('click', prev);
  cta.addEventListener('click', function () { current === TOTAL ? go(1, -1) : next(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
  });
  var sx = null, sy = null;
  $('card').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  $('card').addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  window.addEventListener('error', function (e) { console.error('Card error:', e.message); });
})();
