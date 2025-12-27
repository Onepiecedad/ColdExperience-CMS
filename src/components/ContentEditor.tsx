import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    FileText,
    Loader2,
    Check,
    Globe,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { getPages, getContentByPage, updateContent } from '../services/supabase';
import { LANGUAGES, type CmsPage, type CmsContent, type Language } from '../types';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { ContentGrid, ContentField, ContentCard } from './ui/ContentGrid';

// Section display configuration
const SECTION_CONFIG: Record<string, { title: string; icon?: string; defaultExpanded?: boolean }> = {
    main: { title: 'Main Content', defaultExpanded: true },
    features: { title: 'Features', defaultExpanded: false },
    cta: { title: 'Call to Action', defaultExpanded: false },
    owners: { title: 'Owners / Hosts', defaultExpanded: false },
    contact: { title: 'Contact Info', defaultExpanded: false },
};

export const ContentEditor: React.FC = () => {
    const [pages, setPages] = useState<CmsPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
    const [content, setContent] = useState<CmsContent[]>([]);
    const [activeLanguage, setActiveLanguage] = useState<Language>('sv');
    const [loading, setLoading] = useState(true);
    const [savingFields, setSavingFields] = useState<Set<string>>(new Set());
    const [savedFields, setSavedFields] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    // Fetch pages on mount
    useEffect(() => {
        const fetchPages = async () => {
            try {
                const pagesData = await getPages();
                setPages(pagesData);
                if (pagesData.length > 0) {
                    setSelectedPage(pagesData[0]);
                }
            } catch (err) {
                setError('Failed to load pages');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPages();
    }, []);

    // Fetch content when page changes
    useEffect(() => {
        if (!selectedPage) return;

        const fetchContent = async () => {
            setLoading(true);
            try {
                const contentData = await getContentByPage(selectedPage.id);
                setContent(contentData);
                setError(null);
            } catch (err) {
                setError('Failed to load content');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [selectedPage]);

    // Group content by section
    const groupedContent = useMemo(() => {
        const groups: Record<string, CmsContent[]> = {};

        content.forEach(item => {
            const section = item.section || 'main';
            if (!groups[section]) {
                groups[section] = [];
            }
            groups[section].push(item);
        });

        // Sort each group by display_order
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => a.display_order - b.display_order);
        });

        return groups;
    }, [content]);

    // Get ordered sections
    const orderedSections = useMemo(() => {
        const sections = Object.keys(groupedContent);
        // Sort by predefined order, then alphabetically
        const order = ['main', 'features', 'cta', 'owners', 'contact'];
        return sections.sort((a, b) => {
            const aIndex = order.indexOf(a);
            const bIndex = order.indexOf(b);
            if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    }, [groupedContent]);

    // Save field function
    const saveField = useCallback(async (contentItem: CmsContent, value: string) => {
        setSavingFields(prev => new Set(prev).add(contentItem.id));
        try {
            await updateContent(contentItem.id, activeLanguage, value);
            setSavedFields(prev => new Set(prev).add(contentItem.id));
            setTimeout(() => {
                setSavedFields(prev => {
                    const next = new Set(prev);
                    next.delete(contentItem.id);
                    return next;
                });
            }, 2000);
        } catch (err) {
            console.error('Failed to save:', err);
            setError('Failed to save changes');
        } finally {
            setSavingFields(prev => {
                const next = new Set(prev);
                next.delete(contentItem.id);
                return next;
            });
        }
    }, [activeLanguage]);

    // Get content value for current language
    const getContentValue = (item: CmsContent): string => {
        const key = `content_${activeLanguage}` as keyof CmsContent;
        return (item[key] as string) || '';
    };

    // Update local content state
    const handleContentChange = (itemId: string, value: string) => {
        setContent(prev =>
            prev.map(item =>
                item.id === itemId
                    ? { ...item, [`content_${activeLanguage}`]: value }
                    : item
            )
        );
    };

    // Render a single field
    const renderField = (item: CmsContent) => {
        const isTextarea = item.content_type === 'textarea' || item.content_type === 'richtext' || item.content_type === 'html';
        const isUrl = item.content_type === 'url' || item.content_key.toLowerCase().includes('url') || item.content_key.toLowerCase().includes('youtube');
        const isSaving = savingFields.has(item.id);
        const isSaved = savedFields.has(item.id);

        // Determine field label
        let fieldLabel = item.field_label || item.content_key;
        if (isUrl && !fieldLabel.toLowerCase().includes('url')) {
            fieldLabel = `${fieldLabel} (URL)`;
        }

        return (
            <ContentField key={item.id} label={fieldLabel} hint={item.field_hint || (isUrl ? 'Enter a full URL including https://' : undefined)}>
                <div className="relative group">
                    {isTextarea ? (
                        <textarea
                            value={getContentValue(item)}
                            onChange={(e) => handleContentChange(item.id, e.target.value)}
                            onBlur={() => saveField(item, getContentValue(item))}
                            className="input w-full min-h-[100px] resize-y pr-12"
                            placeholder={`Enter ${activeLanguage.toUpperCase()} content...`}
                        />
                    ) : isUrl ? (
                        <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 px-3 py-2.5 rounded-l-lg bg-cold-700/50 border border-r-0 border-cold-600/30 text-cold-400 text-sm">
                                🔗
                            </div>
                            <input
                                type="url"
                                value={getContentValue(item)}
                                onChange={(e) => handleContentChange(item.id, e.target.value)}
                                onBlur={() => saveField(item, getContentValue(item))}
                                className="input w-full pr-12 rounded-l-none"
                                placeholder="https://..."
                            />
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={getContentValue(item)}
                            onChange={(e) => handleContentChange(item.id, e.target.value)}
                            onBlur={() => saveField(item, getContentValue(item))}
                            className="input w-full pr-12"
                            placeholder={`Enter ${activeLanguage.toUpperCase()} content...`}
                        />
                    )}

                    {/* Save indicator - Premium */}
                    <div className="absolute right-3 top-3">
                        {isSaving && (
                            <div className="w-5 h-5 flex items-center justify-center">
                                <Loader2 size={16} className="animate-spin text-cold-400" />
                            </div>
                        )}
                        {isSaved && !isSaving && (
                            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/20">
                                <Check size={12} className="text-emerald-400" />
                            </div>
                        )}
                    </div>
                </div>
            </ContentField>
        );
    };

    // Render section content
    const renderSectionContent = (sectionKey: string, items: CmsContent[]) => {
        // For features, use 2-column grid with cards
        if (sectionKey === 'features') {
            // Group features by number (feature1_title + feature1_desc as a pair)
            const featurePairs: Record<string, CmsContent[]> = {};
            items.forEach(item => {
                const match = item.content_key.match(/feature(\d+)/);
                if (match) {
                    const num = match[1];
                    if (!featurePairs[num]) featurePairs[num] = [];
                    featurePairs[num].push(item);
                } else {
                    // Section header items
                    if (!featurePairs['header']) featurePairs['header'] = [];
                    featurePairs['header'].push(item);
                }
            });

            return (
                <div className="space-y-5">
                    {/* Section header fields */}
                    {featurePairs['header'] && (
                        <ContentGrid columns={2}>
                            {featurePairs['header'].map(item => renderField(item))}
                        </ContentGrid>
                    )}

                    {/* Feature cards */}
                    <ContentGrid columns={2}>
                        {Object.entries(featurePairs)
                            .filter(([key]) => key !== 'header')
                            .sort(([a], [bKey]) => Number(a) - Number(bKey))
                            .map(([num, featureItems]) => (
                                <ContentCard
                                    key={num}
                                    title={`Feature ${num}`}
                                    subtitle={featureItems.find(i => i.content_key.includes('title'))?.content_en || ''}
                                >
                                    {featureItems
                                        .sort((a, _b) => a.content_key.includes('title') ? -1 : 1)
                                        .map(item => renderField(item))}
                                </ContentCard>
                            ))}
                    </ContentGrid>
                </div>
            );
        }

        // Default: 2-column grid
        return (
            <ContentGrid columns={items.length > 2 ? 2 : 1}>
                {items.map(item => renderField(item))}
            </ContentGrid>
        );
    };

    if (loading && pages.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-3" />
                    <p className="text-cold-400 text-sm">Loading content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                            <FileText className="w-5 h-5 text-accent-light" />
                        </div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">
                            Content Editor
                        </h1>
                    </div>
                    <p className="text-cold-400 text-sm">
                        Edit your website's text content across all languages
                    </p>
                </div>

                {/* Language Selector - Premium */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-cold-800/50 border border-cold-700/30 backdrop-blur-sm">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setActiveLanguage(lang.code)}
                            className={`
                                px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                                flex items-center gap-2
                                ${activeLanguage === lang.code
                                    ? 'bg-gradient-to-r from-accent/90 to-accent-dark text-white shadow-lg shadow-accent/20'
                                    : 'text-cold-400 hover:text-cold-200 hover:bg-cold-700/30'
                                }
                            `}
                        >
                            <span className="text-base">{lang.flag}</span>
                            <span className="hidden sm:inline">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message - Premium */}
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-fade-in">
                    <div className="p-2 rounded-lg bg-red-500/20">
                        <AlertCircle className="text-red-400" size={18} />
                    </div>
                    <p className="text-red-300 text-sm">{error}</p>
                </div>
            )}

            {/* Page Selector - Premium */}
            <div className="glass-card p-5">
                <label className="block text-sm font-medium text-cold-300 mb-3">
                    Select Page
                </label>
                <select
                    value={selectedPage?.id || ''}
                    onChange={(e) => {
                        const page = pages.find(p => p.id === e.target.value);
                        setSelectedPage(page || null);
                    }}
                    className="input w-full"
                >
                    {pages.map(page => (
                        <option key={page.id} value={page.id}>
                            {page.name}
                        </option>
                    ))}
                </select>
                {selectedPage?.description && (
                    <p className="text-sm text-cold-500 mt-3">{selectedPage.description}</p>
                )}
            </div>

            {/* Content Sections */}
            <div className="space-y-4">
                {loading ? (
                    <div className="glass-card p-12 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto mb-3" />
                            <p className="text-cold-400 text-sm">Loading page content...</p>
                        </div>
                    </div>
                ) : content.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="inline-flex p-4 rounded-2xl bg-cold-800/30 border border-cold-700/30 mb-4">
                            <Globe className="w-8 h-8 text-cold-500" />
                        </div>
                        <p className="text-cold-300 font-medium mb-1">No content found</p>
                        <p className="text-sm text-cold-500">Add content using the Supabase dashboard.</p>
                    </div>
                ) : (
                    orderedSections.map((sectionKey, index) => {
                        const sectionItems = groupedContent[sectionKey];
                        const config = SECTION_CONFIG[sectionKey] || { title: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1) };

                        return (
                            <div
                                key={sectionKey}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CollapsibleSection
                                    title={config.title}
                                    itemCount={sectionItems.length}
                                    defaultExpanded={config.defaultExpanded}
                                >
                                    {renderSectionContent(sectionKey, sectionItems)}
                                </CollapsibleSection>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Quick Tip - Premium */}
            {content.length > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
                    <Sparkles className="w-4 h-4 text-accent-light mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-cold-400 leading-relaxed">
                        <span className="font-medium text-cold-300">Pro tip:</span> Changes are automatically saved when you click outside a field. Switch languages using the tabs above to manage translations.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ContentEditor;
