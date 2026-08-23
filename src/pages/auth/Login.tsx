/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#059669] bg-white/10 px-3 py-1 rounded-full border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5" />
              Catcher & Staff Portal
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Welcome back to your shift roster.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Sign in to manage your CatchingJobs profile, view scheduled night runs, check
              payslips, and update your weekly availability.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/15 text-xs font-mono">
            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#059669] shrink-0 border border-white/10">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Free Door-to-Door Transit</p>
                <p className="text-slate-400 font-sans text-xs">
                  Direct pickup from your front door.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#059669] shrink-0 border border-white/10">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Guaranteed Friday Pay</p>
                <p className="text-slate-400 font-sans text-xs">
                  Direct BACS transfer every Friday.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#059669] shrink-0 border border-white/10">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">GLAA Licensed & Lantra Approved</p>
                <p className="text-slate-400 font-sans text-xs">
                  Highest safety and welfare benchmarks.
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

      {/* Right Column - Auth Card */}
      <div className="flex items-center justify-center flex-1 p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Sign In</h2>
            <p className="text-xs text-[#64748B]">
              Enter your verified email and password to log in.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
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
                    <FormLabel className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.co.uk"
                        className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-lg"
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
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600 font-mono" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-[#059669] hover:bg-[#047857] text-white font-mono font-semibold text-xs uppercase tracking-wider py-3 rounded-lg shadow-xs cursor-pointer transition-colors"
                disabled={!isLoaded || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>

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
            className="w-full border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] font-mono text-xs uppercase tracking-wider py-2.5 rounded-lg cursor-pointer"
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
