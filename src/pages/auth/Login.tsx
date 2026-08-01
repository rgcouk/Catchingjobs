import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
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

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate('/user-portal');
      } else {
        // More steps needed (like MFA). For simplicity, we just log it here.
        console.log(result);
        setError("Further verification is required. Please check your email.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.longMessage || "Failed to sign in. Please check your credentials.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left / Top - Branding & Copy */}
      <div className="flex flex-col justify-center flex-1 p-8 md:p-16 lg:p-24 border-b md:border-b-0 md:border-r border-border bg-muted/30">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign in to manage your CatchingJobs profile, track applications, and view available shifts.
            </p>
          </div>
          <div className="space-y-4 pt-8 border-t border-border">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-foreground">1</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">Secure access to your work documents and schedule.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-foreground">2</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">Update your availability instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right / Bottom - Auth Component */}
      <div className="flex items-center justify-center flex-1 p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground">Enter your email and password to log in.</p>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
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
              <Button type="submit" className="w-full" disabled={!isLoaded || form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
