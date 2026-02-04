'use client';

import { ReactNode, createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TABS CONTEXT
// ============================================

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

// ============================================
// TABS COMPONENT
// ============================================

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export default function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const activeTab = value ?? internalValue;
  const setActiveTab = (tab: string) => {
    if (!value) {
      setInternalValue(tab);
    }
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// ============================================
// TABS LIST
// ============================================

interface TabsListProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'bordered';
}

export function TabsList({ children, className, variant = 'default' }: TabsListProps) {
  const variants = {
    default: 'flex gap-1 border-b border-slate-200',
    pills: 'flex gap-2 p-1 bg-slate-100 rounded-xl',
    bordered: 'flex gap-1',
  };

  return (
    <div className={cn(variants[variant], className)} role="tablist">
      {children}
    </div>
  );
}

// ============================================
// TAB TRIGGER
// ============================================

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled = false,
  icon,
  badge,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        'relative px-4 py-3 text-sm font-medium transition-all duration-200',
        'flex items-center gap-2',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        isActive
          ? 'text-blue-600'
          : 'text-slate-500 hover:text-slate-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && <span className={isActive ? 'text-blue-500' : 'text-slate-400'}>{icon}</span>}
      {children}
      {badge}
      
      {/* Active indicator */}
      {isActive && (
        <span
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
          style={{
            animation: 'tabIndicator 0.2s ease-out',
          }}
        />
      )}

      <style jsx>{`
        @keyframes tabIndicator {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </button>
  );
}

// ============================================
// TABS CONTENT
// ============================================

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
  forceMount?: boolean;
}

export function TabsContent({ value, children, className, forceMount = false }: TabsContentProps) {
  const { activeTab } = useTabs();
  const isActive = activeTab === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      className={cn(
        isActive && 'animate-fade-in',
        className
      )}
      style={{ animationDuration: '200ms' }}
    >
      {children}
    </div>
  );
}

// ============================================
// SIMPLE TABS (Alternative ohne Context)
// ============================================

interface SimpleTab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  content: ReactNode;
}

interface SimpleTabsProps {
  tabs: SimpleTab[];
  defaultTab?: string;
  className?: string;
  variant?: 'default' | 'pills';
}

export function SimpleTabs({ tabs, defaultTab, className, variant = 'default' }: SimpleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      <div
        className={cn(
          'flex',
          variant === 'default' && 'gap-1 border-b border-slate-200',
          variant === 'pills' && 'gap-2 p-1 bg-slate-100 rounded-xl'
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-all duration-200',
              'flex items-center gap-2',
              variant === 'default' && [
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700',
              ],
              variant === 'pills' && [
                'rounded-lg',
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ]
            )}
          >
            {tab.icon && (
              <span className={activeTab === tab.id ? 'text-blue-500' : 'text-slate-400'}>
                {tab.icon}
              </span>
            )}
            {tab.label}
            {tab.badge}
            
            {/* Active indicator for default variant */}
            {variant === 'default' && activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 animate-fade-in" key={activeTab}>
        {activeContent}
      </div>
    </div>
  );
}
