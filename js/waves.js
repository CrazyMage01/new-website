// Shared engine: scroll-scrubbed waves + reveal-on-scroll. Loaded at the end of <body>.
(() => {
  document.documentElement.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Waves rise as they scroll into view (scrubbed: reversing scroll lowers them) ---
  const svgs = [...document.querySelectorAll('svg.wave')];
  if (svgs.length && !reduced) {
    // FX toggles are driven by the wave-lab panel on the home page when present;
    // hard-code the winners and delete the lab before shipping.
    const FX = { depth: true, roll: true, bob: true, easing: 'smooth' };
    const easings = {
      smooth: t => 1 - Math.pow(1 - t, 3),
      overshoot: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
      // easeOutElastic damped to half amplitude so the crest never clips the svg top
      springy: t => t <= 0 ? 0 : t >= 1 ? 1 :
        1 + (Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3)) * 0.5
    };
    const waves = svgs.map(svg => ({
      svg, main: svg.querySelector('path.main'), under: svg.querySelector('path.under')
    }));
    const render = now => {
      const vh = innerHeight;
      waves.forEach((w, i) => {
        const rect = w.svg.getBoundingClientRect();
        // progress through the divider's transit across the viewport: 0 when its
        // top reaches the bottom edge, 1 shortly before its bottom leaves the top
        const t = Math.min(1, Math.max(0, (vh - rect.top) / ((vh + rect.height) * 0.85)));
        const e1 = easings[FX.easing](t);
        const bob = FX.bob ? Math.sin(now / 900 + i * 1.7) * 5 * t : 0;
        const y = (1 - e1) * 120 + bob;
        const x = FX.roll ? (e1 - 1) * 120 : 0;
        w.main.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        w.under.style.display = FX.depth ? '' : 'none';
        if (FX.depth) {
          // back wave lags slightly, rises a touch higher, and bobs out of phase
          const e2 = easings.smooth(Math.min(1, Math.max(0, (t - 0.08) / 0.92)));
          const bob2 = FX.bob ? Math.sin(now / 700 + i * 2.1 + 1) * 6 * t : 0;
          const y2 = (1 - e2) * 134 - 12 + bob2;
          const x2 = 80 + (FX.roll ? (e2 - 1) * 160 : 0);
          w.under.setAttribute('transform', `translate(${x2.toFixed(2)} ${y2.toFixed(2)})`);
        }
      });
    };
    render(0);
    const tick = now => { render(now); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    for (const key of ['depth', 'roll', 'bob']) {
      const el = document.getElementById('fx-' + key);
      if (el) el.onchange = e => FX[key] = e.target.checked;
    }
    const easeSel = document.getElementById('fx-ease');
    if (easeSel) easeSel.onchange = e => FX.easing = e.target.value;
  }

  // --- Reveal-on-scroll: elements with .reveal rise in as they enter the viewport ---
  const targets = [...document.querySelectorAll('.reveal')];
  if (targets.length && !reduced && 'IntersectionObserver' in window) {
    targets.forEach((el, i) => { el.style.transitionDelay = `${(i % 5) * 70}ms`; });
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      }
    }, { threshold: 0.15 });
    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.classList.add('visible'));
  }
})();
