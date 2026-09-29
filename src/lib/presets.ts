import type { FieldKey } from "./prompt";

export interface FieldDef {
  key: FieldKey;
  label: string;
  placeholder: string;
  /** Quick-pick chips shown under the input. Clicking one fills the field. */
  options: string[];
}

export const FIELDS: FieldDef[] = [
  {
    key: "subject",
    label: "Subject",
    placeholder: "What is in the image? e.g. a lone astronaut on a red dune",
    options: [],
  },
  {
    key: "style",
    label: "Style",
    placeholder: "e.g. cinematic photograph",
    options: [
      "cinematic photograph",
      "editorial photo",
      "product photo",
      "digital painting",
      "watercolor illustration",
      "anime illustration",
      "3D render",
      "pixel art",
      "isometric illustration",
      "oil painting",
      "line art",
      "vintage film photo",
    ],
  },
  {
    key: "environment",
    label: "Environment",
    placeholder: "e.g. Tokyo street at night",
    options: [
      "a foggy forest at dawn",
      "a neon-lit city street at night",
      "a minimalist studio backdrop",
      "a sunlit kitchen",
      "a snowy mountain ridge",
      "a desert under a starry sky",
      "an overgrown ruined temple",
      "a rooftop above the clouds",
    ],
  },
  {
    key: "lighting",
    label: "Lighting",
    placeholder: "e.g. golden hour",
    options: [
      "golden hour light",
      "soft diffused light",
      "dramatic rim lighting",
      "neon lighting",
      "moody low-key lighting",
      "bright high-key lighting",
      "volumetric god rays",
      "candlelight",
      "overcast daylight",
    ],
  },
  {
    key: "camera",
    label: "Camera angle",
    placeholder: "e.g. low angle",
    options: [
      "eye level",
      "low angle",
      "high angle",
      "top-down",
      "over-the-shoulder",
      "dutch angle",
      "macro close-up",
      "drone shot",
    ],
  },
  {
    key: "lens",
    label: "Lens",
    placeholder: "e.g. 35mm lens",
    options: [
      "24mm wide-angle lens",
      "35mm lens",
      "50mm lens",
      "85mm portrait lens",
      "100mm macro lens",
      "200mm telephoto lens",
      "fisheye lens",
      "tilt-shift lens",
    ],
  },
  {
    key: "composition",
    label: "Composition",
    placeholder: "e.g. wide shot",
    options: [
      "extreme close-up",
      "close-up",
      "medium shot",
      "wide shot",
      "extreme wide shot",
      "rule of thirds",
      "centered symmetry",
      "leading lines",
      "shallow depth of field",
    ],
  },
  {
    key: "mood",
    label: "Mood",
    placeholder: "e.g. dramatic",
    options: [
      "dramatic",
      "serene",
      "mysterious",
      "joyful",
      "melancholic",
      "epic",
      "cozy",
      "eerie",
      "nostalgic",
    ],
  },
  {
    key: "color",
    label: "Color palette",
    placeholder: "e.g. teal and orange",
    options: [
      "teal and orange",
      "muted earth tones",
      "black and white",
      "pastel palette",
      "vibrant saturated colors",
      "monochrome blue",
      "warm sepia tones",
      "neon pink and cyan",
    ],
  },
];

export interface RatioDef {
  value: string;
  label: string;
}

export const RATIOS: RatioDef[] = [
  { value: "1:1", label: "Square" },
  { value: "16:9", label: "Landscape / YouTube" },
  { value: "9:16", label: "Portrait / Reels, Shorts, TikTok" },
  { value: "4:5", label: "Instagram portrait" },
  { value: "3:2", label: "Photo" },
  { value: "2:3", label: "Poster" },
  { value: "4:3", label: "Classic" },
  { value: "21:9", label: "Ultrawide / cinematic" },
];

export const NEGATIVE_PRESETS = [
  "blurry, low quality, watermark, text, logo",
  "deformed hands, extra fingers, bad anatomy",
  "oversaturated, jpeg artifacts, noise",
];

export interface Template {
  id: string;
  name: string;
  description: string;
  values: Partial<Record<FieldKey | "ratio" | "negative", string>>;
}

export const TEMPLATES: Template[] = [
  {
    id: "cinematic",
    name: "Cinematic still",
    description: "Movie-frame look with dramatic light",
    values: {
      style: "cinematic photograph",
      lighting: "dramatic rim lighting",
      camera: "low angle",
      lens: "35mm lens",
      composition: "wide shot",
      mood: "dramatic",
      color: "teal and orange",
      ratio: "21:9",
    },
  },
  {
    id: "portrait",
    name: "Portrait",
    description: "Clean, flattering headshot style",
    values: {
      style: "editorial photo",
      lighting: "soft diffused light",
      camera: "eye level",
      lens: "85mm portrait lens",
      composition: "shallow depth of field",
      mood: "serene",
      ratio: "4:5",
    },
  },
  {
    id: "product",
    name: "Product shot",
    description: "E-commerce ready, studio look",
    values: {
      style: "product photo",
      environment: "a minimalist studio backdrop",
      lighting: "bright high-key lighting",
      camera: "eye level",
      lens: "100mm macro lens",
      composition: "centered symmetry",
      color: "pastel palette",
      ratio: "1:1",
    },
  },
  {
    id: "anime",
    name: "Anime",
    description: "Illustrated, vibrant, expressive",
    values: {
      style: "anime illustration",
      lighting: "golden hour light",
      composition: "medium shot",
      mood: "joyful",
      color: "vibrant saturated colors",
      ratio: "16:9",
      negative: "deformed hands, extra fingers, bad anatomy",
    },
  },
  {
    id: "3d",
    name: "3D render",
    description: "Clay-like, soft, modern 3D",
    values: {
      style: "3D render",
      lighting: "soft diffused light",
      camera: "high angle",
      composition: "centered symmetry",
      mood: "cozy",
      color: "pastel palette",
      ratio: "1:1",
    },
  },
];
