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
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${checked ? 'bg-[#5865F2] shadow-[0_0_15px_rgba(88,101,242,0.4)]' : 'bg-white/10 hover:bg-white/20'
                }`}
        >
            <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-7' : 'translate-x-1'
                }`} />
        </button>
    );
}

// --- master toggle switch (for top-level module enable/disable) ---
export function MasterToggle({ checked, onChange, disabled, label }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    label: string;
}) {
    return (
        <div className={`p-6 rounded-2xl flex items-center justify-between transition-all duration-300 border-2 ${checked
            ? 'bg-[#5865F2]/10 border-[#5865F2]/50 shadow-[0_0_30px_rgba(88,101,242,0.1)]'
            : 'bg-white/[0.02] border-white/10'
            }`}>
            <div>
                <h2 className={`text-xl font-bold tracking-tight transition-colors ${checked ? 'text-white' : 'text-white/60'}`}>
                    {label}
                </h2>
                <p className={`text-sm mt-1 transition-colors ${checked ? 'text-white/70' : 'text-white/30'}`}>
                    {checked ? 'Module is armed and actively protecting the server.' : 'Module is currently disabled.'}
                </p>
            </div>
            <Toggle checked={checked} onChange={onChange} disabled={disabled} />
        </div>
    );
}

// --- card wrapper ---
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`rounded-xl border border-white/10 bg-[#111822]/90 backdrop-blur-xl p-6 sm:p-8 transition-all duration-300 hover:border-white/20 shadow-xl ${className}`}>
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
        <div className={`flex items-center justify-between gap-6 py-3 border-b border-white/[0.03] last:border-0 ${disabled ? 'opacity-50' : ''}`}>
            <div className="min-w-0 pr-4">
                <span className="text-base font-bold text-white/90">{label}</span>
                {hint && <p className="text-sm text-white/50 mt-1 leading-snug">{hint}</p>}
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
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
                {icon && <span className="text-[#5865F2]">{icon}</span>}
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-widest">{title}</h3>
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
            className="bg-[#0f1419] border border-white/15 rounded-xl px-4 py-2.5 text-base font-medium text-white focus:outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] transition-all disabled:opacity-50 appearance-none cursor-pointer hover:border-white/30 min-w-[140px]"
        >
            {options.map(o => (
                <option key={o.value} value={o.value} className="bg-[#111822] text-white py-2">{o.label}</option>
            ))}
        </select>
    );
}

// --- number input (premium) ---
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
                className="w-24 bg-[#0f1419] border border-white/15 rounded-xl px-4 py-2.5 text-base font-bold text-white text-center focus:outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] transition-all disabled:opacity-50 hover:border-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {suffix && <span className="text-sm font-medium text-white/40">{suffix}</span>}
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
        <div className="flex items-center gap-4 w-full py-2">
            <input
                type="range"
                value={value}
                min={min}
                max={max}
                step={step || 1}
                onChange={e => onChange(parseInt(e.target.value))}
                disabled={disabled}
                className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#5865F2] disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#5865F2] [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
            />
            {label && <span className="text-base font-bold text-[#5865F2] min-w-[5rem] text-right bg-[#5865F2]/10 px-3 py-1 rounded-lg">{label}</span>}
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
            className="w-full bg-[#0f1419] border border-white/15 rounded-xl px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] transition-all disabled:opacity-50 hover:border-white/30"
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
        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white/80 uppercase tracking-widest">{label}</span>
                <button
                    onClick={onAdd}
                    disabled={disabled}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#5865F2]/15 text-[#5865F2] hover:bg-[#5865F2]/30 transition-colors disabled:opacity-50"
                >
                    <Plus size={14} />
                    {addLabel || 'ADD NEW'}
                </button>
            </div>
            {ids.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-xl">
                    <p className="text-sm font-medium text-white/30">None configured</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {ids.map(id => (
                        <div key={id} className="flex items-center justify-between bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.02] rounded-xl px-4 py-2.5 group transition-colors">
                            <span className="text-sm font-mono font-medium text-white/80">{id}</span>
                            <button
                                onClick={() => onRemove(id)}
                                disabled={disabled}
                                className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                            >
                                <X size={16} />
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
        <div className="flex flex-wrap gap-3">
            {options.map(o => {
                const active = selected.includes(o.value);
                return (
                    <button
                        key={o.value}
                        type="button"
                        onClick={() => !disabled && toggle(o.value)}
                        disabled={disabled}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${active
                            ? 'bg-[#5865F2]/15 border-[#5865F2]/50 text-[#5865F2] shadow-[0_0_15px_rgba(88,101,242,0.15)]'
                            : 'bg-[#0f1419] border-white/10 text-white/50 hover:text-white hover:border-white/30'
                            } disabled:opacity-50`}
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
        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && add()}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 bg-[#0f1419] border border-white/15 rounded-xl px-4 py-2.5 text-sm font-medium text-white placeholder-white/30 focus:outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] transition-colors disabled:opacity-50 hover:border-white/30"
                />
                <button
                    onClick={add}
                    disabled={disabled || !input.trim()}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#5865F2]/15 text-[#5865F2] hover:bg-[#5865F2]/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <Plus size={16} /> ADD
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {items.length === 0 && <span className="text-sm font-medium text-white/20 italic">No items added</span>}
                {items.map(item => (
                    <span key={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-sm font-mono font-medium text-white shadow-sm">
                        {item}
                        <button onClick={() => onChange(items.filter(i => i !== item))} disabled={disabled} className="text-white/40 hover:text-red-400 transition-colors">
                            <X size={14} />
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
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-2 shadow-lg mb-8
                ${open
                    ? 'bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/30 hover:bg-[#5865F2]/20'
                    : 'text-white/60 hover:text-white bg-[#111822] hover:bg-white/5 border-white/10 hover:border-white/20'}`}
        >
            {open ? 'HIDE ADVANCED SETTINGS' : 'SHOW ADVANCED SETTINGS'}
            <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180 text-[#5865F2]' : ''}`} />
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
        <div className="sticky bottom-0 pt-6 pb-2 -mx-4 px-4 sm:-mx-8 sm:px-8 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent z-50">
            <button
                onClick={onSave}
                disabled={disabled || saving}
                className="w-full py-4 rounded-xl font-black text-base tracking-widest uppercase text-white bg-[#5865F2] hover:bg-[#4752c4] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(88,101,242,0.3)] hover:shadow-[0_0_40px_rgba(88,101,242,0.5)] border border-[#5865F2]/50"
            >
                {saving ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        SAVING CHANGES...
                    </>
                ) : (
                    <>
                        <Check size={20} />
                        SAVE CHANGES
                    </>
                )}
            </button>
        </div>
    );
}

// --- loading state ---
export function ConfigLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-[#5865F2]/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-[#5865F2] rounded-full border-t-transparent animate-spin absolute inset-0"></div>
            </div>
            <p className="text-sm font-bold text-white/50 uppercase tracking-widest animate-pulse">Loading Module Data...</p>
        </div>
    );
}

// --- helper to prompt for discord id ---
export function promptId(label: string): string | null {
    const id = prompt(`Enter ${label} Discord ID (17-20 numbers):`);
    if (id && /^\d{17,20}$/.test(id.trim())) return id.trim();
    if (id) alert('Invalid ID Format.\nDiscord IDs must be purely numeric and 17-20 digits long.');
    return null;
}
