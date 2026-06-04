'use strict';

// ─── Configuration ───────────────────────────────────────────────────────────
const CONFIG = {
  username: 'Altrevis',
  featuredProjects: [
    'Shoply-API-e-commerce',
    'E-commerce-project-YNOV',
    'goodlifeapp',
    'weather-app',
    'Groupie-Tracker-G7',
    'project-forum'
  ],
  typingTexts: [
    'Développeur Full Stack',
    '2× Lauréat Challenge 48h',
    'Passionné par le Code',
    'Créateur d\'applications web',
    'Étudiant en Bachelor → Master'
  ],
  typingSpeed: 90,
  typingDelay: 1900,
  revealSelector: [
    '.hero-badge', '.hero-greeting', '.hero-title',
    '.hero-subtitle', '.hero-description', '.hero-pills',
    '.hero-actions', '.social-row', '.hero-card-wrap',
    '.about-card', '.timeline-item', '.skill-category',
    '.project-card', '.projects-toolbar', '.contact-card'
  ].join(',')
};

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  repositories: [],
  activeFilter: 'all',
  searchTerm: ''
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const el = {
  navbar:       $('.navbar'),
  hamburger:    $('.hamburger'),
  navMenu:      $('.nav-menu'),
  navLinks:     $$('.nav-link'),
  sections:     $$('section[id]'),
  progress:     $('.scroll-progress'),
  backToTop:    $('.back-to-top'),
  search:       $('#project-search'),
  count:        $('#projects-count'),
  featuredGrid: $('#featured-projects-grid'),
  projectsGrid: $('#projects-grid'),
  cursorDot:    $('.cursor-dot'),
  cursorRing:   $('.cursor-ring'),
  canvas:       $('.bg-canvas')
};

// ═══════════════════════════════════════════
// CURSOR PERSONNALISÉ
// ═══════════════════════════════════════════
function initCursor() {
  if (!el.cursorDot || window.matchMedia('(pointer: coarse)').matches) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    el.cursorDot.style.left = mx + 'px';
    el.cursorDot.style.top  = my + 'px';
  });

  const animRing = () => {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    el.cursorRing.style.left = rx + 'px';
    el.cursorRing.style.top  = ry + 'px';
    raf = requestAnimationFrame(animRing);
  };
  animRing();
}

