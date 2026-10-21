import type { ReactNode } from "react";
import type { Layer } from "./bike-visual";
import {
  atY,
  lerp,
  offset,
  pedalPoint,
  pt,
  saddlePoint,
  stemEnd,
  type Geometry,
  type Point,
} from "./geometry";

type LayerProps = { layer: Layer; g: Geometry };

/**
 * One SVG renderer per component category. A new category only needs a new entry here;
 * categories without a renderer are not drawn.
 */
export const layerRenderers: Record<string, (props: LayerProps) => ReactNode> = {
  frame: Frame,
  fork: Fork,
  wheels: Wheels,
  tyres: Tyres,
  drivetrain: Drivetrain,
  brakes: Brakes,
  handlebar: Handlebar,
  saddle: Saddle,
  pedals: Pedals,
  mudguards: Mudguards,
};

const hubs = (g: Geometry) => [g.rearHub, g.frontHub];

function Frame({ layer, g }: LayerProps) {
  const topStart = g.stepThrough ? lerp(g.bottomBracket, g.seatTop, 0.45) : g.seatTop;
  const topEnd = g.stepThrough ? lerp(g.headTop, g.headBottom, 0.85) : g.headTop;
  return (
    <g fill="none" stroke={layer.colour} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${pt(g.rearHub)} L${pt(g.bottomBracket)} L${pt(g.seatTop)} Z`} strokeWidth={8} />
      <path d={`M${pt(topStart)} L${pt(topEnd)}`} strokeWidth={10} />
      <path d={`M${pt(g.bottomBracket)} L${pt(g.headBottom)}`} strokeWidth={11} />
      <path d={`M${pt(g.headTop)} L${pt(g.headBottom)}`} strokeWidth={12} />
    </g>
  );
}

function Fork({ layer, g }: LayerProps) {
  if (layer.variant === "suspension") {
    return (
      <g strokeLinecap="round">
        <path d={`M${pt(g.headBottom)} L${pt(lerp(g.headBottom, g.frontHub, 0.5))}`} stroke="#d4d4d8" strokeWidth={7} />
        <path d={`M${pt(lerp(g.headBottom, g.frontHub, 0.42))} L${pt(g.frontHub)}`} stroke={layer.colour} strokeWidth={12} />
        <circle cx={g.headBottom.x} cy={g.headBottom.y} r={7} fill={layer.colour} />
      </g>
    );
  }
  return <path d={`M${pt(g.headBottom)} L${pt(g.frontHub)}`} stroke={layer.colour} strokeWidth={7} strokeLinecap="round" />;
}

function Wheels({ layer, g }: LayerProps) {
  const aero = layer.variant === "aero";
  const rimRadius = g.wheelRadius - (aero ? 17 : 10);
  const spokeEnd = g.wheelRadius - (aero ? 24 : 12);
  return (
    <g>
      {hubs(g).map((hub) => (
        <g key={hub.x}>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * Math.PI) / 6;
            return (
              <path
                key={i}
                d={`M${pt(hub)} L${pt(offset(hub, Math.cos(angle) * spokeEnd, Math.sin(angle) * spokeEnd))}`}
                stroke="#a1a1aa"
                strokeWidth={1}
              />
            );
          })}
          <circle cx={hub.x} cy={hub.y} r={rimRadius} fill="none" stroke={layer.colour} strokeWidth={aero ? 14 : 5} />
          <circle cx={hub.x} cy={hub.y} r={6} fill={layer.colour} />
        </g>
      ))}
    </g>
  );
}

function Tyres({ layer, g }: LayerProps) {
  const width = { slick: 8, allroad: 11, knobby: 12 }[layer.variant] ?? 9;
  const radius = g.wheelRadius - width / 2;
  return (
    <g fill="none">
      {hubs(g).map((hub) => (
        <g key={hub.x}>
          <circle cx={hub.x} cy={hub.y} r={radius} stroke={layer.colour} strokeWidth={width} />
          <circle cx={hub.x} cy={hub.y} r={g.wheelRadius - 1} stroke="#171717" strokeWidth={3} />
          {layer.variant === "knobby" && (
            <circle cx={hub.x} cy={hub.y} r={g.wheelRadius + 1} stroke="#171717" strokeWidth={4} strokeDasharray="3 4" />
          )}
        </g>
      ))}
    </g>
  );
}

function Drivetrain({ layer, g }: LayerProps) {
  const bb = g.bottomBracket;
  const ring = layer.variant === "2x" ? 28 : 26;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={`M${pt(offset(bb, 0, -ring))} L${pt(offset(g.rearHub, 0, -12))}`} stroke="#52525b" strokeWidth={2} />
      <path d={`M${pt(offset(bb, 0, ring))} L${pt(offset(g.rearHub, 0, 12))}`} stroke="#52525b" strokeWidth={2} />
      <circle cx={g.rearHub.x} cy={g.rearHub.y} r={12} stroke={layer.colour} strokeWidth={4} />
      <circle cx={bb.x} cy={bb.y} r={ring} stroke={layer.colour} strokeWidth={5} />
      {layer.variant === "2x" && <circle cx={bb.x} cy={bb.y} r={20} stroke={layer.colour} strokeWidth={3} />}
      <path d={`M${pt(bb)} L${pt(pedalPoint(g))}`} stroke={layer.colour} strokeWidth={7} />
      <circle cx={bb.x} cy={bb.y} r={7} fill={layer.colour} />
    </g>
  );
}

function Brakes({ layer, g }: LayerProps) {
  if (layer.variant === "disc") {
    return (
      <g>
        {hubs(g).map((hub) => (
          <g key={hub.x}>
            <circle cx={hub.x} cy={hub.y} r={20} fill="none" stroke={layer.colour} strokeWidth={3} />
            <rect x={hub.x - 18} y={hub.y - 28} width={16} height={10} rx={2} fill={layer.colour} />
          </g>
        ))}
      </g>
    );
  }
  const rimTop = (hub: Point) => hub.y - g.wheelRadius + 8;
  const front = atY(g.headBottom, g.frontHub, rimTop(g.frontHub));
  const rear = atY(g.rearHub, g.seatTop, rimTop(g.rearHub));
  return (
    <g fill={layer.colour}>
      <rect x={front.x - 8} y={front.y - 4} width={16} height={8} rx={2} />
      <rect x={rear.x - 8} y={rear.y - 4} width={16} height={8} rx={2} />
    </g>
  );
}

function Handlebar({ layer, g }: LayerProps) {
  const end = stemEnd(g);
  const bar = {
    drop: `M${pt(end)} q 28 0 30 22 q 2 22 -16 24`,
    flat: `M${pt(end)} l 6 -8 l -14 -4`,
    swept: `M${pt(end)} q 0 -22 -40 -20`,
  }[layer.variant] ?? `M${pt(end)} l 12 0`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${pt(g.headTop)} L${pt(end)}`} stroke="#3f3f46" strokeWidth={7} />
      <path d={bar} stroke={layer.colour} strokeWidth={6} />
    </g>
  );
}

