'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// DROPDOWN OPTION TYPE
// ============================================

export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  color?: string;
  description?: string;
  disabled?: boolean;
}

// ============================================
// DROPDOWN COMPONENT
// ============================================

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  position?: 'bottom' | 'top';
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Auswählen...',
  label,
  error,
  disabled = false,
  className,
  position = 'bottom',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev + 1;
            return next >= options.length ? 0 : next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? options.length - 1 : next;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && !options[highlightedIndex]?.disabled) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options, onChange]);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          `w-full flex items-center justify-between gap-2
          px-4 py-3
          bg-white/70 backdrop-blur-sm
          border rounded-xl
          text-left text-[15px]
          transition-all duration-200`,
          disabled
            ? 'opacity-50 cursor-not-allowed border-slate-200'
            : 'hover:border-slate-300 cursor-pointer border-slate-200',
          isOpen && 'border-blue-400 ring-2 ring-blue-100',
          error && 'border-red-400'
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedOption?.color && (
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-slate-500">{selectedOption.icon}</span>
          )}
          <span className={cn('truncate', selectedOption ? 'text-slate-800' : 'text-slate-400')}>
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <svg
          className={cn('w-5 h-5 text-slate-400 transition-transform flex-shrink-0', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 w-full mt-2 py-1 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl overflow-hidden',
            position === 'top' && 'bottom-full mb-2 mt-0'
          )}
          style={{
            animation: 'dropdownIn 0.15s ease-out',
          }}
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                disabled={option.disabled}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  option.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer',
                  option.value === value
                    ? 'bg-blue-50 text-blue-700'
                    : highlightedIndex === index
                    ? 'bg-slate-50'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                {option.color && (
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.icon && (
                  <span className="flex-shrink-0 text-slate-500">{option.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-slate-500 block truncate">{option.description}</span>
                  )}
                </div>
                {option.value === value && (
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// ============================================
// STATUS DROPDOWN (Lead Status ändern)
// ============================================

import { LeadStatus } from '@/types';
import { STATUS_CONFIG } from '@/lib/utils';

interface StatusDropdownProps {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
  disabled?: boolean;
  label?: string;
}

export function StatusDropdown({ value, onChange, disabled, label }: StatusDropdownProps) {
  const statusOptions: DropdownOption[] = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.label,
    color: config.color,
  }));

  return (
    <Dropdown
      options={statusOptions}
      value={value}
      onChange={(v) => onChange(v as LeadStatus)}
      disabled={disabled}
      label={label}
      placeholder="Status wählen"
    />
  );
}

// ============================================
// PRIORITY DROPDOWN
// ============================================

import { LeadPriority } from '@/types';
import { PRIORITY_CONFIG } from '@/lib/utils';

interface PriorityDropdownProps {
  value: LeadPriority;
  onChange: (priority: LeadPriority) => void;
  disabled?: boolean;
  label?: string;
}

export function PriorityDropdown({ value, onChange, disabled, label }: PriorityDropdownProps) {
  const priorityOptions: DropdownOption[] = Object.entries(PRIORITY_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.label,
    color: config.color,
  }));

  return (
    <Dropdown
      options={priorityOptions}
      value={value}
      onChange={(v) => onChange(v as LeadPriority)}
      disabled={disabled}
      label={label}
      placeholder="Priorität wählen"
    />
  );
}

// ============================================
// MULTI-SELECT DROPDOWN
// ============================================

interface MultiSelectProps {
  options: DropdownOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  values,
  onChange,
  placeholder = 'Auswählen...',
  label,
  disabled = false,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const selectedLabels = values
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          `w-full flex items-center justify-between gap-2
          px-4 py-3
          bg-white/70 backdrop-blur-sm
          border border-slate-200 rounded-xl
          text-left text-[15px]
          transition-all duration-200`,
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 cursor-pointer',
          isOpen && 'border-blue-400 ring-2 ring-blue-100'
        )}
      >
        <span className={cn('truncate', selectedLabels ? 'text-slate-800' : 'text-slate-400')}>
          {selectedLabels || placeholder}
        </span>
        <svg
          className={cn('w-5 h-5 text-slate-400 transition-transform flex-shrink-0', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 py-1 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleValue(option.value)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                    values.includes(option.value)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-slate-300'
                  )}
                >
                  {values.includes(option.value) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
