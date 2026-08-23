/**
 * Test landing page showcasing the LandingPage component
 * This can be accessed at /landings/test-landing to see the component in action
 */

import React from 'react';
import {
  ChickenCampaignLandingPage,
  TurkeyCampaignLandingPage,
  SpringRecruitmentLandingPage,
} from '../../components/landers/example-usage';

export default function TestLandingPage() {
  return (
    <div className="space-y-16">
      <h1 className="text-3xl font-display text-[var(--color-ink)] text-center">
        Landing Page Component Showcase
      </h1>
      <p className="text-lg text-[var(--color-ink-2)] max-w-2xl mx-auto font-normal leading-relaxed text-center">
        View examples of the reusable LandingPage component for different campaigns
      </p>

      {/* Chicken Campaign Example */}
      <section className="border-t border-[var(--color-rule)] pt-16">
        <h2 className="text-2xl font-display text-[var(--color-ink)]">Chicken Catching Campaign</h2>
        <ChickenCampaignLandingPage />
      </section>

      {/* Turkey Campaign Example */}
      <section className="border-t border-[var(--color-rule)] pt-16">
        <h2 className="text-2xl font-display text-[var(--color-ink)]">Turkey Catching Campaign</h2>
        <TurkeyCampaignLandingPage />
      </section>

      {/* Custom Campaign Example */}
      <section className="border-t border-[var(--color-rule)] pt-16">
        <h2 className="text-2xl font-display text-[var(--color-ink)]">
          Spring Recruitment Campaign
        </h2>
        <SpringRecruitmentLandingPage />
      </section>
    </div>
  );
}
