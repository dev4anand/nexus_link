/**
 * Nexus Link - Three.js Background
 * Professional kinetic network with depth layers
 */

(function () {
  'use strict';

  var scene;
  var camera;
  var renderer;
  var clock;

  var nodes;
  var dust;
  var links;

  var animationId;
  var mutationObserver;

  var pointer = { x: 0, y: 0 };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var NODE_COUNT = 96;
  var DUST_COUNT = 180;
  var LINK_DISTANCE = 168;
  var DEPTH_LIMIT = 280;

  var nodeState = [];
  var dustState = [];

  function isLightTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function getPalette() {
    if (isLightTheme()) {
      return {
        nodeColor: 0x1e6ea9,
        dustColor: 0x0d8f86,
        lineColor: { r: 0.15, g: 0.44, b: 0.66 },
        nodeOpacity: 0.5,
        dustOpacity: 0.18,
        lineOpacity: 0.22
      };
    }

    return {
      nodeColor: 0x8fd8ff,
      dustColor: 0x39b4a4,
      lineColor: { r: 0.45, g: 0.82, b: 0.96 },
      nodeOpacity: 0.64,
      dustOpacity: 0.2,
      lineOpacity: 0.28
    };
  }

  function init() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 1, 2300);
    camera.position.z = 620;

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    clock = new THREE.Clock();

    buildNodes();
    buildDust();
    buildLinks();
    applyPalette();

    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('mousemove', onPointerMove, { passive: true });

    mutationObserver = new MutationObserver(applyPalette);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    animate();
  }

  function buildNodes() {
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(NODE_COUNT * 3);

    var width = window.innerWidth;
    var height = window.innerHeight;

    for (var i = 0; i < NODE_COUNT; i++) {
      var x = (Math.random() - 0.5) * width * 1.25;
      var y = (Math.random() - 0.5) * height * 1.25;
      var z = (Math.random() - 0.5) * DEPTH_LIMIT * 2;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      nodeState.push({
        x: x,
        y: y,
        z: z,
        vx: (Math.random() - 0.5) * 0.33,
        vy: (Math.random() - 0.5) * 0.33,
        vz: (Math.random() - 0.5) * 0.16,
        wave: Math.random() * Math.PI * 2
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    nodes = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x8fd8ff,
        size: 2.6,
        transparent: true,
        opacity: 0.64,
        sizeAttenuation: true
      })
    );

    scene.add(nodes);
  }

  function buildDust() {
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(DUST_COUNT * 3);

    var width = window.innerWidth;
    var height = window.innerHeight;

    for (var i = 0; i < DUST_COUNT; i++) {
      var x = (Math.random() - 0.5) * width * 1.7;
      var y = (Math.random() - 0.5) * height * 1.6;
      var z = (Math.random() - 0.5) * 1100;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      dustState.push({
        x: x,
        y: y,
        z: z,
        speed: 0.11 + Math.random() * 0.18,
        drift: (Math.random() - 0.5) * 0.08
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    dust = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x39b4a4,
        size: 1.35,
        transparent: true,
        opacity: 0.2,
        sizeAttenuation: true
      })
    );

    scene.add(dust);
  }

  function buildLinks() {
    var maxSegments = NODE_COUNT * NODE_COUNT;

    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(maxSegments * 6);
    var colors = new Float32Array(maxSegments * 6);

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
    );

    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage)
    );

    links = new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.28
      })
    );

    scene.add(links);
  }

  function applyPalette() {
    if (!nodes || !dust || !links) return;

    var p = getPalette();

    nodes.material.color.setHex(p.nodeColor);
    nodes.material.opacity = p.nodeOpacity;

    dust.material.color.setHex(p.dustColor);
    dust.material.opacity = p.dustOpacity;

    links.material.opacity = p.lineOpacity;
  }

  function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
  }

  function updateNodes(delta, elapsed) {
    var positions = nodes.geometry.attributes.position.array;

    var widthLimit = window.innerWidth * 0.65;
    var heightLimit = window.innerHeight * 0.65;

    for (var i = 0; i < NODE_COUNT; i++) {
      var state = nodeState[i];
      var waveFactor = reducedMotion ? 0.12 : 0.32;

      state.x += state.vx * (delta * 60);
      state.y += state.vy * (delta * 60);
      state.z += state.vz * (delta * 60);

      state.wave += delta * (reducedMotion ? 0.35 : 0.8);
      state.y += Math.sin(state.wave + elapsed * 0.34) * waveFactor;

      if (state.x > widthLimit || state.x < -widthLimit) state.vx *= -1;
      if (state.y > heightLimit || state.y < -heightLimit) state.vy *= -1;
      if (state.z > DEPTH_LIMIT || state.z < -DEPTH_LIMIT) state.vz *= -1;

      positions[i * 3] = state.x;
      positions[i * 3 + 1] = state.y;
      positions[i * 3 + 2] = state.z;
    }

    nodes.geometry.attributes.position.needsUpdate = true;
  }

  function updateDust(delta) {
    var positions = dust.geometry.attributes.position.array;

    var heightLimit = window.innerHeight * 0.9;
    var widthLimit = window.innerWidth * 0.95;

    for (var i = 0; i < DUST_COUNT; i++) {
      var state = dustState[i];
      var speed = reducedMotion ? state.speed * 0.35 : state.speed;

      state.y += speed;
      state.x += state.drift;

      if (state.y > heightLimit) state.y = -heightLimit;
      if (state.x > widthLimit) state.x = -widthLimit;
      if (state.x < -widthLimit) state.x = widthLimit;

      positions[i * 3] = state.x;
      positions[i * 3 + 1] = state.y;
      positions[i * 3 + 2] = state.z;
    }

    dust.geometry.attributes.position.needsUpdate = true;
  }

  function updateLinks() {
    var p = getPalette();

    var pointPositions = nodes.geometry.attributes.position.array;
    var linePositions = links.geometry.attributes.position.array;
    var lineColors = links.geometry.attributes.color.array;

    var segment = 0;

    for (var i = 0; i < NODE_COUNT; i++) {
      var ax = pointPositions[i * 3];
      var ay = pointPositions[i * 3 + 1];
      var az = pointPositions[i * 3 + 2];

      for (var j = i + 1; j < NODE_COUNT; j++) {
        var bx = pointPositions[j * 3];
        var by = pointPositions[j * 3 + 1];
        var bz = pointPositions[j * 3 + 2];

        var dx = ax - bx;
        var dy = ay - by;
        var dz = az - bz;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < LINK_DISTANCE) {
          var intensity = (1 - dist / LINK_DISTANCE) * 0.92;

          linePositions[segment * 6] = ax;
          linePositions[segment * 6 + 1] = ay;
          linePositions[segment * 6 + 2] = az;
          linePositions[segment * 6 + 3] = bx;
          linePositions[segment * 6 + 4] = by;
          linePositions[segment * 6 + 5] = bz;

          lineColors[segment * 6] = p.lineColor.r * intensity;
          lineColors[segment * 6 + 1] = p.lineColor.g * intensity;
          lineColors[segment * 6 + 2] = p.lineColor.b * intensity;
          lineColors[segment * 6 + 3] = p.lineColor.r * intensity;
          lineColors[segment * 6 + 4] = p.lineColor.g * intensity;
          lineColors[segment * 6 + 5] = p.lineColor.b * intensity;

          segment++;
        }
      }
    }

    links.geometry.attributes.position.needsUpdate = true;
    links.geometry.attributes.color.needsUpdate = true;
    links.geometry.setDrawRange(0, segment * 2);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    var delta = clock.getDelta();
    var elapsed = clock.elapsedTime;

    updateNodes(delta, elapsed);
    updateDust(delta);
    updateLinks();

    var targetX = pointer.x * (reducedMotion ? 14 : 34);
    var targetY = pointer.y * (reducedMotion ? 10 : 24);

    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.position.z = 620 + Math.sin(elapsed * 0.14) * (reducedMotion ? 8 : 20);
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  function onResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function waitForThree() {
    if (typeof THREE !== 'undefined') {
      init();
      return;
    }

    setTimeout(waitForThree, 100);
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    if (mutationObserver) mutationObserver.disconnect();
  }

  window.addEventListener('beforeunload', destroy);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForThree);
  } else {
    waitForThree();
  }
})();
