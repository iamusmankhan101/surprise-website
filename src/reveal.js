// Scroll-in reveal: <div ref={reveal(150)}> fades/lifts/unblurs the element the first time it enters view,
// starting `delay` ms after (for staggering). Styles live in index.css under [data-reveal].
// A ref callback (not a class) so remounted nodes, e.g. after switching client preset, are picked up too.
let observer;

const getObserver = () =>
  (observer ??= new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.reveal = 'done';
        observer.unobserve(entry.target);
      }),
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  ));

export const reveal = (delay = 0) => (el) => {
  if (!el || el.dataset.reveal || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.style.setProperty('--reveal-delay', `${delay}ms`);
  el.dataset.reveal = 'pending';
  getObserver().observe(el);
};
