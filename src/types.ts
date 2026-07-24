/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProfessionalRole {
  id: string;
  title: string;
  sector: 'chicken' | 'turkey';
  weeklyPayEst: string;
  payRate: string;
  shiftPattern: string;
  requirements: string[];
  description: string;
  trainingStandards: string[];
}

export interface TownHub {
  id: string;
  name: string;
  pickupPoint: string;
  surroundingAreas: string[];
  localizedCopy: string;
}

export interface Region {
  id: string;
  name: string;
  county: string;
  activeCrews: number;
  featuredRoles: string[];
  seoCopy: string;
  towns?: TownHub[];
}

export interface TenantConfig {
  id: 'chicken' | 'turkey';
  subdomain: string;
  title: string;
  tagline: string;
  accentColor: string;
  introCopy: string;
  standards: string[];
}

export interface ApplicationData {
  userId?: string;
  name: string;
  email?: string;
  phone: string;
  town: string;
  hasRightToWork: boolean | null;
  hasDrivingLicense: boolean | null;
  shiftAvailability: string;
  authProvider?: 'google' | 'facebook';
  avatarUrl?: string;
}
