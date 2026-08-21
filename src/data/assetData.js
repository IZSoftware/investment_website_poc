export const assetData = {
  'sovereign-fixed-income': {
    id: 'sovereign-fixed-income',
    title: 'Sovereign Fixed Income',
    description: 'Short-term investments, rates, and credit instruments.',
    value: '$154.3 B',
    date: 'AS AT July 30, 2026',
    enabled: true,
    subEntities: [
      {
        id: 'sovereign-bonds',
        title: 'Sovereign Bonds',
        description: 'Long-term investment instruments issued by governments.',
        value: '$98.7 B',
        date: 'AS AT July 30, 2026',
        enabled: true,
        subEntities: []
      },
      {
        id: 'sovereign-bills',
        title: 'Sovereign Bills',
        description: 'Short-term investment instruments with maturity under one year.',
        value: '$55.6 B',
        date: 'AS AT July 30, 2026',
        enabled: true,
        subEntities: []
      }
    ]
  },
  'credit': {
    id: 'credit',
    title: 'Credit',
    description: 'Corporate lending and bond portfolio investments.',
    value: '$87.2 B',
    date: 'AS AT July 30, 2026',
    enabled: true,
    subEntities: [
      {
        id: 'corporate-loan',
        title: 'Corporate Loan',
        description: 'Direct lending to corporate entities.',
        value: '$52.4 B',
        date: 'AS AT July 30, 2026',
        enabled: true,
        subEntities: []
      },
      {
        id: 'corporate-bonds',
        title: 'Corporate Bonds',
        description: 'Fixed income securities issued by corporations.',
        value: '$34.8 B',
        date: 'AS AT July 30, 2026',
        enabled: true,
        subEntities: []
      }
    ]
  },
  'equities': {
    id: 'equities',
    title: 'Equities',
    description: 'Private equity positions and public equity market NF Holding.',
    value: '$219.4 B',
    date: 'AS AT July 30, 2026',
    enabled: true,
    subEntities: [
      {
        id: 'public-equity',
        title: 'Public Equity',
        description: 'Publicly traded equity securities and market positions.',
        value: '$142.5 B',
        date: 'AS AT July 30, 2026',
        enabled: true,
        subEntities: []
      },
      {
        id: 'private-equity',
        title: 'Private Equity',
        description: 'Direct investments in private companies and buyouts.',
        value: '$38.2 B',
        date: 'AS AT July 30, 2026',
        enabled: true,
        subEntities: []
      },
      {
        id: 'international-equity',
        title: 'International Equity',
        description: 'Global equity investments across international markets.',
        value: '$38.7 B',
        date: 'AS AT July 30, 2026',
        enabled: true,
        subEntities: [
          {
            id: 'global-public-equity',
            title: 'Global Public Equity',
            description: 'International publicly traded equity positions.',
            value: '$24.3 B',
            date: 'AS AT July 30, 2026',
            enabled: true,
            subEntities: []
          },
          {
            id: 'global-private-equity',
            title: 'Global Private Equity',
            description: 'International private equity investments and partnerships.',
            value: '$14.4 B',
            date: 'AS AT July 30, 2026',
            enabled: true,
            subEntities: []
          }
        ]
      }
    ]
  },
  'real-estate': {
    id: 'real-estate',
    title: 'Real Estate',
    description: 'Real estate NF Holding and infrastructure investments.',
    value: '$105.9 B',
    date: 'AS AT July 30, 2026',
    enabled: true,
    subEntities: [
      {
        id: 'residential',
        title: 'Residential',
        description: 'Residential property NF Holding and developments.',
        value: '$48.3 B',
        date: 'AS AT July 30, 2026',
        enabled: true,
        subEntities: []
      },
      {
        id: 'land',
        title: 'Land',
        description: 'Undeveloped land NF Holding and strategic parcels.',
        value: '$22.1 B',
        date: 'AS AT July 30, 2026',
        enabled: true,
        subEntities: []
      },
      {
        id: 'commercial-buildings',
        title: 'Commercial Buildings',
        description: 'Commercial real estate and office properties.',
        value: '$35.5 B',
        date: 'AS AT July 30, 2026',
        enabled: true,
        subEntities: []
      }
    ]
  },
  'fund-of-funds': {
    id: 'fund-of-funds',
    title: 'Fund of Funds',
    description: 'Portfolio of investments in various investment funds.',
    value: '$68.5 B',
    date: 'AS AT July 30, 2026',
    enabled: true,
    subEntities: []
  }
};

// Helper function to get all top-level assets
export const getTopLevelAssets = () => {
  return Object.values(assetData);
};

// Helper function to get asset by ID
export const getAssetById = (id) => {
  return assetData[id] || null;
};

// Helper function to find nested sub-entity
export const findSubEntity = (parentId, subId) => {
  const parent = assetData[parentId];
  if (!parent) return null;
  
  // First level sub-entities
  let found = parent.subEntities.find(sub => sub.id === subId);
  if (found) return found;
  
  // Second level sub-entities (nested)
  for (const subEntity of parent.subEntities) {
    if (subEntity.subEntities && subEntity.subEntities.length > 0) {
      found = subEntity.subEntities.find(nested => nested.id === subId);
      if (found) return found;
    }
  }
  
  return null;
};

// Helper to get breadcrumb path
export const getBreadcrumbPath = (parentId, subId = null) => {
  const path = [{ title: 'Net Assets', path: '/investor-portal/net-assets' }];
  
  const parent = assetData[parentId];
  if (parent) {
    path.push({ title: parent.title, path: `/investor-portal/net-assets/${parentId}` });
    
    if (subId) {
      const sub = findSubEntity(parentId, subId);
      if (sub) {
        path.push({ title: sub.title, path: `/investor-portal/net-assets/${parentId}/${subId}` });
      }
    }
  }
  
  return path;
};