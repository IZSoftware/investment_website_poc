// 1. ASSET DATA (Investor Portal — Net Assets tree)
export const assetData = {
  'sovereign-fixed-income': {
    id: 'sovereign-fixed-income',
    title: 'Sovereign Fixed Income',
    description: 'Short-term investments, rates, and credit instruments.',
    value: '$1.5 B',
    date: 'AS AT July 30, 2026',
    enabled: true,
    subEntities: [
      { id: 'sovereign-bonds', title: 'Sovereign Bonds', description: 'Long-term investment instruments issued by governments.', value: '$0.9 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] },
      { id: 'sovereign-bills', title: 'Sovereign Bills', description: 'Short-term investment instruments with maturity under one year.', value: '$0.6 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] }
    ]
  },
  'credit': {
    id: 'credit', title: 'Credit', description: 'Corporate lending and bond portfolio investments.', value: '$1.0 B', date: 'AS AT July 30, 2026', enabled: true,
    subEntities: [
      { id: 'corporate-loan',  title: 'Corporate Loan',  description: 'Direct lending to corporate entities.',           value: '$0.6 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] },
      { id: 'corporate-bonds', title: 'Corporate Bonds', description: 'Fixed income securities issued by corporations.', value: '$0.4 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] }
    ]
  },
  'equities': {
    id: 'equities', title: 'Equities', description: 'Private equity positions and public equity market holdings.', value: '$1.0 B', date: 'AS AT July 30, 2026', enabled: true,
    subEntities: [
      { id: 'public-equity',  title: 'Public Equity',  description: 'Publicly traded equity securities and market positions.', value: '$0.5 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] },
      { id: 'private-equity', title: 'Private Equity', description: 'Direct investments in private companies and buyouts.',    value: '$0.3 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] },
      {
        id: 'international-equity', title: 'International Equity', description: 'Global equity investments across international markets.', value: '$0.2 B', date: 'AS AT July 30, 2026', enabled: true,
        subEntities: [
          { id: 'global-public-equity',  title: 'Global Public Equity',  description: 'International publicly traded equity positions.',          value: '$0.12 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] },
          { id: 'global-private-equity', title: 'Global Private Equity', description: 'International private equity investments and partnerships.', value: '$0.08 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] }
        ]
      }
    ]
  },
  'real-estate': {
    id: 'real-estate', title: 'Real Estate', description: 'Real estate holdings and infrastructure investments.', value: '$1.0 B', date: 'AS AT July 30, 2026', enabled: true,
    subEntities: [
      { id: 'residential',         title: 'Residential',         description: 'Residential property holdings and developments.', value: '$0.45 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] },
      { id: 'land',                title: 'Land',                description: 'Undeveloped land holdings and strategic parcels.', value: '$0.20 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] },
      { id: 'commercial-buildings',title: 'Commercial Buildings', description: 'Commercial real estate and office properties.',    value: '$0.35 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: [] }
    ]
  },
  'fund-of-funds': {
    id: 'fund-of-funds', title: 'Fund of Funds', description: 'Portfolio of investments in various investment funds.', value: '$0.5 B', date: 'AS AT July 30, 2026', enabled: true, subEntities: []
  }
};

export const getTopLevelAssets = () => Object.values(assetData);
export const getAssetById      = (id) => assetData[id] || null;

export const findSubEntity = (parentId, subId) => {
  const parent = assetData[parentId];
  if (!parent) return null;
  let found = parent.subEntities.find(s => s.id === subId);
  if (found) return found;
  for (const sub of parent.subEntities) {
    if (sub.subEntities?.length) {
      found = sub.subEntities.find(n => n.id === subId);
      if (found) return found;
    }
  }
  return null;
};

export const getBreadcrumbPath = (parentId, subId = null) => {
  const path = [{ title: 'Net Assets', path: '/investor-portal/net-assets' }];
  const parent = assetData[parentId];
  if (parent) {
    path.push({ title: parent.title, path: `/investor-portal/net-assets/${parentId}` });
    if (subId) {
      const sub = findSubEntity(parentId, subId);
      if (sub) path.push({ title: sub.title, path: `/investor-portal/net-assets/${parentId}/${subId}` });
    }
  }
  return path;
};

// 2. COMPANY DETAILS

export const companyDetails = {
  'NF Holding-finance': {
    name: 'NF HOLDING FINANCE', KESValue: '130,000,000,000', usdValue: '1,250,000,000',
    website: 'www.nfholdingsfinance.com', year: 'H1 2025', ownership: '1.95%',
    sector: 'Finance', sectorId: 'finance', country: 'Kenya', incorporated: 'Kenya', ticker: 'NFH', votingShare: '1.36%',
    historicalInvestments: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }],
    investmentChartData: [{ year: 2021, KES: 80000, usd: 780 },{ year: 2022, KES: 95000, usd: 920 },{ year: 2023, KES: 108000, usd: 1050 },{ year: 2024, KES: 120000, usd: 1160 },{ year: 2025, KES: 130000, usd: 1250 }],
    votingMeetings: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }]
  },
  'NF Holding-power': {
    name: 'NF HOLDING POWER', KESValue: '93,600,000,000', usdValue: '900,000,000',
    website: 'www.nfholdingspower.com', year: 'H1 2025', ownership: '2.15%',
    sector: 'Power', sectorId: 'power', country: 'Ghana', incorporated: 'Ghana', ticker: 'NFH', votingShare: '2.15%',
    historicalInvestments: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }],
    investmentChartData: [{ year: 2021, KES: 60000, usd: 580 },{ year: 2022, KES: 72000, usd: 695 },{ year: 2023, KES: 80000, usd: 770 },{ year: 2024, KES: 87000, usd: 840 },{ year: 2025, KES: 93600, usd: 900 }],
    votingMeetings: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }]
  },
  'NF Holding-energy': {
    name: 'NF HOLDINGS ENERGY', KESValue: '78,000,000,000', usdValue: '750,000,000',
    website: 'www.nfholdingsenergy.com', year: 'H1 2025', ownership: '1.75%',
    sector: 'Energy', sectorId: 'energy', country: 'Ethiopia', incorporated: 'Ethiopia', ticker: 'NFH', votingShare: '1.75%',
    historicalInvestments: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }],
    investmentChartData: [{ year: 2021, KES: 48000, usd: 460 },{ year: 2022, KES: 58000, usd: 560 },{ year: 2023, KES: 65000, usd: 625 },{ year: 2024, KES: 72000, usd: 694 },{ year: 2025, KES: 78000, usd: 750 }],
    votingMeetings: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }]
  },
  'NF Holding-hotels': {
    name: 'NF HOLDING HOTELS PLC', KESValue: '52,000,000,000', usdValue: '500,000,000',
    website: 'www.nfholdingshotels.com', year: 'H1 2025', ownership: '2.25%',
    sector: 'Hospitality', sectorId: 'hospitality', country: 'Rwanda', incorporated: 'Rwanda', ticker: 'NFH', votingShare: '2.25%',
    historicalInvestments: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }],
    investmentChartData: [{ year: 2021, KES: 30000, usd: 290 },{ year: 2022, KES: 38000, usd: 366 },{ year: 2023, KES: 43000, usd: 415 },{ year: 2024, KES: 48000, usd: 462 },{ year: 2025, KES: 52000, usd: 500 }],
    votingMeetings: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }]
  },
  'NF Holding-digital': {
    name: 'NF HOLDING DIGITAL', KESValue: '104,000,000,000', usdValue: '1,000,000,000',
    website: 'www.nfholdingsdigital.com', year: 'H1 2025', ownership: '1.65%',
    sector: 'Technology', sectorId: 'technology', country: 'Kenya', incorporated: 'Kenya', ticker: 'HLDDIG', votingShare: '1.65%',
    historicalInvestments: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }],
    investmentChartData: [{ year: 2021, KES: 62000, usd: 600 },{ year: 2022, KES: 74000, usd: 712 },{ year: 2023, KES: 84000, usd: 810 },{ year: 2024, KES: 95000, usd: 915 },{ year: 2025, KES: 104000, usd: 1000 }],
    votingMeetings: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }]
  },
  'NF Holding-realty': {
    name: 'NF HOLDING REALTY', KESValue: '62,400,000,000', usdValue: '600,000,000',
    website: 'www.nfholdingsrealty.com', year: 'H1 2025', ownership: '1.85%',
    sector: 'Real Estate', sectorId: 'real-estate', country: 'Kenya', incorporated: 'Kenya', ticker: 'HLDRLT', votingShare: '1.85%',
    historicalInvestments: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }],
    investmentChartData: [{ year: 2021, KES: 38000, usd: 366 },{ year: 2022, KES: 46000, usd: 443 },{ year: 2023, KES: 52000, usd: 500 },{ year: 2024, KES: 57000, usd: 549 },{ year: 2025, KES: 62400, usd: 600 }],
    votingMeetings: [{ date: '12/05/2025', meetingType: 'Annual' },{ date: '12/10/2024', meetingType: 'Annual' },{ date: '12/07/2023', meetingType: 'Annual' },{ date: '12/13/2022', meetingType: 'Annual' },{ date: '11/30/2021', meetingType: 'Annual' }]
  }
};

