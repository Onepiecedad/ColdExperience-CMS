// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT BAR - Non-clickable breadcrumb showing current editing location
// No links to legacy routes — navigation is handled by PreviewEditorScreen's
// SectionSelector dropdown.
// ═══════════════════════════════════════════════════════════════════════════

import { ChevronRight } from 'lucide-react';

interface ContextBarProps {
    pageLabel: string;
    pageId: string;
    sectionLabel: string;
    subsectionLabel?: string;
}

export function ContextBar({ pageLabel, sectionLabel, subsectionLabel }: ContextBarProps) {
    return (
        <div className="sticky top-0 z-40 bg-[#0a1622]/95 backdrop-blur-xl border-b border-white/[0.06]">
            {/* Breadcrumb row (non-clickable) */}
            <div className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-[13px] flex-wrap">
                    <span className="text-white/40">
                        Sidor
                    </span>
                    <ChevronRight size={12} className="text-white/30" />
                    <span className="text-white/40">
                        {pageLabel}
                    </span>
                    <ChevronRight size={12} className="text-white/30" />
                    <span className="text-[#5a9bc7] font-medium">{sectionLabel}</span>
                    {subsectionLabel && (
                        <>
                            <ChevronRight size={12} className="text-white/30" />
                            <span className="text-white font-medium">{subsectionLabel}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ContextBar;
