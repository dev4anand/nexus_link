/**
 * NEXUS LINK — Three.js Background Animation
 * Floating particle network with connecting lines
 */

(function () {
  'use strict';

  let scene, camera, renderer, particles, lines;
  let animId;
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 150;
  const pData = [];

  function init() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 600;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    buildParticles();
    buildLines();
    animate();

    window.addEventListener('resize', onResize);
    document.addEventListener('mousemove', onMouseMove);
  }

  let mouseX = 0, mouseY = 0;

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  }

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function buildParticles() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * window.innerWidth;
      const y = (Math.random() - 0.5) * window.innerHeight;
      const z = (Math.random() - 0.5) * 400;

      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      pData.push({
        x, y, z,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.15,
        i
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: isLight() ? 0x0066ff : 0x00d4ff,
      size: isLight() ? 2 : 2.5,
      transparent: true,
      opacity: isLight() ? 0.35 : 0.6,
      sizeAttenuation: true
    });

    particles = new THREE.Points(geo, mat);
    scene.add(particles);
  }

  // Update particle/line colors when theme changes
  function onThemeChange() {
    if (particles) {
      particles.material.color.setHex(isLight() ? 0x0066ff : 0x00d4ff);
      particles.material.opacity = isLight() ? 0.35 : 0.6;
    }
    if (lines) {
      lines.material.opacity = isLight() ? 0.12 : 0.25;
    }
  }

  // Watch for data-theme attribute changes
  new MutationObserver(onThemeChange).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ['data-theme'] }
  );

  function buildLines() {
    const geo = new THREE.BufferGeometry();
    // Max connections: rough estimate
    const maxLines = PARTICLE_COUNT * PARTICLE_COUNT;
    const positions = new Float32Array(maxLines * 6);
    const colors    = new Float32Array(maxLines * 6);

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3).setUsage(THREE.DynamicDrawUsage));

    const mat = new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.25 })
    );

    lines = mat;
    scene.add(lines);
  }

  function updateLines() {
    const pos = particles.geometry.attributes.position.array;
    const linePos = lines.geometry.attributes.position.array;
    const lineCol = lines.geometry.attributes.color.array;

    let idx = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const ax = pos[i * 3], ay = pos[i * 3 + 1], az = pos[i * 3 + 2];
        const bx = pos[j * 3], by = pos[j * 3 + 1], bz = pos[j * 3 + 2];
        const dx = ax - bx, dy = ay - by, dz = az - bz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECTION_DIST) {
          const alpha = 1 - dist / CONNECTION_DIST;
          linePos[idx * 6]     = ax;
          linePos[idx * 6 + 1] = ay;
          linePos[idx * 6 + 2] = az;
          linePos[idx * 6 + 3] = bx;
          linePos[idx * 6 + 4] = by;
          linePos[idx * 6 + 5] = bz;

          // Gradient color: cyan to blue
          lineCol[idx * 6]     = 0;
          lineCol[idx * 6 + 1] = alpha * 0.83;
          lineCol[idx * 6 + 2] = alpha;
          lineCol[idx * 6 + 3] = alpha * 0.4;
          lineCol[idx * 6 + 4] = alpha * 0.5;
          lineCol[idx * 6 + 5] = alpha;

          idx++;
        }
      }
    }

    lines.geometry.attributes.position.needsUpdate = true;
    lines.geometry.attributes.color.needsUpdate = true;
    lines.geometry.setDrawRange(0, idx * 2);
  }

  function animate() {
    animId = requestAnimationFrame(animate);

    const pos = particles.geometry.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const d = pData[i];
      d.x += d.vx;
      d.y += d.vy;
      d.z += d.vz;

      const hw = window.innerWidth / 2;
      const hh = window.innerHeight / 2;

      if (d.x > hw || d.x < -hw) d.vx *= -1;
      if (d.y > hh || d.y < -hh) d.vy *= -1;
      if (d.z > 200 || d.z < -200) d.vz *= -1;

      pos[i * 3]     = d.x;
      pos[i * 3 + 1] = d.y;
      pos[i * 3 + 2] = d.z;
    }

    particles.geometry.attributes.position.needsUpdate = true;

    // Subtle camera parallax
    camera.position.x += (mouseX * 30 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 20 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    updateLines();
    renderer.render(scene, camera);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Wait for THREE to load
  function waitForThree() {
    if (typeof THREE !== 'undefined') {
      init();
    } else {
      setTimeout(waitForThree, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForThree);
  } else {
    waitForThree();
  }
})();
