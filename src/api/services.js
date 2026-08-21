import api from "./axios-http";

// Every function returns `response.data` — the API envelope
// { success, message, data, errors[] }. Pages check `envelope.success`
// and read `envelope.data` (README §2).

// ============================================================
// AUTH (README §5)
// ============================================================

// POST /api/auth/login
export const login = async ({ email, password }) => {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
};

// POST /api/auth/verify-challenge — answers = "8 digits in letter order"
export const verifyChallenge = async ({ challengeId, answers }) => {
  const response = await api.post("/api/auth/verify-challenge", { challengeId, answers });
  return response.data;
};

// POST /api/auth/refresh — rotates the refresh token; always store the new one
export const refreshToken = async ({ refreshToken }) => {
  const response = await api.post("/api/auth/refresh", { refreshToken });
  return response.data;
};

// POST /api/auth/logout
export const logout = async ({ refreshToken }) => {
  const response = await api.post("/api/auth/logout", { refreshToken });
  return response.data;
};

// POST /api/auth/forgot-password — data IS the challenge
export const forgotPassword = async ({ email }) => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data;
};

// POST /api/auth/verify-reset-challenge → { resetToken, expiresInMinutes }
export const verifyResetChallenge = async ({ challengeId, answers }) => {
  const response = await api.post("/api/auth/verify-reset-challenge", { challengeId, answers });
  return response.data;
};

// POST /api/auth/reset-password — same endpoint serves invite tokens (set-password page)
export const resetPassword = async ({ token, newPassword }) => {
  const response = await api.post("/api/auth/reset-password", { token, newPassword });
  return response.data;
};

// ============================================================
// SITE — public, no auth (README §6)
// ============================================================

// GET /api/site/info
export const getSiteInfo = async () => {
  const response = await api.get("/api/site/info");
  return response.data;
};

// GET /api/site/info/about
export const getSiteInfoAbout = async () => {
  const response = await api.get("/api/site/info/about");
  return response.data;
};

// GET /api/site/info/cluster
export const getSiteInfoCluster = async () => {
  const response = await api.get("/api/site/info/cluster");
  return response.data;
};

// GET /api/site/info/portfolio?month=&year=
export const getSiteInfoPortfolio = async ({ month, year } = {}) => {
  const response = await api.get("/api/site/info/portfolio", { params: { month, year } });
  return response.data;
};

// POST /api/site/newsletter
export const subscribeSiteNewsletter = async ({ fullName, email, consent, website, captchaToken }) => {
  const response = await api.post("/api/site/newsletter", {
    fullName,
    email,
    consent,
    website,
    captchaToken,
  });
  return response.data;
};

// ============================================================
// INVESTOR (README §7)
// ============================================================

// GET /api/investor/clusters
export const getInvestorClusters = async () => {
  const response = await api.get("/api/investor/clusters");
  return response.data;
};

// GET /api/investor/assets
export const getInvestorAssets = async () => {
  const response = await api.get("/api/investor/assets");
  return response.data;
};

// GET /api/investor/assets/{assetId}/asset-subclasses
export const getInvestorAssetSubclasses = async ({ assetId }) => {
  const response = await api.get(`/api/investor/assets/${assetId}/asset-subclasses`);
  return response.data;
};

// GET /api/investor/portfolio — full tree: AssetNode[] (asset + its subclasses[])
export const getInvestorPortfolio = async () => {
  const response = await api.get("/api/investor/portfolio");
  return response.data;
};

// GET /api/investor/countries
export const getInvestorCountries = async () => {
  const response = await api.get("/api/investor/countries");
  return response.data;
};

// GET /api/investor/dashboard/cluster
export const getInvestorDashboardCluster = async () => {
  const response = await api.get("/api/investor/dashboard/cluster");
  return response.data;
};

// GET /api/investor/dashboard/portfolio
export const getInvestorDashboardPortfolio = async () => {
  const response = await api.get("/api/investor/dashboard/portfolio");
  return response.data;
};

// GET /api/investor/dashboard/net-assets
export const getInvestorDashboardNetAssets = async () => {
  const response = await api.get("/api/investor/dashboard/net-assets");
  return response.data;
};

// GET /api/investor/dashboard/countries
export const getInvestorDashboardCountries = async () => {
  const response = await api.get("/api/investor/dashboard/countries");
  return response.data;
};

// ============================================================
// ADMIN PORTFOLIO (README §8.2) — canonical paths only
// ============================================================