// 3. SECTORS
export const sectorsData = [
  {
    id: 'finance',    title: 'FINANCE',    icon: '💰', color: '#086F94',
    portfolioValue: '$1.25 B', portfolioPct: 25,
    heroImage: '/close-up-shot-business-study-essentials-white-desk-work-study-aesthetics.jpg',
    date: 'AS AT July 30, 2026',
    description: "We are addressing Africa's infrastructure deficit by mobilising global capital and allocating it to sectors that will power Africa to prosperity. Strong economic fundamentals and technological innovation have enabled us to build one of the largest pan-African banking networks, providing commercial and investment banking, asset management, and insurance services across the continent.",
    partnerships: [{ id: 'NF Holding-finance', name: 'NF HOLDING FINANCE', logo: '/NF Holding Logo.png', description: 'Leading African investment and securities company' }]
  },
  {
    id: 'technology', title: 'TECHNOLOGY', icon: '💻', color: '#00AAAA',
    portfolioValue: '$1.0 B', portfolioPct: 20,
    heroImage: '/ai-nuclear-energy-future-innovation-disruptive-technology.jpg',
    date: 'AS AT July 30, 2026',
    description: "We invest in innovative technology solutions that transform African industries and communities. From fintech to agritech, healthtech to edutech, our technology portfolio drives digital transformation across the continent, creating new opportunities and improving lives.",
    partnerships: [{ id: 'NF Holding-digital', name: 'NF HOLDING DIGITAL', logo: '/NF Holding Logo.png', description: 'Digital solutions and technology investments' }]
  },
  {
    id: 'hospitality', title: 'HOSPITALITY', icon: '🏨', color: '#D14850',
    portfolioValue: '$0.5 B', portfolioPct: 10,
    heroImage: '/beautiful-aerial-shot-city.jpg',
    date: 'AS AT July 30, 2026',
    description: "Premium hospitality assets including hotels, resorts, and tourism infrastructure. We develop and manage premium hospitality assets that redefine tourism experiences across Africa, combining world-class amenities with local cultural authenticity.",
    partnerships: [{ id: 'NF Holding-hotels', name: 'NF HOLDING HOTELS PLC', logo: '/NF Holding Logo.png', description: 'Luxury hospitality group with properties across Rwanda' }]
  },
  {
    id: 'power', title: 'POWER', icon: '🔋', color: '#7FBC4D',
    portfolioValue: '$0.9 B', portfolioPct: 18,
    heroImage: '/medium-shot-smiley-engineer-holding-tablet.jpg',
    date: 'AS AT July 30, 2026',
    description: "With an installed capacity of 2,000 megawatts, we supply 13–15% of national grid powering millions of homes. Our 120,000-kilometer power distribution network extends our reach to over 1.8 million customers including businesses, hospitals, and schools—empowering communities across Africa.",
    partnerships: [{ id: 'NF Holding-power', name: 'NF HOLDING POWER', logo: '/NF Holding Logo.png', description: 'Leading power generation company in Ghana' }]
  },
  {
    id: 'energy', title: 'ENERGY', icon: '⚡', color: '#B18C7F',
    portfolioValue: '$0.75 B', portfolioPct: 15,
    heroImage: '/sun-setting-silhouette-electricity-pylons.jpg',
    date: 'AS AT July 30, 2026',
    description: "Our energy portfolio focuses on sustainable energy solutions across Africa. We invest in oil, gas, and renewable energy projects that drive economic growth while ensuring environmental sustainability. Through strategic partnerships and innovative technologies, we're powering Africa's energy transition.",
    partnerships: [{ id: 'NF Holding-energy', name: 'NF HOLDINGS ENERGY', logo: '/NF Holding Logo.png', description: 'Integrated energy company' }]
  },
  {
    id: 'real-estate', title: 'REAL ESTATE', icon: '🏢', color: '#2A384C',
    portfolioValue: '$0.6 B', portfolioPct: 12,
    heroImage: '/beautiful-aerial-shot-city.jpg',
    date: 'AS AT July 30, 2026',
    description: "Commercial and residential real estate developments in key African markets. We develop and manage premium real estate assets that redefine urban landscapes across Africa. Our portfolio includes commercial properties, residential developments and mixed-use projects that combine world-class standards with local market understanding.",
    partnerships: [{ id: 'NF Holding-realty', name: 'NF HOLDING REALTY', logo: '/NF Holding Logo.png', description: 'Commercial and residential real estate across East Africa' }]
  }
];

