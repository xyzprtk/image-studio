export type ProviderId = 'openai' | 'google' | 'stability' | 'replicate';

export interface Provider {
  id: ProviderId;
  name: string;
  logo: string;
  color: string;
  models: Model[];
}

export interface Model {
  id: string;
  name: string;
  provider: ProviderId;
  supportsImageToImage: boolean;
}

export interface ProviderConfig {
  providerId: ProviderId;
  apiKey: string;
  isConfigured: boolean;
  lastTested?: number;
}

export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3';

export interface GenerationParams {
  provider: ProviderId;
  model: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  quality: 'standard' | 'hd';
  seed?: number;
  numImages: number;
  imageToImage?: string;
}

export interface Generation {
  id: string;
  params: GenerationParams;
  images: string[];
  createdAt: number;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  category: string;
  isBuiltIn: boolean;
}

export const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    color: '#10A37F',
    models: [
      { id: 'dalle-3', name: 'DALL-E 3', provider: 'openai', supportsImageToImage: false },
      { id: 'dalle-2', name: 'DALL-E 2', provider: 'openai', supportsImageToImage: false },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    logo: 'https://www.gstatic.com/images/branding/product/2x/gen_ai_48dp.png',
    color: '#4285F4',
    models: [
      { id: 'imagen-3', name: 'Imagen 3', provider: 'google', supportsImageToImage: true },
      { id: 'imagen-2', name: 'Imagen 2', provider: 'google', supportsImageToImage: true },
    ],
  },
  {
    id: 'stability',
    name: 'Stability AI',
    logo: 'https://www.stability.ai/_next/static/media/logo-icon.76d5b5d2.svg',
    color: '#7866D5',
    models: [
      { id: 'sd3-5', name: 'Stable Diffusion 3.5', provider: 'stability', supportsImageToImage: true },
      { id: 'sdxl', name: 'SDXL', provider: 'stability', supportsImageToImage: true },
    ],
  },
  {
    id: 'replicate',
    name: 'Replicate',
    logo: 'https://replicate.com/favicon.ico',
    color: '#FF4D4D',
    models: [
      { id: 'flux-pro', name: 'Flux Pro', provider: 'replicate', supportsImageToImage: false },
      { id: 'flux-dev', name: 'Flux Dev', provider: 'replicate', supportsImageToImage: false },
      { id: 'midjourney', name: 'Midjourney', provider: 'replicate', supportsImageToImage: false },
    ],
  },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string; ratio: number }[] = [
  { value: '1:1', label: 'Square', ratio: 1 },
  { value: '4:3', label: 'Landscape 4:3', ratio: 4/3 },
  { value: '3:4', label: 'Portrait 3:4', ratio: 3/4 },
  { value: '16:9', label: 'Wide 16:9', ratio: 16/9 },
  { value: '9:16', label: 'Tall 9:16', ratio: 9/16 },
  { value: '3:2', label: 'Landscape 3:2', ratio: 3/2 },
  { value: '2:3', label: 'Portrait 2:3', ratio: 2/3 },
];

export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'portrait',
    name: 'Portrait',
    prompt: 'A {subject} portrait, {style}, professional photography, dramatic lighting, {mood}',
    category: 'Portrait',
    isBuiltIn: true,
  },
  {
    id: 'landscape',
    name: 'Landscape',
    prompt: 'A breathtaking {terrain} landscape, {time_of_day}, {weather}, golden hour, cinematic, 8k',
    category: 'Landscape',
    isBuiltIn: true,
  },
  {
    id: 'product',
    name: 'Product Shot',
    prompt: 'Professional product photography of {product}, {background}, soft studio lighting, clean, minimalist, high-end',
    category: 'Product',
    isBuiltIn: true,
  },
  {
    id: 'abstract',
    name: 'Abstract Art',
    prompt: 'Abstract {medium}, {colors} color palette, {texture}, fluid dynamics, {mood}, {style}',
    category: 'Abstract',
    isBuiltIn: true,
  },
  {
    id: 'architecture',
    name: 'Architecture',
    prompt: '{style} architecture, {building_type}, {material}, {lighting}, {environment}, photorealistic, 8k',
    category: 'Architecture',
    isBuiltIn: true,
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    prompt: 'Fantasy scene of {subject}, {setting}, {mood}, {style}, epic, magical, highly detailed, 8k resolution',
    category: 'Fantasy',
    isBuiltIn: true,
  },
];
