import * as THREE from './vendor/three.module.js';

// The existing visual mark, given a small amount of depth and independent motion.
(function originBrandStudio() {
  const canvas = document.getElementById('origin-brand-canvas');
  const stage = canvas?.closest('.origin-brand-scene');
  if (!canvas || !stage) return;

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const period = Math.PI * 2 / 32;
  const paintInterval = 1000 / 30;
  let renderer;
  let disposed = false;
  let failed = false;
  let contextLost = false;
  let visible = false;
  let pageActive = true;
  let raf = 0;
  let elapsed = 0;
  let lastTick = 0;
  let lastPaint = 0;
  let frame = 0;
  let width = 1;
  let height = 1;

  canvas.dataset.engine = `three.js r${THREE.REVISION}`;
  canvas.dataset.state = 'loading';
  canvas.dataset.frame = '0';
  canvas.dataset.time = '0';
  canvas.setAttribute('aria-hidden', 'true');

  function calm() {
    return reduced.matches || root.dataset.effects === 'calm';
  }

  function fallback(state = 'fallback') {
    cancelAnimationFrame(raf);
    raf = 0;
    lastTick = 0;
    lastPaint = 0;
    canvas.hidden = true;
    canvas.dataset.state = state;
    stage.classList.remove('brand-ready');
  }

  try {
    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true, powerPreference: 'low-power'
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  } catch (error) {
    failed = true;
    fallback();
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, .1, 40);
  camera.position.set(0, 0, 9);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight('#ffffff', '#a8a0ba', 2.1));
  const key = new THREE.DirectionalLight('#fff9f3', 2.4);
  key.position.set(-4, 6, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight('#dad2ff', .45);
  fill.position.set(5, -1, 4);
  scene.add(fill);

  // Coordinates match origin-mark.svg. The inner contour stays open, as in the logo.
  const outer = [[64, 202], [138, 155], [200, 53], [292, 106],
    [369, 78], [438, 191], [407, 307], [306, 356],
    [239, 459], [180, 393], [89, 387], [107, 319]];
  const inner = [[177, 310], [200, 204], [268, 153],
    [351, 204], [326, 284], [274, 343]];
  const toPoint = ([x, y]) => [(x - 256) / 100, (256 - y) / 100];
  function trace(path, points) {
    path.moveTo(...toPoint(points[0]));
    points.slice(1).forEach(point => path.lineTo(...toPoint(point)));
    path.closePath();
  }
  const silhouette = new THREE.Shape();
  trace(silhouette, outer);
  const voidPath = new THREE.Path();
  trace(voidPath, inner);
  silhouette.holes.push(voidPath);

  const geometry = new THREE.ExtrudeGeometry(silhouette, {
    depth: .24, steps: 1, bevelEnabled: true,
    bevelThickness: .035, bevelSize: .035, bevelSegments: 3,
    curveSegments: 1
  });
  geometry.center();
  const face = new THREE.MeshStandardMaterial({
    color: '#AB9FF2', metalness: 0, roughness: .75
  });
  const edge = new THREE.MeshStandardMaterial({
    color: '#9688d2', metalness: 0, roughness: .85
  });
  const mark = new THREE.Mesh(geometry, [face, edge]);
  scene.add(mark);

  function render() {
    if (disposed || failed || contextLost || width < 2 || height < 2) return;
    const time = calm() ? 0 : elapsed;
    const phase = time * period;
    mark.rotation.set(
      .075 + .05 * Math.sin(phase),
      -.12 + .085 * Math.sin(phase + .55),
      -.045 + .025 * Math.sin(phase - .4)
    );
    mark.position.y = .025 * Math.sin(phase);
    try {
      renderer.render(scene, camera);
      frame += 1;
      canvas.hidden = false;
      canvas.dataset.frame = String(frame);
      canvas.dataset.time = elapsed.toFixed(2);
      canvas.dataset.state = calm() ? 'calm' : 'playing';
      stage.classList.add('brand-ready');
    } catch (error) {
      failed = true;
      fallback();
    }
  }

  function resize() {
    if (disposed || failed || contextLost) return;
    width = Math.max(1, stage.clientWidth);
    height = Math.max(1, stage.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    // Preserve a generous margin on narrow screens without making the mark tiny.
    const aspect = width / height;
    const viewHeight = Math.max(5.1, 4.7 / aspect);
    const halfWidth = viewHeight * aspect / 2;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    render();
  }

  function tick(now) {
    if (disposed || failed || contextLost) return;
    elapsed += lastTick ? Math.min((now - lastTick) / 1000, .1) : 0;
    lastTick = now;
    if (now - lastPaint >= paintInterval - .5) {
      lastPaint = now - ((now - lastPaint) % paintInterval);
      render();
    }
    if (!failed) raf = requestAnimationFrame(tick);
  }

  function synchronize() {
    cancelAnimationFrame(raf);
    raf = 0;
    lastTick = 0;
    lastPaint = 0;
    if (disposed || failed || contextLost) return;
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

  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
    fallback();
  }
  function onContextRestored() {
    contextLost = false;
    if (disposed || failed) return;
    resize();
    synchronize();
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
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    effectsObserver.disconnect();
    document.removeEventListener('visibilitychange', synchronize);
    window.removeEventListener('humble:effects', synchronize);
    reduced.removeEventListener('change', synchronize);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
    geometry.dispose();
    face.dispose();
    edge.dispose();
    renderer.dispose();
  }

  resizeObserver.observe(stage);
  intersectionObserver.observe(stage);
  effectsObserver.observe(root, {attributes: true, attributeFilter: ['data-effects']});
  document.addEventListener('visibilitychange', synchronize);
  window.addEventListener('humble:effects', synchronize);
  reduced.addEventListener('change', synchronize);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  resize();
  synchronize();
})();

