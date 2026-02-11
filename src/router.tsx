// ═══════════════════════════════════════════════════════════════════════════
// ROUTER - Mobile-first navigation routes for ColdExperience CMS
// iOS Settings-style drill-down: Pages → Sections → Editor
// ═══════════════════════════════════════════════════════════════════════════

import { Routes, Route, Navigate } from 'react-router-dom';
import { PagesScreen } from './screens/PagesScreen';
import { SectionsScreen } from './screens/SectionsScreen';
import { EditorScreen } from './screens/EditorScreen';
import { LogsScreen } from './screens/LogsScreen';
import { SchemaCoverageScreen } from './screens/SchemaCoverageScreen';

export function AppRouter() {
    return (
        <Routes>
            {/* Root redirects to pages list */}
            <Route path="/" element={<Navigate to="/pages" replace />} />

            {/* Pages list - entry point */}
            <Route path="/pages" element={<PagesScreen />} />

            {/* Sections for a specific page */}
            <Route path="/pages/:pageId" element={<SectionsScreen />} />

            {/* Editor for a specific section */}
            <Route path="/pages/:pageId/sections/:sectionId" element={<EditorScreen />} />

            {/* Editor for a subsection (bonus route) */}
            <Route path="/pages/:pageId/sections/:sectionId/:subsectionId" element={<EditorScreen />} />

            {/* Advanced - Debug Logs */}
            <Route path="/advanced/logs" element={<LogsScreen />} />

            {/* Advanced - Schema Coverage (Ticket 8) */}
            <Route path="/advanced/schema" element={<SchemaCoverageScreen />} />

            {/* Fallback - redirect to pages */}
            <Route path="*" element={<Navigate to="/pages" replace />} />
        </Routes>
    );
}

export default AppRouter;