// ═══════════════════════════════════════════
// CANVAS PARTICULES
// ═══════════════════════════════════════════
function initCanvas() {
  const canvas = el.canvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 1.5 + .3;
      this.vx = (Math.random() - .5) * .3;
      this.vy = -(Math.random() * .4 + .15);
      this.alpha = Math.random() * .5 + .1;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 150;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const fade = progress < .1 ? progress / .1 : progress > .8 ? 1 - (progress - .8) / .2 : 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56,189,248,${this.alpha * fade})`;
      ctx.fill();
    }
  }

  const init = () => {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
  };

  const animate = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', resize);
  init();
  animate();
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
function initNavigation() {
  const closeMenu = () => {
    el.hamburger?.classList.remove('active');
    el.hamburger?.setAttribute('aria-expanded', 'false');
    el.navMenu?.classList.remove('active');
  };

  el.hamburger?.addEventListener('click', () => {
    const open = el.hamburger.classList.toggle('active');
    el.hamburger.setAttribute('aria-expanded', String(open));
    el.navMenu?.classList.toggle('active', open);
  });

  // Smooth scroll sur tous les liens ancres
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMenu();
    });
  });

  el.backToTop?.addEventListener('click', () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Logo → home
  $('.nav-logo')?.addEventListener('click', () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Clic hors menu mobile
  document.addEventListener('click', (e) => {
    if (!el.navbar?.contains(e.target)) closeMenu();
  });
}

// ═══════════════════════════════════════════
// SCROLL UI
// ═══════════════════════════════════════════
function updateScrollUI() {
  const st = window.scrollY;
  const dh = document.documentElement.scrollHeight - window.innerHeight;
  const pct = dh > 0 ? st / dh : 0;

  el.navbar?.classList.toggle('scrolled', st > 40);
  el.backToTop?.classList.toggle('visible', st > 500);

  if (el.progress) {
    el.progress.style.transform = `scaleX(${Math.min(Math.max(pct, 0), 1)})`;
  }

  // Active nav link
  let current = el.sections[0]?.id || '';
  el.sections.forEach(s => {
    if (st >= s.offsetTop - 200) current = s.id;
  });
  el.navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

function initScroll() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => { updateScrollUI(); ticking = false; });
    ticking = true;
  }, { passive: true });
  updateScrollUI();
}

// ═══════════════════════════════════════════
// TYPING ANIMATION
// ═══════════════════════════════════════════
function initTyping() {
  const el = document.querySelector('.typing-text');
  if (!el) return;

  let ti = 0, ci = 0, deleting = false;

  const tick = () => {
    const text = CONFIG.typingTexts[ti];
    el.textContent = deleting ? text.slice(0, ci - 1) : text.slice(0, ci + 1);
    deleting ? ci-- : ci++;

    let delay = deleting ? CONFIG.typingSpeed * .55 : CONFIG.typingSpeed;
    if (!deleting && ci === text.length) { deleting = true; delay = CONFIG.typingDelay; }
    else if (deleting && ci === 0)       { deleting = false; ti = (ti + 1) % CONFIG.typingTexts.length; delay = 400; }
    setTimeout(tick, delay);
  };
  tick();
}

// ═══════════════════════════════════════════
// REVEAL ANIMATIONS (IntersectionObserver)
// ═══════════════════════════════════════════
function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$(CONFIG.revealSelector).forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Délai en cascade pour les grilles
      const parent = entry.target.parentElement;
      const siblings = [...parent.querySelectorAll('.reveal')];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.min(idx * 60, 300)}ms`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);

      // Animer les barres de compétences
      if (entry.target.classList.contains('skill-category')) {
        entry.target.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = bar.style.getPropertyValue('--w') || bar.style.cssText.match(/--w:([^;]*)/)?.[1] || '0%';
        });
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$(CONFIG.revealSelector).forEach(el => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
    observer.observe(el);
  });
}

