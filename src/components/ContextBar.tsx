// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT BAR - Sticky breadcrumb showing current editing location
// Always visible so Gustav knows exactly what he's editing
// ═══════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface ContextBarProps {
    pageLabel: string;
    pageId: string;
    sectionLabel: string;
    subsectionLabel?: string;
}

export function ContextBar({ pageLabel, pageId, sectionLabel, subsectionLabel }: ContextBarProps) {
    return (
        <div className="sticky top-0 z-40 bg-[#0a1622]/95 backdrop-blur-xl border-b border-white/[0.06]">
            {/* Back button row */}
            <div className="px-4 py-3 flex items-center gap-2">
                <Link
                    to={`/pages/${pageId}`}
                    className="flex items-center gap-1 text-[#5a9bc7] active:opacity-70 transition-opacity -ml-1"
                >
                    <ChevronLeft size={24} />
                    <span className="text-[15px]">Sektioner</span>
                </Link>
            </div>

            {/* Breadcrumb row */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-1.5 text-[13px] flex-wrap">
                    <Link
                        to="/pages"
                        className="text-white/40 hover:text-white/60 transition-colors"
                    >
                        Sidor
                    </Link>
                    <ChevronRight size={12} className="text-white/30" />
                    <Link
                        to={`/pages/${pageId}`}
                        className="text-white/40 hover:text-white/60 transition-colors"
                    >
                        {pageLabel}
                    </Link>
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
