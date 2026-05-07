import { animate, stagger } from 'animejs';

export function pageEnter(target) {
  if (!target) return;
  animate(target, {
    opacity: [0, 1],
    translateY: [10, 0],
    duration: 320,
    ease: 'outQuad',
  });
}

export function staggerIn(targets, delay = 0) {
  const els = typeof targets === 'string' ? document.querySelectorAll(targets) : targets;
  if (!els || (els.length !== undefined && els.length === 0)) return;
  animate(els, {
    opacity: [0, 1],
    translateY: [16, 0],
    delay: stagger(60, { start: delay }),
    duration: 280,
    ease: 'outQuad',
  });
}

export function countUp(startValue = 0, endValue = 100, onUpdate, duration = 900) {
  const obj = { value: startValue };
  animate(obj, {
    value: endValue,
    duration,
    ease: 'outCubic',
    onUpdate() {
      onUpdate(Math.round(obj.value));
    },
  });
}

export function animateBar(fillEl, percent, duration = 700) {
  if (!fillEl) return;
  animate(fillEl, {
    width: [`0%`, `${percent}%`],
    duration,
    ease: 'outQuart',
  });
}

export function shakeEl(el) {
  if (!el) return;
  animate(el, {
    translateX: [0, -8, 8, -6, 6, -3, 3, 0],
    duration: 420,
    ease: 'inOutSine',
  });
}

export function popIn(el) {
  if (!el) return;
  animate(el, {
    scale: [0.7, 1.12, 1],
    opacity: [0, 1],
    duration: 360,
    ease: 'outBack',
  });
}

export function openSidebar(el) {
  if (!el) return;
  animate(el, { translateX: [-240, 0], duration: 280, ease: 'outQuart' });
}

export function closeSidebar(el) {
  if (!el) return;
  animate(el, { translateX: [0, -240], duration: 240, ease: 'inQuart' });
}

export function modalIn(el) {
  if (!el) return;
  animate(el, {
    opacity: [0, 1],
    scale: [0.94, 1],
    duration: 220,
    ease: 'outBack',
  });
}

export function heroEnter(containerEl) {
  if (!containerEl) return;
  const children = containerEl.querySelectorAll('[data-hero-item]');
  if (!children.length) return;
  animate(children, {
    opacity: [0, 1],
    translateY: [24, 0],
    delay: stagger(90),
    duration: 480,
    ease: 'outExpo',
  });
}

export function scoreRingPulse(el) {
  if (!el) return;
  animate(el, {
    scale: [0.85, 1],
    opacity: [0, 1],
    duration: 500,
    ease: 'outBack',
  });
}

export function microClick(el) {
  if (!el) return;
  animate(el, { scale: [1, 0.96, 1], duration: 200, ease: 'outQuad' });
}
