'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Check,
  Sparkles,
  Search,
  Tag
} from 'lucide-react';
import { useStore } from '@/store';
import { PromptTemplate } from '@/lib/types';
import { generateId, cn } from '@/lib/utils';
import { Input, Textarea, Button, Card, Badge, Select } from '@/components/ui';

const CATEGORIES = ['All', 'Portrait', 'Landscape', 'Abstract', 'Product', 'Architecture', 'Fantasy', 'Custom'];

export default function TemplatesPage() {
  const router = useRouter();
  const templates = useStore(s => s.templates);
  const addTemplate = useStore(s => s.addTemplate);
  const removeTemplate = useStore(s => s.removeTemplate);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', prompt: '', category: 'Custom' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                         t.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (template: PromptTemplate) => {
    navigator.clipboard.writeText(template.prompt);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUse = (template: PromptTemplate) => {
    router.push(`/?prompt=${encodeURIComponent(template.prompt)}`);
  };

  const handleCreate = () => {
    if (!newTemplate.name.trim() || !newTemplate.prompt.trim()) return;

    addTemplate({
      id: generateId(),
      name: newTemplate.name.trim(),
      prompt: newTemplate.prompt.trim(),
      category: newTemplate.category,
      isBuiltIn: false,
    });

    setNewTemplate({ name: '', prompt: '', category: 'Custom' });
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    removeTemplate(id);
  };

  const categoryOptions = CATEGORIES.filter(c => c !== 'All').map(c => ({
    value: c,
    label: c,
  }));

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-2 font-title">Templates</h1>
          <p className="text-text-secondary text-sm lg:text-base">
            Create and manage prompt templates for faster generation
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4 lg:p-6 mb-4 lg:mb-6 space-y-4 lg:space-y-5">
          <h3 className="text-lg font-medium">Create New Template</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <Input
              label="Template Name"
              placeholder="e.g., My Portrait Template"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            />
            <Select
              label="Category"
              value={newTemplate.category}
              onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
              options={categoryOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Prompt Template
            </label>
            <Textarea
              placeholder="Use {'{variable}'} syntax for placeholders..."
              value={newTemplate.prompt}
              onChange={(e) => setNewTemplate({ ...newTemplate, prompt: e.target.value })}
              className="min-h-[100px]"
            />
            <p className="text-xs text-text-tertiary mt-2">
              Use {'{subject}'}, {'{style}'}, {'{lighting}'} etc. as placeholders
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newTemplate.name || !newTemplate.prompt}>
              Create Template
            </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="w-full sm:flex-1 sm:max-w-md">
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                category === cat 
                  ? "bg-accent/10 text-accent" 
                  : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card className="p-8 lg:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 lg:w-8 lg:h-8 text-text-tertiary" />
          </div>
          <p className="text-lg font-medium mb-1">No templates found</p>
          <p className="text-sm text-text-secondary max-w-xs">
            {search || category !== 'All' 
              ? 'Try adjusting your search or filters'
              : 'Create your first template to get started'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="p-4 lg:p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium mb-1">{template.name}</h3>
                  <Badge variant="default">
                    <Tag className="w-3 h-3 mr-1" />
                    {template.category}
                  </Badge>
                </div>
                {!template.isBuiltIn && (
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 text-text-tertiary hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <p className="text-sm text-text-secondary font-mono flex-1 mb-4 line-clamp-3">
                {template.prompt}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCopy(template)}
                >
                  {copiedId === template.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copiedId === template.id ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleUse(template)}
                >
                  <Sparkles className="w-4 h-4" />
                  Use
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
