'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  Image, 
  Key, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';
import { PROVIDERS } from '@/lib/types';

const navItems = [
  { href: '/', icon: Sparkles, label: 'Generate' },
  { href: '/gallery', icon: Image, label: 'Gallery' },
  { href: '/providers', icon: Key, label: 'Providers' },
  { href: '/templates', icon: FileText, label: 'Templates' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const providerConfigs = useStore(s => s.providerConfigs);

  const configuredProviders = PROVIDERS.filter(p => 
    providerConfigs.some(c => c.providerId === p.id && c.isConfigured)
  );

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-bg-secondary border-r border-border flex flex-col transition-all duration-300 z-50 hidden lg:flex",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      <div className={cn(
        "h-16 flex items-center border-b border-border px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-lg tracking-tight font-title">Vibe Studio</span>
        )}
      </div>

      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                    isActive 
                      ? "bg-accent/10 text-accent" 
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-bg-tertiary text-text-primary text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {!collapsed && configuredProviders.length > 0 && (
          <div className="mt-8 px-3">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
              Active Providers
            </p>
            <div className="flex flex-wrap gap-2">
              {configuredProviders.map(provider => (
                <div
                  key={provider.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-tertiary text-xs"
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: provider.color }}
                  />
                  <span>{provider.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className={cn(
        "p-3 border-t border-border",
        collapsed ? "flex justify-center" : "flex items-center justify-between"
      )}>
        {!collapsed && (
          <Link 
            href="/settings" 
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm px-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors",
            collapsed && "w-full flex justify-center"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
