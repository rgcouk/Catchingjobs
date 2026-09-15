/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* CatchingJobs · 2026 Brand Design System
 * Candidate & Employee Login
 * Palette: Cadmium Yellow (#FFCC00), Deep Obsidian (#090D14), Crisp White, Ivory (brand-ivory)
 * Typography: Plus Jakarta Sans (Headlines), Inter (Body), JetBrains Mono (Badges/Data)
 */

import React, { useState, useEffect } from 'react';
import { useSignIn, useAuth } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router';
import { FcGoogle } from 'react-icons/fc';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, ShieldCheck, Truck, Coins, ArrowRight, Lock, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import BrandLogo from '../../components/brand/BrandLogo';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';


const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      navigate('/employee', { replace: true });
    }
  }, [authLoaded, isSignedIn, navigate]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    if (!isLoaded) return;
    setError('');

    try {
      const result = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/employee');
      } else {
        setError('Further verification is required. Please check your email.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.longMessage || 'Failed to sign in. Please check your credentials.');
    }
  }

  const handleGoogleSignIn = () => {
    if (!isLoaded) return;
    signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      fallbackRedirectUrl: '/sso-callback',
      forceRedirectUrl: '/employee',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-obsidian selection:bg-brand-yellow selection:text-black antialiased">
      <PublicHeader />
      <div className="flex-1 flex flex-col md:flex-row">
      <Helmet>
        <title>Candidate Log In | CatchingJobs</title>
        <meta name="description" content="Sign in to your CatchingJobs operative portal account." />
      </Helmet>

      {/* Left Column - Brand Showcase (Deep Obsidian) */}
      <div className="flex flex-col justify-between flex-1 p-8 md:p-14 lg:p-20 bg-brand-obsidian text-white border-b md:border-b-0 md:border-r border-slate-900">
        <div className="space-y-8 max-w-lg">
          {/* Authentic Brand Monogram Lockup */}
          <BrandLogo variant="white" size="lg" asLink to="/" />

          <div className="space-y-3 pt-4">
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-brand-yellow bg-white/10 px-3 py-1 rounded border border-white/15">
              <ShieldCheck className="w-4 h-4" /> Pullum Ltd · GLAA Licence PULL0001
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white leading-tight">
              Sign in to manage your catching roster.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Access your door-to-door heated minibus schedule, verify weekly Friday payroll details, and
              receive direct shift updates from the Boston Depot Operations Desk.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10 text-xs text-slate-300 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center text-brand-yellow shrink-0 border border-white/10">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-display font-bold text-sm">Free Home Pickup</strong>
                <span>Direct heated Mercedes Sprinter collection across all English depots.</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center text-brand-yellow shrink-0 border border-white/10">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-display font-bold text-sm">Guaranteed Friday Pay</strong>
                <span>BACS transfers (£750–£1,050/wk) deposited every Friday with zero deduction.</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center text-brand-yellow shrink-0 border border-white/10">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-display font-bold text-sm">Full Welfare Oversight</strong>
                <span>GLAA compliant, Lantra bird welfare and Defra safety certified.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 text-xs font-mono text-slate-400 flex items-center justify-between">
          <Link to="/" className="hover:text-white flex items-center gap-1.5 transition-colors font-bold">
            <ArrowLeft className="w-3.5 h-3.5 text-brand-yellow" /> Back to Home
          </Link>
          <span>© {new Date().getFullYear()} Pullum Ltd</span>
        </div>
      </div>

      {/* Right Column: High-Contrast Auth Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-sm border border-slate-200 p-8 shadow-md space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black font-display tracking-tight text-black">
              Candidate Log In
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              Enter your registered email address and password to sign in.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm font-mono">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono uppercase text-slate-500 font-bold">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="bg-slate-50 border-slate-200 focus:border-black text-sm rounded-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600 font-mono" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-mono uppercase text-slate-500 font-bold">
                        Password
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-slate-50 border-slate-200 focus:border-black text-sm rounded-sm font-mono"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600 font-mono" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-black hover:bg-neutral-800 active:scale-95 text-white font-display font-bold text-xs uppercase tracking-wider py-3.5 rounded-sm shadow-xs cursor-pointer transition-all"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-yellow mr-2" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Log In <ArrowRight className="w-4 h-4 text-brand-yellow" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2 text-[11px] font-mono uppercase text-slate-400 font-bold absolute">
              Or continue with
            </span>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full border-slate-200 hover:border-black text-black font-display font-bold text-xs uppercase tracking-wider py-3 rounded-sm cursor-pointer"
            onClick={handleGoogleSignIn}
            
          >
            {FcGoogle ? <FcGoogle className="mr-2 h-4 w-4" /> : null}
            Google Single Sign-On
          </Button>

          <div className="text-center text-xs text-slate-600 pt-2 font-sans">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-black hover:underline">
              Apply to join roster
            </Link>
  </div>
  </div>
  </div>
    </div>
      <PublicFooter />
    </div>
  );
}