// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

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
