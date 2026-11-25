(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return String(n).padStart(2, '0'); }
  var D, slideIdx = 0, timer = null;

  function renderSlider() {
    var slides = D.slides || [];
    if (!slides.length) return '';
    var html = '<div class="pf-slider" id="slider"></div>';
    return html;
  }
  function depthOf(idx, i, n) { var d = (idx - i + n) % n; return d === n - 1 ? 4 : d < 4 ? d : 5; }
  function buildSlider() {
    var el = document.getElementById('slider'); if (!el) return;
    var slides = D.slides, n = slides.length;
    el.innerHTML = '<div class="pf-slidebg"></div>' +
      slides.map(function (s, idx) {
        return '<div class="pf-slide" data-idx="' + idx + '"><div class="pf-slideart"><div class="pf-slideframe"><img src="' + esc(s.image) + '" alt="' + esc(s.title) + '" /></div></div></div>';
      }).join('') +
      '<div class="pf-slideprogress"><span></span></div>' +
      '<div class="pf-slideinfo"></div>' +
      '<div class="pf-slidedots">' + slides.map(function (s, idx) { return '<button class="pf-dot" aria-label="Show ' + esc(s.title) + '" data-go="' + idx + '"></button>'; }).join('') + '</div>' +
      '<span class="pf-slidecount"></span>';
    el.querySelectorAll('[data-go]').forEach(function (b) { b.addEventListener('click', function () { setSlide(+b.getAttribute('data-go')); }); });
    el.querySelectorAll('.pf-slideframe').forEach(function (f) {
      f.addEventListener('pointermove', function (e) {
        if (!f.parentNode.parentNode.classList.contains('pf-slide-cur')) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        var b = f.getBoundingClientRect();
        var x = Math.max(-1, Math.min(1, (e.clientX - b.left) / b.width * 2 - 1));
        var y = Math.max(-1, Math.min(1, (e.clientY - b.top) / b.height * 2 - 1));
        f.style.setProperty('--banner-rx', (-y * 11).toFixed(2) + 'deg');
        f.style.setProperty('--banner-ry', (x * 14).toFixed(2) + 'deg');
        f.style.setProperty('--banner-sx', (x * 9).toFixed(1) + 'px');
        f.style.setProperty('--banner-sy', (y * 9).toFixed(1) + 'px');
      });
      f.addEventListener('pointerleave', function () { ['--banner-rx', '--banner-ry', '--banner-sx', '--banner-sy'].forEach(function (k) { f.style.removeProperty(k); }); });
    });
    var tx = null;
    el.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (dx <= -40) setSlide((slideIdx + 1) % n); else if (dx >= 40) setSlide((slideIdx - 1 + n) % n);
    });
    setSlide(0);
  }
  function setSlide(i) {
    var el = document.getElementById('slider'), slides = D.slides, n = slides.length, s = slides[i];
    slideIdx = i;
    el.querySelectorAll('.pf-slide').forEach(function (sl) {
      var idx = +sl.getAttribute('data-idx');
      sl.setAttribute('data-depth', depthOf(idx, i, n));
      sl.classList.toggle('pf-slide-cur', idx === i);
    });
    el.querySelector('.pf-slidebg').outerHTML = '<div class="pf-slidebg"><img src="' + esc(s.image) + '" alt="" aria-hidden="true" /></div>';
    el.querySelector('.pf-slideprogress').outerHTML = '<div class="pf-slideprogress"><span></span></div>';
    el.querySelector('.pf-slideinfo').outerHTML = '<div class="pf-slideinfo"><span class="pf-slidetag">' + esc(s.tag) + '</span><span class="pf-slidetitle">' + esc(s.title) + '</span><a class="pf-slidelink" href="' + esc(s.link) + '" target="_blank" rel="noopener noreferrer">' + esc(s.button || 'WATCH →') + '</a></div>';
    el.querySelectorAll('.pf-dot').forEach(function (d, idx) { d.className = idx === i ? 'pf-dot pf-dot-on' : 'pf-dot'; });
    el.querySelector('.pf-slidecount').textContent = pad(i + 1) + ' / ' + pad(n);
    clearInterval(timer);
    timer = setInterval(function () { setSlide((slideIdx + 1) % n); }, 4000);
  }

  function lanesHtml() {
    var lanes = D.lanes || [];
    var grid = lanes.map(function (l, k) {
      var n = (l.projects || []).length;
      return '<a class="pf-card" href="#lane-' + (k + 1) + '" data-lane="lane-' + (k + 1) + '"><div class="pf-cardimg"><img src="' + esc(l.cover) + '" alt="" /><span class="pf-view">' + (n > 0 ? n + ' PROJECTS' : 'SOON') + '</span></div><div class="pf-cardmeta"><span class="pf-cardnum">' + pad(k + 1) + '</span><h3 class="pf-cardtitle">' + esc(l.title) + '</h3><p class="pf-cardtag">' + esc(l.tag) + '</p></div></a>';
    }).join('');
    var secs = lanes.map(function (l, k) {
      var projects = (l.projects || []).map(function (p) {
        return '<a class="pf-project" href="' + esc(p.link) + '" target="_blank" rel="noopener noreferrer"><div class="pf-projectimg"><img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy" /><span class="pf-projectcta">' + esc(p.button || 'WATCH →') + '</span></div><h4 class="pf-projecttitle">' + esc(p.title) + '</h4><p class="pf-projectmeta">' + esc(p.meta) + '</p></a>';
      }).join('');
      return '<section class="pf-lane" id="lane-' + (k + 1) + '"><div class="pf-lanehead"><span class="pf-lanenum">' + pad(k + 1) + '</span><h3 class="pf-lanetitle">' + esc(l.title) + '</h3><span class="pf-lanetag">' + esc(l.tag) + '</span></div>' +
        (projects ? '<div class="pf-projects">' + projects + '</div>' : '<div class="pf-gap"><p class="pf-gaptext">Coming soon.</p></div>') +
        (l.more_link ? '<a class="pf-more" href="' + esc(l.more_link) + '" target="_blank" rel="noopener noreferrer">MORE ' + esc(String(l.title).toUpperCase()) + ' →</a>' : '') + '</section>';
    }).join('');
    return { grid: grid, secs: secs };
  }

  function render() {
    var h = D.hero || {}, L = lanesHtml();
    var wa = D.whatsapp_link || '#';
    document.getElementById('root').innerHTML =
      '<nav class="pf-nav"><span class="pf-logo">MOHAMED<em>.</em>H</span><span class="pf-navlinks"><a href="#work">WORK</a><a href="#about">ABOUT</a><a href="#contact">CONTACT</a></span></nav>' +
      '<header class="pf-hero"><p class="pf-hello">' + esc(h.hello) + '</p><h1 class="pf-name">' + esc(h.name_line1) + '<br />' + esc(h.name_line2) + '</h1><p class="pf-role">' + esc(h.role) + '</p><p class="pf-tagline">' + esc(String(h.tagline_start||'').replace(/\s*$/, ' ')) + '<em>' + esc(h.tagline_highlight) + '</em></p></header>' +
      renderSlider() +
      '<section class="pf-section" id="work"><h2 class="pf-h2">SELECTED WORK</h2><div class="pf-grid">' + L.grid + '</div>' + L.secs + '</section>' +
      '<section class="pf-section" id="services"><h2 class="pf-h2">WHAT I DO</h2><div class="pf-services">' + (D.services || []).map(function (s, i) { return '<div class="pf-service"><span class="pf-servicenum">' + pad(i + 1) + '</span><div><h3 class="pf-servicename">' + esc(s.name) + '</h3><p class="pf-servicedetail">' + esc(s.detail) + '</p></div></div>'; }).join('') + '</div></section>' +
      '<section class="pf-section" id="about"><h2 class="pf-h2">ABOUT</h2><p class="pf-about">' + esc(D.about) + '</p></section>' +
      '<footer class="pf-footer" id="contact"><p class="pf-footkicker">GOT A PROJECT IN MIND?</p><a class="pf-cta" href="' + esc(wa) + '" target="_blank" rel="noopener noreferrer"><span class="pf-ctatext">LET&rsquo;S MAKE<br />IT MOVE</span><span class="pf-ctaarrow" aria-hidden="true">→</span></a><div class="pf-contacts">' +
      (D.contacts || []).map(function (c) { return '<a class="pf-contact" href="' + esc(c.link) + '" target="_blank" rel="noopener noreferrer"><span class="pf-contactlabel">' + esc(c.label) + '</span><span class="pf-contactvalue">' + esc(c.value) + '</span></a>'; }).join('') +
      '</div><p class="pf-copy">© ' + new Date().getFullYear() + ' MOHAMED HASSAN</p></footer>';
    buildSlider();
    document.querySelectorAll('.pf-card').forEach(function (a) {
      a.addEventListener('mousemove', function (e) {
        if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
        var r = a.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        a.style.transform = 'perspective(900px) rotateX(' + (-py * 10).toFixed(2) + 'deg) rotateY(' + (px * 12).toFixed(2) + 'deg) translateY(-4px)';
      });
      a.addEventListener('mouseleave', function () { a.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)'; });
    });
  }

  fetch('/content/site.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) { D = d; render(); })
    .catch(function (e) { document.getElementById('root').innerHTML = '<p style="padding:40px">Could not load content.</p>'; console.error(e); });
})();
