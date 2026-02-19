// ═══════════════════════════════════════════════════════════════════════════
// TRANSLATION STATUS ICON — Visual indicator for translation completeness
// 🟢 Green = translated (content exists in compare language)
// ⚫ Gray  = untranslated (empty in compare language)
// Apple-inspired: subtle glow animation on the green dot
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';

type TranslationStatus = 'translated' | 'untranslated';

interface TranslationStatusIconProps {
    /** The value in the primary (editing) language */
    primaryValue: string;
    /** The value in the compare/reference language */
    compareValue: string;
    /** Optional size in pixels */
    size?: number;
    /** Show label text next to the dot */
    showLabel?: boolean;
}

function getStatus(_primaryValue: string, compareValue: string): TranslationStatus {
    // If compare language has content, it's translated
    if (compareValue?.trim()) return 'translated';
    // If primary has content but compare doesn't, it's untranslated
    return 'untranslated';
}

export const TranslationStatusIcon: React.FC<TranslationStatusIconProps> = ({
    primaryValue,
    compareValue,
    size = 8,
    showLabel = false,
}) => {
    const status = getStatus(primaryValue, compareValue);

    const config = {
        translated: {
            dotClass: 'bg-emerald-400',
            glowClass: 'shadow-[0_0_6px_rgba(52,211,153,0.5)]',
            label: 'Translated',
            labelClass: 'text-emerald-400/70',
        },
        untranslated: {
            dotClass: 'bg-white/20',
            glowClass: '',
            label: 'Missing',
            labelClass: 'text-white/30',
        },
    }[status];

    return (
        <div className="flex items-center gap-1.5" title={config.label}>
            <span
                className={`
                    inline-block rounded-full transition-all duration-500
                    ${config.dotClass} ${config.glowClass}
                `}
                style={{ width: size, height: size }}
            />
            {showLabel && (
                <span className={`text-[10px] font-medium ${config.labelClass}`}>
                    {config.label}
                </span>
            )}
        </div>
    );
};

export default TranslationStatusIcon;
