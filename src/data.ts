/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProfessionalRole, Region, TenantConfig } from './types';

export const TENANTS: Record<'chicken' | 'turkey', TenantConfig> = {
  chicken: {
    id: 'chicken',
    subdomain: 'chicken',
    title: 'Poultry Harvesting Division',
    tagline: 'Elite Chicken Harvesting Crews & Safety Specialists',
    accentColor: 'emerald',
    introCopy:
      "Pullum Ltd operates the UK's most advanced professional poultry harvesting operations. We recruit exclusively for high-performing catching crews who demand professional standards, rigorous training, and guaranteed weekly earnings. We do not compromise on crew quality, animal welfare, or safety-first protocols.",
    standards: [
      'AHVLA Certified Welfare Standards',
      'Lantra Professional Poultry Handling Accreditation',
      'Safety Culture Verified Workplaces',
      'Guaranteed Friday Weekly Pay Cycles',
    ],
  },
  turkey: {
    id: 'turkey',
    subdomain: 'turkey',
    title: 'Turkey Harvesting Division',
    tagline: 'Heavy-Weight Agricultural Harvest & Loading Specialists',
    accentColor: 'teal',
    introCopy:
      'Providing highly disciplined, professional squads for seasonal and year-round turkey harvesting contracts. Our crews are trained to the highest safety and efficiency benchmarks set by Pullum Ltd. Secure stable high-status contracts with leading growers.',
    standards: [
      'Welfare-First Agricultural Certification',
      'Advanced Heavy Loading Compliance',
      'Safety Culture Compliance Auditing',
      'Premium Contract Earnings & Weekly Roster Stability',
    ],
  },
};

export const PROFESSIONAL_ROLES: ProfessionalRole[] = [
  {
    id: 'poultry-operative',
    title: 'Professional Poultry Operative',
    sector: 'chicken',
    weeklyPayEst: '£750 - £950',
    payRate: '£14.50 - £18.00 / hour + night shift premiums',
    shiftPattern: 'Guaranteed 40-50 hours weekly, stable night rosters',
    requirements: [
      'Excellent physical stamina and endurance',
      'Uncompromising commitment to animal welfare regulations',
      'Ability to operate cohesively within a disciplined team',
    ],
    description:
      'Deploying with elite agricultural harvesting squads across commercial production hubs. This role demands precision, pace, and a professional, high-status attitude toward modern food production workflows.',
    trainingStandards: [
      'Lantra Commercial Poultry Handling (Level 2)',
      'Pullum Ltd Standard Induction & Safety Culture Protocols',
    ],
  },
  {
    id: 'crew-leader',
    title: 'Poultry Crew Team Leader',
    sector: 'chicken',
    weeklyPayEst: '£1,050 - £1,300',
    payRate: '£19.00 - £23.00 / hour based on performance logs',
    shiftPattern: 'Consistent 5-night schedule, structured coordination roster',
    requirements: [
      'Minimum 2 years experience in commercial poultry operations',
      'Proven leadership capabilities and team management skills',
      'Full Right to Work documentation and active UK Driving License',
    ],
    description:
      'Lead a high-performing squad of 6-8 professional operatives. You will manage daily safety logs, animal welfare audits, and communicate directly with Pullum Ltd logistics managers to guarantee on-site efficiency.',
    trainingStandards: [
      'Lantra Poultry Catching Leadership (Level 3)',
      'Advanced Animal Welfare Officer Certification',
      'Emergency First Aid in Agricultural Environments',
    ],
  },
  {
    id: 'turkey-operative',
    title: 'Heavy Agricultural Operative',
    sector: 'turkey',
    weeklyPayEst: '£800 - £1,100',
    payRate: '£15.50 - £20.00 / hour + overtime premiums',
    shiftPattern: 'Consistent roster, balanced day and evening blocks',
    requirements: [
      'Excellent upper-body strength and physical coordination',
      'Rigorous attention to livestock safety guidelines',
      'Right to work in the UK and clean background status',
    ],
    description:
      'Operating inside state-of-the-art turkey housing and handling environments. Responsible for loading and welfare-compliant movement under Pullum Ltd quality oversight.',
    trainingStandards: [
      'Humane Live Transport Loading Certification',
      'Heavy Load Manual Handling & Joint Safety',
    ],
  },
  {
    id: 'safety-supervisor',
    title: 'Onsite Safety Supervisor',
    sector: 'turkey',
    weeklyPayEst: '£900 - £1,150',
    payRate: '£17.50 - £21.50 / hour',
    shiftPattern: '4-on, 4-off shift structure (12-hour shifts)',
    requirements: [
      'Exceptional attention to detail and record-keeping',
      'Assertive communication style to enforce safety rules',
      'Understanding of workplace hazard management principles',
    ],
    description:
      'Conduct on-site risk assessments and hazard checks. Complete safety inspections, audit crew certificates, and maintain safety task logs in the Safety Culture app.',
    trainingStandards: [
      'Safety Culture Compliance Auditing',
      'Pullum Ltd Quality Control and Risk Management Protocol',
    ],
  },
];