// ═══════════════════════════════════════════
// THREE.JS — HERO : SPHÈRE DE PARTICULES
// ═══════════════════════════════════════════
function initThreeHero() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('three-hero');
  if (!canvas) return;

  const scene  = new THREE.Scene();
  const W = window.innerWidth, H = window.innerHeight;
  const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ── Particle Sphere (distribution de Fibonacci) ───────────
  const isMob = window.innerWidth < 768;
  const N = isMob ? 1000 : 2500;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const R   = 2.8;

  const C = {
    cyan:   new THREE.Color(0x38bdf8),
    indigo: new THREE.Color(0x818cf8),
    green:  new THREE.Color(0x4ade80),
    amber:  new THREE.Color(0xfbbf24),
  };

  for (let i = 0; i < N; i++) {
    const phi   = Math.acos(1 - 2 * (i + 0.5) / N);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r     = R + (Math.random() - 0.5) * 0.12;
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);

    const t = (pos[i*3+1] / R + 1) / 2; // 0 = bas, 1 = haut
    let c;
    if (t < 0.25)      c = C.indigo;
    else if (t < 0.5)  c = C.cyan;
    else if (t < 0.75) c = C.cyan.clone().lerp(C.green, (t - 0.5) * 4);
    else               c = C.green;
    if (Math.random() < 0.025) c = C.amber;

    col[i*3]   = c.r;
    col[i*3+1] = c.g;
    col[i*3+2] = c.b;
  }

  const sphereGeo = new THREE.BufferGeometry();
  sphereGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  sphereGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const sphereMat = new THREE.PointsMaterial({
    size: isMob ? 0.055 : 0.04,
    vertexColors: true, transparent: true, opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const particleSphere = new THREE.Points(sphereGeo, sphereMat);
  scene.add(particleSphere);

  // ── Wireframe icosaèdre interne ───────────────────────────
  const icoMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.15, 3),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.065 })
  );
  scene.add(icoMesh);

  // ── Anneaux orbitaux (3 plans différents) ─────────────────
  const mkRing = (r, hex, op, rx = 0, rz = 0) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.009, 2, 128),
      new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: op,
        blending: THREE.AdditiveBlending, depthWrite: false })
    );
    m.rotation.x = rx; m.rotation.z = rz;
    return m;
  };
  const ring1 = mkRing(3.2, 0x38bdf8, 0.45, Math.PI / 2);
  const ring2 = mkRing(3.2, 0x818cf8, 0.35, Math.PI / 4, Math.PI / 6);
  const ring3 = mkRing(3.4, 0x4ade80, 0.22, 0.3, Math.PI / 3);
  scene.add(ring1, ring2, ring3);

  // ── Étoiles de fond (drift lent) ─────────────────────────
  const sc = isMob ? 250 : 650;
  const sp = new Float32Array(sc * 3);
  for (let i = 0; i < sc; i++) {
    sp[i*3]   = (Math.random() - 0.5) * 32;
    sp[i*3+1] = (Math.random() - 0.5) * 20;
    sp[i*3+2] = (Math.random() - 0.5) * 18 - 4;
  }
  const starField = new THREE.Points(
    Object.assign(new THREE.BufferGeometry(), { attributes: { position: new THREE.BufferAttribute(sp, 3) } }),
    new THREE.PointsMaterial({ size: 0.022, color: 0x7dd3fc, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false })
  );
  scene.add(starField);

  // ── Sphère centrale lumineuse (glow) ──────────────────────
  const glowCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
  );
  scene.add(glowCore);

  // ── Mouse interaction ─────────────────────────────────────
  let tX = 0, tY = 0, cX = 0, cY = 0;
  document.addEventListener('mousemove', e => {
    tY =  (e.clientX / window.innerWidth  - 0.5) * 1.4;
    tX = -(e.clientY / window.innerHeight - 0.5) * 0.9;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Boucle d'animation ────────────────────────────────────
  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Lerp souris
    cX += (tX - cX) * 0.032;
    cY += (tY - cY) * 0.032;

    particleSphere.rotation.y = t * 0.07 + cY * 0.5;
    particleSphere.rotation.x = cX * 0.3  + Math.sin(t * 0.18) * 0.05;

    icoMesh.rotation.y = -t * 0.042 + cY * 0.18;
    icoMesh.rotation.x =  cX * 0.14 + Math.cos(t * 0.11) * 0.04;

    ring1.rotation.z =  t * 0.14;
    ring2.rotation.y =  t * 0.10;
    ring3.rotation.x =  t * 0.08;
    ring3.rotation.z = -t * 0.055;

    // Dérive douce de la caméra
    camera.position.x = Math.sin(t * 0.09) * 0.22 + cY * 0.38;
    camera.position.y = Math.cos(t * 0.07) * 0.14 + cX * 0.22;
    camera.lookAt(0, 0, 0);

    // Pulsation du noyau
    const pulse = 1 + Math.sin(t * 2.2) * 0.18;
    glowCore.scale.set(pulse, pulse, pulse);

    starField.rotation.y = t * 0.0038;
    renderer.render(scene, camera);
  };
  animate();
}

