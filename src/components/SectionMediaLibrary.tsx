import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Image,
    Upload,
    Trash2,
    Loader2,
    Copy,
    Check,
    FolderOpen,
    X,
    Download,
    Play,
    Video,
    Pause,
    Volume2,
    VolumeX,
    Plus,
    Link2,
    Unlink
} from 'lucide-react';
import {
    getMediaBySection,
    getMedia,
    uploadMediaToSection,
    deleteMedia,
    assignMediaToSection,
    unassignMedia
} from '../services/supabase';
import type { CmsMedia } from '../types';

interface SectionMediaLibraryProps {
    pageId: string;
    sectionId: string;
    pageName: string;
    sectionName: string;
}

export const SectionMediaLibrary: React.FC<SectionMediaLibraryProps> = ({
    pageId,
    sectionId,
    pageName,
    sectionName
}) => {
    const [sectionMedia, setSectionMedia] = useState<CmsMedia[]>([]);
    const [allMedia, setAllMedia] = useState<CmsMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<CmsMedia | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [videoMuted, setVideoMuted] = useState(true);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Helper function to check if media is a video
    const isVideo = (item: CmsMedia): boolean => {
        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
        const filename = item.filename.toLowerCase();
        const mimeType = item.mime_type?.toLowerCase() || '';
        return videoExtensions.some(ext => filename.endsWith(ext)) || mimeType.startsWith('video/');
    };

    // Toggle video playback
    const toggleVideoPlay = () => {
        if (videoRef.current) {
            if (videoPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setVideoPlaying(!videoPlaying);
        }
    };

    // Toggle video mute
    const toggleVideoMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoMuted;
            setVideoMuted(!videoMuted);
        }
    };

    // Reset video state when modal closes
    const handleCloseModal = () => {
        setSelectedMedia(null);
        setVideoPlaying(false);
        setVideoMuted(true);
    };

    // Fetch media for this section
    const fetchSectionMedia = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMediaBySection(pageId, sectionId);
            setSectionMedia(data);
        } catch (err) {
            console.error('Failed to fetch section media:', err);
        } finally {
            setLoading(false);
        }
    }, [pageId, sectionId]);

    // Fetch all media for the picker
    const fetchAllMedia = async () => {
        try {
            const data = await getMedia();
            // Filter out media already assigned to this section
            const availableMedia = data.filter(
                m => !(m.page_id === pageId && m.section_id === sectionId)
            );
            setAllMedia(availableMedia);
        } catch (err) {
            console.error('Failed to fetch all media:', err);
        }
    };

    useEffect(() => {
        fetchSectionMedia();
    }, [fetchSectionMedia]);

    // Handle file upload to this section
    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const uploaded = await uploadMediaToSection(file, pageId, sectionId);
                setSectionMedia(prev => [uploaded, ...prev]);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    // Handle deleting media
    const handleDelete = async (item: CmsMedia) => {
        if (!confirm('Are you sure you want to delete this media?')) return;

        try {
            await deleteMedia(item.id, item.storage_path);
            setSectionMedia(prev => prev.filter(m => m.id !== item.id));
            setSelectedMedia(null);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    // Handle assigning media from the global library
    const handleAssignMedia = async (item: CmsMedia) => {
        try {
            await assignMediaToSection(item.id, pageId, sectionId);
            // Update local state
            setSectionMedia(prev => [{ ...item, page_id: pageId, section_id: sectionId }, ...prev]);
            setAllMedia(prev => prev.filter(m => m.id !== item.id));
        } catch (err) {
            console.error('Failed to assign media:', err);
        }
    };

    // Handle unassigning media from this section
    const handleUnassign = async (item: CmsMedia) => {
        try {
            await unassignMedia(item.id);
            setSectionMedia(prev => prev.filter(m => m.id !== item.id));
            setSelectedMedia(null);
        } catch (err) {
            console.error('Failed to unassign media:', err);
        }
    };

    const copyUrl = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleUpload(e.dataTransfer.files);
    }, []);

    const formatBytes = (bytes: number | null): string => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Open media picker and load all media
    const openMediaPicker = () => {
        fetchAllMedia();
        setShowMediaPicker(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#5a9bc7] mx-auto mb-2" />
                    <p className="text-white/40 text-sm">Loading section media...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#3f7ba7]/10 border border-[#3f7ba7]/20">
                        <Image className="w-4 h-4 text-[#5a9bc7]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">
                            Section Media
                        </h3>
                        <p className="text-xs text-white/40">
                            {sectionMedia.length} file{sectionMedia.length !== 1 ? 's' : ''} • {pageName} › {sectionName}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={openMediaPicker}
                        className="btn btn-secondary flex items-center gap-2 text-xs"
                    >
                        <Link2 size={14} />
                        Link Existing
                    </button>
                </div>
            </div>

            {/* Upload Zone - Compact */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 text-center
                    ${dragActive
                        ? 'border-[#3f7ba7] bg-[#3f7ba7]/10'
                        : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02]'
                    }
                `}
            >
                {uploading ? (
                    <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 text-[#5a9bc7] animate-spin" />
                        <span className="text-white/60 text-sm">Uploading to {sectionName}...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className={`p-3 rounded-xl ${dragActive ? 'bg-[#3f7ba7]/20' : 'bg-white/[0.03]'} border border-white/[0.06]`}>
                            <Upload className={`w-5 h-5 ${dragActive ? 'text-[#5a9bc7]' : 'text-white/40'}`} />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm mb-1">
                                {dragActive ? 'Drop files here' : 'Drag and drop or '}
                                {!dragActive && (
                                    <label className="text-[#5a9bc7] hover:text-[#7ab8e0] cursor-pointer underline underline-offset-2">
                                        browse
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            onChange={(e) => handleUpload(e.target.files)}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </p>
                            <p className="text-white/30 text-xs">
                                Images & videos for this section only
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Grid */}
            {sectionMedia.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/[0.08] rounded-xl bg-white/[0.01]">
                    <div className="inline-flex p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                        <FolderOpen className="w-6 h-6 text-white/30" />
                    </div>
                    <p className="text-white/40 text-sm mb-1">No media in this section</p>
                    <p className="text-white/25 text-xs">
                        Upload files or link existing ones from library
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {sectionMedia.map((item, index) => {
                        const itemIsVideo = isVideo(item);
                        return (
                            <div
                                key={item.id}
                                onClick={() => setSelectedMedia(item)}
                                className="glass-card overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-glow animate-fade-in rounded-xl border border-white/[0.06]"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="aspect-square bg-[#0a1622] relative overflow-hidden">
                                    {itemIsVideo ? (
                                        <>
                                            <video
                                                src={item.public_url}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                muted
                                                preload="metadata"
                                                playsInline
                                                onLoadedMetadata={(e) => {
                                                    // Try to show first frame as poster
                                                    const video = e.target as HTMLVideoElement;
                                                    video.currentTime = 0.1;
                                                }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 group-hover:scale-110 group-hover:bg-[#3f7ba7]/30 transition-all duration-300">
                                                    <Play size={20} className="text-white ml-0.5" fill="white" />
                                                </div>
                                            </div>
                                            <div className="absolute top-2 left-2">
                                                <div className="px-1.5 py-0.5 bg-[#3f7ba7]/80 backdrop-blur-sm rounded flex items-center gap-1">
                                                    <Video size={10} className="text-white" />
                                                    <span className="text-[10px] text-white font-medium">VIDEO</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={item.public_url}
                                            alt={item.alt_text_en || item.filename}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    )}
                                    {/* Delete button - top right, visible on hover */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 backdrop-blur-sm border border-red-400/30 z-10"
                                        title="Delete media"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                {/* Always visible filename bar at bottom */}
                                <div className="px-2 py-1.5 bg-[#0a1622] border-t border-white/[0.06]">
                                    <p className="text-white/70 text-[11px] font-medium truncate" title={item.filename}>
                                        {item.filename}
                                    </p>
                                    <p className="text-white/40 text-[9px]">{formatBytes(item.size_bytes)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Media Detail Modal */}
            {selectedMedia && (() => {
                const selectedIsVideo = isVideo(selectedMedia);
                return (
                    <div
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={handleCloseModal}
                    >
                        <div
                            className="bg-[#0a1622] border border-white/[0.08] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                                        {selectedIsVideo ? (
                                            <Video size={16} className="text-[#5a9bc7]" />
                                        ) : (
                                            <Image size={16} className="text-[#5a9bc7]" />
                                        )}
                                    </div>
                                    <h3 className="font-medium text-white text-sm">
                                        {selectedIsVideo ? 'Video Player' : 'Image Details'}
                                    </h3>
                                    <span className="px-2 py-0.5 text-[10px] font-medium bg-[#3f7ba7]/20 text-[#5a9bc7] rounded border border-[#3f7ba7]/30">
                                        {sectionName}
                                    </span>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Media Preview */}
                            <div className="p-4">
                                <div className="bg-black/30 rounded-xl overflow-hidden mb-4 relative">
                                    {selectedIsVideo ? (
                                        <>
                                            <video
                                                ref={videoRef}
                                                src={selectedMedia.public_url}
                                                className="w-full max-h-[350px] object-contain"
                                                muted={videoMuted}
                                                playsInline
                                                onEnded={() => setVideoPlaying(false)}
                                                onClick={toggleVideoPlay}
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={toggleVideoPlay}
                                                            className="p-2 bg-[#3f7ba7]/30 hover:bg-[#3f7ba7]/50 border border-[#3f7ba7]/40 rounded-full transition-all"
                                                        >
                                                            {videoPlaying ? (
                                                                <Pause size={16} className="text-white" fill="white" />
                                                            ) : (
                                                                <Play size={16} className="text-white ml-0.5" fill="white" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={toggleVideoMute}
                                                            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all"
                                                        >
                                                            {videoMuted ? (
                                                                <VolumeX size={14} className="text-white/70" />
                                                            ) : (
                                                                <Volume2 size={14} className="text-white" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={selectedMedia.public_url}
                                            alt={selectedMedia.alt_text_en || selectedMedia.filename}
                                            className="w-full max-h-[350px] object-contain"
                                        />
                                    )}
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium block mb-1">Filename</label>
                                        <p className="text-white/80 text-sm font-medium truncate">{selectedMedia.filename}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                            <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium block mb-0.5">Size</label>
                                            <p className="text-white/80 text-xs font-medium">{formatBytes(selectedMedia.size_bytes)}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                            <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium block mb-0.5">Type</label>
                                            <p className="text-white/80 text-xs font-medium truncate">{selectedMedia.mime_type || '—'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* URL */}
                                <div className="mt-4">
                                    <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium block mb-1.5">Public URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={selectedMedia.public_url}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white/70 text-xs font-mono"
                                        />
                                        <button
                                            onClick={() => copyUrl(selectedMedia.public_url, selectedMedia.id)}
                                            className={`px-3 py-2 rounded-lg text-sm transition-all ${copiedId === selectedMedia.id
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-white/[0.05] text-white/60 border border-white/[0.1] hover:bg-white/[0.1]'
                                                }`}
                                        >
                                            {copiedId === selectedMedia.id ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-white/[0.06] flex justify-between">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUnassign(selectedMedia)}
                                        className="btn flex items-center gap-2 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                                    >
                                        <Unlink size={14} />
                                        Unlink from Section
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedMedia)}
                                        className="btn flex items-center gap-2 text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={selectedMedia.public_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary flex items-center gap-2 text-xs"
                                    >
                                        <Download size={14} />
                                        Download
                                    </a>
                                    <button
                                        onClick={handleCloseModal}
                                        className="btn btn-primary text-xs"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Media Picker Modal - Link existing media */}
            {showMediaPicker && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowMediaPicker(false)}
                >
                    <div
                        className="bg-[#0a1622] border border-white/[0.08] rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#3f7ba7]/10 border border-[#3f7ba7]/20">
                                    <Link2 size={16} className="text-[#5a9bc7]" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white text-sm">Link Existing Media</h3>
                                    <p className="text-xs text-white/40">Select media to add to {sectionName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMediaPicker(false)}
                                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Media Grid */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {allMedia.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-white/40">No available media to link</p>
                                    <p className="text-white/25 text-sm mt-1">All media is already assigned or upload new files directly</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                    {allMedia.map((item) => {
                                        const itemIsVideo = isVideo(item);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleAssignMedia(item)}
                                                className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/[0.08] hover:border-[#3f7ba7]/50 transition-all hover:scale-[1.03]"
                                            >
                                                <div className="aspect-square bg-black/30">
                                                    {itemIsVideo ? (
                                                        <>
                                                            <video
                                                                src={item.public_url}
                                                                className="w-full h-full object-cover"
                                                                muted
                                                                preload="metadata"
                                                            />
                                                            <div className="absolute top-1 left-1">
                                                                <div className="px-1 py-0.5 bg-[#3f7ba7]/80 rounded text-[8px] text-white font-medium">
                                                                    VIDEO
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <img
                                                            src={item.public_url}
                                                            alt={item.filename}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                </div>
                                                {/* Hover overlay with plus icon */}
                                                <div className="absolute inset-0 bg-[#3f7ba7]/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                    <div className="p-2 bg-white rounded-full">
                                                        <Plus size={16} className="text-[#3f7ba7]" />
                                                    </div>
                                                </div>
                                                {/* Section info if already assigned elsewhere */}
                                                {item.page_id && (
                                                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/70 text-[8px] text-white/60 truncate">
                                                        {item.page_id}/{item.section_id}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/[0.06] flex justify-end">
                            <button
                                onClick={() => setShowMediaPicker(false)}
                                className="btn btn-secondary text-xs"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionMediaLibrary;
