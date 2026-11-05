// Numbers made of you.
// Everything here stays in this tab: nothing is stored or sent anywhere.
// Two modes: a mouse (desktop) and touch (phones and tablets). Same stories, different numbers.
(function () {
  var TOUCH = !!(window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches);

  // bridge = why this number reminds me of the story; link is optional
  // `touch` holds the phone version of a stat's label/bridge when it differs
  var STATS = [
    { key: 'dist', label: 'pixels your mouse has traveled',
      // {dist} is replaced with the visitor's live pixel count
      bridge: 'You’ve moved your mouse {dist} pixels to get here. At work, I taught a script to do the moving for me.',
      touch: { label: 'pixels your thumb has traveled',
               bridge: 'You’ve moved your thumb {dist} pixels to get here. At work, I taught a script to do the moving for me.',
               bridgeZero: 'You got here without moving your thumb at all. At work, I taught a script to do the moving for me too.' },
      storyTitle: 'The script that types for me',
      storyBody: 'Entering invoices into an oil & gas accounting system meant hours of clicking and typing. I built a little AutoHotkey script, with a lot of AI help, that types them in on its own, then stops so a person can check the totals before anything is saved. When I showed it to the team, the reaction was basically “damn, that’s cool.”',
      link: { href: 'work.html', text: 'more about my work →' } },
    { key: 'look', label: 'seconds you looked before moving',
      touch: { label: 'seconds you looked before touching anything' },
      bridge: 'Looking before acting is how I build things too.',
      storyTitle: 'Look before you click',
      storyBody: 'At work I built small Python tools that check the data before anything runs, so problems get caught first instead of cleaned up later.',
      link: { href: 'work.html', text: 'more about my work →' } },
    { key: 'almost', label: 'times you hovered over one number without clicking it',
      bridge: 'Hesitation is data. It’s what got me into psychology.',
      touch: { label: 'times you tapped and missed a number',
               bridge: 'Misses are data too. Figuring out what people meant to do is what got me into psychology.' },
      storyTitle: 'Why people do what they do',
      storyBody: 'I studied psychology at UC San Diego to understand why people pause, choose or walk away. I still use it, whether I’m reading customer data or designing something people should enjoy.' },
    { key: 'away', label: 'times you left this tab and came back',
      touch: { label: 'times you left and came back' },
      bridge: 'Leaving and coming back is kind of my story too.',
      storyTitle: 'Where I’ve been',
      storyBody: 'Shenzhen, San Diego for psychology, Chicago for Booth, now Houston. Next stop: wherever the right team is.' },
    { key: 'side', label: 'of your time spent on the left half of the screen',
      touch: { label: 'of your taps that landed on the left half' },
      bridge: 'I’m reading what you do, not what you’d tell me. One of my projects found the same thing about games.',
      storyTitle: 'What people do vs. what they say',
      storyBody: 'Using Steam, SteamSpy and IGDB data, we tested what predicts a game’s revenue. How many people reviewed a game mattered more than what they said.',
      link: { href: 'steam.html', text: 'see the project →' } },
    { key: 'still', label: 'seconds since your mouse last moved',
      touch: { label: 'seconds since you last touched the screen' },
      bridge: 'Stillness usually means focus. I designed a whole app around that.',
      storyTitle: 'An app about focus',
      storyBody: 'I taught myself Figma to design a gamified productivity app built on behavioral psychology. It’s small and a little silly, and I made every screen myself.' }
  ];
  function pick(st, field) { return (TOUCH && st.touch && st.touch[field]) || st[field]; }

  var rain = document.getElementById('rain');
  var card = document.getElementById('card');
  var report = document.getElementById('report');
  var statsBox = document.getElementById('stats');

  // ---------- what we notice (in memory only) ----------
  var t0 = Date.now();
  var dist = 0, last = null, firstMove = null, lastMove = null, mx = null;
  var leftTicks = 0, sideTicks = 0, away = 0, wasHidden = false;
  var hovers = {}, clicked = {}, misses = 0, touching = false, gesture = null;
  var openIndex = null, reportOpen = false;

  function touched() {
    var now = Date.now();
    if (!firstMove) firstMove = now;
    lastMove = now;
  }

  if (!TOUCH) {
    document.addEventListener('mousemove', function (e) {
      if (last) dist += Math.hypot(e.clientX - last.x, e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
      touched();
      mx = e.clientX;
    });
  } else {
    document.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      if (!t) return;
      touching = true;
      last = { x: t.clientX, y: t.clientY };
      touched();
      sideTicks += 1;
      if (t.clientX < window.innerWidth / 2) leftTicks += 1;
      // remember where this touch began so a quick tap on empty rain can count as a miss (a drag doesn't)
      var overlayOpen = openIndex !== null || reportOpen;
      gesture = { onRain: !overlayOpen && rain.contains(e.target) && !e.target.closest('.live'), moved: 0 };
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      if (!t) return;
      var step = last ? Math.hypot(t.clientX - last.x, t.clientY - last.y) : 0;
      dist += step;
      if (gesture) gesture.moved += step;
      last = { x: t.clientX, y: t.clientY };
      touched();
    }, { passive: true });
    document.addEventListener('touchend', function () {
      if (gesture && gesture.onRain && gesture.moved < 12) misses += 1;
      gesture = null; touching = false; touched();
    }, { passive: true });
    document.addEventListener('touchcancel', function () { touching = false; }, { passive: true });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) wasHidden = true;
    else if (wasHidden) { wasHidden = false; away += 1; }
  });

  function readings() {
    var now = Date.now();
    var px = Math.round(dist);
    // a CSS pixel is about 0.26 mm on a desktop monitor and about 0.16 mm on a phone
    var meters = px * (TOUCH ? 0.00016 : 0.0002646);
    var distance = meters >= 1 ? 'about ' + meters.toFixed(1) + ' meters' : 'about ' + Math.max(1, Math.round(meters * 100)) + ' centimeters';
    var lookSecs = ((firstMove || now) - t0) / 1000;
    var stillSecs = (lastMove ? now - lastMove : now - t0) / 1000;
    var sidePct = sideTicks ? Math.round(leftTicks / sideTicks * 100) : 50;
    var awayLine = away > 0 ? 'You left ' + away + (away === 1 ? ' time' : ' times') + ' and came back. I’m glad you did.' : (TOUCH ? 'You haven’t switched away once. That’s focus.' : 'You haven’t left this tab once. That’s focus.');

    if (TOUCH) {
      var sideLine;
      if (!sideTicks) sideLine = 'Tap around and I’ll tell you which side you favor.';
      else if (sidePct > 55) sideLine = 'Mostly left. Left thumb, or just where your eyes went first?';
      else if (sidePct < 45) sideLine = 'Mostly right. Is your right thumb doing all the work?';
      else sideLine = 'Almost perfectly balanced. As all things should be.';
      var missLine = misses >= 2 ? 'You’ve missed ' + misses + ' times. They’re slippery, I know. Every miss tells me what you were aiming for.'
        : misses === 1 ? 'One miss. Happens to everyone.' : 'Not a single miss. Steady thumbs.';
      return {
        dist: { value: px.toLocaleString('en-US'), px: px, line: px > 0 ? 'That’s ' + distance + ' of thumb travel. I notice small things like that. Honestly, it’s most of my job.' : 'Your thumb hasn’t slid anywhere yet. Try dragging it around and watch this change.' },
        look: { value: lookSecs.toFixed(1), line: firstMove ? (lookSecs >= 2 ? 'You looked before you tapped. I respect that.' : 'You dove right in. I respect that too.') : 'You haven’t touched anything yet. Taking it all in?' },
        almost: { value: String(misses), line: missLine },
        away: { value: String(away), line: awayLine },
        side: { value: sidePct + '%', line: sideLine },
        still: { value: stillSecs.toFixed(1), line: touching || stillSecs < 1 ? 'You’re touching the screen right now. Busy thumbs.' : 'This counts up while you hold still. Right now you’re probably reading this sentence.' }
      };
    }

    var almost = 0;
    Object.keys(hovers).forEach(function (k) { if (!clicked[k] && hovers[k] > almost) almost = hovers[k]; });
    var sideLineM;
    if (!sideTicks) sideLineM = 'Move your mouse around and I’ll tell you which side you favor.';
    else if (sidePct > 55) sideLineM = 'You lean left. Maybe that’s where your eyes went first.';
    else if (sidePct < 45) sideLineM = 'You lean right. Right-handed mouse, or just a little contrarian?';
    else sideLineM = 'Almost perfectly balanced. As all things should be.';
    return {
      dist: { value: px.toLocaleString('en-US'), px: px, line: 'That’s ' + distance + ' of mouse travel. I notice small things like that. Honestly, it’s most of my job.' },
      look: { value: lookSecs.toFixed(1), line: firstMove ? (lookSecs >= 2 ? 'You looked before you leapt. I respect that.' : 'You dove right in. I respect that too.') : 'You still haven’t moved your mouse. Taking it all in?' },
      almost: { value: String(almost), line: almost >= 2 ? 'There’s a number you hovered over ' + almost + ' times without clicking. Curious but cautious? I won’t tell you which one.' : 'You haven’t hesitated over any number yet. Decisive.' },
      away: { value: String(away), line: awayLine },
      side: { value: sidePct + '%', line: sideLineM },
      still: { value: stillSecs.toFixed(1), line: stillSecs < 1 ? 'You’re moving right now. Busy hands.' : 'This counts up whenever you stop moving. Right now you’re probably reading this sentence.' }
    };
  }

  // ---------- the rain ----------
  var formats = [
    function () { return String(Math.floor(Math.random() * 10)); },
    function () { return String(Math.floor(Math.random() * 1000)); },
    function () { return (Math.random() * 10).toFixed(2); },
    function () { return String(Math.floor(Math.random() * 90000) + 10000); },
    function () { return '0.' + Math.floor(Math.random() * 1000); },
    function () { return Math.floor(Math.random() * 100) + '%'; }
  ];
  var small = window.innerWidth < 640;
  var noiseCount = small ? 22 : 40;
  for (var i = 0; i < noiseCount; i++) {
    var n = document.createElement('span');
    var dur = 9 + Math.random() * 10;
    n.className = 'drop noise';
    n.setAttribute('aria-hidden', 'true');
    n.textContent = formats[i % formats.length]();
    n.style.left = (2 + Math.random() * 94).toFixed(1) + '%';
    n.style.top = (Math.random() * 100).toFixed(1) + '%';
    n.style.fontSize = Math.round(13 + Math.random() * 14) + 'px';
    n.style.animationDuration = dur.toFixed(1) + 's';
    n.style.animationDelay = (-Math.random() * dur).toFixed(1) + 's';
    rain.appendChild(n);
  }

  // live numbers: on narrow screens anchor half of them to the right edge so long numbers never run off-screen
  var slots = small
    ? [{ left: 2 }, { left: 20 }, { left: 38 }, { right: 2 }, { right: 20 }, { right: 38 }]
    : [{ left: 9 }, { left: 25 }, { left: 41 }, { left: 57 }, { left: 73 }, { left: 88 }];
  slots.sort(function () { return Math.random() - 0.5; });
  var liveButtons = STATS.map(function (st, idx) {
    var b = document.createElement('button');
    var dur = (TOUCH ? 24 : 20) + Math.random() * 8;
    var s = slots[idx];
    b.type = 'button';
    b.className = 'drop live';
    b.setAttribute('aria-label', 'A number about you');
    if (s.right != null) b.style.right = s.right + '%'; else b.style.left = s.left + '%';
    b.style.top = (Math.random() * 90).toFixed(1) + '%';
    b.style.animationDuration = dur.toFixed(1) + 's';
    b.style.animationDelay = (-Math.random() * dur).toFixed(1) + 's';
    if (!TOUCH) b.addEventListener('mouseenter', function () { hovers[idx] = (hovers[idx] || 0) + 1; });
    b.addEventListener('click', function () { clicked[idx] = true; openCard(idx); });
    rain.appendChild(b);
    return b;
  });

  // ---------- overlays ----------
  function setDim() { rain.classList.toggle('dim', openIndex !== null || reportOpen); }
  function openCard(idx) {
    openIndex = idx; reportOpen = false;
    report.classList.remove('open'); card.classList.add('open');
    setDim(); render();
    card.scrollTop = 0;
    card.querySelector('[data-close]').focus({ preventScroll: true });
  }
  function openReport() {
    openIndex = null; reportOpen = true;
    card.classList.remove('open'); report.classList.add('open');
    setDim(); render();
    report.scrollTop = 0;
    report.querySelector('[data-close]').focus({ preventScroll: true });
  }
  function closeAll() {
    openIndex = null; reportOpen = false;
    card.classList.remove('open'); report.classList.remove('open');
    setDim();
  }
  document.getElementById('noticeBtn').addEventListener('click', openReport);
  document.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', closeAll); });
  document.querySelectorAll('[data-report]').forEach(function (el) { el.addEventListener('click', openReport); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  // report rows
  var rows = STATS.map(function (st) {
    var row = document.createElement('div');
    row.className = 'stat';
    row.innerHTML = '<div class="head"><span class="label"></span><span class="value"></span></div><span class="says"></span>';
    row.querySelector('.label').textContent = pick(st, 'label');
    statsBox.appendChild(row);
    return row;
  });

  function render() {
    var r = readings();
    STATS.forEach(function (st, idx) {
      liveButtons[idx].textContent = r[st.key].value;
      rows[idx].querySelector('.value').textContent = r[st.key].value;
      rows[idx].querySelector('.says').textContent = r[st.key].line;
    });
    if (openIndex !== null) {
      var st = STATS[openIndex];
      var bridge = pick(st, 'bridge');
      if (TOUCH && st.touch && st.touch.bridgeZero && r.dist.px < 40) bridge = st.touch.bridgeZero;
      document.getElementById('cardLabel').textContent = pick(st, 'label');
      document.getElementById('cardValue').textContent = r[st.key].value;
      document.getElementById('cardLine').textContent = r[st.key].line;
      document.getElementById('storyBridge').textContent = bridge.replace('{dist}', r.dist.value);
      document.getElementById('storyTitle').textContent = st.storyTitle;
      document.getElementById('storyBody').textContent = st.storyBody;
      var a = document.getElementById('storyLink');
      if (st.link) { a.href = st.link.href; a.textContent = st.link.text; a.hidden = false; }
      else { a.hidden = true; }
    }
  }

  setInterval(function () {
    if (!TOUCH && mx !== null) {
      sideTicks += 1;
      if (mx < window.innerWidth / 2) leftTicks += 1;
    }
    render();
  }, 200);
  render();

  if (TOUCH) {
    document.getElementById('hint').innerHTML = 'some of these numbers are <span class="hl"><span>about you</span></span>.<br>tap one.';
    document.documentElement.classList.add('touch');
  }
})();