// ═══════════════════════════════════════════
// THREE.JS — SKILLS : GÉOMÉTRIES FLOTTANTES
// ═══════════════════════════════════════════
function initThreeSkills() {
  if (typeof THREE === 'undefined') return;
  const section = document.getElementById('skills');
  if (!section) return;

  let scene, camera, renderer, clock;
  let dodeca, innerIco, orbCloud, glowSphere, running = false;

  function setup() {
    const canvas = document.getElementById('three-skills');
    if (!canvas || scene) return;

    const W = canvas.clientWidth  || section.clientWidth;
    const H = canvas.clientHeight || section.clientHeight;

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 0, 9);

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Dodécaèdre principal (fil de fer)
    dodeca = new THREE.Mesh(
      new THREE.DodecahedronGeometry(2.6, 0),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.14 })
    );
    scene.add(dodeca);

    // Icosaèdre interne décalé
    innerIco = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.7, 2),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.09 })
    );
    innerIco.position.set(3.5, 1, 0);
    scene.add(innerIco);

    // Nuage de particules orbitales
    const oc = 180;
    const op = new Float32Array(oc * 3);
    for (let i = 0; i < oc; i++) {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / oc);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r     = 3.5 + (Math.random() - 0.5) * 0.5;
      op[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      op[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      op[i*3+2] = r * Math.cos(phi);
    }
    const orbGeo = new THREE.BufferGeometry();
    orbGeo.setAttribute('position', new THREE.BufferAttribute(op, 3));
    orbCloud = new THREE.Points(orbGeo, new THREE.PointsMaterial({
      size: 0.08, color: 0x818cf8, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(orbCloud);

    // Noyau lumineux
    glowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.65 })
    );
    scene.add(glowSphere);

    // Anneau décoratif
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.008, 2, 128),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2,
        blending: THREE.AdditiveBlending, depthWrite: false })
    );
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    clock = new THREE.Clock();

    window.addEventListener('resize', () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
  }

  const animate = () => {
    if (!running) return;
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    dodeca.rotation.y    =  t * 0.11;
    dodeca.rotation.x    =  t * 0.065;
    innerIco.rotation.y  = -t * 0.16;
    innerIco.rotation.z  =  t * 0.09;
    orbCloud.rotation.y  =  t * 0.07;
    orbCloud.rotation.x  = -t * 0.04;

    const pulse = 1 + Math.sin(t * 1.6) * 0.16;
    glowSphere.scale.set(pulse, pulse, pulse);

    renderer.render(scene, camera);
  };

  const obs = new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) { setup(); animate(); }
  }, { threshold: 0.08 });
  obs.observe(section);
}

// ═══════════════════════════════════════════
// THREE.JS — CONTACT : NÉBULEUSE & TORUS KNOTS
// ═══════════════════════════════════════════
function initThreeContact() {
  if (typeof THREE === 'undefined') return;
  const section = document.getElementById('contact');
  if (!section) return;

  let scene, camera, renderer, clock;
  let knot1, knot2, nebCloud, running = false;

  function setup() {
    const canvas = document.getElementById('three-contact');
    if (!canvas || scene) return;

    const W = canvas.clientWidth  || section.clientWidth;
    const H = canvas.clientHeight || section.clientHeight;

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 100);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Torus knot gauche — cyan
    knot1 = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.5, 0.14, 120, 16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.18 })
    );
    knot1.position.set(-5.5, 0, -1.5);
    scene.add(knot1);

    // Torus knot droit — indigo (nœud différent p=3,q=5)
    knot2 = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.3, 0.12, 100, 16, 3, 5),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.16 })
    );
    knot2.position.set(5.5, 0, -1.5);
    scene.add(knot2);

    // Nuage de nébuleuse coloré
    const nc = 350;
    const np  = new Float32Array(nc * 3);
    const ncl = new Float32Array(nc * 3);
    const pal = [
      new THREE.Color(0x38bdf8),
      new THREE.Color(0x818cf8),
      new THREE.Color(0x4ade80),
    ];
    for (let i = 0; i < nc; i++) {
      const r     = Math.random() * 7 + 1;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI;
      np[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      np[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      np[i*3+2] = r * Math.cos(phi);
      const c = pal[Math.floor(Math.random() * 3)];
      ncl[i*3] = c.r; ncl[i*3+1] = c.g; ncl[i*3+2] = c.b;
    }
    const nebGeo = new THREE.BufferGeometry();
    nebGeo.setAttribute('position', new THREE.BufferAttribute(np, 3));
    nebGeo.setAttribute('color',    new THREE.BufferAttribute(ncl, 3));
    nebCloud = new THREE.Points(nebGeo, new THREE.PointsMaterial({
      size: 0.09, vertexColors: true, transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(nebCloud);

    clock = new THREE.Clock();

    window.addEventListener('resize', () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
  }

  const animate = () => {
    if (!running) return;
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    knot1.rotation.x =  t * 0.22;
    knot1.rotation.y =  t * 0.16;
    knot2.rotation.x = -t * 0.19;
    knot2.rotation.z =  t * 0.13;
    nebCloud.rotation.y =  t * 0.035;
    nebCloud.rotation.x =  t * 0.018;

    renderer.render(scene, camera);
  };

  const obs = new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) { setup(); animate(); }
  }, { threshold: 0.08 });
  obs.observe(section);
}

// ═══════════════════════════════════════════
// TILT EFFECT
// ═══════════════════════════════════════════
function initTilt(root = document) {
  if (window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  root.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r  = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top)  / r.height;
      card.style.setProperty('--rx', `${(0.5 - py) * 8}deg`);
      card.style.setProperty('--ry', `${(px - 0.5) * 8}deg`);
      card.style.setProperty('--gx', `${px * 100}%`);
      card.style.setProperty('--gy', `${py * 100}%`);
      card.style.setProperty('--lift', '-4px');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--gx', '50%');
      card.style.setProperty('--gy', '50%');
      card.style.setProperty('--lift', '0');
    });
  });
}

