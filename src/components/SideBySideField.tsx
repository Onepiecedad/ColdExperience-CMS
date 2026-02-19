// ═══════════════════════════════════════════════════════════════════════════
// SIDE-BY-SIDE FIELD — Two-column translation editor
// Left: editable primary language | Right: read-only reference language
// Apple-inspired: frosted glass panels, smooth transitions, clean typography
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Edit3 } from 'lucide-react';
import type { Language } from '../types';
import { LANGUAGES } from '../content/contentMap';

interface SideBySideFieldProps {
    /** Content item metadata */
    fieldType: string;
    /** Primary language code (editable) */
    primaryLang: Language;
    /** Compare language code (read-only) */
    compareLang: Language;
    /** Current value in primary language */
    value: string;
    /** Value in compare language */
    compareValue: string;
    /** Change handler for the primary language field */
    onChange: (value: string) => void;
    /** Whether this field has an unsaved draft */
    hasDraft?: boolean;
}

function getLangInfo(code: Language) {
    return LANGUAGES.find(l => l.code === code) || { flag: '🏳️', label: code };
}

export const SideBySideField: React.FC<SideBySideFieldProps> = ({
    fieldType,
    primaryLang,
    compareLang,
    value,
    compareValue,
    onChange,
    hasDraft = false,
}) => {
    const primaryInfo = getLangInfo(primaryLang);
    const compareInfo = getLangInfo(compareLang);

    const isMultiline = fieldType === 'html' || fieldType === 'richtext' || fieldType === 'textarea' || fieldType === 'array';
    const isArray = fieldType === 'array';

    // Shared input styles
    const inputBase = `
        w-full bg-white/[0.03] border rounded-lg text-sm text-white/90
        placeholder-white/30 focus:outline-none transition-colors
    `;
    const editableStyle = `${inputBase} border-white/[0.08] focus:border-[#5a9bc7]/50`;
    const readonlyStyle = `${inputBase} border-white/[0.04] bg-white/[0.01] text-white/50 cursor-default`;

    return (
        <div className="grid grid-cols-2 gap-3">
            {/* ── Primary Language (Editable) ── */}
            <div>
                <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs">{primaryInfo.flag}</span>
                    <span className="text-[11px] font-medium text-white/50">{primaryInfo.label}</span>
                    {hasDraft && (
                        <span className="flex items-center gap-0.5 px-1 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px] font-medium">
                            <Edit3 size={8} />
                            Draft
                        </span>
                    )}
                </div>
                {isMultiline ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`${editableStyle} min-h-[100px] p-3 resize-y ${isArray ? 'font-mono' : ''}`}
                        placeholder="Enter content..."
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`${editableStyle} px-3 py-2.5`}
                        placeholder="Enter text..."
                    />
                )}
            </div>

            {/* ── Compare Language (Read-only Reference) ── */}
            <div>
                <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs">{compareInfo.flag}</span>
                    <span className="text-[11px] font-medium text-white/30">{compareInfo.label}</span>
                    <span className="text-[9px] text-white/20 italic">reference</span>
                </div>
                {isMultiline ? (
                    <textarea
                        value={compareValue}
                        readOnly
                        className={`${readonlyStyle} min-h-[100px] p-3 resize-none ${isArray ? 'font-mono' : ''}`}
                        placeholder="—"
                    />
                ) : (
                    <input
                        type="text"
                        value={compareValue}
                        readOnly
                        className={`${readonlyStyle} px-3 py-2.5`}
                        placeholder="—"
                    />
                )}
            </div>
        </div>
    );
};

export default SideBySideField;