// ---- Clusters ----
// companies = [{ id?, name, link, logo }] — whole-list replace on every write:
// echo existing ids, omit id for new rows, omit a row to delete it.

// GET /api/admin/clusters
export const getAdminClusters = async () => {
  const response = await api.get("/api/admin/clusters");
  return response.data;
};

// POST /api/admin/clusters
export const createAdminCluster = async ({ name, icon, description, publicDescription, companies, valuation, enabled, sortOrder }) => {
  const response = await api.post("/api/admin/clusters", { name, icon, description, publicDescription, companies, valuation, enabled, sortOrder });
  return response.data;
};

// PUT /api/admin/clusters/{id}
export const updateAdminCluster = async ({ id, name, icon, description, publicDescription, companies, valuation, enabled, sortOrder }) => {
  const response = await api.put(`/api/admin/clusters/${id}`, { name, icon, description, publicDescription, companies, valuation, enabled, sortOrder });
  return response.data;
};

// DELETE /api/admin/clusters/{id}
export const deleteAdminCluster = async ({ id }) => {
  const response = await api.delete(`/api/admin/clusters/${id}`);
  return response.data;
};

// PATCH /api/admin/clusters/{id}/status
export const updateAdminClusterStatus = async ({ id, enabled }) => {
  const response = await api.patch(`/api/admin/clusters/${id}/status`, { enabled });
  return response.data;
};

// ---- Assets ----

// GET /api/admin/assets
export const getAdminAssets = async () => {
  const response = await api.get("/api/admin/assets");
  return response.data;
};

// POST /api/admin/assets
export const createAdminAsset = async ({ name, description, valuation, enabled, subclassesVisible, allowsSubclasses, sortOrder }) => {
  const response = await api.post("/api/admin/assets", { name, description, valuation, enabled, subclassesVisible, allowsSubclasses, sortOrder });
  return response.data;
};

// PUT /api/admin/assets/{id}
export const updateAdminAsset = async ({ id, name, description, valuation, enabled, subclassesVisible, allowsSubclasses, sortOrder }) => {
  const response = await api.put(`/api/admin/assets/${id}`, { name, description, valuation, enabled, subclassesVisible, allowsSubclasses, sortOrder });
  return response.data;
};

// DELETE /api/admin/assets/{id} — cascades the soft-delete to subclasses
export const deleteAdminAsset = async ({ id }) => {
  const response = await api.delete(`/api/admin/assets/${id}`);
  return response.data;
};

// PATCH /api/admin/assets/{id}/status
export const updateAdminAssetStatus = async ({ id, enabled }) => {
  const response = await api.patch(`/api/admin/assets/${id}/status`, { enabled });
  return response.data;
};

// ---- Asset subclasses (2 levels max — no parent id) ----

// GET /api/admin/assets/{assetId}/asset-subclasses
export const getAdminAssetSubclasses = async ({ assetId }) => {
  const response = await api.get(`/api/admin/assets/${assetId}/asset-subclasses`);
  return response.data;
};

// POST /api/admin/assets/{assetId}/asset-subclasses
// 400 when the asset has allowsSubclasses: false — hide the control in that case.
export const createAdminAssetSubclass = async ({ assetId, name, description, valuation, enabled, sortOrder }) => {
  const response = await api.post(`/api/admin/assets/${assetId}/asset-subclasses`, { name, description, valuation, enabled, sortOrder });
  return response.data;
};

// PUT /api/admin/asset-subclasses/{id}
export const updateAdminAssetSubclass = async ({ id, name, description, valuation, enabled, sortOrder }) => {
  const response = await api.put(`/api/admin/asset-subclasses/${id}`, { name, description, valuation, enabled, sortOrder });
  return response.data;
};

// DELETE /api/admin/asset-subclasses/{id}
export const deleteAdminAssetSubclass = async ({ id }) => {
  const response = await api.delete(`/api/admin/asset-subclasses/${id}`);
  return response.data;
};

// PATCH /api/admin/asset-subclasses/{id}/status
export const updateAdminAssetSubclassStatus = async ({ id, enabled }) => {
  const response = await api.patch(`/api/admin/asset-subclasses/${id}/status`, { enabled });
  return response.data;
};

// ---- Countries ----

// GET /api/admin/countries
export const getAdminCountries = async () => {
  const response = await api.get("/api/admin/countries");
  return response.data;
};

// POST /api/admin/countries
export const createAdminCountry = async ({ name, valuation, enabled, sortOrder }) => {
  const response = await api.post("/api/admin/countries", { name, valuation, enabled, sortOrder });
  return response.data;
};

