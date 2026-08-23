/**
 * Example usage of the LandingPage component
 * This demonstrates how to use the reusable landing page component for different campaigns
 */

import React from 'react';
import LandingPage from './LandingPage';

// Example 1: Chicken Catching Campaign Landing Page
export function ChickenCampaignLandingPage() {
  return (
    <LandingPage
      campaignId="chicken"
      title="Professional Chicken Catching Careers"
      subtitle="Join our elite poultry harvesting crews with guaranteed weekly pay and door-to-door transit across Lincolnshire, Norfolk, and Yorkshire."
      heroImage="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"
      ctaButtons={[
        {
          text: 'Find Chicken Catching Jobs',
          href: '/chickens',
          variant: 'primary',
          // Using lucide icon
        },
        {
          text: 'Call Our Team',
          href: 'tel:01522504311',
          variant: 'secondary',
        },
      ]}
      features={[
        {
          title: 'Guaranteed Weekly Pay',
          description:
            'Competitive rates of £750-£950 weekly paid every Friday directly to your bank account.',
          // Icon would be imported from lucide-react
        },
        {
          title: 'Door-to-Door Transit',
          description:
            'Minibus pickup from local depots including Boston, Sleaford, Grantham, Lincoln, Norwich, Thetford, Hull, York, and more.',
        },
        {
          title: 'Professional Training',
          description:
            'Lantra-accredited welfare training and safety certification provided for all team members.',
        },
        {
          title: 'Career Progression',
          description:
            'Clear pathways from operative to crew leader, safety supervisor, or transport coordinator roles.',
        },
      ]}
      testimonials={[
        {
          quote:
            'The crew leader in Boston looks after us properly. We get our wages every Friday without fail and the minibus is always on time for pickup.',
          author: 'David W.',
          role: 'Chicken Catching Operative, Boston',
        },
        {
          quote:
            "After 3 years with Pullum Ltd, I've progressed from operative to crew leader. They invest in their people and provide proper training.",
          author: 'Sarah K.',
          role: 'Crew Team Leader, Norfolk',
        },
      ]}
    />
  );
}

// Example 2: Turkey Catching Campaign Landing Page
export function TurkeyCampaignLandingPage() {
  return (
    <LandingPage
      campaignId="turkey"
      title="Seasonal Turkey Harvesting Opportunities"
      subtitle="Join our professional turkey harvesting teams for stable year-round contracts with premium earnings and welfare-first practices."
      heroImage="https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80&w=1200"
      ctaButtons={[
        {
          text: 'Explore Turkey Catching Jobs',
          href: '/turkeys',
          variant: 'primary',
        },
        {
          text: 'Talk to Recruitment',
          href: 'tel:01522504311',
          variant: 'secondary',
        },
      ]}
      features={[
        {
          title: 'Premium Contract Earnings',
          description:
            'Weekly rates of £800-£1,100 for heavy agricultural work with guaranteed weekly pay every Friday.',
        },
        {
          title: 'Welfare-First Approach',
          description:
            'All operations follow strict animal welfare guidelines with Lantra-certified training provided.',
        },
        {
          title: 'Structured Shift Patterns',
          description:
            'Consistent rosters with balanced day/evening blocks and overtime premiums available.',
        },
        {
          title: 'Safety Culture Compliance',
          description:
            'Regular safety audits, hazard checks, and PPE provided for all team members.',
        },
      ]}
      testimonials={[
        {
          quote:
            'The turkey harvesting work is professionally managed. We get proper breaks, safety equipment, and our wages are always on time.',
          author: 'Michael T.',
          role: 'Heavy Agricultural Operative, Yorkshire',
        },
        {
          quote:
            "As a safety supervisor, I appreciate Pullum Ltd's commitment to workplace safety and regular compliance auditing.",
          author: 'Jennifer L.',
          role: 'Onsite Safety Supervisor, Shropshire',
        },
      ]}
    />
  );
}

// Example 3: Custom Campaign Landing Page (e.g., for a specific recruitment drive)
export function SpringRecruitmentLandingPage() {
  return (
    <LandingPage
      campaignId="spring-recruitment"
      title="Spring 2026 Recruitment Drive"
      subtitle="We\'re hiring now for immediate starts across our catching operations. Join our teams for guaranteed work through the busy season."
      showIntakeForm={true}
    />
  );
}

export default {
  ChickenCampaignLandingPage,
  TurkeyCampaignLandingPage,
  SpringRecruitmentLandingPage,
};
