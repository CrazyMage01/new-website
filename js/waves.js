// Shared engine: scroll-scrubbed waves + reveal-on-scroll. Loaded at the end of <body>.
(() => {
  document.documentElement.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Waves rise as they scroll into view (scrubbed: reversing scroll lowers them) ---
  // Front + back wave layers, smooth easing, sideways roll, and idle bobbing.
  const svgs = [...document.querySelectorAll('svg.wave')];
  if (svgs.length && !reduced) {
    const smooth = t => 1 - Math.pow(1 - t, 3);
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
        const e1 = smooth(t);
        const bob = Math.sin(now / 900 + i * 1.7) * 5 * t;
        w.main.setAttribute('transform',
          `translate(${((e1 - 1) * 120).toFixed(2)} ${((1 - e1) * 120 + bob).toFixed(2)})`);
        // back wave lags slightly, rises a touch higher, and bobs out of phase
        const e2 = smooth(Math.min(1, Math.max(0, (t - 0.08) / 0.92)));
        const bob2 = Math.sin(now / 700 + i * 2.1 + 1) * 6 * t;
        w.under.setAttribute('transform',
          `translate(${(80 + (e2 - 1) * 160).toFixed(2)} ${((1 - e2) * 134 - 12 + bob2).toFixed(2)})`);
      });
    };
    render(0);
    const tick = now => { render(now); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  // --- Copy-to-clipboard buttons (e.g. the Email pill) ---
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // fallback for browsers without clipboard API permission
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1500);
    });
  });

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
