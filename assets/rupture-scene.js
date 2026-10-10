import * as THREE from './vendor/three.module.js';

// A custom bevelled fracture. Color comes from light reflected in the metal.
(function ruptureStudio() {
  const canvas = document.getElementById('rupture-scene');
  const stage = canvas?.closest('.portal-stage');
  if (!canvas || !stage) return;
  const interactionSurface = stage.closest('.portal') || stage;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const cycle = Math.PI * 2 / 36;
  let renderer;
  let raf = 0;
  let elapsed = 0;
  let lastTick = 0;
  let lastRender = 0;
  let frame = 0;
  let visible = true;
  let contextLost = false;
  let failed = false;
  let width = 1;
  let height = 1;
  const target = new THREE.Vector2();
  const tilt = new THREE.Vector2();
  canvas.dataset.engine = `three.js r${THREE.REVISION}`;
  canvas.dataset.state = 'loading';
  canvas.dataset.frame = '0';
  canvas.dataset.time = '0';

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4, 4, 4, -4, .1, 80);
  camera.position.set(0, .1, 11);
  camera.lookAt(0, 0, 0);

  function quiet() {
    return reduced.matches || document.documentElement.dataset.effects === 'calm';
  }
  function fallback(reason) {
    canvas.hidden = true;
    canvas.dataset.state = reason;
    stage.classList.remove('scene-ready');
    cancelAnimationFrame(raf);
    raf = 0;
    lastTick = 0;
  }
  try {
    renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: 'high-performance'});
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1.15;
  } catch (error) {
    failed = true;
    fallback('fallback');
    return;
  }

  try {
    const environment = new THREE.Scene();
    environment.background = new THREE.Color('#11131a');
    const panelResources = [];
    function panel(color, intensity, position, size, angle = 0) {
      const geometry = new THREE.PlaneGeometry(...size);
      const material = new THREE.MeshBasicMaterial({color, side: THREE.DoubleSide});
      material.color.multiplyScalar(intensity);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.lookAt(0, 0, 0);
      mesh.rotateZ(angle);
      environment.add(mesh);
      panelResources.push({geometry, material});
    }
    panel('#c7ff31', 4, [-4, 3.8, 3.5], [3.8, 6.8], -.2);
    panel('#ff267e', 3.6, [4.2, 1.2, 3], [3.6, 6], .2);
    panel('#4f8dff', 4.6, [1.6, -4, 4], [6, 2.6], .3);
    panel('#f7ff83', 4.2, [-1.4, 5, -.5], [4.6, 2], -.3);
    panel('#bbc6ff', 2.4, [-4.4, -1.8, -3], [4.5, 5]);
    panel('#ff59fb', 3.2, [4, -1.6, -4], [3.5, 4]);
    panel('#f7f8ff', 1.8, [-2.4, 1.6, 5.4], [1, 5.5], -.08);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentMap = pmrem.fromScene(environment, .04, .1, 30);
    scene.environment = environmentMap.texture;
    panelResources.forEach(({geometry, material}) => { geometry.dispose(); material.dispose(); });
    pmrem.dispose();

    scene.add(new THREE.AmbientLight('#c6cbd8', .22));
    const key = new THREE.DirectionalLight('#e8f7ff', 2.1);
    key.position.set(-3, 5, 8);
    scene.add(key);
    const edge = new THREE.DirectionalLight('#ff6cb3', 1.1);
    edge.position.set(4, -2, 3);
    scene.add(edge);

    const contour = [
      [-1.86, -1.46], [-1.66, -.7], [-2.13, .6], [-1.31, 1.12],
      [-.62, 2.26], [.4, 1.67], [1.26, 1.98], [2.02, .72],
      [1.68, -.57], [.55, -1.11], [-.19, -2.26], [-.84, -1.53]
    ];
    const silhouette = new THREE.Shape();
    silhouette.moveTo(...contour[0]);
    contour.slice(1).forEach(point => silhouette.lineTo(...point));
    silhouette.closePath();
    const voidPath = new THREE.Path();
    const voidPoints = [[-.79, -.52], [-.56, .49], [.14, 1.02], [.97, .51], [.71, -.23], [.18, -.86]];
    voidPath.moveTo(...voidPoints[0]);
    voidPoints.slice(1).forEach(point => voidPath.lineTo(...point));
    voidPath.closePath();
    silhouette.holes.push(voidPath);
    const geometry = new THREE.ExtrudeGeometry(silhouette, {
      depth: .62, bevelEnabled: true, bevelThickness: .15,
      bevelSize: .16, bevelSegments: 5, steps: 1, curveSegments: 1
    });
    geometry.center();
    const vertices = geometry.attributes.position;
    for (let i = 0; i < vertices.count; i += 1) {
      const x = vertices.getX(i), y = vertices.getY(i), z = vertices.getZ(i);
      vertices.setXYZ(i, x + z * .32, y + z * .08,
        z + .24 * Math.sin(x * 1.15) + .17 * Math.cos(y * 1.4));
    }
    vertices.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    const chrome = new THREE.MeshPhysicalMaterial({
      color: '#bbc0cf', metalness: 1, roughness: .19,
      clearcoat: .65, clearcoatRoughness: .12, envMapIntensity: 1.25
    });
    const sculpture = new THREE.Mesh(geometry, chrome);
    sculpture.rotation.set(-.14, .38, -.2);
    scene.add(sculpture);

    const orbitGroup = new THREE.Group();
    function orbit(color, opacity, radiusX, radiusY, rotation) {
      const points = [];
      for (let i = 0; i < 81; i += 1) {
        const a = i / 80 * Math.PI * 2;
        points.push(new THREE.Vector3(radiusX * Math.cos(a), radiusY * Math.sin(a), 0));
      }
      const ring = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({color, transparent: true, opacity, depthWrite: false})
      );
      ring.rotation.set(...rotation);
      orbitGroup.add(ring);
    }
    orbit('#c7ff31', .32, 2.9, 2.7, [1.04, .36, -.3]);
    orbit('#ff38d3', .18, 3.15, 2.6, [.44, 1.08, .35]);
    scene.add(orbitGroup);

    function pose(time) {
      const phase = time * cycle;
      sculpture.rotation.set(-.14 + Math.sin(phase + .8) * .16 + tilt.y,
        .38 + Math.sin(phase) * .42 + tilt.x, -.2 + Math.sin(phase * 2) * .045);
      sculpture.position.y = Math.sin(phase) * .07;
      orbitGroup.rotation.y = -.15 + Math.sin(phase + .4) * .15;
      orbitGroup.rotation.z = Math.sin(phase) * .08;
    }
    function render() {
      if (failed || contextLost || width < 2 || height < 2) return;
      pose(elapsed);
      renderer.render(scene, camera);
      frame += 1;
      canvas.dataset.frame = String(frame);
      canvas.dataset.time = elapsed.toFixed(2);
      canvas.dataset.state = quiet() ? 'calm' : 'playing';
      canvas.hidden = false;
      stage.classList.add('scene-ready');
    }
    function resize() {
      width = Math.max(1, stage.clientWidth);
      height = Math.max(1, stage.clientHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width < 600 ? 1.25 : 1.5));
      renderer.setSize(width, height, false);
      const viewHeight = width / height < .7 ? 7.9 : 6.9;
      const halfWidth = viewHeight * width / height / 2;
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      render();
    }
    function tick(now) {
      const delta = lastTick ? Math.min((now - lastTick) / 1000, .05) : 0;
      lastTick = now;
      elapsed += delta;
      const smooth = 1 - Math.exp(-delta * 3);
      tilt.lerp(target, smooth);
      const paintInterval = 1000 / 60;
      if (now - lastRender >= paintInterval - .5) {
        lastRender = now - ((now - lastRender) % paintInterval);
        render();
      }
      raf = requestAnimationFrame(tick);
    }
    function synchronize() {
      cancelAnimationFrame(raf);
      raf = 0;
      lastTick = 0;
      lastRender = 0;
      if (failed || contextLost) return;
      if (quiet()) {
        target.set(0, 0);
        tilt.set(0, 0);
        render();
        return;
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(tick);
      else canvas.dataset.state = 'paused';
    }
    interactionSurface.addEventListener('pointermove', event => {
      if (quiet() || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = interactionSurface.getBoundingClientRect();
      target.set(((event.clientX - rect.left) / rect.width * 2 - 1) * .1,
        ((event.clientY - rect.top) / rect.height * 2 - 1) * .08);
    }, {passive: true});
    interactionSurface.addEventListener('pointerleave', () => target.set(0, 0), {passive: true});
    document.addEventListener('visibilitychange', synchronize);
    window.addEventListener('humble:effects', synchronize);
    reduced.addEventListener('change', synchronize);
    finePointer.addEventListener('change', () => target.set(0, 0));
    new ResizeObserver(resize).observe(stage);
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      synchronize();
    }, {rootMargin: '80px'}).observe(stage);
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      contextLost = true;
      fallback('fallback');
    });
    canvas.addEventListener('webglcontextrestored', () => {
      contextLost = false;
      resize();
      synchronize();
    });
    resize();
    synchronize();
  } catch (error) {
    failed = true;
    fallback('fallback');
    renderer.dispose();
  }
})();