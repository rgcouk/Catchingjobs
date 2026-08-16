import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
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
import { Loader2 } from 'lucide-react';

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
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-background">
      {/* Right / Top - Branding & Copy */}
      <div className="flex flex-col justify-center flex-1 p-8 md:p-16 lg:p-24 border-b md:border-b-0 md:border-l border-border bg-muted/30">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-foreground">
              Join CatchingJobs
            </h1>
            <p className="text-lg text-muted-foreground">
              Create an account to apply for positions, manage your details, and join our
              professional teams.
            </p>
          </div>
          <div className="space-y-4 pt-8 border-t border-border">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-foreground">1</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Quick and straightforward onboarding process.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-foreground">2</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Immediate access to job opportunities near you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Left / Bottom - Auth Component */}
      <div className="flex items-center justify-center flex-1 p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              {pendingVerification
                ? 'Enter the verification code sent to your email.'
                : 'Fill in your details below to get started.'}
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {!pendingVerification ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isLoaded || form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
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
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isLoaded || verifyForm.formState.isSubmitting}
                >
                  {verifyForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>
              </form>
            </Form>
          )}

          {!pendingVerification && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={!isLoaded}
              >
                {FcGoogle ? <FcGoogle className="mr-2 h-4 w-4" /> : null}
                Google
              </Button>

              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
