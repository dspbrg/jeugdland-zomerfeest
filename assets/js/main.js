/* Jeugdland 75 jaar · Zomerfeest — interactivity */
(function () {
  "use strict";

  // Event: zaterdag 22 augustus 2026, 14:00–19:00 (lokale tijd NL)
  var EVENT_START = new Date(2026, 7, 22, 14, 0, 0); // month is 0-based → 7 = aug
  var EVENT_END = new Date(2026, 7, 22, 19, 0, 0);

  /* ---------------- Countdown ---------------- */
  var grid = document.getElementById("countdown");
  var doneMsg = document.getElementById("countdown-done");

  function pad(n) { return String(n).padStart(2, "0"); }

  function setUnit(unit, value) {
    var el = grid && grid.querySelector('[data-unit="' + unit + '"]');
    if (el) el.textContent = value;
  }

  function tick() {
    var diff = EVENT_START.getTime() - Date.now();

    if (diff <= 0) {
      if (grid) grid.hidden = true;
      if (doneMsg) doneMsg.hidden = false;
      return false; // stop ticking
    }

    var s = Math.floor(diff / 1000);
    setUnit("days", Math.floor(s / 86400));
    setUnit("hours", pad(Math.floor((s % 86400) / 3600)));
    setUnit("minutes", pad(Math.floor((s % 3600) / 60)));
    setUnit("seconds", pad(s % 60));
    return true;
  }

  if (grid && tick()) {
    var timer = setInterval(function () {
      if (!tick()) clearInterval(timer);
    }, 1000);
  }

  /* ---------------- Add-to-calendar (.ics) ---------------- */
  function icsStamp(d) {
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      "00"
    );
  }

  var calBtn = document.getElementById("cal-btn");
  if (calBtn) {
    var ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Jeugdland//Zomerfeest 75 jaar//NL",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:zomerfeest-2026@jeugdland",
      "DTSTART:" + icsStamp(EVENT_START),
      "DTEND:" + icsStamp(EVENT_END),
      "SUMMARY:Jeugdland 75 jaar — Zomerfeest",
      "DESCRIPTION:De diamant van de buurt wordt 75 jaar! Trek je glitteroutfit uit de kast en schitter als een diamant.",
      "LOCATION:Theemsplein 22\\, 2014 CN Haarlem",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    calBtn.setAttribute("href", URL.createObjectURL(blob));
  }

  /* ---------------- Parallax scroll ----------------
     Drives the independent `translate` property (NOT `transform`). The CSS
     order is translate → rotate → scale, so `translate` is applied in screen
     space — a rotated diamond still parallaxes straight up, never diagonally.
     It also composes cleanly with the breathing `scale` animation. */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pxEls = [].slice.call(document.querySelectorAll("[data-parallax]"));

  if (!reduce && pxEls.length) {
    var ticking = false;

    function apply() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      for (var i = 0; i < pxEls.length; i++) {
        var el = pxEls[i];
        var sp = parseFloat(el.getAttribute("data-speed")) || 0.2;
        el.style.translate = "0 " + (y * sp).toFixed(1) + "px";
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(apply);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    apply();
  }

  /* ---------------- Randomise the diamond float ----------------
     Each diamond gets a random gesture variant, duration and start-phase on
     load, so the motion never settles into a recognisable pattern. The CSS
     keyframes keep scale+rotation as one move; we only randomise the timing.
     Skipped under reduced-motion (the CSS media query then keeps them still). */
  if (!reduce) {
    var variants = ["float-a", "float-b", "float-c", "float-d", "float-e", "float-f"];
    var ease = "cubic-bezier(.2,.9,.3,1)";        // snappy attack, quick settle
    var diamonds = [].slice.call(document.querySelectorAll(".hd"));
    for (var d = 0; d < diamonds.length; d++) {
      var name = variants[Math.floor(Math.random() * variants.length)];
      var dur = 2.3 + Math.random() * 1.7;        // 2.3s – 4.0s — playful dance tempo
      var delay = -Math.random() * dur;           // random point in the sequence
      diamonds[d].style.animation =
        name + " " + dur.toFixed(2) + "s " + ease + " " + delay.toFixed(2) + "s infinite";
    }
  }

  /* ---------------- Sync the browser UI tint to the fading background ----
     Keeps iOS Safari's bar / status area matching the canvas as it fades,
     instead of a fixed colour clashing behind the Dynamic Island. */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var shell = document.querySelector(".shell");
  if (themeMeta && shell) {
    var syncTheme = function () {
      themeMeta.setAttribute("content", getComputedStyle(shell).backgroundColor);
    };
    syncTheme();
    setInterval(syncTheme, 2000);
  }
})();

/* ---------------- Scroll-reveal for the activity cards ----------------
   Cards rise + fade in (staggered) as they scroll into view — adds rhythm
   on mobile where hover does nothing. Class added by JS, so without JS the
   cards stay fully visible. Skipped under reduced-motion. */
(function () {
  var cards = document.querySelectorAll(".acts__grid .act");
  if (!cards.length || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (var i = 0; i < cards.length; i++) {
    cards[i].classList.add("reveal");
    cards[i].style.setProperty("--i", i);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

  cards.forEach(function (c) { io.observe(c); });
})();