// 4. CLUSTERS
export const clusters = [
  {
    id: 'finance',
    sectorId: 'finance', 
    title: 'Finance Cluster',
    image: '/close-up-shot-business-study-essentials-white-desk-work-study-aesthetics.jpg',
    secondImage: '/black-businessman-using-computer-laptop.jpg',
    description: 'Strategic investments in financial institutions driving economic growth.',
    logos: [
      { name: 'NF Holding Finance',         image: '/NF Holding Logo.png', link: '/clients/NF Holding-finance' },
      { name: 'NF Holding Capital',          image: '/NF Holding Logo.png', link: '/clients/NF Holding-finance' },
      { name: 'NF Holding Asset Management', image: '/NF Holding Logo.png', link: '/clients/NF Holding-finance' },
      { name: 'NF Holding Insurance',        image: '/NF Holding Logo.png', link: '/clients/NF Holding-finance' },
    ],
    stats: { branches: '210', customers: '2.5M', employees: '15,000', countries: '4' },
    statLabels: [{ key: 'branches', label: 'Branches' },{ key: 'customers', label: 'Customers' },{ key: 'employees', label: 'Employees' },{ key: 'countries', label: 'Countries' }],
    details: "Our Finance Cluster comprises strategic investments in leading financial institutions that form the backbone of economic development across multiple African markets."
  },
  {
    id: 'technology',
    sectorId: 'technology',
    title: 'Technology Cluster',
    image: '/ai-nuclear-energy-future-innovation-disruptive-technology.jpg',
    secondImage: '/data-center-developer-uses-vr-headset-ai-technology-machine-learning.jpg',
    description: 'Innovative tech solutions transforming African industries and communities.',
    logos: [
      { name: 'NF Holding Digital',   image: '/NF Holding Logo.png', link: '/clients/NF Holding-digital' },
      { name: 'NF Holding Tech Labs', image: '/NF Holding Logo.png', link: '/clients/NF Holding-digital' },
      { name: 'NF Holding Fintech',   image: '/NF Holding Logo.png', link: '/clients/NF Holding-digital' },
    ],
    stats: { dataCenters: '8', techStartups: '45', employees: '12,000', countries: '4' },
    statLabels: [{ key: 'dataCenters', label: 'Data Centers' },{ key: 'techStartups', label: 'Tech Startups' },{ key: 'employees', label: 'Employees' },{ key: 'countries', label: 'Countries' }],
    details: "The Technology Cluster represents our investment in cutting-edge digital solutions that are driving Africa's Fourth Industrial Revolution."
  },
  {
    id: 'hospitality',
    sectorId: 'hospitality',
    title: 'Hospitality Cluster',
    image: '/beautiful-aerial-shot-city.jpg', 
    secondImage: '/high-view-toy-model-house-keys.jpg',
    description: 'Premium hospitality assets redefining tourism experiences across Africa.',
    logos: [{ name: 'NF Holding Hotels PLC', image: '/NF Holding Logo.png', link: '/clients/NF Holding-hotels' }],
    stats: { hotels: '15', resorts: '8', employees: '10,000', countries: '4' },
    statLabels: [{ key: 'hotels', label: 'Hotels' },{ key: 'resorts', label: 'Resorts' },{ key: 'employees', label: 'Employees' },{ key: 'countries', label: 'Countries' }],
    details: "Our Hospitality Cluster encompasses premium hotels, resorts, and tourism infrastructure that are transforming the African hospitality landscape."
  },
  {
    id: 'power',
    sectorId: 'power',
    title: 'Power Cluster',
    image: '/medium-shot-smiley-engineer-holding-tablet.jpg',
    secondImage: '/engineer-electric-woman-checking-maintenance-solar-cells.jpg',
    description: 'Our Power investments focus on sustainable power generation and distribution across Africa.',
    logos: [
      { name: 'NF Holding Power',      image: '/NF Holding Logo.png', link: '/clients/NF Holding-power' },
      { name: 'NF Holding Power Grid', image: '/NF Holding Logo.png', link: '/clients/NF Holding-power' },
    ],
    stats: { totalCapacity: '1,500 MW', transmissionLines: '5,000 km', employees: '25,000', countries: '4' },
    statLabels: [{ key: 'totalCapacity', label: 'Total Capacity' },{ key: 'transmissionLines', label: 'Transmission Lines' },{ key: 'employees', label: 'Employees' },{ key: 'countries', label: 'Countries' }],
    details: "The Power Cluster represents our comprehensive approach to Africa's energy transformation through diversified power generation, transmission, and distribution assets."
  },
  {
    id: 'energy',
    sectorId: 'energy',
    title: 'Energy Cluster',
    image: '/sun-setting-silhouette-electricity-pylons.jpg',
    secondImage: '/african-american-technician-checks-maintenance-solar-panels-group-three-black-engineers-meeting-solar-station.jpg',
    description: 'Our energy investments focus on sustainable power generation and distribution across Africa.',
    logos: [
      { name: 'NF Holding Energy',     image: '/NF Holding Logo.png', link: '/clients/NF Holding-energy' },
      { name: 'NF Holding Renewables', image: '/NF Holding Logo.png', link: '/clients/NF Holding-energy' },
    ],
    stats: { powerPlants: '15', renewableCapacity: '800 MW', employees: '18,000', countries: '4' },
    statLabels: [{ key: 'powerPlants', label: 'Power Plants' },{ key: 'renewableCapacity', label: 'Renewable Capacity' },{ key: 'employees', label: 'Employees' },{ key: 'countries', label: 'Countries' }],
    details: "Our Energy Cluster represents a comprehensive portfolio of sustainable power generation and distribution assets strategically positioned across the African continent."
  },
  {
    id: 'real-estate',
    sectorId: 'real-estate',
    title: 'Real Estate Cluster',
    image: '/beautiful-aerial-shot-city.jpg', 
    secondImage: '/high-view-toy-model-house-keys.jpg',
    description: 'Premium developments that redefine urban landscapes across Africa.',
    logos: [
      { name: 'NF Holding Realty',       image: '/NF Holding Logo.png', link: '/clients/NF Holding-realty' },
      { name: 'NF Holding Developments', image: '/NF Holding Logo.png', link: '/clients/NF Holding-realty' },
    ],
    stats: { properties: '25', residentialUnits: '3,200', employees: '8,500', countries: '4' },
    statLabels: [{ key: 'properties', label: 'Properties' },{ key: 'residentialUnits', label: 'Residential Units' },{ key: 'employees', label: 'Employees' },{ key: 'countries', label: 'Countries' }],
    details: "Our Real Estate Cluster encompasses commercial and residential developments that are transforming urban landscapes across Africa."
  }
];

