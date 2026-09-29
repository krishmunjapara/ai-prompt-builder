import type { FieldKey, PromptState } from "./prompt";

export interface FieldDef {
  key: FieldKey;
  label: string;
  placeholder: string;
  options: string[];
}

/** Subject is edited in the big composer; these are the refine rows. */
export const REFINE_FIELDS: FieldDef[] = [
  {
    key: "style",
    label: "Style",
    placeholder: "35mm film photograph",
    options: [
      "35mm film photograph",
      "editorial photograph",
      "studio product photograph",
      "cinematic film still",
      "gouache illustration",
      "watercolor illustration",
      "anime key visual",
      "isometric 3D render",
      "claymation",
      "oil painting",
      "ink line drawing",
      "pixel art",
    ],
  },
  {
    key: "environment",
    label: "Setting",
    placeholder: "a rain-soaked Tokyo alley at night",
    options: [
      "a foggy pine forest at dawn",
      "a neon-lit alley at night",
      "a seamless studio backdrop",
      "a sunlit kitchen",
      "a snowy mountain ridge",
      "a desert under a starry sky",
      "an overgrown greenhouse",
      "a quiet library",
    ],
  },
  {
    key: "lighting",
    label: "Light",
    placeholder: "golden hour side light",
    options: [
      "golden hour light",
      "soft window light",
      "overcast daylight",
      "hard rim light",
      "neon glow",
      "candlelight",
      "low-key chiaroscuro",
      "volumetric light shafts",
      "bright high-key light",
    ],
  },
  {
    key: "camera",
    label: "Angle",
    placeholder: "low angle",
    options: [
      "eye level",
      "low angle",
      "high angle",
      "top-down",
      "over-the-shoulder",
      "dutch angle",
      "aerial view",
    ],
  },
  {
    key: "lens",
    label: "Lens",
    placeholder: "35mm lens",
    options: [
      "24mm wide lens",
      "35mm lens",
      "50mm lens",
      "85mm portrait lens",
      "100mm macro lens",
      "200mm telephoto lens",
      "tilt-shift lens",
    ],
  },
  {
    key: "composition",
    label: "Framing",
    placeholder: "medium shot, rule of thirds",
    options: [
      "extreme close-up",
      "close-up",
      "medium shot",
      "wide shot",
      "rule of thirds",
      "centered symmetry",
      "shallow depth of field",
      "negative space",
    ],
  },
  {
    key: "mood",
    label: "Mood",
    placeholder: "quiet and nostalgic",
    options: ["quiet", "nostalgic", "tense", "dreamlike", "playful", "melancholic", "triumphant", "eerie"],
  },
  {
    key: "color",
    label: "Colour",
    placeholder: "muted teal and amber",
    options: [
      "muted teal and amber",
      "warm earth tones",
      "pastel palette",
      "monochrome",
      "high-contrast black and white",
      "Kodak Portra tones",
      "deep jewel tones",
      "neon magenta and cyan",
    ],
  },
];

export const RATIOS = [
  { value: "1:1", label: "Square" },
  { value: "4:5", label: "Instagram portrait" },
  { value: "9:16", label: "Reels · Shorts · TikTok" },
  { value: "16:9", label: "YouTube · widescreen" },
  { value: "3:2", label: "Photo" },
  { value: "2:3", label: "Poster" },
  { value: "21:9", label: "Cinematic" },
] as const;

export const NEGATIVE_PRESETS = [
  "text, watermark, logo",
  "extra fingers, distorted hands",
  "blur, noise, jpeg artifacts",
];

export interface Example {
  id: string;
  title: string;
  values: Partial<PromptState>;
}

/** Complete, hand-written shots. Instant — no AI call. */
export const EXAMPLES: Example[] = [
  {
    id: "ramen",
    title: "Night ramen stall",
    values: {
      subject: "an elderly chef ladling broth at a tiny ramen stall",
      style: "35mm film photograph",
      environment: "a rain-soaked Tokyo side street at night",
      lighting: "warm lantern light against cool neon",
      camera: "eye level",
      lens: "35mm lens",
      composition: "medium shot, steam in the foreground",
      mood: "quiet",
      color: "Kodak Portra tones",
      ratio: "3:2",
      negative: "text, watermark, logo",
    },
  },
  {
    id: "perfume",
    title: "Perfume on stone",
    values: {
      subject: "a faceted glass perfume bottle",
      style: "studio product photograph",
      environment: "a slab of honed travertine with a single dried flower",
      lighting: "hard sunlight casting long shadows",
      camera: "low angle",
      lens: "100mm macro lens",
      composition: "centered symmetry, negative space",
      mood: "calm and luxurious",
      color: "warm earth tones",
      ratio: "4:5",
      negative: "text, watermark, logo",
    },
  },
  {
    id: "fox",
    title: "Fox in first snow",
    values: {
      subject: "a red fox pausing mid-step, breath visible",
      style: "wildlife photograph",
      environment: "a birch forest in the first snow",
      lighting: "soft overcast daylight",
      camera: "eye level",
      lens: "200mm telephoto lens",
      composition: "rule of thirds, shallow depth of field",
      mood: "still",
      color: "muted whites with rust orange",
      ratio: "16:9",
      negative: "blur, noise, jpeg artifacts",
    },
  },
  {
    id: "greenhouse",
    title: "Greenhouse reader",
    values: {
      subject: "a girl reading on a wicker chair surrounded by ferns",
      style: "gouache illustration",
      environment: "an overgrown Victorian greenhouse",
      lighting: "dappled afternoon light",
      camera: "high angle",
      composition: "wide shot",
      mood: "dreamlike",
      color: "sage greens and pale gold",
      ratio: "2:3",
    },
  },
  {
    id: "astronaut",
    title: "Astronaut on a dune",
    values: {
      subject: "a lone astronaut planting a small flag",
      style: "cinematic film still",
      environment: "a red desert dune under two moons",
      lighting: "low sun with long shadows",
      camera: "low angle",
      lens: "24mm wide lens",
      composition: "extreme wide shot, tiny figure",
      mood: "triumphant",
      color: "rust red and deep indigo",
      ratio: "21:9",
      negative: "text, watermark, logo",
    },
  },
  {
    id: "claymation",
    title: "Clay bakery",
    values: {
      subject: "a round baker pulling croissants from an oven",
      style: "claymation",
      environment: "a tiny corner bakery at dawn",
      lighting: "warm oven glow",
      camera: "eye level",
      composition: "medium shot",
      mood: "playful",
      color: "butter yellow and terracotta",
      ratio: "1:1",
    },
  },
];

/** "Surprise me" ideas — short, specific, varied. */
export const IDEAS = [
  "a lighthouse keeper's cat watching a storm",
  "a vending machine glowing alone in a bamboo forest",
  "an old tailor measuring a robot for a suit",
  "a koi pond seen from above at dusk",
  "a cyclist crossing a flooded street in monsoon rain",
  "a jazz trio on a rooftop in 1950s Harlem",
  "a paper boat sailing through a library aisle",
  "a beekeeper in a lavender field at sunrise",
  "a glass greenhouse on the moon",
  "a street food cart in Mumbai at night",
  "a snow leopard on a Himalayan ledge",
  "a retro diner on Mars",
  "a potter's hands shaping wet clay",
  "a treehouse city in the fog",
  "a ballerina tying her shoes backstage",
  "a tiny dragon asleep in a teacup",
];
