/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* CatchingJobs · 2026 Brand Design System
 * Candidate & Employee Login
 * Palette: Flame Orange (#ff7c20), Deep Obsidian (#090D14), Crisp White, Ivory (brand-ivory)
 * Typography: Plus Jakarta Sans (Headlines), Geist (Body), JetBrains Mono (Badges/Data)
 */

import { useState, useEffect } from 'react';
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
import { ShieldCheck, Truck, Coins, ArrowRight, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [error, setError] = useState('');
  const [googlePending, setGooglePending] = useState(false);
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

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setError('');
    setGooglePending(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/employee',
      });
    } catch {
      setError('Unable to continue with Google. Please try again.');
      setGooglePending(false);
    }
  };

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-white text-brand-obsidian selection:bg-brand-yellow selection:text-black antialiased">
        <div className="flex-1 flex flex-col md:flex-row">
          <>
            <title>Log In | CatchingJobs</title>
            <meta
              name="description"
              content="Sign in to your CatchingJobs operative portal account."
            />
          </>

          {/* Left Column - Brand Showcase (light surface) */}
          <div className="flex flex-col justify-between flex-1 p-6 py-8 md:p-16 bg-brand-ivory text-brand-obsidian border-b md:border-b-0 md:border-r border-slate-200">
            <div className="space-y-7 max-w-[592px]">
              {/* Authentic Brand Monogram Lockup */}

              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 text-[9px] md:text-[11px] font-mono font-bold text-brand-obsidian bg-white px-3 py-1 rounded border border-slate-200">
                  <ShieldCheck className="w-4 h-4" /> Pullum Ltd · GLAA Licence PULL0001
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-[32px] md:text-[48px] font-extrabold font-display text-brand-obsidian leading-tight text-balance">
                  Sign in to your account.
                </h1>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed text-pretty font-sans">
                  Access your door-to-door heated minibus schedule, verify weekly Friday payroll
                  details, and receive direct shift updates from the Boston Depot Operations Desk.
                </p>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-200 text-xs text-slate-600 font-sans">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-white flex items-center justify-center text-brand-obsidian shrink-0 border border-slate-200">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-brand-obsidian block font-display font-bold text-sm">
                      Free Home Pickup
                    </strong>
                    <span>
                      Direct heated Mercedes Sprinter collection across all English depots.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-white flex items-center justify-center text-brand-obsidian shrink-0 border border-slate-200">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-brand-obsidian block font-display font-bold text-sm">
                      Guaranteed Friday Pay
                    </strong>
                    <span>
                      BACS transfers (£750–£1,050/wk) deposited every Friday with zero deduction.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-white flex items-center justify-center text-brand-obsidian shrink-0 border border-slate-200">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-brand-obsidian block font-display font-bold text-sm">
                      Full Welfare Oversight
                    </strong>
                    <span>GLAA compliant, Lantra bird welfare and Defra safety certified.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 text-xs font-mono text-slate-600 flex items-center justify-between">
              <Link
                to="/"
                className="hover:text-brand-obsidian flex items-center gap-1.5 transition-colors font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-brand-yellow" /> Back to Home
              </Link>
              <span>© {new Date().getFullYear()} Pullum Ltd</span>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="flex-1 flex items-center justify-center p-6 py-12 md:p-16 bg-white">
            <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-display text-brand-obsidian tracking-tight text-balance">
                  Log In
                </h2>
                <p className="text-xs text-slate-600 font-sans">
                  Enter your registered email address and password to sign in.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm font-mono"
                >
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
                        <FormLabel className="text-sm text-brand-obsidian font-semibold">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            {...field}
                            className="bg-white border-slate-200 focus:border-brand-orange min-h-12 text-sm rounded-sm"
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
                          <FormLabel className="text-sm text-brand-obsidian font-semibold">
                            Password
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            {...field}
                            className="bg-white border-slate-200 focus:border-brand-orange min-h-12 text-sm rounded-sm font-mono"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600 font-mono" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={!isLoaded || form.formState.isSubmitting || googlePending}
                    className="w-full bg-brand-orange hover:bg-brand-obsidian hover:text-white text-brand-obsidian font-display font-bold text-sm min-h-12 py-3 rounded-sm shadow-xs cursor-pointer"
                  >
                    {form.formState.isSubmitting ? (
                      <span>Signing in…</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Log In <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2 text-[11px] font-mono uppercase text-slate-600 font-bold absolute">
                  Or continue with
                </span>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full border-slate-200 hover:border-black text-black font-display font-bold text-sm min-h-12 py-3 rounded-sm cursor-pointer"
                disabled={!isLoaded || googlePending || form.formState.isSubmitting}
                onClick={handleGoogleSignIn}
              >
                {FcGoogle ? <FcGoogle className="mr-2 h-4 w-4" /> : null}
                {googlePending ? 'Connecting to Google…' : 'Google Single Sign-On'}
              </Button>

              <div className="text-center text-xs text-slate-600 pt-2 font-sans">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-black hover:underline">
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
