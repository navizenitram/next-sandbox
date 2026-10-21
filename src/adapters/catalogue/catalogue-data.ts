import type {
  Bike,
  BikeComponent,
  Catalogue,
  ComponentVisual,
  LocalizedText,
  PrebuiltComponent,
  TypeComponent,
} from "@/domain/catalogue/catalogue";
import { money } from "@/domain/shared/money";

// Placeholder catalogue for the MVP: names, prices and stock are illustrative.

type TypeId = "road" | "mtb" | "gravel" | "city";

const IVA_GENERAL_BPS = 2100;

const components: BikeComponent[] = [];
const typeComponents: TypeComponent[] = [];

function component(
  id: string,
  categoryId: string,
  name: LocalizedText,
  netCents: number,
  visual: ComponentVisual,
  types: TypeId[],
  stock = 10,
) {
  components.push({
    id,
    categoryId,
    name,
    netPrice: money(netCents, "EUR"),
    taxRateBps: IVA_GENERAL_BPS,
    stock,
    visual,
  });
  for (const bikeTypeId of types) typeComponents.push({ bikeTypeId, componentId: id });
}

// Frames. variant = geometry: road | mtb | gravel | city
component("frame-road-aero", "frame", { es: "Cuadro aero de carbono", en: "Aero carbon frame" }, 189000, { colour: "#b91c1c", variant: "road" }, ["road"], 0);
component("frame-road-endurance", "frame", { es: "Cuadro endurance de carbono", en: "Endurance carbon frame" }, 149000, { colour: "#1e3a8a", variant: "road" }, ["road"]);
component("frame-road-alloy", "frame", { es: "Cuadro de aluminio", en: "Alloy frame" }, 69000, { colour: "#64748b", variant: "road" }, ["road"]);
component("frame-mtb-trail", "frame", { es: "Cuadro trail de carbono", en: "Carbon trail frame" }, 179000, { colour: "#15803d", variant: "mtb" }, ["mtb"]);
component("frame-mtb-enduro", "frame", { es: "Cuadro enduro de aluminio", en: "Alloy enduro frame" }, 99000, { colour: "#ea580c", variant: "mtb" }, ["mtb"]);
component("frame-mtb-xc", "frame", { es: "Cuadro XC de carbono", en: "Carbon XC frame" }, 199000, { colour: "#171717", variant: "mtb" }, ["mtb"]);
component("frame-gravel-steel", "frame", { es: "Cuadro de acero aventura", en: "Steel adventure frame" }, 89000, { colour: "#78350f", variant: "gravel" }, ["gravel"]);
component("frame-gravel-carbon", "frame", { es: "Cuadro gravel de carbono", en: "Carbon gravel frame" }, 159000, { colour: "#0f766e", variant: "gravel" }, ["gravel"]);
component("frame-gravel-alloy", "frame", { es: "Cuadro all-road de aluminio", en: "Alloy all-road frame" }, 74000, { colour: "#6b21a8", variant: "gravel" }, ["gravel"]);
component("frame-city-classic", "frame", { es: "Cuadro clásico de acero", en: "Classic steel frame" }, 59000, { colour: "#1d4ed8", variant: "city" }, ["city"]);
component("frame-city-step", "frame", { es: "Cuadro de paso bajo", en: "Step-through frame" }, 54000, { colour: "#db2777", variant: "city" }, ["city"]);
component("frame-city-alloy", "frame", { es: "Cuadro urbano de aluminio", en: "Urban alloy frame" }, 49000, { colour: "#4b5563", variant: "city" }, ["city"]);

