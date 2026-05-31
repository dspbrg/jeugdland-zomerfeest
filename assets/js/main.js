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

/* ---------------- ZOMERFEEST letter colour shuffle ----------------
   Inline the word-art SVG (the <img> stays as a no-JS fallback), then let
   each letter flip between the colours it ALREADY uses — instant (no fade),
   random, and never the same colour as a left/right neighbour. Each letter
   runs on its own loose timer so they change out of sync. Reduced-motion safe. */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var img = document.querySelector(".hero__zomerfeest");
  if (!img || !img.getAttribute("src")) return;

  fetch(img.getAttribute("src"))
    .then(function (r) { return r.text(); })
    .then(function (txt) {
      var tmp = document.createElement("div");
      tmp.innerHTML = txt;
      var svg = tmp.querySelector("svg");
      if (!svg) return;
      svg.setAttribute("class", "hero__zomerfeest");
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      img.replaceWith(svg);
      start(svg);
    })
    .catch(function () { /* keep the <img> fallback */ });

  function start(svg) {
    var paths = [].slice.call(svg.querySelectorAll("path"));
    var palette = [];
    var letters = [];
    paths.forEach(function (p) {
      var m = (p.getAttribute("fill") || "").match(/#([0-9a-fA-F]{6})/);
      if (!m) return;
      var col = "#" + m[1].toUpperCase();
      if (palette.indexOf(col) === -1) palette.push(col);
      var b;
      try { b = p.getBBox(); } catch (e) { return; }
      letters.push({ el: p, x: b.x, y: b.y, color: col });
    });
    if (letters.length < 2 || palette.length < 2) return;

    // split into the two rows (ZOMER / FEEST) at the biggest vertical gap
    letters.sort(function (a, b) { return a.y - b.y; });
    var splitIdx = 1, maxGap = -1;
    for (var i = 1; i < letters.length; i++) {
      var g = letters[i].y - letters[i - 1].y;
      if (g > maxGap) { maxGap = g; splitIdx = i; }
    }
    var rows = [letters.slice(0, splitIdx), letters.slice(splitIdx)];
    rows.forEach(function (row) {
      row.sort(function (a, b) { return a.x - b.x; });
      row.forEach(function (L, i) {
        L.left = row[i - 1] || null;
        L.right = row[i + 1] || null;
      });
    });

    function pick(L) {
      var avoid = {};
      avoid[L.color] = 1;
      if (L.left) avoid[L.left.color] = 1;
      if (L.right) avoid[L.right.color] = 1;
      var opts = palette.filter(function (c) { return !avoid[c]; });
      if (!opts.length) opts = palette.filter(function (c) { return c !== L.color; });
      return opts[Math.floor(Math.random() * opts.length)];
    }

    // resolve any same-colour neighbours in the starting artwork (left→right)
    rows.forEach(function (row) {
      row.forEach(function (L) {
        if (L.left && L.left.color === L.color) {
          L.color = pick(L);
          L.el.setAttribute("fill", L.color);
        }
      });
    });

    function tick(L) {
      L.color = pick(L);
      L.el.setAttribute("fill", L.color);
      setTimeout(function () { tick(L); }, 1400 + Math.random() * 2600);
    }
    letters.forEach(function (L) {
      setTimeout(function () { tick(L); }, Math.random() * 2200);
    });
  }
})();
