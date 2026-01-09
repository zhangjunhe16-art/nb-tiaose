
export interface ColorReference {
  id: string;
  styleName: string;
  imageUrl: string;
  description: string;
  lutData?: string; // .cube file content
}

export interface ProcessingState {
  status: 'idle' | 'analyzing' | 'generating' | 'completed' | 'error';
  message: string;
  progress: number;
}

export enum GradingStyle {
  TEAL_ORANGE = 'Cinematic Teal & Orange',
  NOIR = 'Film Noir / Monochrome High Contrast',
  GOLDEN_HOUR = 'Warm Golden Hour / Sunset',
  BLEACH_BYPASS = 'Gritty Bleach Bypass',
  VINTAGE_KODAK = 'Vintage Kodak Film Stock',
  MODERN_COMMERCIAL = 'Clean Modern Commercial (Bright & Sharp)'
}
