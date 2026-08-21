import api from "./axios-http";

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async ({ email, otp }) => {
  try {
    const response = await api.post("/api/auth/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestOtp = async (email) => {
  try {
    const response = await api.post("/api/auth/request-otp", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshSession = async (refreshToken) => {
  try {
    const response = await api.post("/api/auth/refresh", { refreshToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async (refreshToken) => {
  try {
    const response = await api.post("/api/auth/logout", { refreshToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const forgotPassword = async (email) => {
//   try {
//     const response = await api.post("/api/auth/forgot-password", { email });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };


// export const resetPassword = async ({ token, newPassword }) => {
//   try {
//     const response = await api.post("/api/auth/reset-password", { token, newPassword });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// GET /api/investor/portfolio
export const getPortfolio = async () => {
  try {
    const response = await api.get("/api/investor/portfolio");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/investor/sectors
export const getSectors = async () => {
  try {
    const response = await api.get("/api/investor/sectors");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/investor/dashboard/portfolio
export const getDashboardPortfolio = async () => {
  try {
    const response = await api.get("/api/investor/dashboard/portfolio");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/investor/dashboard/net-assets
export const getDashboardNetAssets = async () => {
  try {
    const response = await api.get("/api/investor/dashboard/net-assets");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/investor/dashboard/countries
export const getDashboardCountries = async () => {
  try {
    const response = await api.get("/api/investor/dashboard/countries");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/investor/dashboard/cluster
export const getDashboardCluster = async () => {
  try {
    const response = await api.get("/api/investor/dashboard/cluster");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/investor/countries
export const getCountries = async () => {
  try {
    const response = await api.get("/api/investor/countries");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/investor/assets
export const getAssets = async () => {
  try {
    const response = await api.get("/api/investor/assets");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/investor/assets/{assetId}/sub-entities
export const getAssetSubEntities = async ({ assetId }) => {
  try {
    const response = await api.get(`/api/investor/assets/${assetId}/sub-entities`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/admin/users
export const getAdminUsers = async () => {
  try {
    const response = await api.get("/api/admin/users");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/users
export const createAdminUser = async ({ fullName, email, role, active }) => {
  try {
    const response = await api.post("/api/admin/users", { fullName, email, role, active });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/users/{id}
export const updateAdminUser = async ({ id, fullName, role, active }) => {
  try {
    const response = await api.put(`/api/admin/users/${id}`, { fullName, role, active });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/users/{id}
export const deleteAdminUser = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// GET /api/public/values
export const getPublicValues = async () => {
  try {
    const response = await api.get("/api/public/values");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/timeline
export const getPublicTimeline = async () => {
  try {
    const response = await api.get("/api/public/timeline");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/stats
export const getPublicStats = async () => {
  try {
    const response = await api.get("/api/public/stats");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/site
export const getPublicSite = async () => {
  try {
    const response = await api.get("/api/public/site");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/portfolio
export const getPublicPortfolio = async () => {
  try {
    const response = await api.get("/api/public/portfolio");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/pages/{pageKey}
export const getPublicPage = async ({ pageKey }) => {
  try {
    const response = await api.get(`/api/public/pages/${pageKey}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/news
export const getPublicNews = async ({ page = 0, size = 9 } = {}) => {
  try {
    const response = await api.get("/api/public/news", { params: { page, size } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/news/{slug}
export const getPublicNewsBySlug = async ({ slug }) => {
  try {
    const response = await api.get(`/api/public/news/${slug}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/media
export const getPublicMedia = async () => {
  try {
    const response = await api.get("/api/public/media");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/leadership
export const getPublicLeadership = async () => {
  try {
    const response = await api.get("/api/public/leadership");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/foundation
export const getPublicFoundation = async () => {
  try {
    const response = await api.get("/api/public/foundation");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/countries
export const getPublicCountries = async () => {
  try {
    const response = await api.get("/api/public/countries");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/public/clusters
export const getPublicClusters = async () => {
  try {
    const response = await api.get("/api/public/clusters");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const subscribeNewsletter = async ({ fullName, email, consent, website = '', captchaToken = '' }) => {
  const response = await api.post('/api/public/newsletter', { fullName, email, consent, website, captchaToken });
  return response.data;
};

export const submitContactForm = async ({ fullName, phone, email, subject, message, consent, website = '', captchaToken = '' }) => {
  const response = await api.post('/api/public/contact', { fullName, phone, email, subject, message, consent, website, captchaToken });
  return response.data;
};

// GET /api/investor/sectors
export const getInvestorSectors = async () => {
  try {
    const response = await api.get("/api/investor/sectors");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInvestorPortfolio = async () => {
  try {
    const response = await api.get("/api/investor/portfolio");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInvestorDashboardPortfolio = async () => {
  try {
    const response = await api.get("/api/investor/dashboard/portfolio");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInvestorDashboardNetAssets = async () => {
  try {
    const response = await api.get("/api/investor/dashboard/net-assets");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInvestorDashboardCountries = async () => {
  try {
    const response = await api.get("/api/investor/dashboard/countries");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInvestorDashboardCluster = async () => {
  try {
    const response = await api.get("/api/investor/dashboard/cluster");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInvestorCountries = async () => {
  try {
    const response = await api.get("/api/investor/countries");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInvestorAssets = async () => {
  try {
    const response = await api.get("/api/investor/assets");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInvestorAssetSubEntities = async ({ assetId }) => {
  try {
    const response = await api.get(`/api/investor/assets/${assetId}/sub-entities`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/admin/sectors
export const getAdminSectors = async () => {
  try {
    const response = await api.get("/api/admin/sectors");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/sectors
export const createAdminSector = async ({ name, icon, description, publicDescription, companies, valuation, enabled, sortOrder }) => {
  try {
    const response = await api.post("/api/admin/sectors", { name, icon, description, publicDescription, companies, valuation, enabled, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/sectors/{id}
export const updateAdminSector = async ({ id, name, icon, description, publicDescription, companies, valuation, enabled, sortOrder }) => {
  try {
    const response = await api.put(`/api/admin/sectors/${id}`, { name, icon, description, publicDescription, companies, valuation, enabled, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/sectors/{id}
export const deleteAdminSector = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/sectors/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH /api/admin/sectors/{id}/status
export const updateAdminSectorStatus = async ({ id, enabled }) => {
  try {
    const response = await api.patch(`/api/admin/sectors/${id}/status`, { enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/admin/countries
export const getAdminCountries = async () => {
  try {
    const response = await api.get("/api/admin/countries");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/countries
export const createAdminCountry = async ({ countryName, numberOfYears, valuation, enabled, sortOrder }) => {
  try {
    const response = await api.post("/api/admin/countries", { countryName, numberOfYears, valuation, enabled, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/countries/{id}
export const updateAdminCountry = async ({ id, countryName, numberOfYears, valuation, enabled, sortOrder }) => {
  try {
    const response = await api.put(`/api/admin/countries/${id}`, { countryName, numberOfYears, valuation, enabled, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/countries/{id}
export const deleteAdminCountry = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/countries/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH /api/admin/countries/{id}/status
export const updateAdminCountryStatus = async ({ id, enabled }) => {
  try {
    const response = await api.patch(`/api/admin/countries/${id}/status`, { enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/admin/assets
export const getAdminAssets = async () => {
  try {
    const response = await api.get("/api/admin/assets");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/assets
export const createAdminAsset = async ({ name, description, valuation, enabled, subEntitiesVisible, allowSubEntities, sortOrder }) => {
  try {
    const response = await api.post("/api/admin/assets", { name, description, valuation, enabled, subEntitiesVisible, allowSubEntities, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAdminAsset = async ({ id, name, description, valuation, enabled, subclassesVisible, allowsSubclasses, sortOrder }) => {
  try {
    const response = await api.put(`/api/admin/assets/${id}`, { name, description, valuation, enabled, subclassesVisible, allowsSubclasses, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/assets/{id}
export const deleteAdminAsset = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/assets/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH /api/admin/assets/{id}/status
export const updateAdminAssetStatus = async ({ id, enabled }) => {
  try {
    const response = await api.patch(`/api/admin/assets/${id}/status`, { enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/admin/assets/{assetId}/sub-entities
export const getAdminAssetSubEntities = async ({ assetId }) => {
  try {
    const response = await api.get(`/api/admin/assets/${assetId}/sub-entities`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/assets/{assetId}/sub-entities
export const createAdminAssetSubEntity = async ({ assetId, name, description, parentSubEntityId, valuation, enabled, sortOrder }) => {
  try {
    const response = await api.post(`/api/admin/assets/${assetId}/sub-entities`, { name, description, parentSubEntityId, valuation, enabled, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/sub-entities/{id}
export const updateAdminSubEntity = async ({ id, name, description, parentSubEntityId, valuation, enabled, sortOrder }) => {
  try {
    const response = await api.put(`/api/admin/sub-entities/${id}`, { name, description, parentSubEntityId, valuation, enabled, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/sub-entities/{id}
export const deleteAdminSubEntity = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/sub-entities/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH /api/admin/sub-entities/{id}/status
export const updateAdminSubEntityStatus = async ({ id, enabled }) => {
  try {
    const response = await api.patch(`/api/admin/sub-entities/${id}/status`, { enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ VALUES ============
// GET /api/admin/values
export const getAdminValues = async () => {
  try {
    const response = await api.get("/api/admin/values");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/values
export const createAdminValue = async ({ number, title, description, sortOrder, enabled }) => {
  try {
    const response = await api.post("/api/admin/values", { number, title, description, sortOrder, enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/values/{id}
export const updateAdminValue = async ({ id, number, title, description, sortOrder, enabled }) => {
  try {
    const response = await api.put(`/api/admin/values/${id}`, { number, title, description, sortOrder, enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/values/{id}
export const deleteAdminValue = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/values/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ TIMELINE ============
// GET /api/admin/timeline
export const getAdminTimeline = async () => {
  try {
    const response = await api.get("/api/admin/timeline");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/timeline
export const createAdminTimeline = async ({ year, title, description, sortOrder, enabled }) => {
  try {
    const response = await api.post("/api/admin/timeline", { year, title, description, sortOrder, enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/timeline/{id}
export const updateAdminTimeline = async ({ id, year, title, description, sortOrder, enabled }) => {
  try {
    const response = await api.put(`/api/admin/timeline/${id}`, { year, title, description, sortOrder, enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/timeline/{id}
export const deleteAdminTimeline = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/timeline/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ PAGES ============
// GET /api/admin/pages
export const getAdminPages = async () => {
  try {
    const response = await api.get("/api/admin/pages");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/pages
export const createAdminPage = async ({ pageKey, sectionKey, title, body, sortOrder, enabled }) => {
  try {
    const response = await api.post("/api/admin/pages", { pageKey, sectionKey, title, body, sortOrder, enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/pages/{id}
export const updateAdminPage = async ({ id, pageKey, sectionKey, title, body, sortOrder, enabled }) => {
  try {
    const response = await api.put(`/api/admin/pages/${id}`, { pageKey, sectionKey, title, body, sortOrder, enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/pages/{id}
export const deleteAdminPage = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/pages/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ NEWS ============
// GET /api/admin/news
export const getAdminNews = async () => {
  try {
    const response = await api.get("/api/admin/news");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/news
export const createAdminNews = async ({ slug, title, category, publishDate, excerpt, body, coverImageUrl, published }) => {
  try {
    const response = await api.post("/api/admin/news", { slug, title, category, publishDate, excerpt, body, coverImageUrl, published });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/news/{id}
export const updateAdminNews = async ({ id, slug, title, category, publishDate, message, imageUrl, published }) => {
  try {
    const response = await api.put(`/api/admin/news/${id}`, { slug, title, category, publishDate, message, imageUrl, published });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/news/{id}
export const deleteAdminNews = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/news/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ MEDIA ============
// GET /api/admin/media
export const getAdminMedia = async () => {
  try {
    const response = await api.get("/api/admin/media");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/media
export const createAdminMedia = async ({ title, description, videoUrl, thumbnailUrl, durationLabel, sortOrder, enabled }) => {
  try {
    const response = await api.post("/api/admin/media", { title, description, videoUrl, thumbnailUrl, durationLabel, sortOrder, enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/media/{id}
export const updateAdminMedia = async ({ id, title, description, videoUrl, thumbnailUrl, durationLabel, sortOrder, enabled }) => {
  try {
    const response = await api.put(`/api/admin/media/${id}`, { title, description, videoUrl, thumbnailUrl, durationLabel, sortOrder, enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/media/{id}
export const deleteAdminMedia = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/media/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ LEADERSHIP ============
// GET /api/admin/leadership
export const getAdminLeadership = async () => {
  try {
    const response = await api.get("/api/admin/leadership");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/leadership
export const createAdminLeadership = async ({ personName, role, quote, photoUrl, sortOrder, enabled }) => {
  try {
    const response = await api.post("/api/admin/leadership", { personName, role, quote, photoUrl, sortOrder, enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/leadership/{id}
export const updateAdminLeadership = async ({ id, personName, role, quote, photoUrl, sortOrder, enabled }) => {
  try {
    const response = await api.put(`/api/admin/leadership/${id}`, { personName, role, quote, photoUrl, sortOrder, enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/leadership/{id}
export const deleteAdminLeadership = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/leadership/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ FOUNDATION ============
// GET /api/admin/foundation
export const getAdminFoundation = async () => {
  try {
    const response = await api.get("/api/admin/foundation");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/foundation
export const updateAdminFoundation = async ({ title, body, ctaLabel, ctaUrl, imageUrl }) => {
  try {
    const response = await api.put("/api/admin/foundation", { title, body, ctaLabel, ctaUrl, imageUrl });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ NEWSLETTER ============
// GET /api/admin/newsletter
export const getAdminNewsletter = async () => {
  try {
    const response = await api.get("/api/admin/newsletter");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/newsletter/{id}
export const deleteAdminNewsletter = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/newsletter/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ CONTACT MESSAGES ============
// GET /api/admin/contact-messages
export const getAdminContactMessages = async ({ page = 0, size = 20 } = {}) => {
  try {
    const response = await api.get("/api/admin/contact-messages", { params: { page, size } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/contact-messages/{id}
export const deleteAdminContactMessage = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/contact-messages/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH /api/admin/contact-messages/{id}/read
export const markAdminContactMessageAsRead = async ({ id }) => {
  try {
    const response = await api.patch(`/api/admin/contact-messages/${id}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ SETTINGS ============
// GET /api/admin/settings
export const getAdminSettings = async () => {
  try {
    const response = await api.get("/api/admin/settings");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/settings
export const updateAdminSettings = async ({
  dashboardTitle,
  dashboardSubtitle,
  portfolioIntroText,
  netAssetsIntroText,
  countriesIntroText,
  globalInvestmentValuation,
  yearsOfInvesting,
  hero,
  companyStats,
  contact,
  socialLinks,
  footerQuickLinks
}) => {
  try {
    const response = await api.put("/api/admin/settings", {
      dashboardTitle,
      dashboardSubtitle,
      portfolioIntroText,
      netAssetsIntroText,
      countriesIntroText,
      globalInvestmentValuation,
      yearsOfInvesting,
      hero,
      companyStats,
      contact,
      socialLinks,
      footerQuickLinks
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/uploads
export const uploadFile = async ({ file, folder = "" }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/api/admin/uploads", formData, {
      params: { folder },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/uploads
export const deleteFile = async ({ objectName }) => {
  try {
    const response = await api.delete("/api/admin/uploads", {
      params: { objectName }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ SITE INFO ============
// GET /api/site/info
export const getSiteInfo = async () => {
  try {
    const response = await api.get("/api/site/info");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/site/info/portfolio
export const getSiteInfoPortfolio = async ({ month, year } = {}) => {
  try {
    const response = await api.get("/api/site/info/portfolio", {
      params: { month, year }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/site/info/cluster
export const getSiteInfoCluster = async () => {
  try {
    const response = await api.get("/api/site/info/cluster");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/site/info/about
export const getSiteInfoAbout = async () => {
  try {
    const response = await api.get("/api/site/info/about");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/site/newsletter
export const subscribeSiteNewsletter = async ({ fullName, email, consent, website, captchaToken }) => {
  try {
    const response = await api.post("/api/site/newsletter", {
      fullName,
      email,
      consent,
      website,
      captchaToken
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ AUTHENTICATION ============
// POST /api/auth/login
export const login = async ({ email, password }) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/auth/verify-challenge
export const verifyChallenge = async ({ challengeId, answers }) => {
  try {
    const response = await api.post("/api/auth/verify-challenge", { challengeId, answers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/auth/refresh
export const refreshToken = async ({ refreshToken }) => {
  try {
    const response = await api.post("/api/auth/refresh", { refreshToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/auth/logout
export const logout = async ({ refreshToken }) => {
  try {
    const response = await api.post("/api/auth/logout", { refreshToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async ({ email }) => {
  try {
    const response = await api.post("/api/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/auth/verify-reset-challenge
export const verifyResetChallenge = async ({ challengeId, answers }) => {
  try {
    const response = await api.post("/api/auth/verify-reset-challenge", { challengeId, answers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/auth/reset-password
export const resetPassword = async ({ token, newPassword }) => {
  try {
    const response = await api.post("/api/auth/reset-password", { token, newPassword });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ INVESTOR CLUSTERS ============
// GET /api/investor/clusters
export const getInvestorClusters = async () => {
  try {
    const response = await api.get("/api/investor/clusters");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// GET /api/investor/assets/{assetId}/asset-subclasses
export const getInvestorAssetSubclasses = async ({ assetId }) => {
  try {
    const response = await api.get(`/api/investor/assets/${assetId}/asset-subclasses`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// ============ ADMIN USD KES RATES ============
// GET /api/admin/usd-kes-rates
export const getAdminUsdKesRates = async () => {
  try {
    const response = await api.get("/api/admin/usd-kes-rates");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/usd-kes-rates
export const createAdminUsdKesRate = async ({ month, year, kesValue, usdValue, currentDefault }) => {
  try {
    const response = await api.post("/api/admin/usd-kes-rates", {
      month,
      year,
      kesValue,
      usdValue,
      currentDefault
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/usd-kes-rates/{id}
export const updateAdminUsdKesRate = async ({ id, month, year, kesValue, usdValue, currentDefault }) => {
  try {
    const response = await api.put(`/api/admin/usd-kes-rates/${id}`, {
      month,
      year,
      kesValue,
      usdValue,
      currentDefault
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH /api/admin/usd-kes-rates/{id}/default
export const setAdminUsdKesRateAsDefault = async ({ id }) => {
  try {
    const response = await api.patch(`/api/admin/usd-kes-rates/${id}/default`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ ADMIN PERFORMANCE ============
// GET /api/admin/performance
export const getAdminPerformance = async () => {
  try {
    const response = await api.get("/api/admin/performance");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/performance
export const createAdminPerformance = async ({ month, year, portfolioValue, revenue, debt, gearing, returnOnAssets }) => {
  try {
    const response = await api.post("/api/admin/performance", {
      month,
      year,
      portfolioValue,
      revenue,
      debt,
      gearing,
      returnOnAssets
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/performance/{id}
export const updateAdminPerformance = async ({ id, month, year, portfolioValue, revenue, debt, gearing, returnOnAssets }) => {
  try {
    const response = await api.put(`/api/admin/performance/${id}`, {
      month,
      year,
      portfolioValue,
      revenue,
      debt,
      gearing,
      returnOnAssets
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/performance/{id}
export const deleteAdminPerformance = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/performance/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// ============ ADMIN LOGIN LOCKS ============
// GET /api/admin/login-locks
export const getAdminLoginLocks = async () => {
  try {
    const response = await api.get("/api/admin/login-locks");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/login-locks/{id}
export const deleteAdminLoginLock = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/login-locks/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// ============ ADMIN CLUSTERS ============
// GET /api/admin/clusters
export const getAdminClusters = async () => {
  try {
    const response = await api.get("/api/admin/clusters");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/clusters
export const createAdminCluster = async ({ name, icon, description, publicDescription, companies, valuation, enabled, sortOrder }) => {
  try {
    const response = await api.post("/api/admin/clusters", { name, icon, description, publicDescription, companies, valuation, enabled, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/clusters/{id}
export const updateAdminCluster = async ({ id, name, icon, description, publicDescription, companies, valuation, enabled, sortOrder }) => {
  try {
    const response = await api.put(`/api/admin/clusters/${id}`, { name, icon, description, publicDescription, companies, valuation, enabled, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/clusters/{id}
export const deleteAdminCluster = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/clusters/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH /api/admin/clusters/{id}/status
export const updateAdminClusterStatus = async ({ id, enabled }) => {
  try {
    const response = await api.patch(`/api/admin/clusters/${id}/status`, { enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ ADMIN ASSET SUBCLASSES ============
// GET /api/admin/assets/{assetId}/asset-subclasses
export const getAdminAssetSubclasses = async ({ assetId }) => {
  try {
    const response = await api.get(`/api/admin/assets/${assetId}/asset-subclasses`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST /api/admin/assets/{assetId}/asset-subclasses
export const createAdminAssetSubclass = async ({ assetId, name, description, valuation, enabled, sortOrder }) => {
  try {
    const response = await api.post(`/api/admin/assets/${assetId}/asset-subclasses`, { name, description, valuation, enabled, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT /api/admin/asset-subclasses/{id}
export const updateAdminAssetSubclass = async ({ id, name, description, valuation, enabled, sortOrder }) => {
  try {
    const response = await api.put(`/api/admin/asset-subclasses/${id}`, { name, description, valuation, enabled, sortOrder });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE /api/admin/asset-subclasses/{id}
export const deleteAdminAssetSubclass = async ({ id }) => {
  try {
    const response = await api.delete(`/api/admin/asset-subclasses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH /api/admin/asset-subclasses/{id}/status
export const updateAdminAssetSubclassStatus = async ({ id, enabled }) => {
  try {
    const response = await api.patch(`/api/admin/asset-subclasses/${id}/status`, { enabled });
    return response.data;
  } catch (error) {
    throw error;
  }
};
