import React, { useState, useEffect } from 'react';
import {
    Package,
    Save,
    Loader2,
    Check,
    Star,
    Plus,
    X,
    Sparkles,
    Clock,
    Tag
} from 'lucide-react';
import { getPackages, updatePackage, updatePackageHighlights } from '../services/supabase';
import { LANGUAGES, type CmsPackage, type Language } from '../types';

export const PackageEditor: React.FC = () => {
    const [packages, setPackages] = useState<CmsPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLanguage, setActiveLanguage] = useState<Language>('en');
    const [savingId, setSavingId] = useState<string | null>(null);
    const [savedId, setSavedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const data = await getPackages();
                setPackages(data);
            } catch (err) {
                console.error('Failed to fetch packages:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    const getLocalizedField = (pkg: CmsPackage, field: string): string => {
        const key = `${field}_${activeLanguage}` as keyof CmsPackage;
        return (pkg[key] as string) || '';
    };

    const getLocalizedHighlights = (pkg: CmsPackage): string[] => {
        const key = `highlights_${activeLanguage}` as keyof CmsPackage;
        return (pkg[key] as string[]) || [];
    };

    const updateLocalPackage = (pkgId: string, field: string, value: string | number | boolean) => {
        setPackages(prev =>
            prev.map(pkg =>
                pkg.id === pkgId ? { ...pkg, [field]: value } : pkg
            )
        );
    };

    const updateLocalizedField = (pkgId: string, field: string, value: string) => {
        const key = `${field}_${activeLanguage}`;
        setPackages(prev =>
            prev.map(pkg =>
                pkg.id === pkgId ? { ...pkg, [key]: value } : pkg
            )
        );
    };

    const updateHighlight = (pkgId: string, index: number, value: string) => {
        const key = `highlights_${activeLanguage}` as keyof CmsPackage;
        setPackages(prev =>
            prev.map(pkg => {
                if (pkg.id !== pkgId) return pkg;
                const highlights = [...(pkg[key] as string[] || [])];
                highlights[index] = value;
                return { ...pkg, [key]: highlights };
            })
        );
    };

    const addHighlight = (pkgId: string) => {
        const key = `highlights_${activeLanguage}` as keyof CmsPackage;
        setPackages(prev =>
            prev.map(pkg => {
                if (pkg.id !== pkgId) return pkg;
                const highlights = [...(pkg[key] as string[] || []), ''];
                return { ...pkg, [key]: highlights };
            })
        );
    };

    const removeHighlight = (pkgId: string, index: number) => {
        const key = `highlights_${activeLanguage}` as keyof CmsPackage;
        setPackages(prev =>
            prev.map(pkg => {
                if (pkg.id !== pkgId) return pkg;
                const highlights = [...(pkg[key] as string[] || [])];
                highlights.splice(index, 1);
                return { ...pkg, [key]: highlights };
            })
        );
    };

    const savePackage = async (pkg: CmsPackage) => {
        setSavingId(pkg.id);
        try {
            // Save main fields
            await updatePackage(pkg.id, {
                price_sek: pkg.price_sek,
                price_eur: pkg.price_eur,
                featured: pkg.featured,
                active: pkg.active,
                [`name_${activeLanguage}`]: getLocalizedField(pkg, 'name'),
                [`duration_${activeLanguage}`]: getLocalizedField(pkg, 'duration'),
                [`description_${activeLanguage}`]: getLocalizedField(pkg, 'description'),
            });

            // Save highlights
            await updatePackageHighlights(pkg.id, activeLanguage, getLocalizedHighlights(pkg));

            setSavedId(pkg.id);
            setTimeout(() => setSavedId(null), 2000);
        } catch (err) {
            console.error('Failed to save package:', err);
        } finally {
            setSavingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-3" />
                    <p className="text-cold-400 text-sm">Loading packages...</p>
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
                            <Package className="w-5 h-5 text-accent-light" />
                        </div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">
                            Package Editor
                        </h1>
                    </div>
                    <p className="text-cold-400 text-sm">
                        Manage experience packages, pricing, and descriptions
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

            {/* Package Cards - Premium */}
            <div className="grid gap-6">
                {packages.map((pkg, index) => (
                    <div
                        key={pkg.id}
                        className={`
                            glass-card overflow-hidden animate-fade-in
                            ${pkg.featured ? 'ring-1 ring-accent/30' : ''}
                        `}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Featured Badge */}
                        {pkg.featured && (
                            <div className="h-1 bg-gradient-to-r from-accent via-accent-light to-accent" />
                        )}

                        <div className="p-6">
                            {/* Package Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    {pkg.featured && (
                                        <div className="p-2.5 bg-gradient-to-br from-accent/20 to-accent-dark/20 rounded-xl border border-accent/20">
                                            <Star className="text-accent-light" size={20} />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            {getLocalizedField(pkg, 'name') || pkg.package_key}
                                        </h3>
                                        <p className="text-xs text-cold-500 font-mono mt-1">{pkg.package_key}</p>
                                    </div>
                                </div>

                                {/* Save Button - Premium */}
                                <button
                                    onClick={() => savePackage(pkg)}
                                    disabled={savingId === pkg.id}
                                    className={`
                                        btn transition-all duration-300
                                        ${savedId === pkg.id
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'btn-primary'
                                        }
                                    `}
                                >
                                    {savedId === pkg.id ? (
                                        <>
                                            <Check size={16} />
                                            <span>Saved</span>
                                        </>
                                    ) : savingId === pkg.id ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Left Column - Pricing & Status */}
                                <div className="space-y-5">
                                    {/* Pricing - Premium Cards */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-cold-800/30 border border-cold-700/20">
                                            <label className="block text-xs font-medium text-cold-400 mb-2 uppercase tracking-wider">
                                                Price (SEK)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-cold-500 font-medium">kr</span>
                                                <input
                                                    type="number"
                                                    value={pkg.price_sek}
                                                    onChange={(e) => updateLocalPackage(pkg.id, 'price_sek', parseInt(e.target.value) || 0)}
                                                    className="w-full bg-transparent border-none text-xl font-semibold text-white pl-8 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-cold-800/30 border border-cold-700/20">
                                            <label className="block text-xs font-medium text-cold-400 mb-2 uppercase tracking-wider">
                                                Price (EUR)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-cold-500 font-medium">€</span>
                                                <input
                                                    type="number"
                                                    value={pkg.price_eur || ''}
                                                    onChange={(e) => updateLocalPackage(pkg.id, 'price_eur', parseInt(e.target.value) || 0)}
                                                    className="w-full bg-transparent border-none text-xl font-semibold text-white pl-6 focus:outline-none"
                                                    placeholder="Auto"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Toggles - Premium */}
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`
                                                w-10 h-6 rounded-full transition-all duration-300 relative
                                                ${pkg.featured
                                                    ? 'bg-gradient-to-r from-accent to-accent-dark'
                                                    : 'bg-cold-700'
                                                }
                                            `}>
                                                <input
                                                    type="checkbox"
                                                    checked={pkg.featured}
                                                    onChange={(e) => updateLocalPackage(pkg.id, 'featured', e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`
                                                    absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-300
                                                    ${pkg.featured ? 'left-5' : 'left-1'}
                                                `} />
                                            </div>
                                            <span className="text-sm text-cold-300 group-hover:text-white transition-colors">Featured</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`
                                                w-10 h-6 rounded-full transition-all duration-300 relative
                                                ${pkg.active
                                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                                    : 'bg-cold-700'
                                                }
                                            `}>
                                                <input
                                                    type="checkbox"
                                                    checked={pkg.active}
                                                    onChange={(e) => updateLocalPackage(pkg.id, 'active', e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`
                                                    absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-300
                                                    ${pkg.active ? 'left-5' : 'left-1'}
                                                `} />
                                            </div>
                                            <span className="text-sm text-cold-300 group-hover:text-white transition-colors">Active</span>
                                        </label>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-cold-300 mb-2">
                                            <Tag size={14} className="text-cold-500" />
                                            Name
                                            <span className="text-base ml-1">{LANGUAGES.find(l => l.code === activeLanguage)?.flag}</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={getLocalizedField(pkg, 'name')}
                                            onChange={(e) => updateLocalizedField(pkg.id, 'name', e.target.value)}
                                            className="input w-full"
                                            placeholder="Package name..."
                                        />
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-cold-300 mb-2">
                                            <Clock size={14} className="text-cold-500" />
                                            Duration
                                            <span className="text-base ml-1">{LANGUAGES.find(l => l.code === activeLanguage)?.flag}</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={getLocalizedField(pkg, 'duration')}
                                            onChange={(e) => updateLocalizedField(pkg.id, 'duration', e.target.value)}
                                            className="input w-full"
                                            placeholder="e.g., 7 days / 6 nights"
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Description & Highlights */}
                                <div className="space-y-5">
                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-cold-300 mb-2">
                                            Description
                                            <span className="text-base ml-2">{LANGUAGES.find(l => l.code === activeLanguage)?.flag}</span>
                                        </label>
                                        <textarea
                                            value={getLocalizedField(pkg, 'description')}
                                            onChange={(e) => updateLocalizedField(pkg.id, 'description', e.target.value)}
                                            className="input w-full min-h-[100px] resize-y"
                                            placeholder="Package description..."
                                        />
                                    </div>

                                    {/* Highlights - Premium */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-cold-300 mb-3">
                                            <Sparkles size={14} className="text-accent-light" />
                                            Highlights
                                            <span className="text-base ml-1">{LANGUAGES.find(l => l.code === activeLanguage)?.flag}</span>
                                        </label>
                                        <div className="space-y-2">
                                            {getLocalizedHighlights(pkg).map((highlight, index) => (
                                                <div key={index} className="flex gap-2 group">
                                                    <div className="flex-shrink-0 w-6 h-10 flex items-center justify-center text-xs text-cold-600 font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={highlight}
                                                        onChange={(e) => updateHighlight(pkg.id, index, e.target.value)}
                                                        className="input flex-1"
                                                        placeholder={`Highlight ${index + 1}...`}
                                                    />
                                                    <button
                                                        onClick={() => removeHighlight(pkg.id, index)}
                                                        className="p-2.5 text-cold-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addHighlight(pkg.id)}
                                                className="flex items-center gap-2 text-sm text-accent-light hover:text-white transition-colors mt-3 ml-6"
                                            >
                                                <Plus size={16} />
                                                Add highlight
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
