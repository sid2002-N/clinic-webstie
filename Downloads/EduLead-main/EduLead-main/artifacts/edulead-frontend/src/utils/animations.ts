import { animate, stagger as animeStagger } from 'animejs';

export function pageEnter(target: string | Element | null) {
  if (!target) return;
  animate(target, {
    opacity: [0, 1],
    translateY: [10, 0],
    duration: 320,
    ease: 'out(2)',
  });
}

export function staggerIn(
  targets: string | NodeListOf<Element> | Element[],
  delay = 0,
) {
  animate(targets as string, {
    opacity: [0, 1],
    translateY: [16, 0],
    delay: animeStagger(60, { start: delay }),
    duration: 280,
    ease: 'out(2)',
  });
}

export function countUp(
  startValue = 0,
  endValue = 100,
  onUpdate: (v: number) => void,
  duration = 900,
) {
  const obj = { value: startValue };
  animate(obj, {
    value: endValue,
    duration,
    ease: 'out(3)',
    onUpdate() {
      onUpdate(Math.round((obj as any).value));
    },
  });
}

export function animateBar(fillEl: HTMLElement | null, percent: number, duration = 700) {
  if (!fillEl) return;
  animate(fillEl, {
    width: [`0%`, `${percent}%`],
    duration,
    ease: 'out(4)',
  });
}

export function shakeEl(el: HTMLElement | null) {
  if (!el) return;
  animate(el, {
    translateX: [0, -8, 8, -6, 6, -3, 3, 0],
    duration: 420,
    ease: 'inOut(2)',
  });
}

export function popIn(el: HTMLElement | null) {
  if (!el) return;
  animate(el, {
    scale: [0.7, 1.12, 1],
    opacity: [0, 1],
    duration: 360,
    ease: 'out(2)',
  });
}

export function openSidebar(el: HTMLElement | null) {
  if (!el) return;
  animate(el, { translateX: [-240, 0], duration: 280, ease: 'out(4)' });
}

export function closeSidebar(el: HTMLElement | null) {
  if (!el) return;
  animate(el, { translateX: [0, -240], duration: 240, ease: 'in(4)' });
}

export function modalIn(el: HTMLElement | null) {
  if (!el) return;
  animate(el, {
    opacity: [0, 1],
    scale: [0.94, 1],
    duration: 220,
    ease: 'out(2)',
  });
}

export function heroEnter(containerEl: HTMLElement | null) {
  if (!containerEl) return;
  const children = containerEl.querySelectorAll('[data-hero-item]');
  if (!children.length) return;
  animate(children as unknown as string, {
    opacity: [0, 1],
    translateY: [24, 0],
    delay: animeStagger(90),
    duration: 480,
    ease: 'out(3)',
  });
}

export function scoreRingPulse(el: HTMLElement | null) {
  if (!el) return;
  animate(el, {
    scale: [0.85, 1],
    opacity: [0, 1],
    duration: 500,
    ease: 'out(2)',
  });
}