// PUT /api/admin/countries/{id}
export const updateAdminCountry = async ({ id, name, valuation, enabled, sortOrder }) => {
  const response = await api.put(`/api/admin/countries/${id}`, { name, valuation, enabled, sortOrder });
  return response.data;
};

// DELETE /api/admin/countries/{id}
export const deleteAdminCountry = async ({ id }) => {
  const response = await api.delete(`/api/admin/countries/${id}`);
  return response.data;
};

// PATCH /api/admin/countries/{id}/status
export const updateAdminCountryStatus = async ({ id, enabled }) => {
  const response = await api.patch(`/api/admin/countries/${id}/status`, { enabled });
  return response.data;
};

// ============================================================
// ADMIN PERFORMANCE (README §8.3) — writes SUPER_ADMIN/ADMIN only
// ============================================================

// GET /api/admin/performance
export const getAdminPerformance = async () => {
  const response = await api.get("/api/admin/performance");
  return response.data;
};

// POST /api/admin/performance — month+year unique (400 names the period)
export const createAdminPerformance = async ({ month, year, portfolioValue, revenue, debt, gearing, returnOnAssets }) => {
  const response = await api.post("/api/admin/performance", { month, year, portfolioValue, revenue, debt, gearing, returnOnAssets });
  return response.data;
};

// PUT /api/admin/performance/{id}
export const updateAdminPerformance = async ({ id, month, year, portfolioValue, revenue, debt, gearing, returnOnAssets }) => {
  const response = await api.put(`/api/admin/performance/${id}`, { month, year, portfolioValue, revenue, debt, gearing, returnOnAssets });
  return response.data;
};

// DELETE /api/admin/performance/{id}
export const deleteAdminPerformance = async ({ id }) => {
  const response = await api.delete(`/api/admin/performance/${id}`);
  return response.data;
};

// ============================================================
// ADMIN RATES (README §8.3) — rates can NEVER be deleted
// ============================================================

// GET /api/admin/usd-kes-rates
export const getAdminUsdKesRates = async () => {
  const response = await api.get("/api/admin/usd-kes-rates");
  return response.data;
};

// POST /api/admin/usd-kes-rates — month+year unique
export const createAdminUsdKesRate = async ({ month, year, kesValue, usdValue, currentDefault }) => {
  const response = await api.post("/api/admin/usd-kes-rates", { month, year, kesValue, usdValue, currentDefault });
  return response.data;
};

// PUT /api/admin/usd-kes-rates/{id}
export const updateAdminUsdKesRate = async ({ id, month, year, kesValue, usdValue, currentDefault }) => {
  const response = await api.put(`/api/admin/usd-kes-rates/${id}`, { month, year, kesValue, usdValue, currentDefault });
  return response.data;
};

// PATCH /api/admin/usd-kes-rates/{id}/default — promotes one, demotes the incumbent
export const setAdminUsdKesRateAsDefault = async ({ id }) => {
  const response = await api.patch(`/api/admin/usd-kes-rates/${id}/default`);
  return response.data;
};

// ============================================================
// ADMIN CONTENT (README §8.4/§8.5) — news, timeline, settings
// ============================================================

// ---- News ----

// GET /api/admin/news
export const getAdminNews = async () => {
  const response = await api.get("/api/admin/news");
  return response.data;
};

// POST /api/admin/news — slug auto-derived from title when omitted;
// `message` is the full article text (no teaser field — derive one client-side)
export const createAdminNews = async ({ slug, title, category, publishDate, message, imageUrl, published }) => {
  const response = await api.post("/api/admin/news", { slug, title, category, publishDate, message, imageUrl, published });
  return response.data;
};

// PUT /api/admin/news/{id}
export const updateAdminNews = async ({ id, slug, title, category, publishDate, message, imageUrl, published }) => {
  const response = await api.put(`/api/admin/news/${id}`, { slug, title, category, publishDate, message, imageUrl, published });
  return response.data;
};

// DELETE /api/admin/news/{id}
export const deleteAdminNews = async ({ id }) => {
  const response = await api.delete(`/api/admin/news/${id}`);
  return response.data;
};

// ---- Timeline ----

// GET /api/admin/timeline
export const getAdminTimeline = async () => {
  const response = await api.get("/api/admin/timeline");
  return response.data;
};

