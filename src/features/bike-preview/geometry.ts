export type Point = Readonly<{ x: number; y: number }>;

/** Anchor points of a frame shape, in the preview's SVG coordinates. */
export type Geometry = Readonly<{
  rearHub: Point;
  frontHub: Point;
  bottomBracket: Point;
  seatTop: Point;
  headTop: Point;
  headBottom: Point;
  wheelRadius: number;
  /** Low top tube (city step-through). */
  stepThrough: boolean;
}>;

const p = (x: number, y: number): Point => ({ x, y });

const geometries: Record<string, Geometry> = {
  road: {
    rearHub: p(130, 265), frontHub: p(470, 265), bottomBracket: p(268, 270),
    seatTop: p(238, 118), headTop: p(420, 122), headBottom: p(432, 172),
    wheelRadius: 108, stepThrough: false,
  },
  mtb: {
    rearHub: p(122, 262), frontHub: p(478, 262), bottomBracket: p(262, 262),
    seatTop: p(242, 138), headTop: p(418, 128), headBottom: p(436, 186),
    wheelRadius: 112, stepThrough: false,
  },
  gravel: {
    rearHub: p(126, 265), frontHub: p(474, 265), bottomBracket: p(266, 272),
    seatTop: p(240, 122), headTop: p(416, 118), headBottom: p(430, 174),
    wheelRadius: 108, stepThrough: false,
  },
  city: {
    rearHub: p(130, 266), frontHub: p(470, 266), bottomBracket: p(272, 272),
    seatTop: p(236, 124), headTop: p(404, 110), headBottom: p(424, 178),
    wheelRadius: 108, stepThrough: true,
  },
};

export function geometryFor(name: string): Geometry {
  return geometries[name] ?? geometries.road;
}

export const pt = (point: Point) => `${point.x} ${point.y}`;

export const lerp = (a: Point, b: Point, t: number): Point => p(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);

export const offset = (point: Point, dx: number, dy: number): Point => p(point.x + dx, point.y + dy);

/** The point on segment a–b at height y (clamped to the segment). */
export function atY(a: Point, b: Point, y: number): Point {
  const t = Math.min(1, Math.max(0, (y - a.y) / (b.y - a.y)));
  return lerp(a, b, t);
}

/** Top of the seatpost: the seat tube extended past the frame. */
export function saddlePoint(g: Geometry): Point {
  const dx = g.seatTop.x - g.bottomBracket.x;
  const dy = g.seatTop.y - g.bottomBracket.y;
  const length = Math.hypot(dx, dy);
  return offset(g.seatTop, (dx / length) * 34, (dy / length) * 34);
}

export const stemEnd = (g: Geometry) => offset(g.headTop, 20, -12);

export const pedalPoint = (g: Geometry) => offset(g.bottomBracket, 22, 32);
