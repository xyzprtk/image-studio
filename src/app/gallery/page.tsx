'use client';

import { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Download, 
  Copy, 
  Filter,
  Grid3X3,
  ImageIcon,
  Loader2
} from 'lucide-react';
import { useStore } from '@/store';
import { PROVIDERS } from '@/lib/types';
import { formatDate, truncate, downloadImage, cn } from '@/lib/utils';
import { Input, Button, Card, Badge, Select } from '@/components/ui';

export default function GalleryPage() {
  const generations = useStore(s => s.generations);
  const deleteGeneration = useStore(s => s.deleteGeneration);
  const clearHistory = useStore(s => s.clearHistory);

  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredGenerations = generations.filter(g => {
    const matchesSearch = g.params.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = providerFilter === 'all' || g.params.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
  };

  const getProviderInfo = (providerId: string) => {
    return PROVIDERS.find(p => p.id === providerId);
  };

  const providerOptions = [
    { value: 'all', label: 'All Providers' },
    ...PROVIDERS.map(p => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-2 font-title">Gallery</h1>
          <p className="text-text-secondary text-sm lg:text-base">
            {generations.length} generation{generations.length !== 1 ? 's' : ''} in your history
          </p>
        </div>
        {generations.length > 0 && (
          <Button variant="danger" size="sm" onClick={clearHistory}>
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="w-full sm:flex-1 sm:max-w-md">
          <Input
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          options={providerOptions}
          className="w-48"
        />
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2.5 transition-colors",
              viewMode === 'grid' ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2.5 transition-colors",
              viewMode === 'list' ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredGenerations.length === 0 ? (
        <Card className="p-8 lg:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-4">
            <ImageIcon className="w-7 h-7 lg:w-8 lg:h-8 text-text-tertiary" />
          </div>
          <p className="text-lg font-medium mb-1">
            {search || providerFilter !== 'all' ? 'No matches found' : 'No images yet'}
          </p>
          <p className="text-sm text-text-secondary max-w-xs">
            {search || providerFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start generating images to build your gallery'}
          </p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {filteredGenerations.map((gen) => {
            const provider = getProviderInfo(gen.params.provider);
            return (
              <Card key={gen.id} className="overflow-hidden group">
                <div className="aspect-square relative bg-bg-tertiary">
                  {gen.status === 'pending' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    </div>
                  ) : gen.status === 'failed' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-sm text-danger px-4 text-center">{gen.error}</p>
                    </div>
                  ) : gen.images[0] ? (
                    <img
                      src={gen.images[0]}
                      alt={gen.params.prompt}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {gen.images[0] && (
                      <button
                        onClick={() => downloadImage(gen.images[0], `gallery-${gen.id}.png`)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopyPrompt(gen.params.prompt)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      title="Copy prompt"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteGeneration(gen.id)}
                      className="p-2 bg-white/10 hover:bg-danger/50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-sm text-text-secondary line-clamp-2" title={gen.params.prompt}>
                    {truncate(gen.params.prompt, 60)}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="success"
                      style={{ 
                        backgroundColor: `${provider?.color}15`, 
                        color: provider?.color 
                      }}
                    >
                      {provider?.name}
                    </Badge>
                    <span className="text-xs text-text-tertiary">
                      {formatDate(gen.createdAt)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGenerations.map((gen) => {
            const provider = getProviderInfo(gen.params.provider);
            return (
              <Card key={gen.id} className="p-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-bg-tertiary flex-shrink-0">
                  {gen.images[0] ? (
                    <img src={gen.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : gen.status === 'pending' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary mb-1">{truncate(gen.params.prompt, 100)}</p>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="success"
                      style={{ 
                        backgroundColor: `${provider?.color}15`, 
                        color: provider?.color 
                      }}
                    >
                      {provider?.name}
                    </Badge>
                    <span className="text-xs text-text-tertiary">
                      {gen.params.model} · {gen.params.aspectRatio}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {formatDate(gen.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {gen.images[0] && (
                    <Button variant="ghost" size="sm" onClick={() => downloadImage(gen.images[0], `gallery-${gen.id}.png`)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleCopyPrompt(gen.params.prompt)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteGeneration(gen.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
