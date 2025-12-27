import React, { useState, ReactNode } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';

interface CollapsibleSectionProps {
    title: string;
    itemCount?: number;
    defaultExpanded?: boolean;
    children: ReactNode;
    isSaving?: boolean;
    isSaved?: boolean;
    onSaveAll?: () => void;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    itemCount,
    defaultExpanded = false,
    children,
    isSaving = false,
    isSaved = false,
    onSaveAll,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="glass-card overflow-hidden">
            {/* Premium Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all duration-300 group"
            >
                <div className="flex items-center gap-4">
                    {/* Animated Chevron */}
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        bg-cold-800/50 border border-cold-700/30
                        transition-all duration-300 group-hover:border-accent/30
                        ${isExpanded ? 'bg-accent/10 border-accent/20' : ''}
                    `}>
                        <ChevronDown
                            className={`w-4 h-4 text-cold-400 transition-transform duration-300 ${isExpanded ? 'rotate-0 text-accent-light' : '-rotate-90'}`}
                        />
                    </div>

                    {/* Title */}
                    <span className="font-semibold text-cold-100 tracking-tight">{title}</span>

                    {/* Item Count Badge */}
                    {itemCount !== undefined && (
                        <span className="badge">
                            {itemCount} {itemCount === 1 ? 'field' : 'fields'}
                        </span>
                    )}
                </div>

                {/* Save Status */}
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {isSaving && (
                        <span className="flex items-center gap-2 text-xs text-cold-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="hidden sm:inline">Saving...</span>
                        </span>
                    )}
                    {isSaved && !isSaving && (
                        <span className="flex items-center gap-2 text-xs text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Saved</span>
                        </span>
                    )}
                    {onSaveAll && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSaveAll();
                            }}
                            className="btn btn-secondary text-xs py-1.5 px-3"
                        >
                            Save All
                        </button>
                    )}
                </div>
            </button>

            {/* Content with Smooth Expand */}
            <div
                className={`
                    grid transition-all duration-500 ease-out
                    ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                `}
            >
                <div className="overflow-hidden">
                    <div className="p-5 pt-0">
                        {/* Subtle divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-cold-700/40 to-transparent mb-5" />
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollapsibleSection;
