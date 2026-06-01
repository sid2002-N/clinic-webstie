export const SUPERELLIPSE_POINTS = 192;

export function buildSuperellipsePath(exponent: number, points = SUPERELLIPSE_POINTS) {
  const coords = Array.from({ length: points }, (_, index) => {
    const theta = (index / points) * Math.PI * 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const x = 0.5 + 0.5 * Math.sign(cos) * Math.abs(cos) ** (2 / exponent);
    const y = 0.5 + 0.5 * Math.sign(sin) * Math.abs(sin) ** (2 / exponent);
    return `${x.toFixed(5)} ${y.toFixed(5)}`;
  });

  return `M ${coords.join(" L ")} Z`;
}
