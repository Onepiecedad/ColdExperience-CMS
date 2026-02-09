// Re-export all Supabase functions from services
// This file provides backward compatibility for imports from ./lib/supabase

export {
    supabase,
    signInWithMagicLink,
    signInWithGoogle,
    isEmailAllowed,
    signOut,
    getCurrentUser,
    getPages,
    getContentByPage,
    updateContent,
    createContent,
    getPackages,
    updatePackage,
    updatePackageHighlights,
    getMedia,
    uploadMedia,
    deleteMedia,
    getMediaBySection,
    getUnassignedMedia,
    uploadMediaToSection,
    assignMediaToSection,
    unassignMedia,
    getSettings,
    updateSetting,
} from '../services/supabase';