// POST /api/admin/timeline
export const createAdminTimeline = async ({ year, title, description, sortOrder, enabled }) => {
  const response = await api.post("/api/admin/timeline", { year, title, description, sortOrder, enabled });
  return response.data;
};

// PUT /api/admin/timeline/{id}
export const updateAdminTimeline = async ({ id, year, title, description, sortOrder, enabled }) => {
  const response = await api.put(`/api/admin/timeline/${id}`, { year, title, description, sortOrder, enabled });
  return response.data;
};

// DELETE /api/admin/timeline/{id}
export const deleteAdminTimeline = async ({ id }) => {
  const response = await api.delete(`/api/admin/timeline/${id}`);
  return response.data;
};

// ---- Settings ----

// GET /api/admin/settings
export const getAdminSettings = async () => {
  const response = await api.get("/api/admin/settings");
  return response.data;
};

/**
 * PUT /api/admin/settings
 *
 * The backend PUT REPLACES the whole settings document — any field missing
 * from the body is wiped. So this function sends the object it is given
 * verbatim, with no destructuring whitelist: the page is responsible for
 * fetching the current document, mutating it, and sending it ALL back.
 * (A whitelist here previously wiped yearEstablished, chairman* and
 * usdToLocalCurrencyRateId on every save.)
 */
export const updateAdminSettings = async (settings) => {
  const response = await api.put("/api/admin/settings", settings);
  return response.data;
};

// ============================================================
// ADMIN USERS (README §8.6) — SUPER_ADMIN only
// ============================================================

// GET /api/admin/users
export const getAdminUsers = async () => {
  const response = await api.get("/api/admin/users");
  return response.data;
};

// POST /api/admin/users — no password: the user gets an invite email
export const createAdminUser = async ({ fullName, email, role, active }) => {
  const response = await api.post("/api/admin/users", { fullName, email, role, active });
  return response.data;
};

// PUT /api/admin/users/{id}
export const updateAdminUser = async ({ id, fullName, role, active }) => {
  const response = await api.put(`/api/admin/users/${id}`, { fullName, role, active });
  return response.data;
};

// DELETE /api/admin/users/{id}
export const deleteAdminUser = async ({ id }) => {
  const response = await api.delete(`/api/admin/users/${id}`);
  return response.data;
};

// ============================================================
// ADMIN OPS (README §8.6a/§8.7/§8.8) — locks, newsletter, audit
// ============================================================

// GET /api/admin/login-locks — currently-locked accounts/addresses
export const getAdminLoginLocks = async () => {
  const response = await api.get("/api/admin/login-locks");
  return response.data;
};

// DELETE /api/admin/login-locks/{id} — clear one lock early
export const deleteAdminLoginLock = async ({ id }) => {
  const response = await api.delete(`/api/admin/login-locks/${id}`);
  return response.data;
};

// GET /api/admin/newsletter
export const getAdminNewsletter = async () => {
  const response = await api.get("/api/admin/newsletter");
  return response.data;
};

// DELETE /api/admin/newsletter/{id} — HARD delete (GDPR erasure), warn first
export const deleteAdminNewsletter = async ({ id }) => {
  const response = await api.delete(`/api/admin/newsletter/${id}`);
  return response.data;
};

// GET /api/admin/audit?page=&size= — data is a Spring Page (size capped at 100)
export const getAdminAudit = async ({ page = 0, size = 20 } = {}) => {
  const response = await api.get("/api/admin/audit", { params: { page, size } });
  return response.data;
};

// ============================================================
// UPLOADS (README §8.9)
// ============================================================

// POST /api/admin/uploads — multipart; `folder` is a FORM FIELD, not a query
// param. → data: { url, objectName, originalFilename, contentType, sizeBytes }
// Keep `objectName` — it's the only way to delete the file later. Max 5 MB.
//
// Content-Type is explicitly unset rather than left alone: this instance defaults
// it to application/json, and axios then serializes FormData to JSON — the request
// leaves as {"file":{},"folder":"news"} with the bytes dropped and the API answers
// 500. Passing undefined lets the browser set multipart/form-data with its
// boundary. Do NOT hardcode "multipart/form-data" either: without the boundary the
// server cannot parse the parts.
export const uploadFile = async ({ file, folder = "" }) => {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) {
    formData.append("folder", folder);
  }
  const response = await api.post("/api/admin/uploads", formData, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
};

// DELETE /api/admin/uploads?objectName= — query param IS the contract here
export const deleteFile = async ({ objectName }) => {
  const response = await api.delete("/api/admin/uploads", { params: { objectName } });
  return response.data;
};
