'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/projects`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      if (data.session) {
        router.push('/projects');
        router.refresh();
      } else {
        setIsSuccess(true);
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/projects`,
        },
      });

      if (error) {
        setError(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate Google authentication');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-40" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/20 to-black" />

      <div className="relative z-10 w-full max-w-sm space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-bold text-black text-xs shadow-lg">
              CS
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">ClipScout</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create an account</h1>
            <p className="text-xs text-neutral-400 mt-1">Get started with multimodal video intelligence.</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mx-auto text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-semibold text-white">Check your inbox</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                We sent a confirmation link to{' '}
                <span className="text-white font-mono">{email}</span>. Click it to activate your account.
              </p>
              <Link
                href="/login"
                className="inline-block text-xs font-semibold text-white hover:underline pt-2"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs leading-relaxed">
                  {error}
                </div>
              )}

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 border border-white/10 hover:border-white/25 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                    />
                  </svg>
                )}
                <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-neutral-950 px-2.5 text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                  OR
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailSignup} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-300">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-black bg-white hover:bg-neutral-200 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account with Email</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-white/10 text-center text-xs text-neutral-500">
                Already have an account?{' '}
                <Link href="/login" className="text-white hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Skip auth option */}
        <div className="text-center">
          <Link href="/projects" className="text-xs text-neutral-500 hover:text-white transition">
            Skip auth — go to workspace →
          </Link>
        </div>
      </div>
    </div>
  );
}
