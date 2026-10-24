export const jobs = [
  {
    id: 1,
    title: 'Night Shift Broiler Catcher',
    sector: 'chicken',
    townName: 'Boston',
    townId: 'boston',
    payRate: '£15.50 - £18.50/hr',
  },
  {
    id: 2,
    title: 'Commercial Turkey Catcher',
    sector: 'turkey',
    townName: 'Lincoln',
    townId: 'lincoln',
    payRate: '£16.00 - £19.50/hr',
  },
];

export const locations = [
  {
    id: 'lincolnshire',
    name: 'Lincolnshire',
    county: 'Lincolnshire',
    activeCrews: 4,
    seoCopy: 'Catching teams across Lincolnshire.',
    towns: [
      { id: 'boston', name: 'Boston', pickupPoint: 'Home pickup', surrounding: 'Boston area' },
      { id: 'lincoln', name: 'Lincoln', pickupPoint: 'Home pickup', surrounding: 'Lincoln area' },
    ],
  },
];