// 5. PORTFOLIO HIGHLIGHTS
export const portfolioHighlights = {

  hero: {
    backgroundImage: '/businessman-is-using-computer-laptop.jpg',
    title: 'Investment Portfolio',
  },
  highlightsTabLabel: 'HIGHLIGHTS',

  summaryText:
    "We invest in clusters that provide strong long-term returns and have the ability to transform Africa's economy. The value of our existing portfolio as at July 30, 2026 is USD 5.0 billion.",

  highlightStats: [
    { label: 'Clusters',         value: '6'     },
    { label: 'Countries',       value: '4'     },
    { label: 'Employees',       value: '40k+'  },
    { label: 'Portfolio Value', value: '$5 Bn' },
  ],

  sectorColors: {
    finance:      '#338BBA',
    technology:   '#FF6B6B',
    hospitality:  '#4ECDC4',
    power:        '#FFD166',
    energy:       '#06D6A0',
    'real-estate':'#118AB2',
  },

  philosophyTitle: 'INVESTMENT PHILOSOPHY',
  philosophyText:
    "Our approach to investment is guided by the philosophy of African capitalism, which is the private sector's commitment to Africa's development through long term investments that create economic prosperity and social wealth.",
};

// 6. INVESTMENT PORTFOLIO
export const investmentPortfolio = {
  totalPortfolio: { value: '$5.0 B', description: 'Net assets as at July 30, 2026' },
  countries: '4',
  years: '5',
  philosophyText: "Our approach to investment is guided by the philosophy of African capitalism, which is the private sector's commitment to Africa's development through long term investments that create economic prosperity and social wealth.",
  sectors: sectorsData.map(s => ({
    id: s.id, icon: s.icon, title: s.title, description: s.description,
    value: s.portfolioValue, date: s.date, valueDescription: 'Total Value'
  }))
};

