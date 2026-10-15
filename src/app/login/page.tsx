'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { UserRole } from '@/types';
import { 
  Zap, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Inbox
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { 
    signIn, 
    signUp, 
    resendConfirmationEmail,
    loginAsDemoUser, 
    availableUsers, 
    isSupabaseConfigured 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('analyst');
  const [title, setTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.success) {
          router.push('/');
        } else {
          setErrorMessage(res.error || 'Invalid credentials.');
        }
      } else {
        const res = await signUp(email, password, fullName, role, title);
        if (res.success) {
          if (res.requiresEmailConfirmation) {
            setVerificationPendingEmail(email);
          } else {
            setSuccessMessage('Registration successful! Redirecting...');
            setTimeout(() => router.push('/'), 1200);
          }
        } else {
          setErrorMessage(res.error || 'Failed to register account.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication error.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (targetEmail: string) => {
    setIsResending(true);
    try {
      const res = await resendConfirmationEmail(targetEmail);
      if (res.success) {
        setSuccessMessage(`A fresh verification link has been sent to ${targetEmail}. Please check your inbox and spam folder.`);
      } else {
        setErrorMessage(res.error || 'Failed to resend confirmation email.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resending confirmation.';
      setErrorMessage(msg);
    } finally {
      setIsResending(false);
    }
  };

  const handleDemoLogin = (userId: string) => {
    loginAsDemoUser(userId);
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-3.5 py-6 sm:py-12 relative z-20">
      {/* Container Box with Frosted Glass styling & Cyber-Mesh Background */}
      <div className="w-full max-w-md bg-[#020e08]/90 backdrop-blur-2xl border border-emerald-500/35 rounded-2xl shadow-2xl p-4 sm:p-8 relative overflow-hidden">
        
        {/* Custom Cyber Network Artwork Background */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-45 mix-blend-screen contrast-125 brightness-110"
          style={{ backgroundImage: "url('/login_bg.jpg')" }}
        />
        {/* Protective deep emerald atmospheric gradient for crisp typography and input contrast */}
        <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#020e08]/75 via-[#021810]/60 to-[#020e08]/85" />

        {/* Glow ambient accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6 relative z-10">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 p-0.5 shadow-xl shadow-emerald-950/70 flex items-center justify-center mb-2.5">
            <div className="w-full h-full bg-[#041a10] rounded-[14px] flex items-center justify-center">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 fill-emerald-400/90" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#020e08] animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg sm:text-xl font-black tracking-wider text-white">HERMIT INVESTMENTS</h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              PRO
            </span>
          </div>
          
          <p className="text-xs text-emerald-300/80 font-medium mt-0.5">
            Energy Sector Surveillance & Strategic Intelligence
          </p>

          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-[10px] text-emerald-300">
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{isSupabaseConfigured ? 'Supabase Auth Online' : 'Local Standby / Demo Mode'}</span>
          </div>
        </div>

        {/* VIEW 1: EMAIL VERIFICATION PENDING STATE */}
        {verificationPendingEmail ? (
          <div className="relative z-10 space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg">
              <Inbox className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="font-display text-sm font-bold text-white">Check Your Email</h2>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                We sent a confirmation link to:
              </p>
              <div className="text-xs font-mono font-bold text-emerald-300 bg-[#03180f] p-2 rounded-xl border border-emerald-500/30">
                {verificationPendingEmail}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#03180f]/80 border border-emerald-900/60 text-xs text-emerald-100/90 space-y-1.5">
              <div className="font-bold text-emerald-300">Next Steps:</div>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-emerald-200/80">
                <li>Open the confirmation email from Hermit Security.</li>
                <li>Click the verification link to activate your access tier.</li>
                <li>You will automatically be routed into the intelligence dashboard.</li>
              </ol>
            </div>

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleResend(verificationPendingEmail)}
                disabled={isResending}
                className="w-full flex items-center justify-center gap-1.5 bg-[#03180f] hover:bg-[#062418] border border-emerald-500/40 text-emerald-300 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Sending...' : 'Resend Confirmation Email'}</span>
              </button>

              <button
                onClick={() => {
                  setVerificationPendingEmail(null);
                  setMode('signin');
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                className="w-full text-center text-xs text-emerald-400 hover:text-white py-1 transition-colors"
              >
                &larr; Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Toggle between Sign In & Sign Up */}
            <div className="grid grid-cols-2 p-1 bg-[#010905]/80 rounded-xl border border-emerald-500/20 mb-4 sm:mb-5 relative z-10">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-emerald-600/40 text-white border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-emerald-600/40 text-white border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register Account
              </button>
            </div>

            {/* Error Messages (with inline Resend option if email not confirmed) */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs space-y-2 relative z-10">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
                {errorMessage.toLowerCase().includes('email not confirmed') && email && (
                  <button
                    type="button"
                    onClick={() => handleResend(email)}
                    disabled={isResending}
                    className="w-full mt-1.5 flex items-center justify-center gap-1.5 bg-rose-900/60 hover:bg-rose-800/80 border border-rose-400/40 text-white py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{isResending ? 'Sending link...' : `Resend verification email to ${email}`}</span>
                  </button>
                )}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2 relative z-10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300/80 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-emerald-500/60 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Farai Chigumira"
                        className="w-full bg-[#03150e]/90 border border-emerald-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-300/80 mb-1">
                        Role Tier
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full bg-[#03150e]/90 border border-emerald-500/25 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 transition-colors"
                      >
                        <option value="executive">Executive</option>
                        <option value="director">Director</option>
                        <option value="analyst">Analyst</option>
                        <option value="engineer">Engineer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-300/80 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Managing Director"
                        className="w-full bg-[#03150e]/90 border border-emerald-500/25 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-emerald-300/80 mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-500/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hermitinvestments.co.zw"
                    className="w-full bg-[#03150e]/90 border border-emerald-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-300/80 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-500/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#03150e]/90 border border-emerald-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/30 disabled:opacity-60 active:scale-98"
              >
                <span>{isSubmitting ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Portal' : 'Create Intelligence Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Demo Personas - 1-Click Access */}
            {/*
            <div className="mt-5 pt-4 border-t border-emerald-900/50 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                  Instant 1-Click Demo Personas
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono">
                  Zero Config
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleDemoLogin(user.id)}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-[#03180f]/70 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-400/40 text-left transition-all group active:scale-99"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0 border border-emerald-400/40">
                        {user.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 truncate block">
                          {user.full_name}
                        </span>
                        <span className="text-[10px] text-emerald-400/70 truncate block">
                          {user.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-extrabold bg-[#051f14] text-emerald-300 border border-emerald-500/30">
                        {user.role}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            */}

            {/* Security Note */}
            <div className="mt-4 text-center text-[10px] text-emerald-400/50 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500/60" />
              <span>Restricted to Authorized Hermit Personnel & Affiliates</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
