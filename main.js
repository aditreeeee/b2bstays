/* Site-wide behaviour: scroll reveal, stagger, counters, navbar, active nav, footer year. */
(function () {
  "use strict";

  /* ── Scroll reveal ── */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.10 });
    items.forEach(function (i) { io.observe(i); });
  } else {
    items.forEach(function (i) { i.classList.add("in"); });
  }

  /* ── Stagger sibling reveals in card grids ── */
  document.querySelectorAll(".row, #moduleCards").forEach(function (row) {
    var children = row.querySelectorAll(":scope > [class*='col'] > .reveal, :scope > .reveal");
    children.forEach(function (el, idx) {
      el.style.transitionDelay = (idx * 0.08) + "s";
    });
  });

  /* ── Navbar shadow on scroll ── */
  var nav = document.querySelector(".site-nav");
  if (nav) {
    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 20);
    }, { passive: true });
  }

  /* ── Eyebrow reveal inside parent ── */
  document.querySelectorAll(".eyebrow").forEach(function (el) {
    var parent = el.closest(".reveal");
    if (!parent) {
      // standalone eyebrow — observe directly
      if ("IntersectionObserver" in window) {
        var eo = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add("in"); eo.unobserve(e.target); }
          });
        }, { threshold: 0.15 });
        eo.observe(el);
      } else {
        el.classList.add("in");
      }
    }
  });

  /* ── Number counter animation ── */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var value = target < 1 ? (ease * target).toFixed(1) : Math.round(ease * target);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  /* ── Active nav link ── */
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".site-nav .nav-link[href]").forEach(function (a) {
    var target = a.getAttribute("href").split("#")[0].toLowerCase();
    if (target === page) a.classList.add("active");
  });

  /* ── Footer year ── */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
