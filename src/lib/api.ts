import { GenerationParams, ProviderConfig } from '@/lib/types';

export async function generateImage(
  params: GenerationParams,
  providerConfig: ProviderConfig
): Promise<{ images: string[]; error?: string }> {
  switch (params.provider) {
    case 'openai':
      return generateWithOpenAI(params, providerConfig.apiKey);
    case 'google':
      return generateWithGoogle(params, providerConfig.apiKey);
    case 'stability':
      return generateWithStability(params, providerConfig.apiKey);
    case 'replicate':
      return generateWithReplicate(params, providerConfig.apiKey);
    default:
      return { images: [], error: 'Unknown provider' };
  }
}

async function generateWithOpenAI(params: GenerationParams, apiKey: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        prompt: params.prompt,
        n: params.numImages,
        size: getOpenAISize(params.aspectRatio),
        quality: params.quality,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { images: [], error: error.error?.message || 'OpenAI API error' };
    }

    const data = await response.json();
    const images = data.data.map((img: { b64_json: string }) => 
      `data:image/png;base64,${img.b64_json}`
    );
    return { images };
  } catch (error) {
    return { images: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function generateWithGoogle(params: GenerationParams, apiKey: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: { text: params.prompt },
          number_of_images: params.numImages,
          aspect_ratio: getGoogleAspect(params.aspectRatio),
          safety_filter_level: 'block_medium_and_above',
          person_generation: 'allow_adult',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { images: [], error: error.error?.message || 'Google API error' };
    }

    const data = await response.json();
    const images = data.predictions?.map((p: { image: { imageBytes: string } }) => 
      `data:image/png;base64,${p.image.imageBytes}`
    ) || [];
    return { images: images.length > 0 ? images : [] };
  } catch (error) {
    return { images: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function generateWithStability(params: GenerationParams, apiKey: string) {
  try {
    const sizes: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '3:4': { width: 768, height: 1024 },
      '16:9': { width: 1024, height: 576 },
      '9:16': { width: 576, height: 1024 },
      '3:2': { width: 1024, height: 683 },
      '2:3': { width: 683, height: 1024 },
    };
    
    const size = sizes[params.aspectRatio] || sizes['1:1'];

    const formData = new FormData();
    formData.append('prompt', params.prompt);
    if (params.negativePrompt) {
      formData.append('negative_prompt', params.negativePrompt);
    }
    formData.append('width', String(size.width));
    formData.append('height', String(size.height));
    formData.append('samples', String(params.numImages));
    if (params.seed) {
      formData.append('seed', String(params.seed));
    }

    const response = await fetch(
      `https://api.stability.ai/v2beta/image generation/text-to-image`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { images: [], error: error.message || 'Stability AI error' };
    }

    const data = await response.json();
    const images = data.artifacts?.map((a: { base64: string }) => 
      `data:image/png;base64,${a.base64}`
    ) || [];
    return { images };
  } catch (error) {
    return { images: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function generateWithReplicate(params: GenerationParams, apiKey: string) {
  try {
    const modelMap: Record<string, string> = {
      'flux-pro': 'black-forest-labs/flux-pro',
      'flux-dev': 'black-forest-labs/flux-dev',
      'midjourney': 'midjourney/midjourney',
    };

    const model = modelMap[params.model];
    if (!model) {
      return { images: [], error: 'Unknown Replicate model' };
    }

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        version: model,
        input: {
          prompt: params.prompt,
          aspect_ratio: params.aspectRatio,
          num_outputs: params.numImages,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { images: [], error: error.detail || 'Replicate API error' };
    }

    const prediction = await response.json();
    
    // Poll for completion
    let status = prediction.status;
    let result = prediction;
    
    while (status === 'starting' || status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      result = await pollResponse.json();
      status = result.status;
    }

    if (status === 'failed') {
      return { images: [], error: result.error || 'Generation failed' };
    }

    const images = Array.isArray(result.output) ? result.output : [result.output];
    return { images: images.filter(Boolean) };
  } catch (error) {
    return { images: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function getOpenAISize(aspectRatio: string): string {
  const map: Record<string, string> = {
    '1:1': '1024x1024',
    '4:3': '1024x768',
    '3:4': '768x1024',
    '16:9': '1024x576',
    '9:16': '576x1024',
  };
  return map[aspectRatio] || '1024x1024';
}

function getGoogleAspect(aspectRatio: string): string {
  const map: Record<string, string> = {
    '1:1': '1:1',
    '4:3': '4:3',
    '3:4': '3:4',
    '16:9': '16:9',
    '9:16': '9:16',
  };
  return map[aspectRatio] || '1:1';
}

export async function testProviderConnection(
  providerId: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (providerId) {
      case 'openai': {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        return { success: response.ok, error: response.ok ? undefined : 'Invalid API key' };
      }
      case 'google': {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        return { success: response.ok, error: response.ok ? undefined : 'Invalid API key' };
      }
      case 'stability': {
        const response = await fetch('https://api.stability.ai/v1/user/account', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        return { success: response.ok, error: response.ok ? undefined : 'Invalid API key' };
      }
      case 'replicate': {
        const response = await fetch('https://api.replicate.com/v1/account', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        return { success: response.ok, error: response.ok ? undefined : 'Invalid API key' };
      }
      default:
        return { success: false, error: 'Unknown provider' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}
