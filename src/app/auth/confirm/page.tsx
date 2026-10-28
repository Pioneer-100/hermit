'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { Zap, CheckCircle2, AlertCircle, ArrowRight, Mail, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your Hermit intelligence access token...');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const sb = getSupabaseClient();

    const handleVerification = async () => {
      // 1. Check for URL error query parameters sent by Supabase
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      if (errorParam || errorDescription) {
        if (isMounted) {
          setStatus('error');
          setMessage(errorDescription || errorParam || 'Verification token is invalid or has expired.');
        }
        return;
      }

      // 2. Check for PKCE code
      const code = searchParams.get('code');
      // 3. Check for token_hash and type (OTP flow)
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!sb) {
        // Fallback for local demo simulation
        if (isMounted) {
          setStatus('success');
          setMessage('Account verified in local demonstration mode. Redirecting...');
          setTimeout(() => router.push('/'), 1500);
        }
        return;
      }

      try {
        if (tokenHash && type) {
          const { error } = await sb.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any
          });
          if (error) throw error;
        } else if (code) {
          const { error } = await sb.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          // Implicit flow hash handling is automatically parsed by Supabase client
          const { data: { session } } = await sb.auth.getSession();
          if (!session) {
            // Wait briefly for auth state change
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }

        // Verify active session
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          if (isMounted) {
            setStatus('success');
            setMessage(`Account confirmed for ${session.user.email}! Welcome to Hermit Energy Monitor.`);
            setTimeout(() => {
              router.push('/');
            }, 1800);
          }
        } else {
          // If no token was found in the URL but user is already signed in
          const currentUser = (await sb.auth.getUser()).data.user;
          if (currentUser) {
            if (isMounted) {
              setStatus('success');
              setMessage(`Welcome back, ${currentUser.email}! Access confirmed.`);
              setTimeout(() => router.push('/'), 1200);
            }
          } else {
            if (isMounted) {
              setStatus('error');
              setMessage('No valid confirmation token was found in this link. The link may have expired or already been used.');
            }
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to verify account confirmation token.';
        if (isMounted) {
          setStatus('error');
          setMessage(msg);
        }
      }
    };

    handleVerification();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setIsResending(true);
    setResendSuccess(false);

    const sb = getSupabaseClient();
    if (sb) {
      try {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm` : undefined;
        const { error } = await sb.auth.resend({
          type: 'signup',
          email: resendEmail.trim(),
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        setResendSuccess(true);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Error resending confirmation');
      } finally {
        setIsResending(false);
      }
    } else {
      setResendSuccess(true);
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#040d1a]/90 backdrop-blur-2xl border border-blue-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden text-white">
      {/* Glow ambient background */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="flex flex-col items-center text-center mb-6 relative z-10">
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 p-0.5 shadow-xl shadow-blue-950/70 flex items-center justify-center mb-3">
          <div className="w-full h-full bg-[#0a1d36] rounded-[14px] flex items-center justify-center">
            <Zap className="w-7 h-7 text-blue-400 fill-blue-400" />
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-400 rounded-full ring-2 ring-[#040d1a] animate-pulse" />
        </div>

        <h1 className="text-lg font-black tracking-wider text-white">HERMIT INVESTMENTS</h1>
        <p className="text-xs text-cyan-300/80 font-medium mt-0.5">
          Account Verification Gateway
        </p>
      </div>

      {/* State View */}
      <div className="relative z-10 space-y-4 text-center">
        {status === 'verifying' && (
          <div className="py-6 space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-blue-400/30 border-t-emerald-400 animate-spin" />
            <p className="text-xs text-cyan-200/90 font-medium">
              {message}
            </p>
            <p className="text-[10px] text-blue-400/60 font-mono">
              Securing session with Supabase Auth...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-sm font-bold text-white">Confirmation Confirmed!</h2>
            <p className="text-xs text-slate-200/90 leading-relaxed bg-[#06162a]/80 p-3 rounded-xl border border-blue-500/30">
              {message}
            </p>

            <button
              onClick={() => router.push('/')}
              className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg transition-all"
            >
              <span>Enter Hermit Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-2 space-y-4 animate-in fade-in duration-200 text-left">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-white mb-0.5">Verification Failed</strong>
                <span className="leading-relaxed">{message}</span>
              </div>
            </div>

            {/* Resend Link Form */}
            <form onSubmit={handleResend} className="space-y-2 pt-1 border-t border-blue-900/50">
              <label className="block text-[11px] font-bold text-cyan-300">
                Request a New Confirmation Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-blue-500/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your registered work email..."
                  className="w-full bg-[#03150e]/90 border border-blue-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                disabled={isResending || !resendEmail.trim()}
                className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-600 text-white py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Sending...' : 'Resend Confirmation Link'}</span>
              </button>

              {resendSuccess && (
                <p className="text-[11px] text-cyan-300 font-medium text-center bg-blue-950/60 p-2 rounded-lg border border-blue-500/30">
                  New verification link dispatched! Please check your inbox and spam folder.
                </p>
              )}
            </form>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs text-cyan-300 hover:text-white underline font-semibold"
              >
                &larr; Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 relative z-20">
      <Suspense fallback={
        <div className="text-xs text-cyan-300 font-mono animate-pulse">
          Loading verification gateway...
        </div>
      }>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}
