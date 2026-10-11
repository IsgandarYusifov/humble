(function horizonStudio() {
  'use strict';

  const canvas = document.getElementById('horizon-scene');
  const card = canvas?.closest('.horizon-card');
  if (!canvas || !card) return;

  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let context;
  try { context = canvas.getContext('2d', {alpha: false}); } catch { return; }
  if (!context) return;

  const plate = document.createElement('canvas');
  const backdrop = plate.getContext('2d', {alpha: false});
  if (!backdrop) return;

  const stars = [
    [.08, .15, 1.8, .27, .2], [.18, .29, 1.4, .23, 2.1],
    [.29, .10, 1.1, .12, 4.3], [.48, .19, 1.7, .25, 1.2],
    [.65, .11, 1.1, .14, 3.9], [.91, .17, 1.4, .22, 5.7],
    [.82, .27, 1.1, .12, 2.6], [.13, .52, 1.3, .18, 4.1],
    [.24, .43, 1.7, .20, 1.7], [.75, .40, 1.1, .13, 3.1],
    [.90, .53, 1.2, .17, 5.1], [.07, .70, .8, .12, .7],
    [.61, .58, .8, .10, 4.8], [.85, .70, .9, .11, 2.4],
    [.37, .20, .65, .09, 5.5], [.70, .22, .7, .10, .4]
  ];

  let width = 1;
  let height = 1;
  let dpr = 1;
  let elapsed = 0;
  let frame = 0;
  let raf = 0;
  let lastTick = 0;
  let lastPaint = 0;
  let visible = true;
  let pageActive = true;
  let disposed = false;
  const cycle = Math.PI * 2 / 48;
  const paintInterval = 1000 / 30;

  canvas.dataset.engine = 'canvas2d';
  canvas.dataset.motion = 'autonomous';
  canvas.dataset.state = 'loading';
  canvas.dataset.frame = '0';
  canvas.dataset.time = '0';

  function calm() {
    return reduced.matches || root.dataset.effects === 'calm';
  }

  // The surface, illuminated edge and moving spark share this one curve.
  function horizonDepth() {
    return Math.min(height * .32, width * .14);
  }

  function horizonY(x) {
    const offset = (x - width * .5) / (width * .5);
    const crest = height * (width / height < 1 ? .84 : .78);
    return crest + horizonDepth() * offset * offset;
  }

  function traceHorizon(ctx, start = 0, end = width) {
    const curvature = 4 * horizonDepth() / (width * width);
    const slope = 2 * curvature * (start - width * .5);
    ctx.moveTo(start, horizonY(start));
    ctx.quadraticCurveTo((start + end) / 2,
      horizonY(start) + slope * (end - start) / 2, end, horizonY(end));
  }

  function paintBackdrop() {
    backdrop.setTransform(dpr, 0, 0, dpr, 0, 0);
    backdrop.fillStyle = '#08090d';
    backdrop.fillRect(0, 0, width, height);

    backdrop.save();
    backdrop.translate(width * .5, height * .73);
    backdrop.scale(1, height / width * .74);
    const atmosphere = backdrop.createRadialGradient(0, 0, 0, 0, 0, width * .54);
    atmosphere.addColorStop(0, 'rgba(89, 73, 158, .17)');
    atmosphere.addColorStop(.44, 'rgba(43, 40, 96, .12)');
    atmosphere.addColorStop(1, 'rgba(8, 9, 13, 0)');
    backdrop.fillStyle = atmosphere;
    backdrop.fillRect(-width, -width, width * 2, width * 2);
    backdrop.restore();

    backdrop.beginPath();
    traceHorizon(backdrop);
    backdrop.lineTo(width, height + 2);
    backdrop.lineTo(0, height + 2);
    backdrop.closePath();
    backdrop.fillStyle = '#040509';
    backdrop.fill();

    const edge = backdrop.createLinearGradient(0, 0, width, 0);
    edge.addColorStop(0, 'rgba(64, 106, 153, .44)');
    edge.addColorStop(.28, 'rgba(154, 142, 222, .76)');
    edge.addColorStop(.49, 'rgba(209, 191, 186, .76)');
    edge.addColorStop(.72, 'rgba(172, 120, 176, .60)');
    edge.addColorStop(1, 'rgba(64, 106, 153, .36)');
    backdrop.strokeStyle = edge;
    backdrop.lineCap = 'round';
    for (const [weight, opacity] of [[14, .035], [5, .10], [2.5, .25], [1.1, 1]]) {
      backdrop.beginPath();
      traceHorizon(backdrop);
      backdrop.lineWidth = weight;
      backdrop.globalAlpha = opacity;
      backdrop.stroke();
    }
    backdrop.globalAlpha = 1;
  }

  function paintStars(time) {
    context.lineWidth = .8;
    stars.forEach(([nx, ny, radius, opacity, phase], index) => {
      const x = nx * width;
      const y = ny * height;
      const breathing = .78 + .22 * Math.sin(time * (Math.PI * 2 / (10 + index % 6)) + phase);
      context.strokeStyle = `rgba(218, 217, 229, ${opacity * breathing})`;
      context.beginPath();
      context.moveTo(x - radius, y);
      context.lineTo(x + radius, y);
      context.moveTo(x, y - radius);
      context.lineTo(x, y + radius);
      context.stroke();
    });
  }

  function paintSpark(time) {
    const x = width * (.33 + .035 * Math.sin(time * cycle));
    const y = horizonY(x);
    const breath = .92 + .08 * Math.sin(time * Math.PI * 2 / 14);
    const scale = Math.min(1, Math.max(.7, width / 1100));
    const reach = Math.min(135, width * .13);

    // A low-contrast fan of rays; no particle trail or large glowing dot.
    context.save();
    const rays = [-.13, -.08, -.03, .022, .07];
    rays.forEach((offset, index) => {
      const endX = x + width * offset * .34;
      const endY = y - height * (.20 + (index % 3) * .025);
      const beam = context.createLinearGradient(x, y, endX, endY);
      beam.addColorStop(0, `rgba(166, 158, 223, ${.085 * breath})`);
      beam.addColorStop(.42, 'rgba(118, 112, 175, .026)');
      beam.addColorStop(1, 'rgba(118, 112, 175, 0)');
      context.strokeStyle = beam;
      context.lineWidth = .6;
      context.beginPath();
      context.moveTo(x, y - 2);
      context.quadraticCurveTo(x + (endX - x) * .26, y - height * .10, endX, endY);
      context.stroke();
    });

    const glow = context.createRadialGradient(x, y, 0, x, y, 24 * scale);
    glow.addColorStop(0, `rgba(204, 195, 236, ${.12 * breath})`);
    glow.addColorStop(.22, 'rgba(165, 153, 225, .055)');
    glow.addColorStop(1, 'rgba(165, 153, 225, 0)');
    context.fillStyle = glow;
    context.fillRect(x - 24 * scale, y - 24 * scale, 48 * scale, 48 * scale);

    const flare = context.createLinearGradient(x - reach, y, x + reach, y);
    flare.addColorStop(0, 'rgba(196, 176, 140, 0)');
    flare.addColorStop(.45, `rgba(207, 197, 173, ${.18 * breath})`);
    flare.addColorStop(.5, `rgba(244, 239, 232, ${.44 * breath})`);
    flare.addColorStop(.55, `rgba(207, 197, 173, ${.18 * breath})`);
    flare.addColorStop(1, 'rgba(196, 176, 140, 0)');
    context.strokeStyle = flare;
    context.lineWidth = .7;
    context.beginPath();
    context.moveTo(x - reach, y);
    context.lineTo(x + reach, y);
    context.stroke();

    context.fillStyle = `rgba(245, 241, 255, ${.8 * breath})`;
    context.beginPath();
    context.moveTo(x, y - 4.5 * scale);
    context.lineTo(x + 1.7 * scale, y);
    context.lineTo(x, y + 4.5 * scale);
    context.lineTo(x - 1.7 * scale, y);
    context.closePath();
    context.fill();
    context.restore();
  }

  function render() {
    if (disposed || width < 2 || height < 2) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.drawImage(plate, 0, 0, width, height);
    paintStars(elapsed);
    paintSpark(elapsed);
    frame += 1;
    canvas.dataset.frame = String(frame);
    canvas.dataset.time = elapsed.toFixed(2);
    canvas.dataset.state = calm() ? 'calm' : 'playing';
    card.classList.add('scene-ready');
  }

  function resize() {
    if (disposed) return;
    width = Math.max(1, card.clientWidth);
    height = Math.max(1, card.clientHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = plate.width = Math.max(1, Math.round(width * dpr));
    canvas.height = plate.height = Math.max(1, Math.round(height * dpr));
    paintBackdrop();
    render();
  }

  function tick(now) {
    if (disposed) return;
    elapsed += lastTick ? Math.min((now - lastTick) / 1000, .1) : 0;
    lastTick = now;
    if (now - lastPaint >= paintInterval - .5) {
      lastPaint = now - ((now - lastPaint) % paintInterval);
      render();
    }
    raf = requestAnimationFrame(tick);
  }

  function synchronize() {
    cancelAnimationFrame(raf);
    raf = 0;
    lastTick = 0;
    lastPaint = 0;
    if (disposed) return;
    if (calm()) {
      render();
      return;
    }
    if (visible && !document.hidden && pageActive) raf = requestAnimationFrame(tick);
    else canvas.dataset.state = 'paused';
  }

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    synchronize();
  }, {rootMargin: '80px'});
  const effectsObserver = new MutationObserver(synchronize);

  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    effectsObserver.disconnect();
    document.removeEventListener('visibilitychange', synchronize);
    window.removeEventListener('humble:effects', synchronize);
    reduced.removeEventListener('change', synchronize);
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('pagehide', onPageHide);
  }

  function onPageHide(event) {
    pageActive = false;
    synchronize();
    if (!event.persisted) dispose();
  }

  function onPageShow() {
    pageActive = true;
    resize();
    synchronize();
  }

  resizeObserver.observe(card);
  intersectionObserver.observe(card);
  effectsObserver.observe(root, {attributes: true, attributeFilter: ['data-effects']});
  document.addEventListener('visibilitychange', synchronize);
  window.addEventListener('humble:effects', synchronize);
  reduced.addEventListener('change', synchronize);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  resize();
  synchronize();
})();