export const REGIONS: Region[] = [
  {
    id: 'lincolnshire',
    name: 'Lincolnshire',
    county: 'Lincolnshire',
    activeCrews: 14,
    featuredRoles: ['poultry-operative', 'crew-leader'],
    seoCopy:
      'Lincolnshire stands as the agricultural heartland of the UK. Pullum Ltd supplies premier poultry harvesting crews to major commercial operations throughout Boston, Sleaford, Grantham, and Lincoln. Our local crews enjoy consistent 50-hour workweeks with zero downtime, high-status weekly earnings, and professional career progression in structured environments.',
    towns: [
      {
        id: 'boston',
        name: 'Boston',
        pickupPoint: 'Boston Marketplace / Main Depot',
        surroundingAreas: ['Kirton', 'Sutterton', 'Spalding'],
        localizedCopy:
          'Serving Boston, Kirton, Sutterton, and Spalding. Vans leave nightly from Boston Marketplace. We offer fair labor recruitment under strict GLAA compliance. Please note: Pullum Ltd does not provide visa sponsorships for these roles.',
      },
      {
        id: 'lincoln',
        name: 'Lincoln',
        pickupPoint: 'Lincoln Central Hub',
        surroundingAreas: ['Washingborough', 'Branston', 'Cherry Willingham'],
        localizedCopy:
          'Serving Lincoln and surrounding agricultural zones. Vans leave nightly from Lincoln Central Hub. Fair labor recruitment and GLAA compliant practices guaranteed. No visa sponsorships available.',
      },
      {
        id: 'grantham',
        name: 'Grantham',
        pickupPoint: 'Grantham Station Outpost',
        surroundingAreas: ['Barrowby', 'Gonerby', 'Colsterworth'],
        localizedCopy:
          'Serving Grantham, Barrowby, Gonerby, and Colsterworth. Vans leave nightly from Grantham Station Outpost. Strict GLAA compliance. Note: No visa sponsorships are provided.',
      },
    ],
  },
  {
    id: 'norfolk',
    name: 'Norfolk',
    county: 'Norfolk',
    activeCrews: 9,
    featuredRoles: ['poultry-operative', 'safety-supervisor'],
    seoCopy:
      "With its dense concentration of agricultural operations, Norfolk is a key hub for our poultry catching and loading divisions. Recruiting in Norwich, Thetford, King's Lynn, and Diss, we offer stable year-round contracts under Pullum Ltd's strict professional code. Earn consistent high wages and secure verified training credentials.",
    towns: [
      {
        id: 'attleborough',
        name: 'Attleborough',
        pickupPoint: 'Attleborough Town Center',
        surroundingAreas: ['Wymondham', 'Besthorpe', 'Snetterton'],
        localizedCopy:
          'Serving Attleborough, Wymondham, Besthorpe, and Snetterton. Vans leave nightly from Attleborough Town Center. Fully GLAA compliant recruitment with no hidden fees. No visa sponsorship available.',
      },
    ],
  },
  {
    id: 'yorkshire',
    name: 'Yorkshire',
    county: 'North & East Yorkshire',
    activeCrews: 11,
    featuredRoles: ['turkey-operative', 'crew-leader'],
    seoCopy:
      "Serving both primary broiler and high-volume seasonal turkey sectors across Yorkshire's agricultural corridors. We maintain peak crew efficiency operating from Hull, York, Malton, and Driffield. Our professional team members benefit from the region's largest commercial harvesting contracts, ensuring guaranteed long-term earnings.",
  },
  {
    id: 'shropshire',
    name: 'Shropshire',
    county: 'Shropshire',
    activeCrews: 6,
    featuredRoles: ['poultry-operative', 'turkey-operative'],
    seoCopy:
      "Encompassing poultry and general livestock commercial lines in Shrewsbury, Oswestry, and Telford. Pullum Ltd's Shropshire teams are highly regarded for welfare excellence and absolute safety compliance. Our local farm contracts guarantee stable weekly rosters and secure Friday pay deposits.",
  },
  {
    id: 'suffolk',
    name: 'Suffolk',
    county: 'Suffolk',
    activeCrews: 8,
    featuredRoles: ['poultry-operative', 'safety-supervisor'],
    seoCopy:
      "Suffolk's agricultural operations demand high-integrity, well-trained crew members. Pullum Ltd provides premium support for facilities in Ipswich, Bury St Edmunds, and Eye. Our roles are perfect for local professionals seeking dependable, highly compensated physical careers.",
  },
];
