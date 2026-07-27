import React from 'react';
import { SignUp } from '@clerk/clerk-react';

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-[var(--color-paper)]">
      {/* Right / Top - Branding & Copy */}
      <div className="flex flex-col justify-center flex-1 p-8 md:p-16 lg:p-24 border-b md:border-b-0 md:border-l border-[var(--color-rule)] bg-[var(--color-paper-2)]">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
              Join CatchingJobs
            </h1>
            <p className="text-lg text-[var(--color-ink-2)]">
              Create an account to apply for positions, manage your details, and join our professional teams.
            </p>
          </div>
          <div className="space-y-4 pt-8 border-t border-[var(--color-rule)]">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--color-paper)] border border-[var(--color-rule)] flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-[var(--color-ink)]">1</span>
              </div>
              <p className="text-[var(--color-ink-2)] leading-relaxed text-sm">Quick and straightforward onboarding process.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--color-paper)] border border-[var(--color-rule)] flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-[var(--color-ink)]">2</span>
              </div>
              <p className="text-[var(--color-ink-2)] leading-relaxed text-sm">Immediate access to job opportunities near you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Left / Bottom - Auth Component */}
      <div className="flex items-center justify-center flex-1 p-8">
        <SignUp 
          routing="path" 
          path="/register" 
          signInUrl="/login" 
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
