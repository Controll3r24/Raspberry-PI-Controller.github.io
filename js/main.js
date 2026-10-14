(function () {
  var D = window.I18N;
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lang = 'it';
  try {
    var st = localStorage.getItem('rpc-site-lang');
    if (st === 'it' || st === 'en') lang = st;
    else if (!/^it/i.test(navigator.language || '')) lang = 'en';
  } catch (e) {}

  function t(k) { return (D[lang] && D[lang][k]) || D.it[k] || k; }

  function apply() {
    root.lang = lang;
    document.title = t(root.dataset.title || 'title.index');
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('.copy').forEach(function (b) { if (!b.classList.contains('done')) b.textContent = t('copy'); });
    document.querySelectorAll('.lang').forEach(function (g) {
      g.dataset.active = lang;
      g.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    });
    root.dataset.lang = lang;
    if (window.__demoLang) window.__demoLang();
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      lang = b.dataset.lang;
      try { localStorage.setItem('rpc-site-lang', lang); } catch (e) {}
      apply();
    });
  });
  apply();

  var tabs = document.querySelectorAll('.tab');
  var shots = document.querySelectorAll('.shot');
  tabs.forEach(function (tb) {
    tb.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.toggle('on', x === tb); x.setAttribute('aria-selected', String(x === tb)); });
      shots.forEach(function (s) { s.classList.toggle('on', s.dataset.shot === tb.dataset.shot); });
    });
  });

  document.querySelectorAll('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = b.parentNode.querySelector('code').textContent;
      var done = function () {
        b.classList.add('done');
        b.textContent = t('copied');
        setTimeout(function () { b.classList.remove('done'); b.textContent = t('copy'); }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, done);
      else {
        var ta = document.createElement('textarea');
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        ta.remove();
        done();
      }
    });
  });

  var tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    tocLinks[0].classList.add('on');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('on'); });
          if (map[e.target.id]) map[e.target.id].classList.add('on');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('.doc section[id]').forEach(function (s) { io.observe(s); });
  }

  var term = document.getElementById('term');
  if (term) {
    var script = [
      { c: 'ssh pi@raspberrypi.local', o: ['pi@raspberrypi.local\'s password: ********', 'Linux raspberrypi 6.6.51+rpt-rpi-v8 aarch64'] },
      { c: 'vcgencmd measure_temp', o: ["temp=47.2'C"] },
      { c: 'systemctl is-active ssh', o: ['active'] },
      { c: 'uptime -p', o: ['up 3 days, 4 hours, 12 minutes'] }
    ];
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var prompt = function (i) { return i === 0 ? '<span class="p">C:\\&gt;</span> ' : '<span class="p">pi@raspberrypi:~ $</span> '; };
    var html = '';
    var render = function (cur) { term.innerHTML = html + (cur === null ? '' : cur) + '<span class="cur"></span>'; };
    var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };
    var run = async function () {
      await sleep(900);
      for (var i = 0; i < script.length; i++) {
        var s = script[i];
        var typed = '';
        for (var j = 0; j < s.c.length; j++) {
          typed += s.c[j];
          render(prompt(i) + esc(typed));
          await sleep(34 + Math.random() * 40);
        }
        html += prompt(i) + esc(s.c) + '\n';
        await sleep(380);
        s.o.forEach(function (l) { html += '<span class="' + (l === 'active' ? 'ok' : 'o') + '">' + esc(l) + '</span>\n'; });
        render(null);
        await sleep(620);
      }
      html += prompt(1);
      render(null);
    };
    run();

    var spark = document.getElementById('spark');
    var cpuEl = document.getElementById('s-cpu');
    var tempEl = document.getElementById('s-temp');
    var ramEl = document.getElementById('s-ram');
    var h = [];
    var v = 24;
    for (var i = 0; i < 40; i++) { v = Math.max(8, Math.min(70, v + (Math.random() - .5) * 14)); h.push(v); }
    var draw = function () {
      spark.setAttribute('points', h.map(function (x, i) { return (i * 300 / 39).toFixed(1) + ',' + (56 - x * 0.7).toFixed(1); }).join(' '));
    };
    draw();
    if (!reduce) {
      setInterval(function () {
        v = Math.max(8, Math.min(70, v + (Math.random() - .5) * 16));
        h.push(v);
        h.shift();
        draw();
        cpuEl.textContent = Math.round(v) + '%';
        tempEl.textContent = (44 + v / 14 + Math.random() * .4).toFixed(1) + ' °C';
        ramEl.textContent = (30 + Math.random() * 2).toFixed(0) + '%';
      }, 1100);
    }
  }
})();
