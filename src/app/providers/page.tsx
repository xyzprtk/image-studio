'use client';

import { useState } from 'react';
import { 
  Key, 
  Check, 
  X, 
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { useStore } from '@/store';
import { PROVIDERS, ProviderConfig, ProviderId } from '@/lib/types';
import { testProviderConnection } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Input, Button, Card, Badge } from '@/components/ui';

export default function ProvidersPage() {
  const providerConfigs = useStore(s => s.providerConfigs);
  const setProviderConfig = useStore(s => s.setProviderConfig);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ providerId: string; success: boolean; error?: string } | null>(null);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const getConfig = (providerId: string): ProviderConfig | undefined => {
    return providerConfigs.find(c => c.providerId === providerId);
  };

  const handleSaveKey = async (providerId: string, apiKey: string) => {
    const provider = PROVIDERS.find(p => p.id === providerId);
    if (!provider) return;

    setProviderConfig({
      providerId: providerId as ProviderId,
      apiKey: apiKey.trim(),
      isConfigured: false,
    });
    setTestResult(null);
  };

  const handleTestConnection = async (providerId: string) => {
    const config = getConfig(providerId);
    if (!config?.apiKey) return;

    setTestingId(providerId);
    setTestResult(null);

    const result = await testProviderConnection(providerId, config.apiKey);
    
    setProviderConfig({
      ...config,
      isConfigured: result.success,
      lastTested: Date.now(),
    });

    setTestResult({ providerId, ...result });
    setTestingId(null);
  };

  const handleRemove = (providerId: string) => {
    setProviderConfig({
      providerId: providerId as ProviderId,
      apiKey: '',
      isConfigured: false,
    });
    setTestResult(prev => prev?.providerId === providerId ? null : prev);
  };

  const toggleShowKey = (providerId: string) => {
    setShowKey(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-2 font-title">Providers</h1>
        <p className="text-text-secondary text-sm lg:text-base">
          Configure your API keys for different image generation providers
        </p>
      </div>

      <div className="space-y-4">
        {PROVIDERS.map((provider) => {
          const config = getConfig(provider.id);
          const isConfigured = config?.isConfigured;
          const hasKey = !!config?.apiKey;
          const isTesting = testingId === provider.id;
          const result = testResult?.providerId === provider.id ? testResult : null;

          return (
            <Card key={provider.id} className="p-4 lg:p-6">
              <div className="flex items-start gap-3 lg:gap-4">
                <div 
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${provider.color}15` }}
                >
                  <span className="text-lg lg:text-xl font-semibold" style={{ color: provider.color }}>
                    {provider.name.charAt(0)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-medium">{provider.name}</h3>
                    {isConfigured && (
                      <Badge variant="success">
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                    {!isConfigured && hasKey && (
                      <Badge variant="warning">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Not tested
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-4">
                    {provider.models.map(m => m.name).join(', ')}
                  </p>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Input
                          type={showKey[provider.id] ? 'text' : 'password'}
                          placeholder={`Enter your ${provider.name} API key`}
                          value={config?.apiKey || ''}
                          onChange={(e) => handleSaveKey(provider.id, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey(provider.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                        >
                          {showKey[provider.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleTestConnection(provider.id)}
                        disabled={!config?.apiKey || isTesting}
                        loading={isTesting}
                      >
                        {isTesting ? 'Testing...' : 'Test'}
                      </Button>
                      {hasKey && (
                        <Button
                          variant="ghost"
                          onClick={() => handleRemove(provider.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {result && (
                      <div className={cn(
                        "flex items-center gap-2 text-sm",
                        result.success ? "text-accent" : "text-danger"
                      )}>
                        {result.success ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Connection successful!</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>{result.error || 'Connection failed'}</span>
                          </>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-text-tertiary">
                      Get your API key from{' '}
                      <a 
                        href={getProviderUrl(provider.id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-accent hover:underline inline-flex items-center gap-1"
                      >
                        {provider.name} <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 mt-8 bg-bg-tertiary/50 border-dashed">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-info" />
          </div>
          <div>
            <h3 className="font-medium mb-1">About API Keys</h3>
            <p className="text-sm text-text-secondary">
              Your API keys are stored locally in your browser and are never sent to our servers. 
              Each request is made directly from your browser to the respective AI provider.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function getProviderUrl(providerId: ProviderId): string {
  const urls: Record<ProviderId, string> = {
    openai: 'https://platform.openai.com/api-keys',
    google: 'https://aistudio.google.com/app/apikey',
    stability: 'https://platform.stability.ai/account/keys',
    replicate: 'https://replicate.com/account/api-tokens',
  };
  return urls[providerId];
}
