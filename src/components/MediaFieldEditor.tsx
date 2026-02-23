import React, { useState, useCallback, useRef } from 'react';
import {
    Image,
    Upload,
    Link,
    FolderOpen,
    X,
    Loader2,
    Check,
    Pencil,
    Video,
    Play,
    Trash2
} from 'lucide-react';
import { getMedia, uploadMedia } from '../services/supabase';
import type { CmsMedia } from '../types';

interface MediaFieldEditorProps {
    /** Current URL value (or null/empty if none) */
    value: string | null;
    /** Called with the new URL when user confirms a change */
    onChange: (url: string) => void;
    /** Optional label shown above the preview */
    label?: string;
    /** Optional resolved URL used only for preview display (e.g. relative paths prefixed with site base) */
    previewUrl?: string;
}

type Tab = 'upload' | 'url' | 'library';

const isVideoUrl = (url: string): boolean => {
    const lower = url.toLowerCase();
    return ['.mp4', '.webm', '.mov', '.avi', '.mkv'].some(ext => lower.endsWith(ext));
};

export const MediaFieldEditor: React.FC<MediaFieldEditorProps> = ({
    value,
    onChange,
    label,
    previewUrl,
}) => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('upload');

    // Upload tab state
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // URL tab state
    const [urlInput, setUrlInput] = useState(value || '');

    // Library tab state
    const [libraryMedia, setLibraryMedia] = useState<CmsMedia[]>([]);
    const [libraryLoading, setLibraryLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const openModal = () => {
        setUrlInput(value || '');
        setActiveTab('upload');
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setDragActive(false);
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const uploaded = await uploadMedia(files[0]);
            onChange(uploaded.public_url);
            closeModal();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFileUpload(e.dataTransfer.files);
    }, []);

    const handleUrlConfirm = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            closeModal();
        }
    };

    const handleTabChange = async (tab: Tab) => {
        setActiveTab(tab);
        if (tab === 'library' && libraryMedia.length === 0) {
            setLibraryLoading(true);
            try {
                const data = await getMedia();
                setLibraryMedia(data);
            } catch (err) {
                console.error('Failed to load library:', err);
            } finally {
                setLibraryLoading(false);
            }
        }
    };

    const handlePickFromLibrary = (item: CmsMedia) => {
        onChange(item.public_url);
        closeModal();
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    const hasMedia = !!value;
    const mediaIsVideo = hasMedia && isVideoUrl(value!);

    return (
        <>
            {/* Preview Card */}
            <div className="space-y-1.5">
                {label && (
                    <label className="text-xs text-cold-500 uppercase tracking-wider font-medium block">
                        {label}
                    </label>
                )}
                <div
                    onClick={openModal}
                    className="relative group cursor-pointer rounded-xl border border-cold-700/30 overflow-hidden bg-cold-900 transition-all duration-200 hover:border-accent/40 hover:shadow-glow"
                    style={{ minHeight: '120px' }}
                >
                    {hasMedia ? (
                        <>
                            {mediaIsVideo ? (
                                <>
                                    <video
                                        src={previewUrl || value!}
                                        className="w-full h-32 object-cover"
                                        muted
                                        preload="metadata"
                                        playsInline
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-cold-950/30">
                                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                                            <Play size={20} className="text-white ml-0.5" fill="white" />
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <div className="px-1.5 py-0.5 bg-accent/80 backdrop-blur-sm rounded flex items-center gap-1">
                                            <Video size={10} className="text-white" />
                                            <span className="text-[10px] text-white font-medium">VIDEO</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <img
                                    src={previewUrl || value!}
                                    alt=""
                                    className="w-full h-32 object-cover"
                                />
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-cold-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <div className="flex items-center gap-2 text-white text-sm font-medium">
                                    <Pencil size={16} />
                                    Change media
                                </div>
                            </div>

                            {/* Clear button */}
                            <button
                                onClick={handleClear}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 backdrop-blur-sm border border-red-400/30"
                                title="Remove media"
                            >
                                <Trash2 size={12} />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 gap-2 text-cold-500 group-hover:text-cold-300 transition-colors">
                            <div className="p-3 rounded-xl bg-cold-800/30 border border-cold-700/20 group-hover:border-accent/30 transition-colors">
                                <Image size={20} />
                            </div>
                            <span className="text-xs">Click to add media</span>
                        </div>
                    )}
                </div>

                {/* URL display below preview */}
                {hasMedia && (
                    <p className="text-xs text-cold-600 font-mono truncate px-1" title={value!}>
                        {value}
                    </p>
                )}
            </div>

            {/* Edit Modal */}
            {open && (
                <div
                    className="fixed inset-0 bg-cold-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-cold-900 border border-cold-700/40 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-cold-700/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                                    <Image size={16} className="text-accent-light" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-sm">Edit Media</h3>
                                    <p className="text-xs text-cold-500">Upload a file, enter a URL, or pick from library</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg text-cold-400 hover:text-white hover:bg-cold-800/50 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 px-5 pt-4">
                            {(['upload', 'url', 'library'] as Tab[]).map((tab) => {
                                const icons = { upload: Upload, url: Link, library: FolderOpen };
                                const labels = { upload: 'Upload File', url: 'Enter URL', library: 'Media Library' };
                                const Icon = icons[tab];
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => handleTabChange(tab)}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                                            ${activeTab === tab
                                                ? 'bg-accent/20 text-accent-light border border-accent/30'
                                                : 'text-cold-400 hover:text-cold-200 hover:bg-cold-800/40'
                                            }
                                        `}
                                    >
                                        <Icon size={13} />
                                        {labels[tab]}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-5">

                            {/* Upload Tab */}
                            {activeTab === 'upload' && (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`
                                        rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300
                                        ${dragActive
                                            ? 'border-accent bg-accent/5'
                                            : 'border-cold-700/40 hover:border-cold-600/50'
                                        }
                                    `}
                                >
                                    {uploading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="animate-spin text-accent" />
                                            <p className="text-cold-300 text-sm">Uploading...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className={`p-4 rounded-2xl border transition-all duration-300 ${dragActive ? 'bg-accent/20 border-accent/30' : 'bg-cold-800/30 border-cold-700/20'}`}>
                                                <Upload size={28} className={dragActive ? 'text-accent-light' : 'text-cold-500'} />
                                            </div>
                                            <div>
                                                <p className="text-cold-200 text-sm font-medium mb-1">
                                                    {dragActive ? 'Drop file here' : 'Drag and drop a file here'}
                                                </p>
                                                <p className="text-cold-500 text-xs">or click the button below to browse</p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*,video/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e.target.files)}
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="btn btn-primary text-sm"
                                            >
                                                <FolderOpen size={15} />
                                                Browse Files
                                            </button>
                                            <p className="text-xs text-cold-600">
                                                JPG, PNG, WebP, GIF, MP4, WebM, MOV
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* URL Tab */}
                            {activeTab === 'url' && (
                                <div className="space-y-4">
                                    <p className="text-cold-400 text-sm">
                                        Enter a full URL to an image or video file.
                                    </p>
                                    <div className="flex gap-2">
                                        <div className="flex-shrink-0 px-3 py-2.5 rounded-l-lg bg-cold-700/50 border border-r-0 border-cold-600/30 text-cold-400 text-sm">
                                            🔗
                                        </div>
                                        <input
                                            type="url"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUrlConfirm()}
                                            className="input flex-1 rounded-l-none font-mono text-sm"
                                            placeholder="https://..."
                                            autoFocus
                                        />
                                    </div>

                                    {/* Preview of entered URL */}
                                    {urlInput.trim() && (
                                        <div className="rounded-xl overflow-hidden border border-cold-700/30 bg-cold-950">
                                            {isVideoUrl(urlInput.trim()) ? (
                                                <video
                                                    src={urlInput.trim()}
                                                    className="w-full max-h-48 object-contain"
                                                    muted
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <img
                                                    src={urlInput.trim()}
                                                    alt="Preview"
                                                    className="w-full max-h-48 object-contain"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleUrlConfirm}
                                        disabled={!urlInput.trim()}
                                        className="btn btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Check size={15} />
                                        Use This URL
                                    </button>
                                </div>
                            )}

                            {/* Library Tab */}
                            {activeTab === 'library' && (
                                <div>
                                    {libraryLoading ? (
                                        <div className="flex items-center justify-center h-40">
                                            <div className="text-center">
                                                <Loader2 size={24} className="animate-spin text-accent mx-auto mb-2" />
                                                <p className="text-cold-500 text-xs">Loading library...</p>
                                            </div>
                                        </div>
                                    ) : libraryMedia.length === 0 ? (
                                        <div className="text-center py-12 text-cold-500 text-sm">
                                            No media in library yet. Upload files first.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {libraryMedia.map((item) => {
                                                const itemIsVideo = isVideoUrl(item.public_url);
                                                const isSelected = item.public_url === value;
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handlePickFromLibrary(item)}
                                                        className={`
                                                            relative group cursor-pointer rounded-lg overflow-hidden border transition-all duration-200 hover:scale-[1.03]
                                                            ${isSelected
                                                                ? 'border-accent shadow-glow'
                                                                : 'border-cold-700/30 hover:border-accent/50'
                                                            }
                                                        `}
                                                    >
                                                        <div className="aspect-square bg-cold-950">
                                                            {itemIsVideo ? (
                                                                <>
                                                                    <video
                                                                        src={item.public_url}
                                                                        className="w-full h-full object-cover"
                                                                        muted
                                                                        preload="metadata"
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                                        <Play size={16} className="text-white ml-0.5" fill="white" />
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

                                                        {/* Hover overlay */}
                                                        <div className="absolute inset-0 bg-accent/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Check size={20} className="text-white" />
                                                        </div>

                                                        {/* Selected indicator */}
                                                        {isSelected && (
                                                            <div className="absolute top-1.5 right-1.5 p-1 bg-accent rounded-full">
                                                                <Check size={10} className="text-white" />
                                                            </div>
                                                        )}

                                                        {/* Filename */}
                                                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-cold-950/80 backdrop-blur-sm">
                                                            <p className="text-[10px] text-white/70 truncate">{item.filename}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-cold-700/30 flex justify-end">
                            <button onClick={closeModal} className="btn btn-secondary text-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MediaFieldEditor;