// ═══════════════════════════════════════════
// GITHUB API
// ═══════════════════════════════════════════
class GitHubAPI {
  constructor(username) {
    this.username = username;
    this.base = 'https://api.github.com';
  }

  async _fetch(url, label) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) { console.warn(`GitHub API (${label}):`, data.message); return null; }
      return data;
    } catch (err) {
      console.error(`GitHub network error (${label}):`, err);
      return null;
    }
  }

  async fetchUser() {
    const u = await this._fetch(`${this.base}/users/${this.username}`, 'user');
    return u && !Array.isArray(u) ? u : null;
  }

  async fetchRepos() {
    const repos = await this._fetch(
      `${this.base}/users/${this.username}/repos?sort=updated&per_page=100`,
      'repos'
    );
    return Array.isArray(repos) ? repos : [];
  }
}

async function loadGitHubStats() {
  const api = new GitHubAPI(CONFIG.username);
  const [user, repos] = await Promise.all([api.fetchUser(), api.fetchRepos()]);
  const safe = Array.isArray(repos) ? repos : [];

  const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = String(val); };

  setEl('repo-count', safe.length || '—');
  if (user) {
    const stars = safe.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    setEl('followers-count', user.followers ?? '—');
    setEl('stars-count', stars);
  } else {
    setEl('followers-count', '—');
    setEl('stars-count', '—');
  }
  return safe;
}

// ═══════════════════════════════════════════
// PROJECTS — helpers
// ═══════════════════════════════════════════
const LANG_ICONS = {
  JavaScript: '<i class="fab fa-js"></i>',
  TypeScript: '<i class="fas fa-file-code"></i>',
  Python:     '<i class="fab fa-python"></i>',
  Java:       '<i class="fab fa-java"></i>',
  Go:         '<i class="fas fa-code"></i>',
  PHP:        '<i class="fab fa-php"></i>',
  HTML:       '<i class="fab fa-html5"></i>',
  CSS:        '<i class="fab fa-css3-alt"></i>',
  'C#':       '<i class="fas fa-hashtag"></i>'
};

