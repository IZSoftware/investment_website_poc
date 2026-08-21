// Contract-regression tests: every service must hit the EXACT canonical
// path/method/body from the backend contract (docs/FRONTEND_README.md).
// A drift here is a production 404/400 — these tests pin the mapping.

jest.mock("./axios-http", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from "./axios-http";
import * as services from "./services";

const ENVELOPE = { success: true, message: "", data: {}, errors: [] };

beforeEach(() => {
  jest.clearAllMocks();
  ["get", "post", "put", "patch", "delete"].forEach((m) => {
    api[m].mockResolvedValue({ data: ENVELOPE });
  });
});

describe("auth services", () => {
  test("login → POST /api/auth/login with {email,password} and returns the envelope", async () => {
    const result = await services.login({ email: "a@b.co", password: "pw" });
    expect(api.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "a@b.co",
      password: "pw",
    });
    expect(result).toEqual(ENVELOPE);
  });

  test("verifyChallenge → POST /api/auth/verify-challenge with {challengeId,answers}", async () => {
    await services.verifyChallenge({ challengeId: "ch-1", answers: "12345678" });
    expect(api.post).toHaveBeenCalledWith("/api/auth/verify-challenge", {
      challengeId: "ch-1",
      answers: "12345678",
    });
  });

  test("forgotPassword → POST /api/auth/forgot-password with {email}", async () => {
    await services.forgotPassword({ email: "a@b.co" });
    expect(api.post).toHaveBeenCalledWith("/api/auth/forgot-password", { email: "a@b.co" });
  });

  test("verifyResetChallenge → POST /api/auth/verify-reset-challenge with {challengeId,answers}", async () => {
    await services.verifyResetChallenge({ challengeId: "ch-2", answers: "87654321" });
    expect(api.post).toHaveBeenCalledWith("/api/auth/verify-reset-challenge", {
      challengeId: "ch-2",
      answers: "87654321",
    });
  });

  test("resetPassword → POST /api/auth/reset-password with {token,newPassword}", async () => {
    await services.resetPassword({ token: "tok", newPassword: "longenough1" });
    expect(api.post).toHaveBeenCalledWith("/api/auth/reset-password", {
      token: "tok",
      newPassword: "longenough1",
    });
  });

  test("refreshToken → POST /api/auth/refresh with {refreshToken}", async () => {
    await services.refreshToken({ refreshToken: "rt-1" });
    expect(api.post).toHaveBeenCalledWith("/api/auth/refresh", { refreshToken: "rt-1" });
  });

  test("logout → POST /api/auth/logout with {refreshToken}", async () => {
    await services.logout({ refreshToken: "rt-1" });
    expect(api.post).toHaveBeenCalledWith("/api/auth/logout", { refreshToken: "rt-1" });
  });
});

describe("investor portfolio services — canonical paths", () => {
  test("getInvestorClusters → GET /api/investor/clusters", async () => {
    await services.getInvestorClusters();
    expect(api.get).toHaveBeenCalledWith("/api/investor/clusters");
  });

  test("getInvestorAssetSubclasses → GET /api/investor/assets/{id}/asset-subclasses", async () => {
    await services.getInvestorAssetSubclasses({ assetId: 42 });
    expect(api.get).toHaveBeenCalledWith("/api/investor/assets/42/asset-subclasses");
  });
});

