// ═══════════════════════════════════════════════════════════════════════════
// ROUTER - Preview-driven CMS navigation
// Default: PreviewEditorScreen (split preview + editor)
// Legacy /pages routes redirect to /edit/ equivalents
// ═══════════════════════════════════════════════════════════════════════════

import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { PreviewEditorScreen } from './screens/PreviewEditorScreen';
import { LogsScreen } from './screens/LogsScreen';
import { SchemaCoverageScreen } from './screens/SchemaCoverageScreen';
import { getPageById } from './content/contentMap';

// Helper: redirect /pages/:pageId to /edit/:pageId/sections/{firstSection}
function LegacySectionsRedirect() {
    const { pageId } = useParams<{ pageId: string }>();
    const page = getPageById(pageId || 'home');
    const firstSection = page?.sections?.[0]?.id || 'hero';
    return <Navigate to={`/edit/${pageId}/sections/${firstSection}`} replace />;
}

// Helper: redirect /pages/:pageId/sections/:sectionId to /edit/ equivalent
function LegacyEditorRedirect() {
    const { pageId, sectionId, subsectionId } = useParams<{
        pageId: string;
        sectionId: string;
        subsectionId?: string;
    }>();
    const path = subsectionId
        ? `/edit/${pageId}/sections/${sectionId}/${subsectionId}`
        : `/edit/${pageId}/sections/${sectionId}`;
    return <Navigate to={path} replace />;
}

export function AppRouter() {
    return (
        <Routes>
            {/* Root → Preview Editor (default) */}
            <Route path="/" element={<Navigate to="/edit/home/sections/hero" replace />} />

            {/* Preview Editor Screen - unified split view */}
            <Route path="/edit/:pageId/sections/:sectionId" element={<PreviewEditorScreen />} />
            <Route path="/edit/:pageId/sections/:sectionId/:subsectionId" element={<PreviewEditorScreen />} />

            {/* Legacy routes → redirect to /edit/ equivalents */}
            <Route path="/pages" element={<Navigate to="/edit/home/sections/hero" replace />} />
            <Route path="/pages/:pageId" element={<LegacySectionsRedirect />} />
            <Route path="/pages/:pageId/sections/:sectionId" element={<LegacyEditorRedirect />} />
            <Route path="/pages/:pageId/sections/:sectionId/:subsectionId" element={<LegacyEditorRedirect />} />

            {/* Advanced */}
            <Route path="/advanced/logs" element={<LogsScreen />} />
            <Route path="/advanced/schema" element={<SchemaCoverageScreen />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/edit/home/sections/hero" replace />} />
        </Routes>
    );
}

export default AppRouter;
