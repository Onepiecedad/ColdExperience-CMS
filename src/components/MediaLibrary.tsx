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
    Eye,
    Download,
    Play,
    Video,
    Pause,
    Volume2,
    VolumeX
} from 'lucide-react';
import { getMedia, uploadMedia, deleteMedia } from '../services/supabase';
import type { CmsMedia } from '../types';

export const MediaLibrary: React.FC = () => {
    const [media, setMedia] = useState<CmsMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<CmsMedia | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [videoMuted, setVideoMuted] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos'>('all');
    const videoRef = useRef<HTMLVideoElement>(null);

    // Helper function to check if media is a video
    const isVideo = (item: CmsMedia): boolean => {
        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
        const filename = item.filename.toLowerCase();
        const mimeType = item.mime_type?.toLowerCase() || '';
        return videoExtensions.some(ext => filename.endsWith(ext)) || mimeType.startsWith('video/');
    };

    // Filtered media based on active tab
    const filteredMedia = media.filter(item => {
        if (activeTab === 'all') return true;
        if (activeTab === 'videos') return isVideo(item);
        if (activeTab === 'images') return !isVideo(item);
        return true;
    });

    // Counts for tab badges
    const imageCount = media.filter(item => !isVideo(item)).length;
    const videoCount = media.filter(item => isVideo(item)).length;

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

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const data = await getMedia();
            setMedia(data);
        } catch (err) {
            console.error('Failed to fetch media:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const uploaded = await uploadMedia(file);
                setMedia(prev => [uploaded, ...prev]);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (item: CmsMedia) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await deleteMedia(item.id, item.storage_path);
            setMedia(prev => prev.filter(m => m.id !== item.id));
            setSelectedMedia(null);
        } catch (err) {
            console.error('Delete failed:', err);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-3" />
                    <p className="text-cold-400 text-sm">Loading media...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Premium Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                        <Image className="w-5 h-5 text-accent-light" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">
                        Media Library
                    </h1>
                </div>
                <p className="text-cold-400 text-sm">
                    Upload and manage images and videos for your website
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`
                        px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2
                        ${activeTab === 'all'
                            ? 'bg-accent/20 text-accent-light border border-accent/30 shadow-glow'
                            : 'bg-cold-800/30 text-cold-400 border border-cold-700/30 hover:bg-cold-800/50 hover:text-cold-200'
                        }
                    `}
                >
                    <FolderOpen size={16} />
                    All
                    <span className={`
                        px-2 py-0.5 rounded-md text-xs font-semibold
                        ${activeTab === 'all' ? 'bg-accent/30 text-accent-light' : 'bg-cold-700/50 text-cold-500'}
                    `}>
                        {media.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('images')}
                    className={`
                        px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2
                        ${activeTab === 'images'
                            ? 'bg-accent/20 text-accent-light border border-accent/30 shadow-glow'
                            : 'bg-cold-800/30 text-cold-400 border border-cold-700/30 hover:bg-cold-800/50 hover:text-cold-200'
                        }
                    `}
                >
                    <Image size={16} />
                    Images
                    <span className={`
                        px-2 py-0.5 rounded-md text-xs font-semibold
                        ${activeTab === 'images' ? 'bg-accent/30 text-accent-light' : 'bg-cold-700/50 text-cold-500'}
                    `}>
                        {imageCount}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`
                        px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2
                        ${activeTab === 'videos'
                            ? 'bg-accent/20 text-accent-light border border-accent/30 shadow-glow'
                            : 'bg-cold-800/30 text-cold-400 border border-cold-700/30 hover:bg-cold-800/50 hover:text-cold-200'
                        }
                    `}
                >
                    <Video size={16} />
                    Videos
                    <span className={`
                        px-2 py-0.5 rounded-md text-xs font-semibold
                        ${activeTab === 'videos' ? 'bg-accent/30 text-accent-light' : 'bg-cold-700/50 text-cold-500'}
                    `}>
                        {videoCount}
                    </span>
                </button>
            </div>

            {/* Upload Zone - Premium */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                    glass-card rounded-2xl transition-all duration-500 relative overflow-hidden
                    ${dragActive
                        ? 'border-accent bg-accent/5 scale-[1.01]'
                        : 'hover:border-cold-600/50'
                    }
                `}
            >
                {/* Animated gradient border on drag */}
                {dragActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/20 via-accent-light/20 to-accent/20 animate-pulse" />
                )}

                <div className="relative p-10 text-center">
                    {uploading ? (
                        <div className="animate-fade-in">
                            <div className="relative inline-block mb-4">
                                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                                <Loader2 className="w-14 h-14 text-accent animate-spin relative" />
                            </div>
                            <p className="text-cold-200 font-medium">Uploading files...</p>
                            <p className="text-cold-500 text-sm mt-1">Please wait</p>
                        </div>
                    ) : (
                        <>
                            <div className={`
                                inline-flex p-5 rounded-2xl mb-5 transition-all duration-300
                                ${dragActive
                                    ? 'bg-accent/20 border-accent/30'
                                    : 'bg-cold-800/30 border-cold-700/20'
                                }
                                border
                            `}>
                                <Upload className={`w-10 h-10 transition-colors ${dragActive ? 'text-accent-light' : 'text-cold-500'}`} />
                            </div>
                            <p className="text-cold-200 font-medium mb-2">
                                {dragActive ? 'Drop files to upload' : 'Drag and drop images here'}
                            </p>
                            <p className="text-cold-500 text-sm mb-5">
                                or click the button below to browse
                            </p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleUpload(e.target.files)}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="btn btn-primary cursor-pointer"
                            >
                                <FolderOpen size={18} />
                                Browse Files
                            </label>
                            <p className="text-xs text-cold-600 mt-5">
                                Supported formats: JPG, PNG, WebP, GIF • Max size: 10MB
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Media Grid - Premium */}
            {media.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <div className="inline-flex p-5 rounded-2xl bg-cold-800/30 border border-cold-700/20 mb-5">
                        <Image className="w-10 h-10 text-cold-600" />
                    </div>
                    <p className="text-cold-300 font-medium mb-1">No media yet</p>
                    <p className="text-sm text-cold-500">
                        Upload your first file to get started
                    </p>
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <div className="inline-flex p-5 rounded-2xl bg-cold-800/30 border border-cold-700/20 mb-5">
                        {activeTab === 'videos' ? (
                            <Video className="w-10 h-10 text-cold-600" />
                        ) : (
                            <Image className="w-10 h-10 text-cold-600" />
                        )}
                    </div>
                    <p className="text-cold-300 font-medium mb-1">
                        No {activeTab === 'videos' ? 'videos' : 'images'} found
                    </p>
                    <p className="text-sm text-cold-500">
                        {activeTab === 'videos'
                            ? 'Upload some video files or switch to "All" to see all media'
                            : 'Upload some images or switch to "All" to see all media'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredMedia.map((item, index) => {
                        const itemIsVideo = isVideo(item);
                        return (
                            <div
                                key={item.id}
                                onClick={() => setSelectedMedia(item)}
                                className="glass-card overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-glow animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="aspect-square bg-cold-900 relative overflow-hidden">
                                    {itemIsVideo ? (
                                        <>
                                            {/* Video thumbnail with first frame */}
                                            <video
                                                src={item.public_url}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                muted
                                                preload="metadata"
                                                playsInline
                                            />
                                            {/* Play button overlay for videos */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-cold-950/30">
                                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-lg group-hover:scale-110 group-hover:bg-accent/30 transition-all duration-300">
                                                    <Play size={28} className="text-white ml-1" fill="white" />
                                                </div>
                                            </div>
                                            {/* Video indicator badge */}
                                            <div className="absolute top-2 left-2">
                                                <div className="px-2 py-1 bg-accent/80 backdrop-blur-sm rounded-md flex items-center gap-1">
                                                    <Video size={12} className="text-white" />
                                                    <span className="text-xs text-white font-medium">VIDEO</span>
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
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-cold-950/90 via-cold-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                                        <p className="text-white text-sm font-medium truncate">{item.filename}</p>
                                        <p className="text-cold-400 text-xs">{formatBytes(item.size_bytes)}</p>
                                    </div>
                                    {/* Quick action */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
                                            <Eye size={14} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Media Detail Modal - Premium */}
            {selectedMedia && (() => {
                const selectedIsVideo = isVideo(selectedMedia);
                return (
                    <div
                        className="fixed inset-0 bg-cold-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
                        onClick={handleCloseModal}
                    >
                        <div
                            className="glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-cold-700/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-cold-800/50 border border-cold-700/30">
                                        {selectedIsVideo ? (
                                            <Video size={18} className="text-accent-light" />
                                        ) : (
                                            <Image size={18} className="text-accent-light" />
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-white">
                                        {selectedIsVideo ? 'Video Player' : 'Image Details'}
                                    </h3>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 rounded-lg text-cold-400 hover:text-white hover:bg-cold-800/50 transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Media Preview */}
                            <div className="p-5">
                                <div className="bg-cold-900 rounded-xl overflow-hidden mb-5 relative">
                                    {selectedIsVideo ? (
                                        <>
                                            {/* Video Player */}
                                            <video
                                                ref={videoRef}
                                                src={selectedMedia.public_url}
                                                className="w-full max-h-[400px] object-contain"
                                                muted={videoMuted}
                                                playsInline
                                                onEnded={() => setVideoPlaying(false)}
                                                onClick={toggleVideoPlay}
                                            />
                                            {/* Video Controls Overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cold-950/90 to-transparent">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {/* Play/Pause Button */}
                                                        <button
                                                            onClick={toggleVideoPlay}
                                                            className="p-3 bg-accent/20 hover:bg-accent/40 border border-accent/30 rounded-full transition-all"
                                                        >
                                                            {videoPlaying ? (
                                                                <Pause size={20} className="text-white" fill="white" />
                                                            ) : (
                                                                <Play size={20} className="text-white ml-0.5" fill="white" />
                                                            )}
                                                        </button>
                                                        {/* Mute/Unmute Button */}
                                                        <button
                                                            onClick={toggleVideoMute}
                                                            className="p-2.5 bg-cold-800/50 hover:bg-cold-700/50 border border-cold-600/30 rounded-full transition-all"
                                                        >
                                                            {videoMuted ? (
                                                                <VolumeX size={18} className="text-cold-300" />
                                                            ) : (
                                                                <Volume2 size={18} className="text-white" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="text-sm text-cold-400">
                                                        Click video to {videoPlaying ? 'pause' : 'play'}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={selectedMedia.public_url}
                                            alt={selectedMedia.alt_text_en || selectedMedia.filename}
                                            className="w-full max-h-[400px] object-contain"
                                        />
                                    )}
                                </div>

                                {/* Info Grid */}
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-cold-500 uppercase tracking-wider font-medium block mb-1">Filename</label>
                                            <p className="text-cold-100 font-medium">{selectedMedia.filename}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-lg bg-cold-800/30 border border-cold-700/20">
                                                <label className="text-xs text-cold-500 uppercase tracking-wider font-medium block mb-1">Size</label>
                                                <p className="text-cold-100 font-medium">{formatBytes(selectedMedia.size_bytes)}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-cold-800/30 border border-cold-700/20">
                                                <label className="text-xs text-cold-500 uppercase tracking-wider font-medium block mb-1">Type</label>
                                                <p className="text-cold-100 font-medium">{selectedMedia.mime_type || '—'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-cold-500 uppercase tracking-wider font-medium block mb-2">Public URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={selectedMedia.public_url}
                                                readOnly
                                                className="input flex-1 text-sm font-mono"
                                            />
                                            <button
                                                onClick={() => copyUrl(selectedMedia.public_url, selectedMedia.id)}
                                                className={`
                                                    btn transition-all
                                                    ${copiedId === selectedMedia.id
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'btn-secondary'
                                                    }
                                                `}
                                            >
                                                {copiedId === selectedMedia.id ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 border-t border-cold-700/30 flex justify-between">
                                <button
                                    onClick={() => handleDelete(selectedMedia)}
                                    className="btn bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30"
                                >
                                    <Trash2 size={16} />
                                    Delete {selectedIsVideo ? 'Video' : 'Image'}
                                </button>
                                <div className="flex gap-2">
                                    <a
                                        href={selectedMedia.public_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        <Download size={16} />
                                        Download
                                    </a>
                                    <button
                                        onClick={handleCloseModal}
                                        className="btn btn-primary"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
