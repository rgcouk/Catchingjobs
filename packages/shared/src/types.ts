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
  description?: string | null;
  phoneNumber?: string | null;
}

export interface Region {
  id: string;
  name: string;
  county: string;
  activeCrews: number;
  featuredRoles: string[];
  seoCopy: string;
  description?: string | null;
  phoneNumber?: string | null;
  towns?: TownHub[];
}

export interface TownData {
  id: string;
  name: string;
  pickupPoint: string;
  surrounding: string;
  localizedCopy: string;
  description?: string | null;
  phoneNumber?: string | null;
  isRegionHub?: boolean;
  towns?: Array<{
    id: string;
    name: string;
    pickupPoint: string;
    surrounding?: string;
  }>;
  region: {
    id: string;
    name: string;
    county: string;
    activeCrews: number;
    seoCopy?: string;
  };
}

export interface RegionData {
  id: string;
  name: string;
  county: string;
  activeCrews: number;
  seoCopy: string;
  description?: string | null;
  phoneNumber?: string | null;
  towns: TownData[];
}

export interface JobPostingData {
  id: number;
  title: string;
  sector: 'chicken' | 'turkey' | string;
  townId: string;
  townName?: string;
  regionId?: string;
  regionName?: string;
  county?: string;
  pickupPoint?: string;
  description: string;
  payRate: string;
  status: string;
  createdAt?: string;
  weeklyPayEst?: string;
  shiftPattern?: string;
  requirements?: string[];
  trainingStandards?: string[];
  _count?: {
    applications?: number;
  };
}

export interface TownLoaderData {
  town: TownData | null;
  sector: 'chicken' | 'turkey' | 'chickens' | 'turkeys';
  notFound?: boolean;
}

export interface JobLoaderData {
  job: JobPostingData | null;
  town: TownData | null;
  sector: 'chicken' | 'turkey';
  notFound?: boolean;
}

export type SSRRouteData = TownLoaderData | JobLoaderData;

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
  hasRightToWork: boolean | string | null;
  hasDrivingLicense: boolean | string | null;
  hasForkliftLicense?: boolean | string | null;
  shiftAvailability?: string;
  authProvider?: 'google' | 'facebook' | 'clerk';
  avatarUrl?: string;
}