// Forks. variant: rigid | suspension
component("fork-carbon", "fork", { es: "Horquilla de carbono", en: "Carbon fork" }, 29000, { colour: "#171717", variant: "rigid" }, ["road", "gravel"]);
component("fork-carbon-aero", "fork", { es: "Horquilla aero de carbono", en: "Aero carbon fork" }, 39000, { colour: "#171717", variant: "rigid" }, ["road"]);
component("fork-alloy", "fork", { es: "Horquilla de aluminio", en: "Alloy fork" }, 12000, { colour: "#9ca3af", variant: "rigid" }, ["road", "gravel", "city"]);
component("fork-mtb-120", "fork", { es: "Suspensión de aire 120 mm", en: "120 mm air suspension fork" }, 49000, { colour: "#1f2937", variant: "suspension" }, ["mtb"]);
component("fork-mtb-150", "fork", { es: "Suspensión de aire 150 mm", en: "150 mm air suspension fork" }, 69000, { colour: "#ca8a04", variant: "suspension" }, ["mtb"]);
component("fork-mtb-coil", "fork", { es: "Suspensión de muelle 140 mm", en: "140 mm coil suspension fork" }, 39000, { colour: "#dc2626", variant: "suspension" }, ["mtb"]);
component("fork-gravel-suspension", "fork", { es: "Suspensión gravel 40 mm", en: "40 mm gravel suspension fork" }, 45000, { colour: "#1f2937", variant: "suspension" }, ["gravel"]);
component("fork-city-steel", "fork", { es: "Horquilla de acero", en: "Steel fork" }, 8000, { colour: "#1f2937", variant: "rigid" }, ["city"]);
component("fork-city-comfort", "fork", { es: "Suspensión confort 63 mm", en: "63 mm comfort suspension fork" }, 15000, { colour: "#374151", variant: "suspension" }, ["city"]);

// Wheels. variant: aero | standard
component("wheels-carbon-50", "wheels", { es: "Ruedas de carbono 50 mm", en: "50 mm carbon wheels" }, 129000, { colour: "#171717", variant: "aero" }, ["road"]);
component("wheels-carbon-35", "wheels", { es: "Ruedas de carbono 35 mm", en: "35 mm carbon wheels" }, 99000, { colour: "#171717", variant: "aero" }, ["road", "gravel"]);
component("wheels-alloy", "wheels", { es: "Ruedas de aluminio", en: "Alloy wheels" }, 29000, { colour: "#9ca3af", variant: "standard" }, ["road", "gravel", "city"]);
component("wheels-mtb-carbon", "wheels", { es: "Ruedas 29\" de carbono", en: "29\" carbon wheels" }, 119000, { colour: "#171717", variant: "standard" }, ["mtb"], 0);
component("wheels-mtb-alloy", "wheels", { es: "Ruedas 29\" de aluminio", en: "29\" alloy wheels" }, 39000, { colour: "#4b5563", variant: "standard" }, ["mtb"]);
component("wheels-mtb-275", "wheels", { es: "Ruedas 27,5\" de aluminio", en: "27.5\" alloy wheels" }, 34000, { colour: "#4b5563", variant: "standard" }, ["mtb"]);
component("wheels-gravel-alloy", "wheels", { es: "Ruedas gravel de aluminio", en: "Alloy gravel wheels" }, 45000, { colour: "#4b5563", variant: "standard" }, ["gravel"]);
component("wheels-city-reinforced", "wheels", { es: "Ruedas reforzadas", en: "Reinforced wheels" }, 19000, { colour: "#d1d5db", variant: "standard" }, ["city"]);
component("wheels-city-dynamo", "wheels", { es: "Ruedas con buje dinamo", en: "Dynamo hub wheels" }, 26000, { colour: "#d1d5db", variant: "standard" }, ["city"]);

// Tyres. variant: slick | allroad | knobby
component("tyres-road-25", "tyres", { es: "Cubiertas 25 mm", en: "25 mm road tyres" }, 9000, { colour: "#171717", variant: "slick" }, ["road"]);
component("tyres-road-28", "tyres", { es: "Cubiertas 28 mm", en: "28 mm road tyres" }, 10000, { colour: "#171717", variant: "slick" }, ["road", "city"]);
component("tyres-tanwall-28", "tyres", { es: "Cubiertas 28 mm flanco marrón", en: "28 mm tan-wall tyres" }, 11000, { colour: "#a16207", variant: "slick" }, ["road", "gravel"]);
component("tyres-gravel-40", "tyres", { es: "Cubiertas gravel 40 mm", en: "40 mm gravel tyres" }, 12000, { colour: "#171717", variant: "allroad" }, ["gravel"]);
component("tyres-gravel-45", "tyres", { es: "Cubiertas gravel 45 mm flanco marrón", en: "45 mm tan-wall gravel tyres" }, 13000, { colour: "#a16207", variant: "allroad" }, ["gravel"]);
component("tyres-mtb-trail", "tyres", { es: "Cubiertas trail 2,4\"", en: "2.4\" trail tyres" }, 14000, { colour: "#171717", variant: "knobby" }, ["mtb"]);
component("tyres-mtb-xc", "tyres", { es: "Cubiertas XC 2,2\"", en: "2.2\" XC tyres" }, 12000, { colour: "#171717", variant: "knobby" }, ["mtb"]);
component("tyres-mtb-tanwall", "tyres", { es: "Cubiertas 2,4\" flanco marrón", en: "2.4\" tan-wall tyres" }, 15000, { colour: "#a16207", variant: "knobby" }, ["mtb"]);
component("tyres-city-puncture", "tyres", { es: "Cubiertas antipinchazos", en: "Puncture-resistant tyres" }, 8000, { colour: "#171717", variant: "allroad" }, ["city"]);
component("tyres-city-reflective", "tyres", { es: "Cubiertas con banda reflectante", en: "Reflective tyres" }, 9000, { colour: "#374151", variant: "allroad" }, ["city"]);

