/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProfessionalRole, Region, TenantConfig } from './types';

export const TENANTS: Record<'chicken' | 'turkey', TenantConfig> = {
  chicken: {
    id: 'chicken',
    subdomain: 'chicken',
    title: 'Chicken Broiler Catching Division',
    tagline: 'Professional Chicken Catching Crews & Night Shift Teams',
    accentColor: 'emerald',
    introCopy:
      'Pullum Ltd manages professional poultry catching teams across the UK. We recruit dedicated broiler catchers for night shift farm operations, working with major agricultural processors and growers. We provide free door-to-door heated minibus transport, strict animal welfare standards, and guaranteed weekly Friday pay.',
    standards: [
      'AHVLA & Lantra Poultry Welfare Standards (Level 2)',
      'GLAA Licensed Fair Recruitment (#PULL0001)',
      'Free Door-to-Door Heated Minibus Collection',
      'Guaranteed Friday Weekly Payroll direct to Bank',
    ],
  },
  turkey: {
    id: 'turkey',
    subdomain: 'turkey',
    title: 'Commercial Turkey Catching Division',
    tagline: 'Specialist Turkey Catching Crews & Module Loading Teams',
    accentColor: 'teal',
    introCopy:
      'Providing disciplined, professional teams for seasonal and year-round commercial turkey catching contracts across the UK. Our crews are trained in humane live bird handling, two-handed support techniques, and heavy module loading with guaranteed weekly wages.',
    standards: [
      'Defra & AHVLA Turkey Welfare Compliance',
      'Two-Handed Heavy Bird Manual Handling Protocols',
      'Free Minibus Pickup & Drop-Off Service',
      'Premium Contract Earnings & Weekly Roster Stability',
    ],
  },
};

