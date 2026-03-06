'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, Plus, X, Loader2, Check, Info } from 'lucide-react';

// --- toggle switch ---
export function Toggle({ checked, onChange, disabled }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${checked ? 'bg-[#5865F2]' : 'bg-white/10'
                }`}
        >
            <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'
                }`} />
        </button>
    );
}

// --- card wrapper ---
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`rounded-xl border border-white/[0.06] bg-[#111822]/80 backdrop-blur-sm p-5 ${className}`}>
            {children}
        </div>
    );
}

// --- row: label + right side control ---
export function Row({ label, hint, children, disabled }: {
    label: string;
    hint?: string;
    children: ReactNode;
    disabled?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between gap-4 py-2 ${disabled ? 'opacity-40' : ''}`}>
            <div className="min-w-0">
                <span className="text-sm font-medium text-white/80">{label}</span>
                {hint && <p className="text-xs text-white/30 mt-0.5">{hint}</p>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

// --- section header ---
export function SectionHeader({ icon, title, children }: {
    icon?: ReactNode;
    title: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
                {icon && <span className="text-[#5865F2]">{icon}</span>}
                <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">{title}</h3>
            </div>
            {children}
        </div>
    );
}

// --- select dropdown ---
export function Select({ value, onChange, options, disabled }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
}) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#5865F2]/50 transition-colors disabled:opacity-40 appearance-none cursor-pointer"
        >
            {options.map(o => (
                <option key={o.value} value={o.value} className="bg-[#111822] text-white">{o.label}</option>
            ))}
        </select>
    );
}

// --- number input (compact) ---
export function NumberInput({ value, onChange, min, max, step, disabled, suffix }: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    suffix?: string;
}) {
    const clamp = (v: number) => {
        if (min !== undefined && v < min) return min;
        if (max !== undefined && v > max) return max;
        return v;
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={e => onChange(clamp(parseInt(e.target.value) || min || 0))}
                onBlur={e => onChange(clamp(parseInt(e.target.value) || min || 0))}
                disabled={disabled}
                className="w-20 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#5865F2]/50 transition-colors disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {suffix && <span className="text-xs text-white/30">{suffix}</span>}
        </div>
    );
}

// --- slider input ---
export function Slider({ value, onChange, min, max, step, disabled, label }: {
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step?: number;
    disabled?: boolean;
    label?: string;
}) {
    return (
        <div className="flex items-center gap-3 w-full">
            <input
                type="range"
                value={value}
                min={min}
                max={max}
                step={step || 1}
                onChange={e => onChange(parseInt(e.target.value))}
                disabled={disabled}
                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#5865F2] disabled:opacity-40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5865F2] [&::-webkit-slider-thumb]:shadow-md"
            />
            {label && <span className="text-sm font-mono text-white/50 min-w-[4rem] text-right">{label}</span>}
        </div>
    );
}

// --- text input ---
export function TextInput({ value, onChange, placeholder, disabled }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#5865F2]/50 transition-colors disabled:opacity-40"
        />
    );
}

// --- id list (trusted users, roles, bots) ---
export function IdList({ ids, onAdd, onRemove, label, addLabel, disabled }: {
    ids: string[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    label: string;
    addLabel?: string;
    disabled?: boolean;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/60">{label}</span>
                <button
                    onClick={onAdd}
                    disabled={disabled}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 transition-colors disabled:opacity-40"
                >
                    <Plus size={12} />
                    {addLabel || 'Add'}
                </button>
            </div>
            {ids.length === 0 ? (
                <p className="text-xs text-white/20 py-2">none configured</p>
            ) : (
                <div className="space-y-1 max-h-28 overflow-y-auto">
                    {ids.map(id => (
                        <div key={id} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-1.5 group">
                            <span className="text-xs font-mono text-white/50">{id}</span>
                            <button
                                onClick={() => onRemove(id)}
                                disabled={disabled}
                                className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- multi-checkbox (punishment actions, permissions) ---
export function CheckboxGroup({ options, selected, onChange, disabled }: {
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    disabled?: boolean;
}) {
    const toggle = (val: string) => {
        onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {options.map(o => {
                const active = selected.includes(o.value);
                return (
                    <button
                        key={o.value}
                        type="button"
                        onClick={() => !disabled && toggle(o.value)}
                        disabled={disabled}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${active
                                ? 'bg-[#5865F2]/15 border-[#5865F2]/30 text-[#5865F2]'
                                : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/10'
                            } disabled:opacity-40`}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

// --- string list (editable, for domains etc) ---
export function StringList({ items, onChange, placeholder, disabled }: {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    const [input, setInput] = useState('');

    const add = () => {
        const val = input.trim();
        if (val && !items.includes(val)) {
            onChange([...items, val]);
            setInput('');
        }
    };

    return (
        <div>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && add()}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:border-[#5865F2]/50 transition-colors disabled:opacity-40"
                />
                <button
                    onClick={add}
                    disabled={disabled || !input.trim()}
                    className="px-2.5 py-1.5 rounded-lg text-xs bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 transition-colors disabled:opacity-40"
                >
                    <Plus size={12} />
                </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {items.map(item => (
                    <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.05] text-xs text-white/50">
                        {item}
                        <button onClick={() => onChange(items.filter(i => i !== item))} disabled={disabled} className="hover:text-red-400 transition-colors">
                            <X size={10} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}

// --- advanced mode toggle ---
export function AdvancedToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/30 hover:text-white/50 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.04] transition-all duration-200"
        >
            Advanced
            <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
    );
}

// --- save bar (sticky bottom) ---
export function SaveBar({ onSave, saving, disabled }: {
    onSave: () => void;
    saving: boolean;
    disabled?: boolean;
}) {
    return (
        <div className="sticky bottom-0 pt-4 pb-1 -mx-4 px-4 sm:-mx-8 sm:px-8 bg-gradient-to-t from-[#0f1419] via-[#0f1419]/95 to-transparent">
            <button
                onClick={onSave}
                disabled={disabled || saving}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-[#5865F2] hover:bg-[#4752c4] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {saving ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        saving...
                    </>
                ) : (
                    <>
                        <Check size={16} />
                        save changes
                    </>
                )}
            </button>
        </div>
    );
}

// --- loading state ---
export function ConfigLoading() {
    return (
        <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#5865F2]" />
        </div>
    );
}

// --- helper to prompt for discord id ---
export function promptId(label: string): string | null {
    const id = prompt(`Enter Discord ${label} ID:`);
    if (id && /^\d{17,20}$/.test(id.trim())) return id.trim();
    if (id) alert('invalid id — must be 17-20 digits');
    return null;
}
