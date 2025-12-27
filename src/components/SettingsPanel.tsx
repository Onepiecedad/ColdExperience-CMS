import React, { useState, useEffect } from 'react';
import {
    Settings,
    Save,
    Loader2,
    Check,
    Globe,
    Mail,
    Phone,
    Calendar,
    ExternalLink,
    Zap,
    Shield,
    HelpCircle
} from 'lucide-react';
import { getSettings, updateSetting } from '../services/supabase';
import type { CmsSetting } from '../types';

export const SettingsPanel: React.FC = () => {
    const [settings, setSettings] = useState<CmsSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const updateLocalSetting = (key: string, value: string) => {
        setSettings(prev =>
            prev.map(s =>
                s.setting_key === key ? { ...s, setting_value: value } : s
            )
        );
    };

    const saveAllSettings = async () => {
        setSaving(true);
        try {
            for (const setting of settings) {
                await updateSetting(setting.setting_key, setting.setting_value || '');
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save settings:', err);
        } finally {
            setSaving(false);
        }
    };

    const getIcon = (key: string) => {
        if (key.includes('email')) return <Mail size={18} />;
        if (key.includes('phone')) return <Phone size={18} />;
        if (key.includes('season')) return <Calendar size={18} />;
        return <Globe size={18} />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-3" />
                    <p className="text-cold-400 text-sm">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                            <Settings className="w-5 h-5 text-accent-light" />
                        </div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight">
                            Settings
                        </h1>
                    </div>
                    <p className="text-cold-400 text-sm">
                        Configure global site settings and preferences
                    </p>
                </div>

                <button
                    onClick={saveAllSettings}
                    disabled={saving}
                    className={`
                        btn transition-all duration-300
                        ${saved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'btn-primary'
                        }
                    `}
                >
                    {saved ? (
                        <>
                            <Check size={16} />
                            <span>Saved!</span>
                        </>
                    ) : saving ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            <span>Save All Changes</span>
                        </>
                    )}
                </button>
            </div>

            {/* Settings Cards - Premium */}
            <div className="grid gap-4">
                {settings.map((setting, index) => (
                    <div
                        key={setting.id}
                        className="glass-card p-5 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 rounded-xl bg-cold-800/50 border border-cold-700/30 text-cold-400">
                                {getIcon(setting.setting_key)}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-cold-100 mb-1">
                                    {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </label>
                                {setting.description && (
                                    <p className="text-xs text-cold-500 mb-3">{setting.description}</p>
                                )}
                                <input
                                    type="text"
                                    value={setting.setting_value || ''}
                                    onChange={(e) => updateLocalSetting(setting.setting_key, e.target.value)}
                                    className="input w-full"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Links - Premium */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-5">
                    <Zap className="w-5 h-5 text-accent-light" />
                    <h2 className="text-lg font-semibold text-white">Quick Links</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    <QuickLink
                        href="https://coldexperience.se"
                        icon={<Globe className="text-accent-light" size={18} />}
                        title="Live Website"
                        subtitle="coldexperience.se"
                    />
                    <QuickLink
                        href="https://supabase.com/dashboard"
                        icon={<div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-400 to-teal-500" />}
                        title="Supabase Dashboard"
                        subtitle="Database & Storage"
                    />
                    <QuickLink
                        href="https://app.netlify.com"
                        icon={<div className="w-4 h-4 rounded bg-gradient-to-br from-teal-400 to-cyan-500" />}
                        title="Netlify Dashboard"
                        subtitle="Hosting & Deploys"
                    />
                    <QuickLink
                        href="https://github.com/Onepiecedad/ColdExperience"
                        icon={<div className="w-4 h-4 rounded-full bg-white" />}
                        title="GitHub Repository"
                        subtitle="Source Code"
                    />
                </div>
            </div>

            {/* System Info - Premium */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Security Status */}
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Shield className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-white">Security Status</h3>
                            <p className="text-xs text-cold-500">All systems operational</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-cold-400">SSL Certificate</span>
                            <span className="badge badge-success">Active</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-cold-400">Auth Provider</span>
                            <span className="text-cold-200">Google OAuth</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-cold-400">Database</span>
                            <span className="text-cold-200">Supabase</span>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="glass-card p-5 relative overflow-hidden">
                    {/* Subtle gradient accent */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                                <HelpCircle className="w-4 h-4 text-accent-light" />
                            </div>
                            <div>
                                <h3 className="font-medium text-white">Need Help?</h3>
                                <p className="text-xs text-cold-500">We're here to assist you</p>
                            </div>
                        </div>
                        <p className="text-cold-300 text-sm mb-4 leading-relaxed">
                            If you need assistance with your dashboard or have questions about managing your content, feel free to reach out.
                        </p>
                        <a
                            href="mailto:support@skyland.ai"
                            className="inline-flex items-center gap-2 text-sm font-medium text-accent-light hover:text-white transition-colors"
                        >
                            <Mail size={14} />
                            Contact Support
                            <ExternalLink size={12} className="opacity-50" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Version Info */}
            <div className="text-center py-4">
                <p className="text-xs text-cold-600">
                    ColdExperience CMS-System v1.0.0 · Built with ❄️ by Skyland AI
                </p>
            </div>
        </div>
    );
};

// Quick Link Component
interface QuickLinkProps {
    href: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}

const QuickLink: React.FC<QuickLinkProps> = ({ href, icon, title, subtitle }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 rounded-xl bg-cold-800/30 border border-cold-700/20 hover:bg-cold-800/50 hover:border-cold-600/30 transition-all duration-300 group"
    >
        <div className="flex-shrink-0">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-medium text-cold-100 group-hover:text-white transition-colors">{title}</p>
            <p className="text-xs text-cold-500 truncate">{subtitle}</p>
        </div>
        <ExternalLink className="text-cold-600 group-hover:text-cold-400 transition-colors flex-shrink-0" size={14} />
    </a>
);
