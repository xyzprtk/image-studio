'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { useStore } from '@/store';
import { 
  PROVIDERS, 
  ASPECT_RATIOS, 
  AspectRatio, 
  ProviderId,
  GenerationParams,
  Generation
} from '@/lib/types';
import { generateImage } from '@/lib/api';
import { generateId, downloadImage, cn } from '@/lib/utils';
import { Input, Textarea, Button, Select, Slider, Card } from '@/components/ui';

export default function GeneratePage() {
  const router = useRouter();
  const providerConfigs = useStore(s => s.providerConfigs);
  const addGeneration = useStore(s => s.addGeneration);
  const templates = useStore(s => s.templates);

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [provider, setProvider] = useState<ProviderId>('openai');
  const [model, setModel] = useState('dalle-3');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [numImages, setNumImages] = useState(1);
  const [seed, setSeed] = useState<number | undefined>();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const selectedProvider = PROVIDERS.find(p => p.id === provider);
  const isConfigured = providerConfigs.some(c => c.providerId === provider && c.isConfigured);

  useEffect(() => {
    const providerModels = PROVIDERS.find(p => p.id === provider)?.models || [];
    if (providerModels.length > 0 && !providerModels.find(m => m.id === model)) {
      setModel(providerModels[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  useEffect(() => {
    if (!isConfigured && providerConfigs.length > 0) {
      const configured = providerConfigs.find(c => c.isConfigured);
      if (configured) {
        setProvider(configured.providerId);
      }
    }
  }, [providerConfigs, isConfigured]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    const config = providerConfigs.find(c => c.providerId === provider);
    if (!config || !config.isConfigured) {
      setError(`Please configure ${selectedProvider?.name} in the Providers page first`);
      return;
    }

    setGenerating(true);
    setError(null);
    setResults([]);

    const params: GenerationParams = {
      provider,
      model,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      aspectRatio,
      quality,
      seed,
      numImages,
    };

    const generationId = generateId();
    const generation: Generation = {
      id: generationId,
      params,
      images: [],
      createdAt: Date.now(),
      status: 'pending',
    };
    addGeneration(generation);

    try {
      const { images, error: genError } = await generateImage(params, config);

      if (genError) {
        setError(genError);
        addGeneration({ ...generation, status: 'failed', error: genError });
      } else {
        setResults(images);
        addGeneration({ ...generation, status: 'completed', images });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      addGeneration({ ...generation, status: 'failed', error: errorMessage });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  const providerOptions = PROVIDERS.map(p => ({
    value: p.id,
    label: p.name,
  }));

  const modelOptions = (PROVIDERS.find(p => p.id === provider)?.models || []).map(m => ({
    value: m.id,
    label: m.name,
  }));

  const aspectOptions = ASPECT_RATIOS.map(a => ({
    value: a.value,
    label: a.label,
  }));

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-2 font-title">Vibe Studio</h1>
        <p className="text-text-secondary text-sm lg:text-base">
          Create stunning images using AI from multiple providers in one place
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <div className="space-y-4 lg:space-y-6">
          <Card className="p-4 lg:p-6 space-y-4 lg:space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Prompt
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="min-h-[140px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Negative Prompt <span className="text-text-tertiary">(optional)</span>
              </label>
              <Textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What to avoid in the image..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPrompt}
                disabled={!prompt}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </Card>

          <Card className="p-4 lg:p-6 space-y-4 lg:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <Select
                label="Provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value as ProviderId)}
                options={providerOptions}
              />
              <Select
                label="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                options={modelOptions}
              />
            </div>

            <Select
              label="Aspect Ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              options={aspectOptions}
            />

            {provider === 'openai' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Quality</label>
                <div className="flex gap-2">
                  {(['standard', 'hd'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
                        quality === q 
                          ? "bg-accent/10 text-accent border border-accent" 
                          : "bg-bg-tertiary text-text-secondary hover:text-text-primary border border-transparent"
                      )}
                    >
                      {q === 'standard' ? 'Standard' : 'HD'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Slider
              label="Number of Images"
              value={numImages}
              onChange={setNumImages}
              min={1}
              max={4}
            />

            <Input
              label="Seed (optional)"
              type="number"
              placeholder="Random"
              value={seed || ''}
              onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
            />
          </Card>

          {error && (
            <Card className="p-4 border-danger/50 bg-danger/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-danger">Generation Failed</p>
                  <p className="text-sm text-text-secondary mt-1">{error}</p>
                </div>
              </div>
            </Card>
          )}

          <Button
            onClick={handleGenerate}
            loading={generating}
            disabled={!prompt.trim() || !isConfigured}
            size="lg"
            className="w-full"
          >
            <Sparkles className="w-5 h-5" />
            {generating ? 'Generating...' : 'Generate'}
          </Button>

          {!isConfigured && providerConfigs.length > 0 && (
            <p className="text-sm text-text-secondary text-center">
              Configure a provider in{' '}
              <button 
                onClick={() => router.push('/providers')}
                className="text-accent hover:underline"
              >
                Providers
              </button>
              {' '}to start generating
            </p>
          )}
        </div>

        <div className="space-y-6">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {results.map((img, i) => (
                <Card key={i} className="overflow-hidden group relative">
                  <img
                    src={img}
                    alt={`Generated ${i + 1}`}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => downloadImage(img, `generated-${Date.now()}-${i + 1}.png`)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : generating ? (
            <Card className="p-8 lg:p-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 lg:w-12 lg:h-12 text-accent animate-spin mb-4" />
              <p className="text-lg font-medium mb-1">Generating your image</p>
              <p className="text-sm text-text-secondary">
                This may take a few seconds...
              </p>
            </Card>
          ) : (
            <Card className="p-8 lg:p-12 flex flex-col items-center justify-center text-center min-h-[300px] lg:min-h-[400px]">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-4">
                <ImageIcon className="w-7 h-7 lg:w-8 lg:h-8 text-text-tertiary" />
              </div>
              <p className="text-lg font-medium mb-1">No images yet</p>
              <p className="text-sm text-text-secondary max-w-xs">
                Enter a prompt and click generate to create your first image
              </p>
            </Card>
          )}

          {templates.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">Quick Templates</h3>
              <div className="flex flex-wrap gap-2">
                {templates.slice(0, 6).map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleUseTemplate(template.prompt)}
                    className="px-3 py-1.5 bg-bg-tertiary hover:bg-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
