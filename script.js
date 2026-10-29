// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Dark / light mode ----------
const root = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
let canvasColors = () => {};
function applyTheme(t, save) {
  root.setAttribute('data-theme', t);
  themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  if (themeMeta) themeMeta.content = t === 'dark' ? '#070a10' : '#f4f7fb';
  if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
  canvasColors();
}
themeBtn.addEventListener('click', () => {
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
});
// Follow the system setting until the visitor picks one manually
matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
  let saved = null; try { saved = localStorage.getItem('theme'); } catch (err) {}
  if (!saved) applyTheme(e.matches ? 'light' : 'dark', false);
});

// Mobile menu
const toggle = document.querySelector('.nav__toggle');
const links = document.getElementById('nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

// Page switching: only one section is visible at a time
const sections = document.querySelectorAll('main section[id]');
const navAnchors = links.querySelectorAll('a');
const ids = Array.from(sections).map(s => s.id);

function showPage(id) {
  if (!ids.includes(id)) id = ids[0];
  sections.forEach(s => {
    const on = s.id === id;
    s.classList.toggle('active', on);
    if (on) s.scrollTop = 0;
  });
  navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
}

// Intercept nav clicks (also the brand link) so the page never jumps/scrolls
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    history.replaceState(null, '', '#' + id);
    showPage(id);
  });
});
window.addEventListener('hashchange', () => showPage(location.hash.slice(1)));
showPage(location.hash.slice(1));

// ---------- Typing effect ----------
const roles = [
  'BSIT student',
  'Web Technology major',
  'Front-end enthusiast',
  'curious coder',
  'future web developer'
];
const typedEl = document.getElementById('typed');
if (reduceMotion) {
  typedEl.textContent = roles[0];
} else {
  let r = 0, c = 0, deleting = false;
  (function tick() {
    const word = roles[r];
    typedEl.textContent = word.slice(0, c);
    let delay = deleting ? 38 : 85;
    if (!deleting && c === word.length) { deleting = true; delay = 1500; }
    else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
    else { c += deleting ? -1 : 1; }
    setTimeout(tick, delay);
  })();
}

// ---------- Photo: 3D tilt + shine + tap-to-toggle logos ----------
const wrap = document.getElementById('photoWrap');
const frame = document.getElementById('photoFrame');

wrap.addEventListener('mousemove', e => {
  const b = frame.getBoundingClientRect();
  const x = (e.clientX - b.left) / b.width;
  const y = (e.clientY - b.top) / b.height;
  if (!reduceMotion) {
    frame.style.setProperty('--ry', ((x - .5) * 14).toFixed(2) + 'deg');
    frame.style.setProperty('--rx', ((.5 - y) * 14).toFixed(2) + 'deg');
  }
  frame.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
  frame.style.setProperty('--my', (y * 100).toFixed(1) + '%');
});
wrap.addEventListener('mouseleave', () => {
  frame.style.setProperty('--rx', '0deg');
  frame.style.setProperty('--ry', '0deg');
});
// Touch devices have no hover, so tap the photo to open/close the logos
wrap.addEventListener('click', () => wrap.classList.toggle('open'));
wrap.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wrap.classList.toggle('open'); }
});

// ---------- Cursor spotlight + magnetic buttons ----------
const spot = document.getElementById('spotlight');
if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
  window.addEventListener('mousemove', e => {
    spot.style.opacity = 1;
    spot.style.left = e.clientX + 'px';
    spot.style.top = e.clientY + 'px';
  });
  document.addEventListener('mouseleave', () => spot.style.opacity = 0);

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const b = el.getBoundingClientRect();
      const dx = (e.clientX - (b.left + b.width / 2)) * .25;
      const dy = (e.clientY - (b.top + b.height / 2)) * .35;
      el.style.transform = `translate(${dx}px, ${dy - 2}px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });
}

// ---------- Particle network background ----------
const canvas = document.getElementById('net');
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d');
  let w, h, dots = [];
  let dotRGB = '94,234,212', linkRGB = '56,189,248';
  canvasColors = () => {
    const cs = getComputedStyle(root);
    dotRGB = cs.getPropertyValue('--dot-rgb').trim() || dotRGB;
    linkRGB = cs.getPropertyValue('--link-rgb').trim() || linkRGB;
  };
  canvasColors();
  const mouse = { x: -999, y: -999 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(80, Math.floor((w * h) / 20000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35
    }));
  }
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize();

  function frameLoop() {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.6, 0, 6.283);
      ctx.fillStyle = `rgba(${dotRGB},.7)`; ctx.fill();
    }
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(${dotRGB},${(1 - dist / 130) * .22})`;
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
        }
      }
      const mx = dots[i].x - mouse.x, my = dots[i].y - mouse.y;
      const md = Math.hypot(mx, my);
      if (md < 160) {
        ctx.strokeStyle = `rgba(${linkRGB},${(1 - md / 160) * .5})`;
        ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    requestAnimationFrame(frameLoop);
  }
  frameLoop();
}
