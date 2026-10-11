(() => {
  const cards = [...document.querySelectorAll('.ecosystem-card')];
  if (!cards.length) return;
  const visible = new Set();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activePage = true;
  const synchronize = () => {
    const enabled = activePage && !document.hidden && !reduced.matches && document.documentElement.dataset.effects !== 'calm';
    cards.forEach(card => card.dataset.sceneActive = String(enabled && visible.has(card)));
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    synchronize();
  }, {threshold: 0.08});
  cards.forEach(card => observer.observe(card));
  document.addEventListener('visibilitychange', synchronize);
  window.addEventListener('humble:effects', synchronize);
  reduced.addEventListener('change', synchronize);
  window.addEventListener('pagehide', () => {activePage = false; synchronize();});
  window.addEventListener('pageshow', () => {activePage = true; synchronize();});
  synchronize();
})();
