/* gallery.js — product sub-image gallery */
(function () {
  'use strict';

  function initGallery(root) {
    var track = root.querySelector('[data-gallery-track]');
    var slides = [].slice.call(root.querySelectorAll('[data-gallery-slide]'));
    var thumbs = root.querySelectorAll('[data-gallery-thumb]');
    var dots = root.querySelectorAll('[data-gallery-dot]');
    if (!track || !slides.length) { return; }

    function setActive(i) {
      for (var t = 0; t < thumbs.length; t++) {
        thumbs[t].setAttribute('aria-current', String(t === i));
      }
      for (var d = 0; d < dots.length; d++) {
        if (d === i) { dots[d].setAttribute('data-active', ''); }
        else { dots[d].removeAttribute('data-active'); }
      }
    }

    for (var t = 0; t < thumbs.length; t++) {
      (function (index) {
        thumbs[index].addEventListener('click', function () {
          track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft, behavior: 'smooth' });
          setActive(index);
        });
      })(t);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var e = 0; e < entries.length; e++) {
          if (entries[e].isIntersecting) {
            setActive(slides.indexOf(entries[e].target));
          }
        }
      }, { root: track, threshold: 0.6 });
      for (var s = 0; s < slides.length; s++) { io.observe(slides[s]); }
    }

    setActive(0);
  }

  function init() {
    var roots = document.querySelectorAll('[data-gallery]');
    Array.prototype.forEach.call(roots, initGallery);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

