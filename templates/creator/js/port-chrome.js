/* port-chrome.js — 旧サイトの共通headにあった挙動の移植 ＋ スマホの引き出し */
(function () {
  "use strict";

  var headerWrap = document.getElementById("headerWrap");
  if (headerWrap) {
    var onScroll = function () {
      if (window.pageYOffset > 20) { headerWrap.classList.add("fixed"); }
      else { headerWrap.classList.remove("fixed"); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var pageTop = document.querySelector(".pageTop");
  if (pageTop) {
    pageTop.style.display = "none";
    var onScroll2 = function () {
      pageTop.style.display = window.pageYOffset > 300 ? "" : "none";
    };
    window.addEventListener("scroll", onScroll2, { passive: true });
    onScroll2();
    pageTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var menu = document.getElementById("M_leftContents");
  var toggle = document.querySelector(".l-menu-toggle");
  if (menu && toggle) {
    var scrim = null;

    var close = function () {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      if (scrim) { scrim.remove(); scrim = null; }
    };

    var open = function () {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      scrim = document.createElement("div");
      scrim.className = "l-menu-scrim";
      scrim.addEventListener("click", close);
      document.body.appendChild(scrim);
    };

    toggle.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) { close(); } else { open(); }
    });

    var closeBtn = menu.querySelector(".l-menu-close");
    if (closeBtn) { closeBtn.addEventListener("click", close); }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { close(); }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && menu.classList.contains("is-open")) { close(); }
    });
  }

  var zoomLinks = document.querySelectorAll("a[data-zoom]");
  if (zoomLinks.length) {
    var box = null;

    var closeZoom = function () {
      if (!box) { return; }
      box.remove();
      box = null;
      document.removeEventListener("keydown", onKey);
    };

    var onKey = function (e) { if (e.key === "Escape") { closeZoom(); } };

    var openZoom = function (src, alt) {
      closeZoom();
      box = document.createElement("div");
      box.className = "zoombox";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-label", "拡大画像");

      var img = document.createElement("img");
      img.src = src;
      img.alt = alt || "";
      img.className = "zoombox__img";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "zoombox__close";
      btn.setAttribute("aria-label", "閉じる");
      btn.textContent = "×";

      box.appendChild(img);
      box.appendChild(btn);
      box.addEventListener("click", function (e) { if (e.target === box || e.target === btn) { closeZoom(); } });
      document.body.appendChild(box);
      document.addEventListener("keydown", onKey);
    };

    Array.prototype.forEach.call(zoomLinks, function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href) { return; }
        e.preventDefault();
        var img = a.querySelector("img");
        openZoom(href, img ? img.alt : "");
      });
    });
  }
}());