describe("admin portfolio services — canonical paths + exact bodies", () => {
  test("createAdminCluster → POST /api/admin/clusters, companies passed through verbatim", async () => {
    const companies = [
      { id: 1, name: "Acme", link: "https://acme.io", logo: "l.png" },
      { name: "NewCo", link: "https://new.co", logo: "n.png" },
    ];
    await services.createAdminCluster({
      name: "Fintech",
      icon: "landmark",
      description: "d",
      publicDescription: "pd",
      companies,
      valuation: { currency: "USD", amount: 1, unit: "M" },
      enabled: true,
      sortOrder: 1,
    });
    expect(api.post).toHaveBeenCalledWith("/api/admin/clusters", {
      name: "Fintech",
      icon: "landmark",
      description: "d",
      publicDescription: "pd",
      companies,
      valuation: { currency: "USD", amount: 1, unit: "M" },
      enabled: true,
      sortOrder: 1,
    });
    // Whole-list replace semantics rely on the array reaching the wire untouched.
    expect(api.post.mock.calls[0][1].companies).toBe(companies);
  });

  test("createAdminAsset body uses subclassesVisible/allowsSubclasses keys", async () => {
    await services.createAdminAsset({
      name: "Equities",
      description: "d",
      valuation: null,
      enabled: true,
      subclassesVisible: true,
      allowsSubclasses: false,
      sortOrder: 2,
    });
    const [path, body] = api.post.mock.calls[0];
    expect(path).toBe("/api/admin/assets");
    expect(body).toEqual({
      name: "Equities",
      description: "d",
      valuation: null,
      enabled: true,
      subclassesVisible: true,
      allowsSubclasses: false,
      sortOrder: 2,
    });
  });

  test("createAdminCountry body is exactly {name,valuation,enabled,sortOrder}", async () => {
    await services.createAdminCountry({
      name: "Kenya",
      valuation: { currency: "USD", amount: 3, unit: "M" },
      enabled: true,
      sortOrder: 1,
      // stray keys must NOT leak into the request body
      flag: "ke.png",
    });
    const [path, body] = api.post.mock.calls[0];
    expect(path).toBe("/api/admin/countries");
    expect(body).toEqual({
      name: "Kenya",
      valuation: { currency: "USD", amount: 3, unit: "M" },
      enabled: true,
      sortOrder: 1,
    });
    expect(Object.keys(body).sort()).toEqual(["enabled", "name", "sortOrder", "valuation"]);
  });

  test("createAdminAssetSubclass → POST /api/admin/assets/{assetId}/asset-subclasses, no parentSubEntityId", async () => {
    await services.createAdminAssetSubclass({
      assetId: 9,
      name: "Private Equity",
      description: "d",
      valuation: null,
      enabled: true,
      sortOrder: 0,
    });
    const [path, body] = api.post.mock.calls[0];
    expect(path).toBe("/api/admin/assets/9/asset-subclasses");
    expect(body).toEqual({
      name: "Private Equity",
      description: "d",
      valuation: null,
      enabled: true,
      sortOrder: 0,
    });
    expect(body).not.toHaveProperty("parentSubEntityId");
    expect(body).not.toHaveProperty("assetId");
  });

  test("updateAdminAssetSubclass → PUT /api/admin/asset-subclasses/{id}", async () => {
    await services.updateAdminAssetSubclass({
      id: 5,
      name: "PE",
      description: "d",
      valuation: null,
      enabled: false,
      sortOrder: 3,
    });
    expect(api.put).toHaveBeenCalledWith("/api/admin/asset-subclasses/5", {
      name: "PE",
      description: "d",
      valuation: null,
      enabled: false,
      sortOrder: 3,
    });
  });

  test.each([
    ["updateAdminClusterStatus", "/api/admin/clusters/7/status"],
    ["updateAdminAssetStatus", "/api/admin/assets/7/status"],
    ["updateAdminAssetSubclassStatus", "/api/admin/asset-subclasses/7/status"],
    ["updateAdminCountryStatus", "/api/admin/countries/7/status"],
  ])("%s → PATCH %s with {enabled}", async (fnName, expectedPath) => {
    await services[fnName]({ id: 7, enabled: false });
    expect(api.patch).toHaveBeenCalledWith(expectedPath, { enabled: false });
  });
});

describe("admin content services", () => {
  test("createAdminNews body uses message/imageUrl (not body/coverImageUrl/excerpt)", async () => {
    await services.createAdminNews({
      slug: "big-news",
      title: "Big News",
      category: "MARKETS",
      publishDate: "2026-01-01",
      message: "Full article text",
      imageUrl: "https://cdn/img.png",
      published: true,
    });
    const [path, body] = api.post.mock.calls[0];
    expect(path).toBe("/api/admin/news");
    expect(body).toEqual({
      slug: "big-news",
      title: "Big News",
      category: "MARKETS",
      publishDate: "2026-01-01",
      message: "Full article text",
      imageUrl: "https://cdn/img.png",
      published: true,
    });
    expect(body).not.toHaveProperty("body");
    expect(body).not.toHaveProperty("coverImageUrl");
    expect(body).not.toHaveProperty("excerpt");
  });

  test("updateAdminSettings PUTs the given object verbatim (backend PUT replaces the whole doc)", async () => {
    const settings = {
      companyName: "NF Holding",
      yearEstablished: 1998,
      someFutureUnknownField: "must-survive",
    };
    await services.updateAdminSettings(settings);
    expect(api.put).toHaveBeenCalledWith("/api/admin/settings", settings);
    // No destructuring whitelist — unknown keys survive.
    expect(api.put.mock.calls[0][1]).toBe(settings);
    expect(api.put.mock.calls[0][1].someFutureUnknownField).toBe("must-survive");
  });
});

