// ═══════════════════════════════════════════════════════════════════════════
// ROUTER - Preview-driven CMS navigation
// Default: PreviewEditorScreen (split preview + editor)
// Legacy /pages and /sections routes still available
// ═══════════════════════════════════════════════════════════════════════════

import { Routes, Route, Navigate } from 'react-router-dom';
import { PagesScreen } from './screens/PagesScreen';
import { SectionsScreen } from './screens/SectionsScreen';
import { EditorScreen } from './screens/EditorScreen';
import { PreviewEditorScreen } from './screens/PreviewEditorScreen';
import { LogsScreen } from './screens/LogsScreen';
import { SchemaCoverageScreen } from './screens/SchemaCoverageScreen';

export function AppRouter() {
    return (
        <Routes>
            {/* Root → Preview Editor (new default) */}
            <Route path="/" element={<Navigate to="/edit/home/sections/hero" replace />} />

            {/* Preview Editor Screen - unified split view */}
            <Route path="/edit/:pageId/sections/:sectionId" element={<PreviewEditorScreen />} />
            <Route path="/edit/:pageId/sections/:sectionId/:subsectionId" element={<PreviewEditorScreen />} />

            {/* Legacy routes (still accessible via direct URL) */}
            <Route path="/pages" element={<PagesScreen />} />
            <Route path="/pages/:pageId" element={<SectionsScreen />} />
            <Route path="/pages/:pageId/sections/:sectionId" element={<EditorScreen />} />
            <Route path="/pages/:pageId/sections/:sectionId/:subsectionId" element={<EditorScreen />} />

            {/* Advanced */}
            <Route path="/advanced/logs" element={<LogsScreen />} />
            <Route path="/advanced/schema" element={<SchemaCoverageScreen />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/edit/home/sections/hero" replace />} />
        </Routes>
    );
}

export default AppRouter;