// 7. PORTFOLIO KPI
export const portfolioKPI = {
  keyFacts: {
    kes: { aum: 520000, aumUnit: 'M', revenue: 38000, revenueUnit: 'M', debt: 14768, debtUnit: 'M', gearing: '29.4%', roa: '4.2%', operatingCountries: 4, lastUpdated: '31-Dec-2025', asAtDate: 'July 30, 2026' },
    usd: { aum: 5000,   aumUnit: 'M', revenue: 823,   revenueUnit: 'M', debt: 328,   debtUnit: 'M', gearing: '29.4%', roa: '4.2%', operatingCountries: 4, lastUpdated: '31-Dec-2025', asAtDate: 'July 30, 2026' }
  },
  investorRelations: { name: 'Charles', tel: '(+254) 71234567', email: 'investor@nf-holding.com' },
  portfolioTotals: { kes: 'KES 520,000 M', usd: 'USD 5,000 M', asAtDate: 'July 30, 2026' },
  pieChartSectors: sectorsData.map(s => ({ name: s.title.charAt(0) + s.title.slice(1).toLowerCase(), value: s.portfolioPct, color: s.color })),
  revenueData: {
    kes: [{ year: '2021', value: 22578 },{ year: '2022', value: 28525 },{ year: '2023', value: 33000 },{ year: '2024', value: 36000 },{ year: '2025', value: 38000 }],
    usd: [{ year: '2021', value: 448 },{ year: '2022', value: 562 },{ year: '2023', value: 650 },{ year: '2024', value: 740 },{ year: '2025', value: 823 }]
  },
  netShareData: [{ year: '2021', value: 0 },{ year: '2022', value: 0.21 },{ year: '2023', value: 0.28 },{ year: '2024', value: 0.32 },{ year: '2025', value: 0.32 }],
  netDebtGearingData: {
    kes: [{ year: '2021', netDebt: 14157, gearing: 39.0 },{ year: '2022', netDebt: 13134, gearing: 33.2 },{ year: '2023', netDebt: 12064, gearing: 28.6 },{ year: '2024', netDebt: 11303, gearing: 25.1 },{ year: '2025', netDebt: 14768, gearing: 29.4 }],
    usd: [{ year: '2021', netDebt: 333, gearing: 39.0 },{ year: '2022', netDebt: 297, gearing: 33.2 },{ year: '2023', netDebt: 265, gearing: 28.6 },{ year: '2024', netDebt: 238, gearing: 25.1 },{ year: '2025', netDebt: 328, gearing: 29.4 }]
  }
};