describe("admin ops services", () => {
  test("getAdminLoginLocks → GET /api/admin/login-locks", async () => {
    await services.getAdminLoginLocks();
    expect(api.get).toHaveBeenCalledWith("/api/admin/login-locks");
  });

  test("deleteAdminLoginLock → DELETE /api/admin/login-locks/{id}", async () => {
    await services.deleteAdminLoginLock({ id: 12 });
    expect(api.delete).toHaveBeenCalledWith("/api/admin/login-locks/12");
  });

  test("getAdminAudit → GET /api/admin/audit with page/size params", async () => {
    await services.getAdminAudit({ page: 3, size: 50 });
    expect(api.get).toHaveBeenCalledWith("/api/admin/audit", { params: { page: 3, size: 50 } });
  });

  test("getAdminAudit defaults to page 0, size 20", async () => {
    await services.getAdminAudit();
    expect(api.get).toHaveBeenCalledWith("/api/admin/audit", { params: { page: 0, size: 20 } });
  });
});

describe("uploads", () => {
  test("uploadFile posts multipart FormData with file AND folder fields", async () => {
    const file = new File(["contents"], "logo.png", { type: "image/png" });
    await services.uploadFile({ file, folder: "clusters" });

    expect(api.post).toHaveBeenCalledTimes(1);
    const [path, formData] = api.post.mock.calls[0];
    expect(path).toBe("/api/admin/uploads");
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("file")).toBe(file);
    expect(formData.get("folder")).toBe("clusters");
  });

  // The instance defaults Content-Type to application/json, and axios then turns
  // FormData into JSON — the file bytes never leave the browser and the API 500s.
  // Clearing the header is what lets the browser set the multipart boundary, so
  // this assertion is the regression guard, not a style preference.
  test("uploadFile clears the JSON Content-Type so the browser sets the boundary", async () => {
    const file = new File(["contents"], "logo.png", { type: "image/png" });
    await services.uploadFile({ file, folder: "clusters" });

    const config = api.post.mock.calls[0][2];
    expect(config).toBeDefined();
    expect("Content-Type" in config.headers).toBe(true);
    expect(config.headers["Content-Type"]).toBeUndefined();
  });

  test("uploadFile omits the folder field when folder is empty", async () => {
    const file = new File(["contents"], "logo.png", { type: "image/png" });
    await services.uploadFile({ file });
    const formData = api.post.mock.calls[0][1];
    expect(formData.get("file")).toBe(file);
    expect(formData.has("folder")).toBe(false);
  });

  test("deleteFile → DELETE /api/admin/uploads with objectName as a query param", async () => {
    await services.deleteFile({ objectName: "clusters/logo.png" });
    expect(api.delete).toHaveBeenCalledWith("/api/admin/uploads", {
      params: { objectName: "clusters/logo.png" },
    });
  });
});

describe("public site services — canonical paths", () => {
  test("getSiteInfoPortfolio → GET /api/site/info/portfolio with month/year params", async () => {
    await services.getSiteInfoPortfolio({ month: 3, year: 2020 });
    expect(api.get).toHaveBeenCalledWith("/api/site/info/portfolio", {
      params: { month: 3, year: 2020 },
    });
  });

  test("getSiteInfoPortfolioHistory → GET /api/site/info/portfolio/history", async () => {
    await services.getSiteInfoPortfolioHistory({ limit: 10 });
    expect(api.get).toHaveBeenCalledWith("/api/site/info/portfolio/history", {
      params: { fromYear: undefined, toYear: undefined, granularity: undefined, limit: 10 },
    });
  });

  test("getSiteInfoPortfolioHistory passes the full window through", async () => {
    await services.getSiteInfoPortfolioHistory({
      fromYear: 2021,
      toYear: 2025,
      granularity: "MONTHLY",
      limit: 60,
    });
    expect(api.get).toHaveBeenCalledWith("/api/site/info/portfolio/history", {
      params: { fromYear: 2021, toYear: 2025, granularity: "MONTHLY", limit: 60 },
    });
  });

  test("getSiteInfoPortfolioHistory called bare sends no params", async () => {
    await services.getSiteInfoPortfolioHistory();
    expect(api.get).toHaveBeenCalledWith("/api/site/info/portfolio/history", {
      params: { fromYear: undefined, toYear: undefined, granularity: undefined, limit: undefined },
    });
  });
});

describe("dead API names stay dead", () => {
  test.each([
    "verifyOtp",
    "requestOtp",
    "getPublicClusters",
    "getAdminSectors",
    "getAdminContactMessages",
    "getAdminValues",
  ])("services.%s is undefined", (name) => {
    expect(services[name]).toBeUndefined();
  });
});
