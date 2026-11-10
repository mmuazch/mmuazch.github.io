(function () {
  // Mobile menu
  var t = document.querySelector('.nav-toggle'), l = document.querySelector('.nav-links');
  if (t && l) t.addEventListener('click', function () {
    var open = l.classList.toggle('open'); t.setAttribute('aria-expanded', open);
  });

  // Copy buttons
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      navigator.clipboard && navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () {
        var o = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = o; }, 1500);
      });
    });
  });

  // WhatsApp message forms
  document.querySelectorAll('form[data-wa]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var lines = [f.getAttribute('data-intro') || 'Hello Muhammad Muaz,'];
      f.querySelectorAll('input,select,textarea').forEach(function (el) {
        if (el.value && el.name) lines.push(el.getAttribute('data-label') + ': ' + el.value);
      });
      window.open('https://wa.me/' + f.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  });

  // Ads (only when a publisher ID is configured in ads-config.js)
  var ads = window.SITE_ADS || {};
  if (ads.publisherId) {
    var s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ads.publisherId;
    document.head.appendChild(s);
    document.querySelectorAll('.ad-slot').forEach(function (box) {
      var slot = (ads.slots || {})[box.getAttribute('data-slot')];
      if (!slot) return;
      box.innerHTML = '<div class="ad-label">Advertisement</div><ins class="adsbygoogle" style="display:block" data-ad-client="' +
        ads.publisherId + '" data-ad-slot="' + slot + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }

  // Course progress (stored in this browser only)
  var KEY = 'muaz-progress';
  function getP() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function setP(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
  var page = document.body.dataset;
  if (page.course) {
    var p = getP(), done = p[page.course] || [];
    document.querySelectorAll('[data-lesson-link]').forEach(function (a) {
      a.classList.add(done.indexOf(a.getAttribute('data-lesson-link')) > -1 ? 'done' : 'todo');
    });
    var total = +page.total || 0, bar = document.querySelector('.progress span'), lab = document.querySelector('[data-progress-label]');
    if (bar && total) { bar.style.width = Math.round(done.length / total * 100) + '%'; }
    if (lab && total) lab.textContent = done.length + ' of ' + total + ' lessons completed';
    var mark = document.querySelector('[data-mark-done]');
    if (mark && page.lesson) {
      if (done.indexOf(page.lesson) > -1) mark.textContent = '✔ Completed';
      mark.addEventListener('click', function () {
        var p2 = getP(); p2[page.course] = p2[page.course] || [];
        if (p2[page.course].indexOf(page.lesson) < 0) p2[page.course].push(page.lesson);
        setP(p2); mark.textContent = '✔ Completed';
        var next = mark.getAttribute('data-next'); if (next) location.href = next;
      });
    }
  }

  // Quiz
  var qz = document.querySelector('form.quiz');
  if (qz) qz.addEventListener('submit', function (e) {
    e.preventDefault(); var score = 0, n = 0;
    qz.querySelectorAll('.q').forEach(function (q) {
      n++; var c = q.getAttribute('data-c');
      q.querySelectorAll('label').forEach(function (lb) {
        lb.classList.remove('right', 'wrong');
        var inp = lb.querySelector('input');
        if (inp.value === c) lb.classList.add('right');
        else if (inp.checked) lb.classList.add('wrong');
      });
      var sel = q.querySelector('input:checked'); if (sel && sel.value === c) score++;
    });
    qz.querySelector('[data-score]').textContent = 'Your score: ' + score + ' / ' + n;
  });
})();