// 8. LEARN ABOUT US
export const learnAboutUs = {
  heading: 'Our Clusters',
  intro: "NF Holdings is a pan-African, family-owned investment group dedicated to building sustainable businesses that create long-term impact. Our investments focus on sectors that drive growth, improve lives, and shape Africa's future.",
  portfolioStatement: "We are committed to building enduring value through responsible investments that enhance lives and support Africa's transformation. Our portfolio was valued at $5.0 billion as of July 30, 2026.",
  exploreButtonLabel: 'EXPLORE OUR INVESTMENTS',
  investmentCards: [
    { id: 1, clusterId: 'finance',     image: '/close-up-shot-business-study-essentials-white-desk-work-study-aesthetics.jpg', title: 'Finance',     category: 'Finance',     description: 'Strategic investments in financial institutions driving economic growth across Africa.' },
    { id: 2, clusterId: 'technology',  image: '/ai-nuclear-energy-future-innovation-disruptive-technology.jpg',                title: 'Technology',  category: 'Technology',  description: 'Innovative tech solutions transforming African industries and communities.' },
    { id: 3, clusterId: 'hospitality', image: '/beautiful-aerial-shot-city.jpg',                                              title: 'Hospitality', category: 'Hospitality', description: 'Premium hospitality assets redefining tourism experiences across Africa.' },
    { id: 4, clusterId: 'power',       image: '/medium-shot-smiley-engineer-holding-tablet.jpg',                              title: 'Power',       category: 'Power',       description: 'Our Power investments focus on sustainable power generation and distribution across Africa.' },
    { id: 5, clusterId: 'energy',      image: '/sun-setting-silhouette-electricity-pylons.jpg',                               title: 'Energy',      category: 'Energy',      description: 'Our energy investments focus on sustainable power generation and distribution across Africa.' },
    { id: 6, clusterId: 'real-estate', image: '/beautiful-aerial-shot-city.jpg',                                              title: 'Real Estate', category: 'Real Estate', description: 'Premium developments that redefine urban landscapes across Africa.' },
  ],
  stats: [
    { label: 'Clusters',                                value: '6'      },
    { label: 'Continents',                             value: '1'      },
    { label: 'Countries',                              value: '4'      },
    { label: 'Employees',                              value: '40k +'  },
    { label: 'Current Value of Portfolio Investments', value: '$5.0 B' },
  ],
};

