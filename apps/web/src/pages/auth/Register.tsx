/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* CatchingJobs · 2026 Brand Design System
 * Candidate & Operative Registration
 * Palette: Flame Orange (#ff7c20), Deep Obsidian (#090D14), Crisp White, Ivory (brand-ivory)
 * Typography: Plus Jakarta Sans (Headlines), Geist (Body), JetBrains Mono (Badges/Data)
 */

import { useState, useEffect } from 'react';
import { useSignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router';
import { FcGoogle } from 'react-icons/fc';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/brand/BrandLogo';
import { BrandIcon } from '@/components/brand/BrandIcon';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required.' }),
  lastName: z.string().min(2, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

const verifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, { message: 'Verification code must be 6 digits.' }),
});

export default function Register() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [error, setError] = useState('');
  const [googlePending, setGooglePending] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      navigate('/employee', { replace: true });
    }
  }, [authLoaded, isSignedIn, navigate]);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const verifyForm = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    if (!isLoaded) return;
    setError('');

    try {
      await signUp.create({
        firstName: values.firstName,
        lastName: values.lastName,
        emailAddress: values.email,
        password: values.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.longMessage || 'Failed to create account.');
    }
  }

  async function onVerifyPress(values: z.infer<typeof verifySchema>) {
    if (!isLoaded) return;
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: values.code,
      });

      if (completeSignUp.status !== 'complete') {
        console.log(JSON.stringify(completeSignUp, null, 2));
        setError('Unable to complete registration. Please try again.');
      } else {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate('/employee');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.longMessage || 'Failed to verify email.');
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    setError('');
    setGooglePending(true);
    try {
      await signUp.authenticateWithRedirect({
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
      <div className="min-h-dvh flex flex-col md:flex-row bg-white text-brand-obsidian selection:bg-brand-yellow selection:text-black antialiased">
        <>
          <title>Apply &amp; Register | CatchingJobs</title>
          <meta
            name="description"
            content="Create your CatchingJobs account to join professional agricultural catching crews with Pullum Ltd."
          />
        </>

        {/* Right Column - Brand Showcase (light surface) */}
        <div className="flex flex-col justify-between flex-1 p-6 py-8 md:p-16 bg-brand-ivory text-brand-obsidian border-b md:border-b-0 md:border-r border-slate-200">
          <div className="space-y-7 max-w-[592px]">
            <BrandLogo variant="scrolled" size="md" />

            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-[9px] md:text-[11px] font-mono font-bold text-brand-obsidian bg-white px-3 py-1 rounded border border-slate-200">
                <ShieldCheck className="w-4 h-4" />
                Direct Recruitment · GLAA Licence PULL0001
              </span>
              <h1 className="text-[32px] md:text-[48px] font-black font-display text-brand-obsidian leading-tight tracking-[-0.03em] text-balance">
                Start your career with Pullum Ltd.
              </h1>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed text-pretty font-sans">
                Register now to apply for active poultry catching crews across the UK, complete your
                induction paperwork, and receive guaranteed Friday payroll (£750–£1,050/wk).
              </p>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-200 text-xs font-mono">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <BrandIcon name="pickup" size={32} />
                </div>
                <div>
                  <p className="font-bold text-brand-obsidian font-display text-sm">
                    Free Door-to-Door Pickup
                  </p>
                  <p className="text-slate-600 font-sans text-xs">
                    Heated Mercedes Sprinter minibus collection from your door.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <BrandIcon name="pay" size={32} />
                </div>
                <div>
                  <p className="font-bold text-brand-obsidian font-display text-sm">
                    Guaranteed Friday Pay
                  </p>
                  <p className="text-slate-600 font-sans text-xs">
                    Direct BACS deposit every Friday with zero deductions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <BrandIcon name="verified" size={32} />
                </div>
                <div>
                  <p className="font-bold text-brand-obsidian font-display text-sm">
                    Lantra Welfare Standard
                  </p>
                  <p className="text-slate-600 font-sans text-xs">
                    Full safety gear and sponsored certification included.
                  </p>
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

        {/* Left Column - Auth Card */}
        <div className="flex items-center justify-center flex-1 p-6 py-12 md:p-16 bg-white">
          <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-brand-obsidian tracking-tight text-balance">
                {pendingVerification ? 'Verify Your Email' : 'Create Account'}
              </h2>
              <p className="text-xs text-slate-600 font-sans">
                {pendingVerification
                  ? 'Enter the 6-digit verification code sent to your email.'
                  : 'Fill in your details below to create an account.'}
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

            {!pendingVerification ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-brand-obsidian font-semibold">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="given-name"
                              placeholder="Arthur"
                              className="bg-white border-slate-200 focus:border-brand-orange min-h-12 text-sm rounded-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-600 font-mono" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-brand-obsidian font-semibold">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="family-name"
                              placeholder="King"
                              className="bg-white border-slate-200 focus:border-brand-orange min-h-12 text-sm rounded-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-600 font-mono" />
                        </FormItem>
                      )}
                    />
                  </div>

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
                            placeholder="name@example.co.uk"
                            className="bg-white border-slate-200 focus:border-brand-orange min-h-12 text-sm rounded-sm"
                            {...field}
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
                        <FormLabel className="text-sm text-brand-obsidian font-semibold">
                          Password (8+ chars)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            className="bg-white border-slate-200 focus:border-brand-orange min-h-12 text-sm rounded-sm font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600 font-mono" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-brand-orange hover:bg-brand-obsidian hover:text-white text-brand-obsidian font-display font-bold text-sm min-h-12 py-3 rounded-sm shadow-xs cursor-pointer"
                    disabled={!isLoaded || form.formState.isSubmitting || googlePending}
                  >
                    {form.formState.isSubmitting ? <>Creating Account...</> : 'Create Account'}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...verifyForm}>
                <form onSubmit={verifyForm.handleSubmit(onVerifyPress)} className="space-y-4">
                  <FormField
                    control={verifyForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-brand-obsidian font-semibold">
                          6-Digit Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="123456"
                            className="bg-white border-slate-200 focus:border-brand-orange min-h-12 text-center font-mono text-lg rounded-sm font-bold"
                            maxLength={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600 font-mono" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-brand-orange hover:bg-brand-obsidian hover:text-white text-brand-obsidian font-display font-bold text-sm min-h-12 py-3 rounded-sm shadow-xs cursor-pointer"
                    disabled={!isLoaded || verifyForm.formState.isSubmitting || googlePending}
                  >
                    {verifyForm.formState.isSubmitting ? (
                      <>Verifying...</>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {!pendingVerification && (
              <>
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
                  onClick={handleGoogleSignUp}
                >
                  {FcGoogle ? <FcGoogle className="mr-2 h-4 w-4" /> : null}
                  {googlePending ? 'Connecting to Google…' : 'Google Single Sign-On'}
                </Button>
              </>
            )}

            <div className="text-center text-xs text-slate-600 pt-2 font-sans">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-black hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
