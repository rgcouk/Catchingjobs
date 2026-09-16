/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* CatchingJobs · 2026 Brand Design System
 * Candidate & Operative Registration
 * Palette: Cadmium Yellow (#fe9320), Deep Obsidian (#090D14), Crisp White, Ivory (brand-ivory)
 * Typography: Plus Jakarta Sans (Headlines), Inter (Body), JetBrains Mono (Badges/Data)
 */

import React, { useState, useEffect } from 'react';
import { useSignUp, useAuth } from '@clerk/clerk-react';
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
import { Loader2, ShieldCheck, Truck, Coins, ArrowRight, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import BrandLogo from '../../components/brand/BrandLogo';


const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required.' }),
  lastName: z.string().min(2, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

const verifySchema = z.object({
  code: z.string().min(6, { message: 'Verification code must be 6 digits.' }),
});

export default function Register() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [error, setError] = useState('');
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

  const handleGoogleSignUp = () => {
    if (!isLoaded) return;
    signUp.authenticateWithRedirect({
      strategy: 'oauth_google',
      fallbackRedirectUrl: '/sso-callback',
      forceRedirectUrl: '/employee',
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-white text-brand-obsidian selection:bg-brand-yellow selection:text-black antialiased">
      <Helmet>
        <title>Apply &amp; Register | CatchingJobs</title>
        <meta
          name="description"
          content="Create your CatchingJobs account to join professional agricultural catching crews with Pullum Ltd."
        />
      </Helmet>

      {/* Right Column - Brand Showcase (Deep Obsidian) */}
      <div className="flex flex-col justify-between flex-1 p-8 md:p-14 lg:p-20 bg-brand-obsidian text-white border-b md:border-b-0 md:border-l border-slate-900">
        <div className="space-y-8 max-w-lg">
          {/* Authentic Brand Monogram Lockup */}
          <BrandLogo variant="white" size="lg" asLink to="/" />

          <div className="space-y-3 pt-4">
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-brand-yellow bg-white/10 px-3 py-1 rounded border border-white/15">
              <ShieldCheck className="w-4 h-4" />
              Direct Recruitment · GLAA Licence PULL0001
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
              Start your career with Pullum Ltd.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              Register now to apply for active poultry catching crews across the UK, complete your
              induction paperwork, and receive guaranteed Friday payroll (£750–£1,050/wk).
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/15 text-xs font-mono">
            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center text-brand-yellow shrink-0 border border-white/10">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white font-display text-sm">Free Door-to-Door Pickup</p>
                <p className="text-slate-400 font-sans text-xs">
                  Heated Mercedes Sprinter minibus collection from your door.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center text-brand-yellow shrink-0 border border-white/10">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white font-display text-sm">Guaranteed Friday Pay</p>
                <p className="text-slate-400 font-sans text-xs">Direct BACS deposit every Friday with zero deductions.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center text-brand-yellow shrink-0 border border-white/10">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white font-display text-sm">Lantra Welfare Standard</p>
                <p className="text-slate-400 font-sans text-xs">
                  Full safety gear and sponsored certification included.
                </p>
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

      {/* Left Column - Auth Card */}
      <div className="flex items-center justify-center flex-1 p-6 sm:p-12 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-sm border border-slate-200 p-8 shadow-md space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black font-display tracking-tight text-black">
              {pendingVerification ? 'Verify Your Email' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              {pendingVerification
                ? 'Enter the 6-digit verification code sent to your email.'
                : 'Fill in your details below to create an account.'}
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-sm font-mono">
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
                        <FormLabel className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Arthur"
                            className="bg-slate-50 border-slate-200 focus:border-black text-sm rounded-sm"
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
                        <FormLabel className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="King"
                            className="bg-slate-50 border-slate-200 focus:border-black text-sm rounded-sm"
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
                      <FormLabel className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.co.uk"
                          className="bg-slate-50 border-slate-200 focus:border-black text-sm rounded-sm"
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
                      <FormLabel className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                        Password (8+ chars)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-slate-50 border-slate-200 focus:border-black text-sm rounded-sm font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600 font-mono" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-black hover:bg-neutral-800 active:scale-95 text-white font-display font-bold text-xs uppercase tracking-wider py-3.5 rounded-sm shadow-xs cursor-pointer transition-all"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-yellow" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
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
                      <FormLabel className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                        6-Digit Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456"
                          className="bg-slate-50 border-slate-200 focus:border-black text-center tracking-widest font-mono text-lg rounded-sm font-bold"
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
                  className="w-full bg-black hover:bg-neutral-800 active:scale-95 text-white font-display font-bold text-xs uppercase tracking-wider py-3.5 rounded-sm shadow-xs cursor-pointer transition-all"
                  disabled={verifyForm.formState.isSubmitting}
                >
                  {verifyForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-yellow" />
                      Verifying...
                    </>
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
                <span className="bg-white px-2 text-[11px] font-mono uppercase text-slate-400 font-bold absolute">
                  Or continue with
                </span>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full border-slate-200 hover:border-black text-black font-display font-bold text-xs uppercase tracking-wider py-3 rounded-sm cursor-pointer"
                onClick={handleGoogleSignUp}
                
              >
                {FcGoogle ? <FcGoogle className="mr-2 h-4 w-4" /> : null}
                Google Single Sign-On
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
  );
}