// 9. ABOUT PAGE
export const aboutPage = {
  hero: {
    image: '/group-afro-americans-working-together.jpg',
    eyebrow: 'NF Holdings Group',
    headline: "Building Africa's financial future",
    subheadline: 'A pan-African investment group allocating capital across six core sectors to power sustainable prosperity.',
  },
  stats: [
    { value: '$5.0 B', label: 'TOTAL PORTFOLIO' },
    { value: '4',      label: 'Countries' },
    { value: '6+',     label: 'Portfolio Cos.' },
    { value: '6',      label: 'Core Clusters' },
  ],
  whoWeAre: {
    para1: "NF Holdings Group is a premier pan-African investment firm with 5 years of focused experience mobilising global capital into Africa's most transformative sectors. We are builders — of financial institutions, energy infrastructure, healthcare networks, and technology platforms.",
    para2: "Capital deployed with purpose creates lasting value. Every thesis is grounded in deep regional knowledge, rigorous analysis, and long-term partnership.",
  },
  milestones: [
    { year: '2021', event: 'NF Holdings Group founded in Nairobi' },
    { year: '2022', event: 'First major infrastructure investment' },
    { year: '2023', event: 'Expansion into 4 African countries' },
    { year: '2024', event: 'Crossed $2.5 B AUM milestone' },
    { year: '2025', event: 'Reached $5.0 B TOTAL PORTFOLIO' },
  ],
  orbitAssets: [
    { id: 'sfi',    label: 'Sovereign\nFixed Income', pct: '30%', value: '$1.5 B', color: '#c4a078', subs: [{ label: 'Bonds', value: '$0.9 B' }, { label: 'Bills', value: '$0.6 B' }] },
    { id: 'credit', label: 'Credit',                  pct: '20%', value: '$1.0 B', color: '#8a9e7a', subs: [{ label: 'Corp.\nLoan', value: '$0.6 B' }, { label: 'Corp.\nBonds', value: '$0.4 B' }] },
    { id: 'eq',     label: 'Equities',                pct: '20%', value: '$1.0 B', color: '#7a8e9e', subs: [{ label: 'Public\nEquity', value: '$0.5 B' }, { label: 'Private\nEquity', value: '$0.3 B' }, { label: 'Intl.\nEquity', value: '$0.2 B' }] },
    { id: 're',     label: 'Real\nEstate',            pct: '20%', value: '$1.0 B', color: '#9e7a8a', subs: [{ label: 'Residential', value: '$0.45 B' }, { label: 'Land', value: '$0.20 B' }, { label: 'Commercial', value: '$0.35 B' }] },
    { id: 'fof',    label: 'Fund of\nFunds',          pct: '10%', value: '$0.5 B', color: '#7a9e8a', subs: [] },
  ],
  totalAUM: '$5.0 B',
  breakdown: {
    sfi:    [{ name: 'Sovereign Bonds', desc: 'Long-term investment instruments issued by governments.', value: '$0.9 B' }, { name: 'Sovereign Bills', desc: 'Short-term instruments with maturity under one year.', value: '$0.6 B' }],
    credit: [{ name: 'Corporate Loan', desc: 'Direct lending to corporate entities.', value: '$0.6 B' }, { name: 'Corporate Bonds', desc: 'Fixed income securities issued by corporations.', value: '$0.4 B' }],
    eq:     [{ name: 'Public Equity', desc: 'Publicly traded equity securities.', value: '$0.5 B' }, { name: 'Private Equity', desc: 'Direct investments in private companies.', value: '$0.3 B' }, { name: 'International Equity', desc: 'Global equity investments across markets.', value: '$0.2 B' }],
    re:     [{ name: 'Residential', desc: 'Residential property holdings and developments.', value: '$0.45 B' }, { name: 'Land', desc: 'Undeveloped land holdings and strategic parcels.', value: '$0.20 B' }, { name: 'Commercial Buildings', desc: 'Commercial real estate and office properties.', value: '$0.35 B' }],
    fof:    [],
  },
  values: [
    { label: 'Integrity',     body: 'We conduct business with the highest ethical standards, ensuring transparency and accountability in every decision.' },
    { label: 'Excellence',    body: 'We strive for superior performance and continuous improvement in all aspects of our investment activities.' },
    { label: 'Innovation',    body: 'We embrace creative thinking and forward-looking strategies to identify and capitalize on emerging opportunities.' },
    { label: 'Sustainability',body: 'We invest responsibly, prioritizing long-term value creation that benefits communities and the environment.' },
  ],
};

// 10. MARKETS DATA
export const marketsData = {
  companyOverview: { years: { value: '5', description: 'of focused investing' } },
  description: 'Our investments are strategically located across Africa, in markets targeted for their performance potential. This allows us to reap the benefits of each region and diversify our risk.',
  countries: [
    { id: 1, name: 'Kenya',    years: '5 years', value: '$2.0 B',  date: 'AS AT July 30, 2026' },
    { id: 2, name: 'Ghana',    years: '5 years', value: '$1.25 B', date: 'AS AT July 30, 2026' },
    { id: 3, name: 'Ethiopia', years: '5 years', value: '$1.0 B',  date: 'AS AT July 30, 2026' },
    { id: 4, name: 'Rwanda',   years: '5 years', value: '$0.75 B', date: 'AS AT July 30, 2026' },
  ],
  africanCountries: [
    'Algeria','Angola','Benin','Botswana','Burkina Faso','Burundi','Cabo Verde','Cameroon',
    'Central African Republic','Chad','Comoros','Democratic Republic of the Congo',
    'Republic of the Congo','Djibouti','Egypt','Equatorial Guinea','Eritrea','Eswatini',
    'Ethiopia','Gabon','Gambia','Ghana','Guinea','Guinea-Bissau','Ivory Coast','Kenya',
    'Lesotho','Liberia','Libya','Madagascar','Malawi','Mali','Mauritania','Mauritius',
    'Morocco','Mozambique','Namibia','Niger','Nigeria','Rwanda','Sao Tome and Principe',
    'Senegal','Seychelles','Sierra Leone','Somalia','South Africa','South Sudan','Sudan',
    'Tanzania','Togo','Tunisia','Uganda','Zambia','Zimbabwe',
  ],
  otherCountries: ['Canada','China','France','Germany','India','Japan','Singapore','United Arab Emirates','United Kingdom','United States'],
};

