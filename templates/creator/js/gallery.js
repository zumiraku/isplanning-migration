/* =============================================================================
   gallery.js — product sub-image gallery
   isp-sp.com Creator Mode rebuild.

   Client request (C22): サブ画像使用（スマホではスワイプできればと思います）.

   The swiping itself is CSS scroll-snap and needs no JavaScript. This file only
   adds the things CSS cannot do: keeping the thumbnails and dots in step with
   whichever slide is showing, and moving the track when a thumbnail is chosen.

   If this script fails to load, the gallery still scrolls and every image is
   still reachable - it just loses the active-state highlight. That is the
   intended degradation, and it is why the thumbnails are buttons inside the
   markup rather than being generated here.
   ========================================================================== */
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

    // Thumbnail -> scroll the track. scrollIntoView would also scroll the page,
    // so move the track's own scrollLeft instead.
    for (var t = 0; t < thumbs.length; t++) {
      (function (index) {
        thumbs[index].addEventListener('click', function () {
          track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft, behavior: 'smooth' });
          setActive(index);
        });
      })(t);
    }

    // Slide -> thumbnail. IntersectionObserver against the track, so it stays
    // correct however the slide was reached: swipe, click, or keyboard.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var e = 0; e < entries.length; e++) {
          if (entries[e].isIntersecting) {
            // Position in the track, not a number written into the markup.
            // The slides come from two loops - 拡大画像 and 追加画像 - and Smarty
            // cannot continue a counter across them without a variable. Reading
            // the index here means the template only has to mark a slide, not
            // number it, so the two can never disagree.
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