export const PROFESSIONAL_ROLES: ProfessionalRole[] = [
  {
    id: 'poultry-operative',
    title: 'Professional Broiler Catcher',
    sector: 'chicken',
    weeklyPayEst: '£750 - £950',
    payRate: '£14.50 - £18.00 / hour + night shift premiums',
    shiftPattern: 'Guaranteed 40-50 hours weekly, stable night rosters (approx. 20:00 - 05:00)',
    requirements: [
      'Good physical stamina, agility, and manual handling capability',
      'Strict commitment to bird welfare regulations (catching by both legs)',
      'Ability to work cohesively inside darkened poultry sheds under blue light',
      'Punctual attendance for nightly minibus home collection',
    ],
    description:
      'Working as part of a 6–8 person catching team inside modern broiler sheds. Operatives carefully catch birds by both legs, support their breast, and load them into transport modules and drawers in accordance with AHVLA and Lantra welfare standards. Full training and PPE provided.',
    trainingStandards: [
      'Lantra Commercial Poultry Handling & Welfare (Level 2)',
      'Pullum Ltd Standard Induction & Shed Bio-Security Protocols',
    ],
  },
  {
    id: 'crew-leader',
    title: 'Poultry Catching Crew Leader',
    sector: 'chicken',
    weeklyPayEst: '£1,050 - £1,300',
    payRate: '£19.00 - £23.00 / hour based on team performance logs',
    shiftPattern: 'Consistent 5-night schedule, structured coordination roster',
    requirements: [
      'Minimum 2 years experience in commercial poultry catching teams',
      'Proven leadership skills and team management experience',
      'Full Right to Work in the UK and clean UK Driving License',
    ],
    description:
      'Lead and coordinate an active catching crew of 6–8 operatives. Responsibilities include managing nightly minibus pickup manifests, conducting pre-catch shed walk-throughs, ensuring strict compliance with bird welfare standards, and maintaining daily shift logs with farm managers.',
    trainingStandards: [
      'Lantra Poultry Catching Leadership (Level 3)',
      'Advanced Animal Welfare Officer Certification',
      'Emergency First Aid in Agricultural Environments',
    ],
  },
  {
    id: 'turkey-operative',
    title: 'Commercial Turkey Catcher',
    sector: 'turkey',
    weeklyPayEst: '£800 - £1,100',
    payRate: '£15.50 - £20.00 / hour + overtime premiums',
    shiftPattern: 'Consistent roster, balanced day and evening catching blocks',
    requirements: [
      'Good upper-body strength and physical coordination for heavy bird loading',
      'Strict compliance with humane handling guidelines',
      'Right to work in the UK and verified background check',
    ],
    description:
      'Working inside specialized turkey housing units. Responsibilities include two-handed support handling, welfare-compliant bird movement, and careful loading into live transport modules under Pullum Ltd welfare oversight.',
    trainingStandards: [
      'Humane Live Turkey Handling & Loading Certification',
      'Heavy Load Manual Handling & Joint Safety',
    ],
  },
  {
    id: 'safety-supervisor',
    title: 'Catching Welfare & Safety Supervisor',
    sector: 'turkey',
    weeklyPayEst: '£900 - £1,150',
    payRate: '£17.50 - £21.50 / hour',
    shiftPattern: '4-on, 4-off shift structure (12-hour shifts)',
    requirements: [
      'Exceptional attention to detail, welfare auditing, and record-keeping',
      'Strong communication skills to enforce biosecurity and health protocols',
      'In-depth knowledge of Defra animal welfare codes and farm biosecurity',
    ],
    description:
      'Conduct on-site bird welfare assessments, biosecurity foot-dip audits, and crew safety checks across contract farms. Maintain compliance logs in the Safety Culture system and ensure all team members follow proper handling techniques.',
    trainingStandards: [
      'Safety Culture Compliance Auditing',
      'Pullum Ltd Quality Control and Bird Welfare Risk Management',
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
      'Lincolnshire is the primary poultry production hub of the UK. Pullum Ltd supplies professional broiler and turkey catching teams to major grower farms throughout Boston, Sleaford, Grantham, and Lincoln. Our local crews enjoy free home pickup, consistent 45–50 hour workweeks, weekly Friday pay, and full Lantra welfare certification.',
    towns: [
      {
        id: 'boston',
        name: 'Boston',
        pickupPoint: 'Boston & surrounding area (Free home pickup)',
        surroundingAreas: ['Kirton', 'Sutterton', 'Spalding'],
        localizedCopy:
          'Serving Boston, Kirton, Sutterton, and Spalding. We pick you up directly from your front door in comfortable heated minibuses and return you home safely after each shift. We offer fair recruitment under strict GLAA compliance. Professional poultry catching teams in Boston with guaranteed Friday weekly pay. Please note: Pullum Ltd does not provide visa sponsorships for these roles.',
      },
      {
        id: 'sleaford',
        name: 'Sleaford',
        pickupPoint: 'Sleaford & surrounding area (Free home pickup)',
        surroundingAreas: ['Ruskington', 'Heckington', 'Ancaster'],
        localizedCopy:
          'Serving Sleaford, Ruskington, Heckington, and Ancaster. We pick you up directly from your front door in dedicated crew minibuses. Professional turkey and broiler catching teams across Lincolnshire under GLAA compliance with guaranteed Friday pay.',
      },
      {
        id: 'lincoln',
        name: 'Lincoln',
        pickupPoint: 'Lincoln & surrounding area (Free home pickup)',
        surroundingAreas: ['Washingborough', 'Branston', 'Cherry Willingham'],
        localizedCopy:
          'Serving Lincoln and surrounding poultry catching corridors with free home pickup. Fair recruitment and GLAA compliant practices guaranteed. No visa sponsorships available.',
      },
      {
        id: 'grantham',
        name: 'Grantham',
        pickupPoint: 'Grantham & surrounding area (Free home pickup)',
        surroundingAreas: ['Barrowby', 'Gonerby', 'Colsterworth'],
        localizedCopy:
          'Serving Grantham, Barrowby, Gonerby, and Colsterworth. free home pickup and return for all night shifts. Strict GLAA compliance. Note: No visa sponsorships are provided.',
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
      "With its dense concentration of poultry farms, Norfolk is a key hub for our broiler catching and loading divisions. Recruiting in Norwich, Thetford, Attleborough, and Diss, we offer stable year-round catching work with free home pickup under Pullum Ltd's strict professional standards. Earn consistent high weekly wages with verified welfare credentials.",
    towns: [
      {
        id: 'attleborough',
        name: 'Attleborough',
        pickupPoint: 'Attleborough & surrounding area (Free home pickup)',
        surroundingAreas: ['Wymondham', 'Besthorpe', 'Snetterton'],
        localizedCopy:
          'Serving Attleborough, Wymondham, Besthorpe, and Snetterton. We pick you up directly from your front door. Fully GLAA compliant recruitment with no hidden fees and guaranteed weekly pay. No visa sponsorship available.',
      },
      {
        id: 'thetford',
        name: 'Thetford',
        pickupPoint: 'Thetford & surrounding area (Free home pickup)',
        surroundingAreas: ['Brandon', 'Watton', 'East Harling'],
        localizedCopy:
          'Serving Thetford, Brandon, Watton, and East Harling. free home pickup for all night catching shifts. Fully GLAA compliant recruitment and guaranteed payroll.',
      },
      {
        id: 'norwich',
        name: 'Norwich',
        pickupPoint: 'Norwich & surrounding area (Free home pickup)',
        surroundingAreas: ['Costessey', 'Hethersett', 'Drayton'],
        localizedCopy:
          'Serving Norwich and broader Norfolk broiler catching corridors. Reliable nightly free home pickup with licensed crew leaders.',
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
      "Serving primary broiler and high-volume seasonal turkey growers across Yorkshire's agricultural corridors. We maintain peak crew efficiency operating from Hull, York, Malton, and Driffield with free home pickup. Our professional team members benefit from stable farm contracts, ensuring guaranteed long-term weekly earnings.",
    towns: [
      {
        id: 'hull',
        name: 'Hull',
        pickupPoint: 'Hull & surrounding area (Free home pickup)',
        surroundingAreas: ['Beverley', 'Cottingham', 'Hedon'],
        localizedCopy:
          'Serving Hull, Beverley, Cottingham, and Hedon. Dedicated crew minibuses pick you up directly from your front door. High-volume commercial poultry catching operations with guaranteed Friday pay.',
      },
      {
        id: 'york',
        name: 'York',
        pickupPoint: 'York & surrounding area (Free home pickup)',
        surroundingAreas: ['Selby', 'Malton', 'Pocklington'],
        localizedCopy:
          'Serving York, Selby, Malton, and Pocklington poultry farm zones with free home pickup. Professional catching teams with Lantra welfare certification.',
      },
    ],
  },
  {
    id: 'shropshire',
    name: 'Shropshire',
    county: 'Shropshire',
    activeCrews: 6,
    featuredRoles: ['poultry-operative', 'turkey-operative'],
    seoCopy:
      "Covering poultry catching operations in Shrewsbury, Oswestry, and Telford. Pullum Ltd's Shropshire teams are highly regarded for welfare excellence and absolute safety compliance. Our local farm contracts guarantee stable weekly rosters, free free home pickup, and secure Friday pay deposits.",
    towns: [
      {
        id: 'shrewsbury',
        name: 'Shrewsbury',
        pickupPoint: 'Shrewsbury & surrounding area (Free home pickup)',
        surroundingAreas: ['Oswestry', 'Telford', 'Wem'],
        localizedCopy:
          'Serving Shrewsbury, Oswestry, and Telford catching corridors. Night shift operations with dedicated free home pickup and Friday weekly pay.',
      },
    ],
  },
  {
    id: 'suffolk',
    name: 'Suffolk',
    county: 'Suffolk',
    activeCrews: 8,
    featuredRoles: ['poultry-operative', 'safety-supervisor'],
    seoCopy:
      "Suffolk's poultry farming operations demand high-integrity, well-trained team members. Pullum Ltd provides premium catching crew support for grower units in Ipswich, Bury St Edmunds, and Eye with free home pickup. Dependable, well-compensated physical catching roles with Friday pay.",
    towns: [
      {
        id: 'bury-st-edmunds',
        name: 'Bury St Edmunds',
        pickupPoint: 'Bury St Edmunds & surrounding area (Free home pickup)',
        surroundingAreas: ['Stowmarket', 'Haverhill', 'Thetford Borders'],
        localizedCopy:
          'Serving Bury St Edmunds, Stowmarket, and Haverhill with free home pickup. Professional catching crews operating under Pullum Ltd welfare standards.',
      },
    ],
  },
];