// HELPER FUNCTIONS
export const getCompanyById       = (id) => companyDetails[id] || null;
export const getSectorById        = (id) => sectorsData.find(s => s.id === id) || null;
export const getCompaniesBySector = (sectorId) => Object.entries(companyDetails).filter(([, c]) => c.sectorId === sectorId).map(([id, c]) => ({ id, ...c }));
export const getSectorForCompany  = (companyId) => { const c = companyDetails[companyId]; return c ? getSectorById(c.sectorId) : null; };
export const getClusterById = (id) => {
  return clusters.find(cluster => cluster.id === id);
};
export const getClusterBySector   = (sectorId) => clusters.find(c => c.sectorId === sectorId) || null;

export const getSectorsAsPortfolioCards = () =>
  sectorsData.map((s, i) => ({ id: i + 1, icon: s.icon, title: s.title, description: s.description, value: s.portfolioValue, date: s.date, valueDescription: 'Total Value', sectorId: s.id }));

export const getPieChartSectors = () => portfolioKPI.pieChartSectors;

export const getChartData = (type, currency = 'kes') => {
  switch (type) {
    case 'revenue':  return portfolioKPI.revenueData[currency] || [];
    case 'netShare': return portfolioKPI.netShareData;
    case 'gearing':  return portfolioKPI.netDebtGearingData[currency] || [];
    default:         return [];
  }
};

export const getTotalMarketsValue = (countries = marketsData.countries) => {
  let total = 0;
  countries.forEach(c => {
    const match = c.value.match(/[\d,.]+/);
    const num = match ? parseFloat(match[0].replace(/,/g, '')) : 0;
    if      (c.value.includes('B'))  total += num * 1e9;
    else if (c.value.includes('M'))  total += num * 1e6;
    else if (c.value.includes('Th')) total += num * 1e3;
    else total += num;
  });
  return `$${(total / 1e9).toFixed(1)} B`;
};

export const getSupportedCountries = () => [...marketsData.africanCountries, ...marketsData.otherCountries].sort();
export const getOrbitAssets        = () => aboutPage.orbitAssets;
export const getAssetBreakdown     = (assetId) => aboutPage.breakdown[assetId] || [];

export const getPortfolioHighlightsTabs = () => [
  { id: 0, name: portfolioHighlights.highlightsTabLabel, href: '#highlights' },
  ...sectorsData.map((s, i) => ({ id: i + 1, name: s.title, href: `#${s.id}` })),
];

export const getHighlightsPieData = () =>
  sectorsData.map(s => ({
    category:   s.title.charAt(0) + s.title.slice(1).toLowerCase(),
    percentage: s.portfolioPct,
    color:      portfolioHighlights.sectorColors[s.id] ?? s.color,
  }));

// 11. CLUSTER DESCRIPTIONS
export const clusterDescriptions = {
  'finance': sectorsData.find(s => s.id === 'finance').description,
  'technology': sectorsData.find(s => s.id === 'technology').description,
  'hospitality': sectorsData.find(s => s.id === 'hospitality').description,
  'power': sectorsData.find(s => s.id === 'power').description,
  'energy': sectorsData.find(s => s.id === 'energy').description,
  'real estate': sectorsData.find(s => s.id === 'real-estate').description,
  'manufacturing': "We back industrial and manufacturing ventures that strengthen Africa's production base, reduce import dependency, and create skilled jobs. Our manufacturing investments span light and heavy industry, building the factories and supply chains that power local economies.",
  'healthcare': "Our healthcare investments expand access to quality medical infrastructure across Africa — from hospitals and diagnostic networks to pharmaceutical distribution — improving health outcomes for millions while building resilient, modern care systems.",
  'agriculture': "We invest across the agricultural value chain, from farming and processing to logistics and distribution, strengthening food security and rural livelihoods while unlocking the continent's vast agricultural potential.",
  'education': "Our education investments support schools, training institutions, and edtech platforms that expand access to quality learning across Africa, equipping the next generation with the skills to drive the continent's growth.",
  'investment': "Through diversified investment vehicles and strategic partnerships, we deploy long-term capital into ventures across Africa's most promising sectors, generating sustainable returns while building enduring economic value.",
};

export const getClusterDescriptionByName = (name, fallback = 'Description coming soon.') => {
  if (!name) return fallback;
  return clusterDescriptions[name.trim().toLowerCase()] || fallback;
};

// 12. CLUSTER COMPANIES
export const clusterCompanies = {
  'finance': clusters.find(c => c.id === 'finance')?.logos ?? [],
  'technology': clusters.find(c => c.id === 'technology')?.logos ?? [],
  'hospitality': clusters.find(c => c.id === 'hospitality')?.logos ?? [],
  'power': clusters.find(c => c.id === 'power')?.logos ?? [],
  'energy': clusters.find(c => c.id === 'energy')?.logos ?? [],
  'real estate': clusters.find(c => c.id === 'real-estate')?.logos ?? [],
};

export const getClusterCompaniesByName = (name) => {
  if (!name) return [];
  return clusterCompanies[name.trim().toLowerCase()] || [];
};