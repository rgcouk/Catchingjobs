/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/employee',
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] text-[#0F172A] selection:bg-[#059669] selection:text-white antialiased">
      <Helmet>
        <title>Sign In | CatchingJobs</title>
        <meta name="description" content="Sign in to your CatchingJobs catcher portal account." />
      </Helmet>

      {/* Left Column - Brand Showcase */}
      <div className="flex flex-col justify-between flex-1 p-8 md:p-14 lg:p-20 bg-[#0F172A] text-white border-b md:border-b-0 md:border-r border-slate-800">
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
              <ShieldCheck className="w-3.5 h-3.5" /> Pullum Ltd · GLAA Licensed Operative Hub
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Sign in to manage your catching roster.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Access your door-to-door transit schedule, verify weekly Friday payroll details, and
              receive direct shift updates.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-[#059669] shrink-0 border border-white/10">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-medium">Free Door-to-Door Pickup</strong>
                <span>Direct home collection across all UK catching corridors.</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-[#059669] shrink-0 border border-white/10">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-medium">Guaranteed Friday Pay</strong>
                <span>BACS transfers deposited every Friday without deduction.</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-[#059669] shrink-0 border border-white/10">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-medium">Full Welfare Oversight</strong>
                <span>GLAA compliant, Lantra bird welfare safety certified.</span>
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

      {/* Right Column: High-Contrast Auth Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-xl border border-[#E2E8F0] p-8 shadow-xs space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Candidate Log In</h2>
            <p className="text-xs text-[#64748B]">
              Enter your registered email address and password to sign in.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
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
                    <FormLabel className="text-xs font-mono uppercase text-[#64748B]">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-md"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-mono uppercase text-[#64748B]">
                        Password
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-md"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-[#059669] hover:bg-[#047857] text-white font-mono font-semibold text-xs uppercase tracking-wider py-3 rounded-md shadow-xs cursor-pointer transition-colors"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Log In <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E2E8F0] w-full" />
            <span className="bg-white px-2 text-[11px] font-mono uppercase text-[#64748B] absolute">
              Or continue with
            </span>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] font-mono text-xs uppercase tracking-wider py-2.5 rounded-md cursor-pointer"
            onClick={handleGoogleSignIn}
            disabled={!isLoaded}
          >
            {FcGoogle ? <FcGoogle className="mr-2 h-4 w-4" /> : null}
            Google Single Sign-On
          </Button>

          <div className="text-center text-xs text-[#64748B] pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#059669] hover:underline">
              Apply to join roster
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