// Drivetrains. variant: 1x | 2x
component("drivetrain-road-2x12-electronic", "drivetrain", { es: "Grupo electrónico 2x12", en: "2x12 electronic groupset" }, 159000, { colour: "#171717", variant: "2x" }, ["road"]);
component("drivetrain-2x12", "drivetrain", { es: "Grupo mecánico 2x12", en: "2x12 mechanical groupset" }, 79000, { colour: "#9ca3af", variant: "2x" }, ["road", "gravel"]);
component("drivetrain-road-2x11", "drivetrain", { es: "Grupo 2x11", en: "2x11 groupset" }, 49000, { colour: "#9ca3af", variant: "2x" }, ["road"]);
component("drivetrain-1x12", "drivetrain", { es: "Transmisión 1x12", en: "1x12 drivetrain" }, 69000, { colour: "#171717", variant: "1x" }, ["mtb", "gravel"]);
component("drivetrain-1x12-electronic", "drivetrain", { es: "Transmisión electrónica 1x12", en: "1x12 electronic drivetrain" }, 129000, { colour: "#171717", variant: "1x" }, ["mtb", "gravel"]);
component("drivetrain-mtb-1x11", "drivetrain", { es: "Transmisión 1x11", en: "1x11 drivetrain" }, 39000, { colour: "#4b5563", variant: "1x" }, ["mtb"]);
component("drivetrain-city-hub8", "drivetrain", { es: "Buje interno de 8 velocidades", en: "8-speed internal hub" }, 29000, { colour: "#9ca3af", variant: "1x" }, ["city"]);
component("drivetrain-city-1x9", "drivetrain", { es: "Transmisión 1x9", en: "1x9 drivetrain" }, 19000, { colour: "#9ca3af", variant: "1x" }, ["city"]);
component("drivetrain-city-single", "drivetrain", { es: "Una velocidad", en: "Single speed" }, 9000, { colour: "#9ca3af", variant: "1x" }, ["city"]);

// Brakes. variant: rim | disc
component("brakes-rim", "brakes", { es: "Frenos de llanta", en: "Rim brakes" }, 9000, { colour: "#9ca3af", variant: "rim" }, ["road", "city"]);
component("brakes-hydraulic-disc", "brakes", { es: "Frenos de disco hidráulicos", en: "Hydraulic disc brakes" }, 29000, { colour: "#171717", variant: "disc" }, ["road", "gravel", "city", "mtb"]);
component("brakes-hydraulic-disc-pro", "brakes", { es: "Frenos de disco hidráulicos pro", en: "Pro hydraulic disc brakes" }, 45000, { colour: "#171717", variant: "disc" }, ["road", "gravel"]);
component("brakes-mechanical-disc", "brakes", { es: "Frenos de disco mecánicos", en: "Mechanical disc brakes" }, 14000, { colour: "#4b5563", variant: "disc" }, ["gravel", "city"]);
component("brakes-mtb-4piston", "brakes", { es: "Frenos de disco de 4 pistones", en: "4-piston disc brakes" }, 39000, { colour: "#171717", variant: "disc" }, ["mtb"]);
component("brakes-mtb-2piston", "brakes", { es: "Frenos de disco de 2 pistones", en: "2-piston disc brakes" }, 22000, { colour: "#4b5563", variant: "disc" }, ["mtb"]);

