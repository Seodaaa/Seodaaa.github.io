// Numbers made of you.
// Everything here stays in this tab: nothing is stored or sent anywhere.
(function () {
  var STATS = [
    { key: 'dist', label: 'pixels your mouse has traveled',
      storyTitle: 'Finding the real number',
      storyBody: 'An accounting system said a small company owed far more than it really did. I traced where the gap came from and rebuilt the true number, one invoice at a time.' },
    { key: 'look', label: 'seconds you looked before moving',
      storyTitle: 'Look before you click',
      storyBody: 'At work I built small Python tools that check the data before anything runs, so problems get caught first instead of cleaned up later.' },
    { key: 'almost', label: 'times you hovered over one number without clicking it',
      storyTitle: 'Why people do what they do',
      storyBody: 'I studied psychology because I wanted to know why people decide the way they do. I still use it every day, from reading data to designing things people actually enjoy using.' },
    { key: 'away', label: 'times you left this tab and came back',
      storyTitle: 'Where I’ve been',
      storyBody: 'Shenzhen, San Diego, Chicago, Houston. Psychology at UC San Diego, then a Master in Management at Chicago Booth. Next stop: wherever the right team is.' },
    { key: 'side', label: 'of your time spent on the left half of the screen',
      storyTitle: 'What makes people buy a game?',
      storyBody: 'Using Steam, SteamSpy and IGDB data in Python and SQL, I tested what predicts a game’s revenue. How many people reviewed a game mattered more than what they said.' },
    { key: 'still', label: 'seconds since your mouse last moved',
      storyTitle: 'An app about focus',
      storyBody: 'I taught myself Figma to design a gamified productivity app built on behavioral psychology, with focus mechanics at its core. It’s small and a little silly, and I made every screen myself.' }
  ];

  var rain = document.getElementById('rain');
  var card = document.getElementById('card');
  var report = document.getElementById('report');
  var statsBox = document.getElementById('stats');

  // ---------- what we notice (in memory only) ----------
  var t0 = Date.now();
  var dist = 0, last = null, firstMove = null, lastMove = null, mx = null;
  var leftTicks = 0, sideTicks = 0, away = 0, wasHidden = false;
  var hovers = {}, clicked = {};
  var openIndex = null, reportOpen = false;

  document.addEventListener('mousemove', function (e) {
    if (last) dist += Math.hypot(e.clientX - last.x, e.clientY - last.y);
    last = { x: e.clientX, y: e.clientY };
    var now = Date.now();
    if (!firstMove) firstMove = now;
    lastMove = now;
    mx = e.clientX;
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) wasHidden = true;
    else if (wasHidden) { wasHidden = false; away += 1; }
  });

  function readings() {
    var now = Date.now();
    var px = Math.round(dist);
    var meters = px * 0.0002646;
    var distance = meters >= 1 ? 'about ' + meters.toFixed(1) + ' meters' : 'about ' + Math.max(1, Math.round(meters * 100)) + ' centimeters';
    var lookSecs = ((firstMove || now) - t0) / 1000;
    var almost = 0;
    Object.keys(hovers).forEach(function (k) { if (!clicked[k] && hovers[k] > almost) almost = hovers[k]; });
    var sidePct = sideTicks ? Math.round(leftTicks / sideTicks * 100) : 50;
    var stillSecs = (lastMove ? now - lastMove : now - t0) / 1000;
    var sideLine;
    if (!sideTicks) sideLine = 'Move your mouse around and I’ll tell you which side you favor.';
    else if (sidePct > 55) sideLine = 'You lean left. Maybe that’s where your eyes went first.';
    else if (sidePct < 45) sideLine = 'You lean right. Right-handed mouse, or just a little contrarian?';
    else sideLine = 'Almost perfectly balanced. As all things should be.';
    return {
      dist: { value: px.toLocaleString('en-US'), line: 'That’s ' + distance + ' of mouse travel. I notice small things like that. Honestly, it’s most of my job.' },
      look: { value: lookSecs.toFixed(1), line: firstMove ? (lookSecs >= 2 ? 'You looked before you leapt. I respect that.' : 'You dove right in. I respect that too.') : 'You still haven’t moved your mouse. Taking it all in?' },
      almost: { value: String(almost), line: almost >= 2 ? 'There’s a number you hovered over ' + almost + ' times without clicking. Curious but cautious? I won’t tell you which one.' : 'You haven’t hesitated over any number yet. Decisive.' },
      away: { value: String(away), line: away > 0 ? 'You left ' + away + (away === 1 ? ' time' : ' times') + ' and came back. I’m glad you did.' : 'You haven’t left this tab once. That’s focus.' },
      side: { value: sidePct + '%', line: sideLine },
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

  var lefts = small ? [4, 20, 36, 52, 66, 80] : [9, 25, 41, 57, 73, 88];
  lefts.sort(function () { return Math.random() - 0.5; });
  var liveButtons = STATS.map(function (st, idx) {
    var b = document.createElement('button');
    var dur = 20 + Math.random() * 8;
    b.type = 'button';
    b.className = 'drop live';
    b.setAttribute('aria-label', 'A number about you');
    b.style.left = lefts[idx] + '%';
    b.style.top = (Math.random() * 90).toFixed(1) + '%';
    b.style.animationDuration = dur.toFixed(1) + 's';
    b.style.animationDelay = (-Math.random() * dur).toFixed(1) + 's';
    b.addEventListener('mouseenter', function () { hovers[idx] = (hovers[idx] || 0) + 1; });
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
    row.querySelector('.label').textContent = st.label;
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
      document.getElementById('cardLabel').textContent = st.label;
      document.getElementById('cardValue').textContent = r[st.key].value;
      document.getElementById('cardLine').textContent = r[st.key].line;
      document.getElementById('storyTitle').textContent = st.storyTitle;
      document.getElementById('storyBody').textContent = st.storyBody;
    }
  }

  setInterval(function () {
    if (mx !== null) {
      sideTicks += 1;
      if (mx < window.innerWidth / 2) leftTicks += 1;
    }
    render();
  }, 200);
  render();

  // phones and tablets have no mouse, so say so honestly
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
    document.getElementById('hint').innerHTML = 'some of these numbers are <span class="hl"><span>about you</span></span>.<br>they work best with a mouse. <a href="work.html">or see my work →</a>';
  }
})();