const PROJECT_DESCS = {
  'Shoply-API-e-commerce':    'API e-commerce complète avec système de paiement, gestion des commandes et stock.',
  'E-commerce-project-YNOV': 'Plateforme e-commerce full-stack avec authentification, panier et tunnel d\'achat.',
  'goodlifeapp':              'Application de suivi du bien-être et des habitudes quotidiennes.',
  'weather-app':              'App météo avec API externe, géolocalisation et UX interactive.',
  'Groupie-Tracker-G7':       'Système de tracking d\'artistes et concerts, développé en Go.',
  'project-forum':            'Forum communautaire avec authentification et gestion des discussions.',
  'ecommerce-website':        'Site e-commerce responsive avec catalogue produit et parcours fluide.',
  'APM-application':          'Application de monitoring et de performance applicative.',
  '2D-wave-monster-web':      'Jeu web 2D avec vagues d\'ennemis et gameplay progressif.',
  'IDS-python':               'Système de détection d\'intrusion (IDS) développé en Python.',
  'Gogonne-REACT':            'Application moderne construite avec React.',
  'forum-java-LARV':          'Forum réalisé en Java avec gestion des comptes.',
  'bowling-Node-JS':          'Application de gestion de parties de bowling en Node.js.',
  'hangman-web':              'Jeu du pendu en version web, avec dictionnaire dynamique.',
  'hangman-terminal':         'Jeu du pendu en terminal avec thèmes variés.',
  'ynov-go-game':             'Jeu développé en Go dans le cadre de la formation.',
  'site-hackathon':           'Site conçu et livré lors d\'un hackathon.',
  'appli-web-register-task':  'Application de gestion et suivi de tâches.',
  'E-commerce-PHP':           'Projet e-commerce avec base de données SQL en PHP.',
  'blizzard':                 'Fan site autour de l\'univers Blizzard Entertainment.',
  'ynov-colo-IA':             'Projet IA autour de la colocation étudiante.'
};

function getDesc(name) {
  return PROJECT_DESCS[name] || 'Projet de développement axé interface, logique métier et bonnes pratiques.';
}

function formatAge(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'Aujourd\'hui';
  if (diff === 1) return 'Hier';
  if (diff < 7)  return diff + ' j';
  if (diff < 30) return Math.floor(diff / 7) + ' sem.';
  if (diff < 365) return Math.floor(diff / 30) + ' mois';
  return Math.floor(diff / 365) + ' an' + (Math.floor(diff / 365) > 1 ? 's' : '');
}

// ─── Créer une carte projet ───────────────────────────────────────────────────
function createCard(repo, featured = false) {
  const card = document.createElement('article');
  const desc = getDesc(repo.name);
  const lang = repo.language || 'Other';
  const icon = LANG_ICONS[lang] || '<i class="fas fa-code"></i>';
  const name = repo.name.replace(/-/g, ' ');

  card.className = `project-card tilt-card reveal${featured ? ' featured-project' : ''}`;
  card.setAttribute('role', 'listitem');
  card.dataset.language    = lang;
  card.dataset.name        = repo.name.toLowerCase();
  card.dataset.description = desc.toLowerCase();
  card.dataset.tech        = lang.toLowerCase();

  card.innerHTML = `
    <div class="project-header">
      <div class="project-icon">${icon}</div>
      <div class="project-links">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer"
           aria-label="Voir ${name} sur GitHub" title="GitHub">
          <i class="fab fa-github"></i>
        </a>
        ${repo.homepage ? `
        <a href="${repo.homepage}" target="_blank" rel="noopener noreferrer"
           aria-label="Voir ${name} en live" title="Demo">
          <i class="fas fa-arrow-up-right-from-square"></i>
        </a>` : ''}
      </div>
    </div>
    <h3>${name}</h3>
    <p>${desc}</p>
    <div class="project-tech">
      <span class="tech-tag">${lang}</span>
    </div>
    <div class="project-stats">
      <div class="project-stat">
        <i class="fas fa-star"></i>
        <span>${repo.stargazers_count || 0}</span>
      </div>
      <div class="project-stat">
        <i class="fas fa-code-branch"></i>
        <span>${repo.forks_count || 0}</span>
      </div>
      <div class="project-stat">
        <i class="fas fa-clock"></i>
        <span>${formatAge(repo.updated_at)}</span>
      </div>
    </div>
  `;
  return card;
}