// Handlebars. variant: drop | flat | swept
component("handlebar-road-carbon", "handlebar", { es: "Manillar de carbono", en: "Carbon drop handlebar" }, 25000, { colour: "#171717", variant: "drop" }, ["road"]);
component("handlebar-road-alloy", "handlebar", { es: "Manillar de aluminio", en: "Alloy drop handlebar" }, 6000, { colour: "#9ca3af", variant: "drop" }, ["road"]);
component("handlebar-road-aero", "handlebar", { es: "Manillar aero integrado", en: "Integrated aero cockpit" }, 45000, { colour: "#171717", variant: "drop" }, ["road"]);
component("handlebar-gravel-flared", "handlebar", { es: "Manillar gravel abierto", en: "Flared gravel handlebar" }, 9000, { colour: "#171717", variant: "drop" }, ["gravel"]);
component("handlebar-gravel-carbon", "handlebar", { es: "Manillar gravel de carbono", en: "Carbon flared handlebar" }, 28000, { colour: "#171717", variant: "drop" }, ["gravel"]);
component("handlebar-flat", "handlebar", { es: "Manillar plano", en: "Flat handlebar" }, 5000, { colour: "#171717", variant: "flat" }, ["gravel", "mtb", "city"]);
component("handlebar-mtb-riser", "handlebar", { es: "Manillar riser 780 mm", en: "780 mm riser handlebar" }, 7000, { colour: "#171717", variant: "flat" }, ["mtb"]);
component("handlebar-mtb-carbon", "handlebar", { es: "Manillar riser de carbono", en: "Carbon riser handlebar" }, 19000, { colour: "#171717", variant: "flat" }, ["mtb"]);
component("handlebar-city-swept", "handlebar", { es: "Manillar curvado", en: "Swept-back handlebar" }, 6000, { colour: "#9ca3af", variant: "swept" }, ["city"]);
component("handlebar-city-cruiser", "handlebar", { es: "Manillar cruiser", en: "Cruiser handlebar" }, 7000, { colour: "#9ca3af", variant: "swept" }, ["city"]);

// Saddles. variant: race | comfort
component("saddle-race", "saddle", { es: "Sillín de competición", en: "Race saddle" }, 9000, { colour: "#171717", variant: "race" }, ["road", "gravel", "mtb"]);
component("saddle-race-carbon", "saddle", { es: "Sillín de carbono", en: "Carbon saddle" }, 19000, { colour: "#171717", variant: "race" }, ["road", "gravel"]);
component("saddle-endurance", "saddle", { es: "Sillín endurance", en: "Endurance saddle" }, 7000, { colour: "#374151", variant: "race" }, ["road", "gravel", "mtb", "city"]);
component("saddle-mtb-trail", "saddle", { es: "Sillín trail", en: "Trail saddle" }, 6000, { colour: "#171717", variant: "race" }, ["mtb"]);
component("saddle-city-comfort", "saddle", { es: "Sillín confort", en: "Comfort saddle" }, 4000, { colour: "#171717", variant: "comfort" }, ["city"]);
component("saddle-city-leather", "saddle", { es: "Sillín de cuero", en: "Leather saddle" }, 12000, { colour: "#92400e", variant: "comfort" }, ["city"], 0);

// Pedals (optional). variant: flat | clipless
component("pedals-clipless-road", "pedals", { es: "Pedales automáticos de carretera", en: "Road clipless pedals" }, 12000, { colour: "#171717", variant: "clipless" }, ["road", "gravel"]);
component("pedals-clipless-carbon", "pedals", { es: "Pedales automáticos de carbono", en: "Carbon clipless pedals" }, 22000, { colour: "#171717", variant: "clipless" }, ["road"]);
component("pedals-clipless-mtb", "pedals", { es: "Pedales automáticos MTB", en: "MTB clipless pedals" }, 9000, { colour: "#4b5563", variant: "clipless" }, ["mtb", "gravel"]);
component("pedals-flat", "pedals", { es: "Pedales de plataforma", en: "Flat pedals" }, 4000, { colour: "#171717", variant: "flat" }, ["road", "mtb", "gravel", "city"]);
component("pedals-mtb-wide", "pedals", { es: "Pedales de plataforma anchos", en: "Wide platform pedals" }, 7000, { colour: "#ea580c", variant: "flat" }, ["mtb"]);
component("pedals-city-reflective", "pedals", { es: "Pedales con reflectantes", en: "Reflective pedals" }, 3000, { colour: "#9ca3af", variant: "flat" }, ["city"]);

