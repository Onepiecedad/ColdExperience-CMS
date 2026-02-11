// ═══════════════════════════════════════════════════════════════════════════
// PAGES SCREEN - iOS Settings-style list of all website pages
// Mobile-first drill-down navigation entry point
// ═══════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { ChevronRight, Snowflake } from 'lucide-react';
import { WEBSITE_PAGES } from '../content/contentMap';
import { StructureCard } from '../components/StructureCard';
import { isEmailAllowed } from '../services/supabase';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export function PagesScreen() {
    const [showStructureCard, setShowStructureCard] = useState(false);

    // Check if user is allowed to see the Structure card
    useEffect(() => {
        const checkAccess = async () => {
            // Always show in dev mode
            if (import.meta.env.DEV) {
                setShowStructureCard(true);
                return;
            }

            // Check if user email is allowed
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email && isEmailAllowed(user.email)) {
                setShowStructureCard(true);
            }
        };

        checkAccess();
    }, []);

    return (
        <div className="min-h-screen bg-[#040810]">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0a1622]/95 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="px-4 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3f7ba7]/90 to-[#285a82] rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                        <Snowflake className="text-white" size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white">ColdExperience CMS</h1>
                        <p className="text-xs text-white/40">Select a page to edit</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-4 space-y-4">
                {/* Structure Card (admin only) */}
                {showStructureCard && (
                    <StructureCard />
                )}

                {/* Page List */}
                <div className="bg-[#0a1622]/60 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="divide-y divide-white/[0.04]">
                        {WEBSITE_PAGES.map((page) => (
                            <Link
                                key={page.id}
                                to={`/pages/${page.id}`}
                                className="flex items-center justify-between px-4 py-4 active:bg-white/[0.03] transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#3f7ba7]/20 border border-[#3f7ba7]/30 flex items-center justify-center">
                                        <span className="text-sm">
                                            {page.sections[0]?.icon || '📄'}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <span className="block text-[15px] font-medium text-white truncate">
                                            {page.label}
                                        </span>
                                        <span className="block text-xs text-white/40">
                                            {page.sections.length} sektioner
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-white/30 flex-shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center space-y-2">
                    <p className="text-xs text-white/30">
                        Tap a page to see its sections
                    </p>

                    {/* Advanced link (admin only) */}
                    {showStructureCard && (
                        <div className="flex items-center justify-center gap-4">
                            <Link
                                to="/advanced/logs"
                                className="text-xs text-white/20 hover:text-white/40 transition-colors"
                            >
                                Debug Log →
                            </Link>
                            <span className="text-white/10">|</span>
                            <Link
                                to="/advanced/schema"
                                className="text-xs text-white/20 hover:text-white/40 transition-colors"
                            >
                                Schema Coverage →
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default PagesScreen;
