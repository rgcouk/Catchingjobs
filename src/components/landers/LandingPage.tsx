/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Modern Landing Page Component for Catchingjobs
 * Follows Hallmark design constraints for marketing/lander pages
 */

import React from 'react';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';

// Import UI components
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// Types
interface LandingPageProps {
  /** Campaign/sector identifier (e.g., 'chicken', 'turkey', 'spring-recruitment') */
  campaignId: string;
  /** Title/headline for the landing page */
  title: string;
  /** Subtitle or supporting text */
  subtitle?: string;
  /** Hero image URL (should follow illustration guidelines: flat, clean vector style) */
  heroImage?: string;
  /** Call to action buttons */
  ctaButtons?: Array<{
    text: string;
    href: string;
    variant?: 'primary' | 'secondary';
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  /** Features/benefits to display */
  features?: Array<{
    title: string;
    description: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  /** Testimonials to display */
  testimonials?: Array<{
    quote: string;
    author: string;
    role?: string;
  }>;
  /** Whether to show the intake form in hero (required for landers per CONTEXT.md) */
  showIntakeForm?: boolean;
  /** Custom intake form component (if not using default) */
  intakeFormComponent?: React.ReactNode;
  /** Additional CSS class for container */
  className?: string;
}

// Import icons (we'll use lucide-react consistently with the codebase)
import {
  MapPin,
  Users,
  ShieldCheck,
  Clock,
  Truck,
  CheckCircle2,
  ArrowRight,
  Phone,
  Bus,
  GraduationCap,
  Handshake,
  Coins,
} from 'lucide-react';

export default function LandingPage({
  campaignId,
  title,
  subtitle,
  heroImage,
  ctaButtons,
  features,
  testimonials,
  showIntakeForm = true,
  intakeFormComponent,
  className = '',
}: LandingPageProps) {
  // Generate unique ID for form
  const formId = `intake-form-${campaignId}-${Date.now()}`;

  // Default CTA buttons if none provided
  const defaultCTAs = ctaButtons || [
    {
      text: 'Explore Local Opportunities',
      href: `#locations`,
      variant: 'primary',
      icon: ArrowRight,
    },
    {
      text: 'Talk to Our Team',
      href: 'tel:01522504311',
      variant: 'secondary',
      icon: Phone,
    },
  ];

  // Default features if none provided (following Catchingjobs value props)
  const defaultFeatures = features || [
    {
      title: 'Guaranteed Weekly Pay',
      description:
        'Competitive rates paid on time, every single Friday, directly into your verified bank account.',
      icon: Coins,
    },
    {
      title: 'Door-to-Door Transit',
      description:
        'Minibus pickup from local town depots ensures seamless worker transit and punctual arrival times.',
      icon: Bus,
    },
    {
      title: 'Friendly & Professional Teams',
      description:
        'Work alongside dedicated professionals in welfare-compliant catching crews with experienced leaders.',
      icon: Users,
    },
    {
      title: 'Lantra Welfare Training',
      description:
        'We support your advancement with sponsored Lantra certification and humane handling credentials.',
      icon: GraduationCap,
    },
  ];

  // Default testimonials if none provided
  const defaultTestimonials = testimonials || [
    {
      quote:
        'Pullum Ltd runs the most organized catching crews. The hours are guaranteed, minibus pickup is always on time, and weekly wages are deposited every Friday morning without fail.',
      author: 'Arthur K.',
      role: 'Senior Catching Crew Leader',
    },
    {
      quote:
        "As an agricultural facility manager, I demand absolute safety and animal welfare compliance. Pullum Ltd's catching squads are disciplined, professional, and Lantra certified.",
      author: 'Mark R.',
      role: 'Agricultural Facility Manager',
    },
  ];

  return (
    <div
      className={`font-sans w-full pb-16 bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-[var(--color-paper)] ${className}`}
    >
      <Helmet>
        <title>{title} | CatchingJobs.co.uk</title>
        <meta name="description" content={subtitle || title} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showIntakeForm ? (
            <div className="grid lg:grid-cols-2 gap-12 py-16 lg:py-24 items-start lg:items-center">
              {/* Hero Content */}
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[var(--color-ink-2)] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                  {campaignId
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}{' '}
                  Division
                </span>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[1.1] tracking-tight text-[var(--color-ink)]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-lg sm:text-xl text-[var(--color-ink-2)] max-w-xl font-normal leading-relaxed">
                    {subtitle}
                  </p>
                )}

                {/* Value Props & Guarantees Row */}
                <div className="flex flex-wrap gap-6 pt-4 border-t border-[var(--color-rule)] pt-6">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-ink-2)] font-medium font-mono">
                    <Users className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Friendly Teams</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-ink-2)] font-medium font-mono">
                    <Truck className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Door-to-door Pickup</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-ink-2)] font-medium font-mono">
                    <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Guaranteed Weekly Pay</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  {defaultCTAs.map((cta, index) => {
                    const isExternal = cta.href.startsWith('http') || cta.href.startsWith('tel');
                    const linkClasses = `inline-flex items-center justify-center gap-2 ${
                      cta.variant === 'primary'
                        ? 'bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)]'
                        : 'border border-[var(--color-rule)] hover:border-[var(--color-ink)] bg-transparent text-[var(--color-ink)]'
                    } font-medium px-8 py-4 rounded-none transition-colors duration-200`;

                    return isExternal ? (
                      <a key={index} href={cta.href} className={linkClasses}>
                        <span>{cta.text}</span>
                        {cta.icon && <cta.icon className="w-5 h-5" />}
                      </a>
                    ) : (
                      <Link key={index} to={cta.href} className={linkClasses}>
                        <span>{cta.text}</span>
                        {cta.icon && <cta.icon className="w-5 h-5" />}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Intake Form (Required to be above the fold per CONTEXT.md) */}
              <div className="relative aspect-square lg:aspect-[4/5] bg-[var(--color-paper-2)] overflow-hidden mix-blend-multiply border border-[var(--color-rule)]">
                {heroImage ? (
                  <>
                    <img
                      src={heroImage}
                      alt={`${title} illustration`}
                      className="absolute inset-0 w-full h-full object-cover grayscale opacity-90"
                    />
                    <div className="absolute inset-0 bg-[var(--color-accent)] mix-blend-color-burn opacity-15"></div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[var(--color-paper-2)]/50"></div>
                )}
                {/* Form Container */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="w-full max-w-sm space-y-4 bg-white/90 backdrop-blur-sm p-6 rounded-border border border-[var(--color-rule)]/50">
                    <h3 className="text-lg font-display text-[var(--color-ink)] text-center">
                      Start Your Application
                    </h3>
                    <p className="text-sm text-[var(--color-ink-2)] text-center">
                      Complete our automated triage to join our professional catching crews
                    </p>
                    {intakeFormComponent ? (
                      intakeFormComponent
                    ) : (
                      <form
                        id={formId}
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          // In a real implementation, this would integrate with Clerk's passwordless auth
                          alert('Form submitted! Redirecting to verification...');
                        }}
                      >
                        <Input
                          type="email"
                          placeholder="Work Email Address"
                          required
                          className="w-full"
                        />
                        <Input type="tel" placeholder="Mobile Number" required className="w-full" />
                        <Button type="submit" className="w-full" variant="default">
                          Send Magic Link
                        </Button>
                        <p className="text-xs text-[var(--color-ink-2)] text-center mt-2">
                          We'll send you a magic link to verify your identity and access the full
                          application.
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 lg:py-24 text-center">
              <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[var(--color-ink-2)] uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                {campaignId
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}{' '}
                Division
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[1.1] tracking-tight text-[var(--color-ink)]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg sm:text-xl text-[var(--color-ink-2)] max-w-xl mx-auto font-normal leading-relaxed">
                  {subtitle}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                {defaultCTAs.map((cta, index) => {
                  const isExternal = cta.href.startsWith('http') || cta.href.startsWith('tel');
                  const linkClasses = `inline-flex items-center justify-center gap-2 ${
                    cta.variant === 'primary'
                      ? 'bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)]'
                      : 'border border-[var(--color-rule)] hover:border-[var(--color-ink)] bg-transparent text-[var(--color-ink)]'
                  } font-medium px-8 py-4 rounded-none transition-colors duration-200`;

                  return isExternal ? (
                    <a key={index} href={cta.href} className={linkClasses}>
                      <span>{cta.text}</span>
                      {cta.icon && <cta.icon className="w-5 h-5" />}
                    </a>
                  ) : (
                    <Link key={index} to={cta.href} className={linkClasses}>
                      <span>{cta.text}</span>
                      {cta.icon && <cta.icon className="w-5 h-5" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      {(features || defaultFeatures) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-display text-[var(--color-ink)] text-center">
                Why Choose Our{' '}
                {campaignId
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}{' '}
                Teams?
              </h2>
              <p className="text-lg text-[var(--color-ink-2)] max-w-2xl mx-auto font-normal leading-relaxed text-center">
                Professional agricultural catching built on security, respect, and career growth.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
                {(features || defaultFeatures).map((feature, index) => (
                  <div
                    key={index}
                    className="bg-[var(--color-paper)] border border-[var(--color-rule)] p-6 space-y-4 text-center"
                  >
                    {feature.icon && (
                      <div className="inline-flex items-center justify-center w-10 h-10 mx-auto mb-4 bg-[var(--color-paper-2)] text-[var(--color-accent)]">
                        <feature.icon className="w-5 h-5" />
                      </div>
                    )}
                    <h3 className="font-semibold text-[var(--color-ink)]">{feature.title}</h3>
                    <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {(testimonials || defaultTestimonials) && (
        <section className="py-16 bg-[var(--color-paper-2)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-display text-[var(--color-ink)] text-center">
                What Our Team Members Say
              </h2>
              <p className="text-lg text-[var(--color-ink-2)] max-w-2xl mx-auto font-normal leading-relaxed text-center">
                Hear from professionals who've built their careers with us
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {(testimonials || defaultTestimonials).map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-[var(--color-paper)] border border-[var(--color-rule)] p-6 flex flex-col justify-between space-y-4 relative"
                  >
                    {/* Quote mark */}
                    <div className="absolute top-4 right-4 w-8 h-8 text-[var(--color-rule)] pointer-events-none">
                      {' '}
                    </div>
                    <p className="text-sm text-[var(--color-ink-2)] leading-relaxed italic pr-6">
                      "{testimonial.quote}"
                    </p>
                    <div className="pt-4 border-t border-[var(--color-rule)] flex items-center justify-between">
                      <span className="font-medium text-[var(--color-ink)] text-sm">
                        {testimonial.author}
                      </span>
                      {testimonial.role && (
                        <span className="text-xs font-mono text-[var(--color-ink-2)] uppercase">
                          {testimonial.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display text-[var(--color-ink)]">
            Ready to Start Your Career?
          </h2>
          <p className="text-lg text-[var(--color-ink-2)] max-w-2xl mx-auto font-normal leading-relaxed">
            Join our professional catching crews with door-to-door pickup, friendly teams, and
            guaranteed weekly pay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to={`/${campaignId === 'chicken' ? 'chickens' : campaignId === 'turkey' ? 'turkeys' : ''}`}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] font-medium px-8 py-4 rounded-none transition-colors duration-200"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="#"
              className="inline-flex items-center justify-center gap-2 border border-[var(--color-rule)] hover:border-[var(--color-ink)] bg-transparent text-[var(--color-ink)] font-medium px-8 py-4 rounded-none transition-colors duration-200"
            >
              <span>Talk to Recruitment</span>
              <Phone className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
