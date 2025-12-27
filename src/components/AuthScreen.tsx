import React, { useState } from 'react';
import { Loader2, Snowflake, Shield, ChevronRight } from 'lucide-react';
import { signInWithGoogle } from '../services/supabase';
import type { User } from '../types';

interface AuthScreenProps {
    onAuthenticated: (user: User) => void;
    error?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ error: externalError }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(externalError || null);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);

        try {
            const { error: signInError } = await signInWithGoogle();
            if (signInError) {
                setError(signInError.message);
                setLoading(false);
            }
            // If successful, the OAuth flow will redirect and handle the rest
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            {/* Premium Ambient Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Primary glow - top center */}
                <div
                    className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse, rgba(40, 90, 130, 0.15) 0%, rgba(40, 90, 130, 0.05) 40%, transparent 70%)',
                    }}
                />

                {/* Secondary glow - bottom right */}
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[500px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse, rgba(90, 155, 199, 0.08) 0%, transparent 60%)',
                    }}
                />

                {/* Subtle grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md animate-fade-in">
                {/* Card */}
                <div className="glass-card p-8 sm:p-10 relative overflow-hidden">
                    {/* Subtle top gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

                    {/* Logo Section */}
                    <div className="text-center mb-10">
                        {/* Premium Logo */}
                        <div className="inline-flex relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent-dark rounded-2xl blur-2xl opacity-40 scale-150" />
                            <div className="relative w-16 h-16 bg-gradient-to-br from-accent/90 to-accent-dark rounded-2xl flex items-center justify-center shadow-xl border border-white/10">
                                <Snowflake className="text-white" size={32} strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Brand Name */}
                        <h1 className="text-xl font-semibold text-white tracking-wide mb-1">
                            ColdExperience
                        </h1>
                        <p className="text-xs font-medium tracking-[0.25em] uppercase text-accent-light/80">
                            CMS-System
                        </p>
                    </div>

                    {/* Welcome Text */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-cold-300 text-sm leading-relaxed">
                            Sign in to manage your website content
                        </p>
                    </div>

                    {/* Error Message */}
                    {(error || externalError) && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
                            <p className="text-red-400 text-sm text-center">
                                {error || externalError}
                            </p>
                        </div>
                    )}

                    {/* Google Sign In Button - Premium */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full group relative overflow-hidden rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {/* Button Background */}
                        <div className="absolute inset-0 bg-white transition-all duration-300 group-hover:bg-gray-50" />

                        {/* Shine Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </div>

                        {/* Button Content */}
                        <div className="relative flex items-center justify-center gap-3 px-6 py-4">
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                            ) : (
                                <>
                                    {/* Google Logo */}
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="font-medium text-gray-700">
                                        Continue with Google
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </div>
                    </button>

                    {/* Access Notice - Premium */}
                    <div className="mt-8 pt-6 border-t border-cold-700/30">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-cold-800/30 border border-cold-700/20">
                            <div className="flex-shrink-0 mt-0.5">
                                <Shield className="w-4 h-4 text-accent-light/70" />
                            </div>
                            <div>
                                <p className="text-xs text-cold-300 leading-relaxed">
                                    <span className="font-medium text-cold-200">Restricted Access</span>
                                    <br />
                                    Only authorized Skyland accounts can sign in to this system.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-cold-500">
                        &copy; {new Date().getFullYear()} ColdExperience · Powered by Skyland AI
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