// Mudguards (optional). variant: full | clip-on
component("mudguards-full", "mudguards", { es: "Guardabarros completos", en: "Full mudguards" }, 5000, { colour: "#171717", variant: "full" }, ["road", "gravel", "city"]);
component("mudguards-clip-on", "mudguards", { es: "Guardabarros desmontables", en: "Clip-on mudguards" }, 3000, { colour: "#4b5563", variant: "clip-on" }, ["road", "gravel", "mtb"]);
component("mudguards-city-chrome", "mudguards", { es: "Guardabarros cromados", en: "Chrome mudguards" }, 7000, { colour: "#d1d5db", variant: "full" }, ["city"]);
component("mudguards-mtb-short", "mudguards", { es: "Guardabarros cortos MTB", en: "Short MTB mudguards" }, 2500, { colour: "#171717", variant: "clip-on" }, ["mtb"]);

const bikes: Bike[] = [];
const prebuiltComponents: PrebuiltComponent[] = [];

function prebuilt(id: string, bikeTypeId: TypeId, name: LocalizedText, componentIds: string[]) {
  bikes.push({ id, bikeTypeId, name });
  for (const componentId of componentIds) prebuiltComponents.push({ bikeId: id, componentId });
}

prebuilt("prebuilt-road", "road", { es: "Carretera Endurance", en: "Endurance Road" }, [
  "frame-road-endurance", "fork-carbon", "wheels-carbon-35", "tyres-road-28", "drivetrain-2x12",
  "brakes-hydraulic-disc", "handlebar-road-alloy", "saddle-race", "pedals-clipless-road",
]);
prebuilt("prebuilt-mtb", "mtb", { es: "Montaña Trail", en: "Trail Mountain" }, [
  "frame-mtb-trail", "fork-mtb-150", "wheels-mtb-alloy", "tyres-mtb-trail", "drivetrain-1x12",
  "brakes-mtb-4piston", "handlebar-mtb-riser", "saddle-mtb-trail", "pedals-flat",
]);
prebuilt("prebuilt-gravel", "gravel", { es: "Gravel Aventura", en: "Adventure Gravel" }, [
  "frame-gravel-carbon", "fork-carbon", "wheels-gravel-alloy", "tyres-gravel-40", "drivetrain-1x12",
  "brakes-hydraulic-disc", "handlebar-gravel-flared", "saddle-endurance", "pedals-clipless-mtb",
]);
prebuilt("prebuilt-city", "city", { es: "Urbana Clásica", en: "Classic City" }, [
  "frame-city-classic", "fork-city-steel", "wheels-city-dynamo", "tyres-city-puncture", "drivetrain-city-hub8",
  "brakes-rim", "handlebar-city-swept", "saddle-city-comfort", "pedals-city-reflective", "mudguards-city-chrome",
]);

export const catalogueData: Catalogue = {
  bikeTypes: [
    {
      id: "road",
      name: { es: "Carretera", en: "Road" },
      description: { es: "Ligera y rápida para el asfalto.", en: "Light and fast on tarmac." },
    },
    {
      id: "mtb",
      name: { es: "Montaña (MTB)", en: "Mountain (MTB)" },
      description: { es: "Suspensión y agarre para senderos técnicos.", en: "Suspension and grip for technical trails." },
    },
    {
      id: "gravel",
      name: { es: "Gravel", en: "Gravel" },
      description: { es: "Del asfalto a la pista sin cambiar de bici.", en: "From tarmac to dirt roads on one bike." },
    },
    {
      id: "city",
      name: { es: "Ciudad", en: "City" },
      description: { es: "Cómoda y práctica para el día a día.", en: "Comfortable and practical for every day." },
    },
  ],
  categories: [
    { id: "frame", name: { es: "Cuadro", en: "Frame" }, mandatory: true },
    { id: "fork", name: { es: "Horquilla", en: "Fork" }, mandatory: true },
    { id: "wheels", name: { es: "Ruedas", en: "Wheels" }, mandatory: true },
    { id: "tyres", name: { es: "Cubiertas", en: "Tyres" }, mandatory: true },
    { id: "drivetrain", name: { es: "Transmisión", en: "Drivetrain" }, mandatory: true },
    { id: "brakes", name: { es: "Frenos", en: "Brakes" }, mandatory: true },
    { id: "handlebar", name: { es: "Manillar", en: "Handlebar" }, mandatory: true },
    { id: "saddle", name: { es: "Sillín", en: "Saddle" }, mandatory: true },
    { id: "pedals", name: { es: "Pedales", en: "Pedals" }, mandatory: false },
    { id: "mudguards", name: { es: "Guardabarros", en: "Mudguards" }, mandatory: false },
  ],
  components,
  typeComponents,
  bikes,
  prebuiltComponents,
};
