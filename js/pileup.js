// The pile-up: once all six numbers are found, the rain stops and everything falls into a heap.
// Uses Matter.js (loaded only when needed). Visitors can grab and fling numbers, but nobody is told to.
// Touching the pile is counted once, anonymously, so later we can say what share of visitors played with it.
(function () {
  var MATTER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';

  function loadMatter(cb) {
    if (window.Matter) return cb(true);
    var s = document.createElement('script');
    s.src = MATTER_SRC; s.async = true;
    s.onload = function () { cb(!!window.Matter); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }

  // opts: { stage, rain, onSettled, onTouched, makeNoise(text,size) }
  window.startPileup = function (opts) {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { opts.onSettled(); return; }
    loadMatter(function (ok) {
      if (!ok) { opts.onSettled(); return; }
      run(opts);
    });
  };

  function run(opts) {
    var M = window.Matter, Engine = M.Engine, Bodies = M.Bodies, Body = M.Body, Composite = M.Composite;
    var stage = opts.stage, rain = opts.rain;
    var small = window.innerWidth < 640;
    var engine = Engine.create({ gravity: { y: 1.1 } });
    var items = [], spawnTimer = null, settled = false, touched = false, drag = null;
    var W = rain.clientWidth, H = rain.clientHeight, t = 200;

    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }),
      Bodies.rectangle(-t / 2, H / 2, t, H * 4, { isStatic: true }),
      Bodies.rectangle(W + t / 2, H / 2, t, H * 4, { isStatic: true })
    ]);

    function addBody(el, x, y, angle) {
      el.classList.add('body');
      el.style.animation = 'none';
      el.style.left = '0'; el.style.right = 'auto'; el.style.top = '0';
      el.tabIndex = -1;
      var w = el.offsetWidth, h = el.offsetHeight;
      var b = Bodies.rectangle(x + w / 2, y + h / 2, w, h * 0.82, {
        restitution: 0.25, friction: 0.6, frictionAir: 0.012, density: 0.0016, chamfer: { radius: 2 }
      });
      if (angle) Body.setAngle(b, angle);
      Body.setVelocity(b, { x: (Math.random() - 0.5) * 1.2, y: 1 + Math.random() * 2 });
      Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.06);
      Composite.add(engine.world, b);
      var it = { el: el, body: b, w: w, h: h };
      el._pile = it;
      items.push(it);
    }

    // freeze every number exactly where it is, then hand it to gravity
    var rr = rain.getBoundingClientRect();
    Array.prototype.slice.call(rain.querySelectorAll('.drop')).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > rr.bottom || r.bottom < rr.top) { el.remove(); return; }
      addBody(el, r.left - rr.left, r.top - rr.top, 0);
    });

    // a last flurry lands on top, so the pile has some height
    var extra = small ? 20 : 90, sent = 0;
    spawnTimer = setInterval(function () {
      if (sent++ >= extra) { clearInterval(spawnTimer); spawnTimer = null; return; }
      var el = opts.makeNoise(Math.round(16 + Math.random() * 18));
      addBody(el, Math.random() * (W - 80) + 20, -40, (Math.random() - 0.5) * 0.6);
    }, 35);

    function loop() {
      Engine.update(engine, 1000 / 60);
      var moving = 0;
      items.forEach(function (it) {
        var p = it.body.position;
        it.el.style.transform = 'translate(' + (p.x - it.w / 2) + 'px,' + (p.y - it.h / 2) + 'px) rotate(' + it.body.angle + 'rad)';
        if (it.body.speed > 0.3) moving++;
      });
      if (!settled && !spawnTimer && moving < 3) { settled = true; opts.onSettled(); }
      requestAnimationFrame(loop);
    }
    loop();

    // grab and fling (mouse or finger), no prompt anywhere
    function pt(e) { var r = rain.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    stage.addEventListener('pointerdown', function (e) {
      var el = e.target.closest && e.target.closest('.body');
      if (!el || !el._pile) return;
      var p = pt(e), b = el._pile.body;
      drag = { it: el._pile, off: { x: p.x - b.position.x, y: p.y - b.position.y }, last: p, t: performance.now(), v: { x: 0, y: 0 } };
      el.classList.add('grabbed');
      if (settled && !touched) { touched = true; opts.onTouched(); }
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var p = pt(e), now = performance.now(), dt = Math.max(1, now - drag.t);
      drag.v = { x: (p.x - drag.last.x) / dt * 16, y: (p.y - drag.last.y) / dt * 16 };
      drag.last = p; drag.t = now;
      Body.setPosition(drag.it.body, { x: p.x - drag.off.x, y: p.y - drag.off.y });
      Body.setVelocity(drag.it.body, drag.v);
    });
    function release() {
      if (!drag) return;
      var m = 40, v = drag.v;
      Body.setVelocity(drag.it.body, { x: Math.max(-m, Math.min(m, v.x)), y: Math.max(-m, Math.min(m, v.y)) });
      drag.it.el.classList.remove('grabbed');
      drag = null;
    }
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
  }
})();