// ─── Filtrage projets ─────────────────────────────────────────────────────────
function applyFilters() {
  const cards = $$('#projects-grid .project-card');
  const term  = state.searchTerm.trim().toLowerCase();
  let visible = 0;

  cards.forEach(c => {
    const matchLang   = state.activeFilter === 'all' || c.dataset.language === state.activeFilter;
    const matchSearch = !term || `${c.dataset.name} ${c.dataset.description} ${c.dataset.tech}`.includes(term);
    const show = matchLang && matchSearch;
    c.classList.toggle('is-hidden', !show);
    if (show) visible++;
  });

  updateCount(visible);
  const empty = el.projectsGrid?.querySelector('.empty-state');
  if (visible === 0 && !empty) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = '<i class="fas fa-folder-open" style="font-size:2rem;margin-bottom:.8rem;display:block"></i><p>Aucun projet ne correspond à cette recherche.</p>';
    el.projectsGrid?.appendChild(div);
  } else if (visible > 0 && empty) {
    empty.remove();
  }
}

function updateCount(n) {
  if (el.count) el.count.textContent = n > 1 ? `${n} projets visibles` : `${n} projet visible`;
}

function initFilters() {
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeFilter = btn.dataset.filter || 'all';
      $$('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
      applyFilters();
    });
  });

  el.search?.addEventListener('input', (e) => {
    state.searchTerm = e.target.value || '';
    applyFilters();
  });
}

// ─── Afficher les projets ─────────────────────────────────────────────────────
async function displayProjects(repos = null) {
  const api  = new GitHubAPI(CONFIG.username);
  const all  = Array.isArray(repos) ? repos : await api.fetchRepos();
  state.repositories = all;

  if (!el.featuredGrid || !el.projectsGrid) return;

  if (!all.length) {
    el.featuredGrid.innerHTML = '<div class="loading-state"><p>Aucun projet trouvé.</p></div>';
    updateCount(0);
    return;
  }

  const featured = all.filter(r => CONFIG.featuredProjects.includes(r.name));
  const others   = all.filter(r => !CONFIG.featuredProjects.includes(r.name));

  el.featuredGrid.innerHTML = '';
  el.projectsGrid.innerHTML = '';

  featured.forEach(r => el.featuredGrid.appendChild(createCard(r, true)));
  others.forEach(r   => el.projectsGrid.appendChild(createCard(r)));

  // Re-init reveal + tilt sur les nouvelles cartes
  initReveal();
  initTilt(document);
  initFilters();
  applyFilters();
}

// ═══════════════════════════════════════════
// COMPTEUR ANIMÉ (hero stats)
// ═══════════════════════════════════════════
function animateCounter(el, target, duration = 1200) {
  if (!el || isNaN(target)) return;
  const start = Date.now();
  const step = () => {
    const p = Math.min((Date.now() - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  // Sécuriser les liens externes
  $$('a[target="_blank"]').forEach(a => {
    if (!a.getAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
  });

  // Décorer les cartes statiques
  $$('.about-card, .timeline-content, .skill-category, .contact-card, .profile-card').forEach(el => {
    el.classList.add('tilt-card');
  });
  $$('.timeline-item, .about-card, .skill-category, .contact-card').forEach(el => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
  });

  // Init modules
  initCursor();
  initCanvas();
  initNavigation();
  initScroll();
  initTyping();
  initReveal();
  initTilt();
  initThreeHero();
  initThreeSkills();
  initThreeContact();

  // Données GitHub
  const repos = await loadGitHubStats();

  // Compteurs animés après chargement
  const repoEl  = document.getElementById('repo-count');
  const starsEl = document.getElementById('stars-count');
  const followersEl = document.getElementById('followers-count');

  const repoCount = repos.length;
  const starsCount = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);

  if (repoEl && repoCount)    animateCounter(repoEl, repoCount);
  if (starsEl && starsCount)  animateCounter(starsEl, starsCount);
  if (followersEl) {
    const val = parseInt(followersEl.textContent);
    if (!isNaN(val)) animateCounter(followersEl, val);
  }

  await displayProjects(repos);
  updateScrollUI();
});