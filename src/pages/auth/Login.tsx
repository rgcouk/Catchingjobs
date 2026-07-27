import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-paper)]">
      {/* Left / Top - Branding & Copy */}
      <div className="flex flex-col justify-center flex-1 p-8 md:p-16 lg:p-24 border-b md:border-b-0 md:border-r border-[var(--color-rule)] bg-[var(--color-paper-2)]">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
              Welcome back
            </h1>
            <p className="text-lg text-[var(--color-ink-2)]">
              Sign in to manage your CatchingJobs profile, track applications, and view available shifts.
            </p>
          </div>
          <div className="space-y-4 pt-8 border-t border-[var(--color-rule)]">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--color-paper)] border border-[var(--color-rule)] flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-[var(--color-ink)]">1</span>
              </div>
              <p className="text-[var(--color-ink-2)] leading-relaxed text-sm">Secure access to your work documents and schedule.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--color-paper)] border border-[var(--color-rule)] flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-[var(--color-ink)]">2</span>
              </div>
              <p className="text-[var(--color-ink-2)] leading-relaxed text-sm">Update your availability instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right / Bottom - Auth Component */}
      <div className="flex items-center justify-center flex-1 p-8">
        <SignIn 
          routing="path" 
          path="/login" 
          signUpUrl="/register" 
          forceRedirectUrl="/user-portal"
          appearance={{
            variables: {
              colorPrimary: '#10B981', /* fallback accent */
            },
            elements: {
              card: "bg-[var(--color-paper)] shadow-none border border-[var(--color-rule)] rounded-xl",
              headerTitle: "font-display text-2xl text-[var(--color-ink)]",
              headerSubtitle: "text-[var(--color-ink-2)]",
              socialButtonsBlockButton: "border-[var(--color-rule)] text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors duration-[var(--dur-short)]",
              socialButtonsBlockButtonText: "font-medium text-[var(--color-ink)]",
              dividerLine: "bg-[var(--color-rule)]",
              dividerText: "text-[var(--color-ink-2)] bg-[var(--color-paper)]",
              formFieldLabel: "text-[var(--color-ink)] font-medium",
              formFieldInput: "bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] focus:border-[var(--color-focus)] focus:ring-1 focus:ring-[var(--color-focus)] transition-all duration-[var(--dur-short)] rounded-lg",
              formButtonPrimary: "bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity duration-[var(--dur-short)] rounded-lg",
              footerActionText: "text-[var(--color-ink-2)]",
              footerActionLink: "text-[var(--color-accent)] hover:underline",
            }
          }}
        />
      </div>
    </div>
  );
}
