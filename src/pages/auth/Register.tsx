/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/employee',
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-[#F8FAFC] text-[#0F172A] selection:bg-[#059669] selection:text-white antialiased">
      <Helmet>
        <title>Create Account | CatchingJobs</title>
        <meta
          name="description"
          content="Create your CatchingJobs account to join professional agricultural catching crews."
        />
      </Helmet>

      {/* Right Column - Brand Showcase */}
      <div className="flex flex-col justify-between flex-1 p-8 md:p-14 lg:p-20 bg-[#0F172A] text-white border-b md:border-b-0 md:border-l border-slate-800">
        <div className="space-y-8 max-w-lg">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 group no-underline">
            <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center text-[#0F172A] font-bold text-xs">
              CJ
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Catching<span className="text-[#059669]">jobs</span>
            </span>
          </Link>

          <div className="space-y-3 pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#059669] bg-white/10 px-2.5 py-0.5 rounded-md border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5" />
              Direct Recruitment
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Start your career with Pullum Ltd.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Register now to apply for active poultry catching crews across the UK, complete your
              induction paperwork, and receive guaranteed Friday payroll.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/15 text-xs font-mono">
            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-[#059669] shrink-0 border border-white/10">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Free Door-to-Door Pickup</p>
                <p className="text-slate-400 font-sans text-xs">
                  Heated minibus collection from your door.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-[#059669] shrink-0 border border-white/10">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Guaranteed Friday Pay</p>
                <p className="text-slate-400 font-sans text-xs">Reliable weekly direct deposit.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-[#059669] shrink-0 border border-white/10">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Lantra Welfare Standard</p>
                <p className="text-slate-400 font-sans text-xs">
                  Full safety gear and sponsored certification.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 text-xs font-mono text-slate-400 flex items-center justify-between">
          <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span>© {new Date().getFullYear()} Pullum Ltd</span>
        </div>
      </div>

      {/* Left Column - Auth Card */}
      <div className="flex items-center justify-center flex-1 p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-xs space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              {pendingVerification ? 'Verify Your Email' : 'Create Account'}
            </h2>
            <p className="text-xs text-[#64748B]">
              {pendingVerification
                ? 'Enter the 6-digit verification code sent to your email.'
                : 'Fill in your details below to join the candidate roster.'}
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
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
                        <FormLabel className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Arthur"
                            className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-md"
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
                        <FormLabel className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="King"
                            className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-md"
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
                      <FormLabel className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.co.uk"
                          className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-md"
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
                      <FormLabel className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                        Password (8+ chars)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600 font-mono" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-[#059669] hover:bg-[#047857] text-white font-mono font-semibold text-xs uppercase tracking-wider py-3 rounded-md shadow-xs cursor-pointer transition-colors"
                  disabled={!isLoaded || form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                      <FormLabel className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                        6-Digit Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456"
                          className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-center tracking-widest font-mono text-lg rounded-md"
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
                  className="w-full bg-[#059669] hover:bg-[#047857] text-white font-mono font-semibold text-xs uppercase tracking-wider py-3 rounded-md shadow-xs cursor-pointer transition-colors"
                  disabled={!isLoaded || verifyForm.formState.isSubmitting}
                >
                  {verifyForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#E2E8F0]" />
                </div>
                <div className="relative flex justify-center text-xs font-mono uppercase">
                  <span className="bg-white px-2 text-[#94A3B8]">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] font-mono text-xs uppercase tracking-wider py-2.5 rounded-md cursor-pointer"
                onClick={handleGoogleSignUp}
                disabled={!isLoaded}
              >
                {FcGoogle ? <FcGoogle className="mr-2 h-4 w-4" /> : null}
                Google Single Sign-On
              </Button>
            </>
          )}

          <div className="text-center text-xs text-[#64748B] pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#059669] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
