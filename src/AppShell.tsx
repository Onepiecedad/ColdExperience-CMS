import { useEffect, useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { AppRouter } from './router';
import { AuthScreen } from './components/AuthScreen';
import { getCurrentUser, isEmailAllowed, signOut, supabase } from './services/supabase';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export function AppShell() {
    const [status, setStatus] = useState<AuthStatus>('loading');
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const syncAuthState = async () => {
            setStatus('loading');

            try {
                const user = await getCurrentUser();

                if (!user) {
                    if (!cancelled) {
                        setStatus('unauthenticated');
                    }
                    return;
                }

                const allowed = import.meta.env.DEV || (user.email ? await isEmailAllowed(user.email) : false);
                if (!allowed) {
                    await signOut();
                    if (!cancelled) {
                        setAuthError('This account is not authorized for the CMS.');
                        setStatus('unauthenticated');
                    }
                    return;
                }

                if (!cancelled) {
                    setAuthError(null);
                    setStatus('authenticated');
                }
            } catch (err) {
                console.error('Failed to restore auth session:', err);
                if (!cancelled) {
                    setAuthError('Failed to verify your session. Please sign in again.');
                    setStatus('unauthenticated');
                }
            }
        };

        syncAuthState();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session?.user) {
                setAuthError(null);
                setStatus('unauthenticated');
                return;
            }

            void syncAuthState();
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#040810] text-white">
                <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0a1622]/80 px-5 py-4">
                    <Loader2 className="animate-spin text-[#5a9bc7]" size={18} />
                    <span className="text-sm text-white/70">Verifying session...</span>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return <AuthScreen error={authError} />;
    }

    if (status !== 'authenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#040810] text-white">
                <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
                    <ShieldAlert size={18} />
                    <span>Unexpected authentication state.</span>
                </div>
            </div>
        );
    }

    return <AppRouter />;
}

export default AppShell;
