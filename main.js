(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var b = document.querySelector('.burger'), m = document.querySelector('.menu');
  if (b && m) b.addEventListener('click', function () {
    var open = m.classList.toggle('open'); b.setAttribute('aria-expanded', open);
  });

  // Header border once the page scrolls
  var top = document.querySelector('.top');
  var onScroll = function () { top && top.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // 3D tilt on service tiles, following the pointer
  if (!reduce && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.tile').forEach(function (t) {
      t.addEventListener('pointermove', function (e) {
        var r = t.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        t.style.transform = 'rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-4px)';
      });
      t.addEventListener('pointerleave', function () { t.style.transform = ''; });
    });
  }

  // Quote / contact forms open WhatsApp with the message filled in
  document.querySelectorAll('form[data-wa]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var lines = [f.getAttribute('data-intro') || 'Hello,'];
      f.querySelectorAll('input,select,textarea').forEach(function (el) {
        if (el.value && el.name) lines.push(el.getAttribute('data-label') + ': ' + el.value);
      });
      window.open('https://wa.me/' + f.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  });

  // Pre-select a service when arriving from a "Get a quote" link (?service=...)
  var sel = document.querySelector('select[name="service"]');
  var q = new URLSearchParams(location.search).get('service');
  if (sel && q) { for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === q) sel.selectedIndex = i; }
})();