function Saddle({ layer, g }: LayerProps) {
  const top = saddlePoint(g);
  const shape =
    layer.variant === "comfort"
      ? `M${pt(offset(top, -22, -2))} q 4 -12 26 -10 q 14 2 14 10 q -2 8 -16 8 l -18 0 q -8 0 -6 -8 z`
      : `M${pt(offset(top, -28, -2))} q 10 -8 40 -6 l 10 4 q -2 4 -12 4 l -30 2 q -10 0 -8 -4 z`;
  return (
    <g>
      <path d={`M${pt(g.seatTop)} L${pt(top)}`} stroke="#71717a" strokeWidth={6} strokeLinecap="round" />
      <path d={shape} fill={layer.colour} />
    </g>
  );
}

function Pedals({ layer, g }: LayerProps) {
  const pedal = pedalPoint(g);
  const width = layer.variant === "flat" ? 28 : 18;
  return <rect x={pedal.x - width / 2} y={pedal.y - 4} width={width} height={8} rx={3} fill={layer.colour} />;
}

function Mudguards({ layer, g }: LayerProps) {
  const radius = g.wheelRadius + 8;
  const arc = (hub: Point, from: number, to: number) => {
    const at = (degrees: number) =>
      offset(hub, Math.cos((degrees * Math.PI) / 180) * radius, Math.sin((degrees * Math.PI) / 180) * radius);
    return `M${pt(at(from))} A ${radius} ${radius} 0 0 1 ${pt(at(to))}`;
  };
  const full = layer.variant === "full";
  return (
    <g fill="none" stroke={layer.colour} strokeWidth={5} strokeLinecap="round">
      <path d={full ? arc(g.rearHub, 180, 350) : arc(g.rearHub, 215, 300)} />
      <path d={full ? arc(g.frontHub, 190, 345) : arc(g.frontHub, 230, 300)} />
    </g>
  );
}
