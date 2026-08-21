import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import * as servicesMock from "../api/services";
import { setTokens, clearTokens, getRefreshToken } from "../api/axios-http";

jest.mock("../api/services", () => ({
  login: jest.fn(),
  verifyChallenge: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("../api/axios-http", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
}));

const envelope = (data) => ({ success: true, message: "", data, errors: [] });

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

const renderAuth = async () => {
  const utils = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(utils.result.current.loading).toBe(false));
  return utils;
};

// AuthContext.logout navigates via window.location.href — stub it so jsdom
// does not log "Not implemented: navigation" and we can assert the target.
const originalLocation = window.location;
beforeAll(() => {
  delete window.location;
  window.location = { href: "" };
});
afterAll(() => {
  window.location = originalLocation;
});

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  window.location.href = "";
});

describe("login()", () => {
  test("challenge envelope → returns challengeId/letters/expiresInSeconds", async () => {
    servicesMock.login.mockResolvedValue(
      envelope({
        challenge: {
          challengeId: "ch-1",
          letters: ["A", "B", "C", "D", "E", "F", "G", "H"],
          expiresInSeconds: 120,
        },
      })
    );

    const { result } = await renderAuth();
    let res;
    await act(async () => {
      res = await result.current.login("a@b.co", "pw");
    });

    expect(servicesMock.login).toHaveBeenCalledWith({ email: "a@b.co", password: "pw" });
    expect(res).toEqual({
      success: true,
      challengeId: "ch-1",
      letters: ["A", "B", "C", "D", "E", "F", "G", "H"],
      expiresInSeconds: 120,
    });
    // No tokens on phase 1.
    expect(setTokens).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test("direct auth envelope (challenge disabled) → authenticated INVESTOR session", async () => {
    servicesMock.login.mockResolvedValue(
      envelope({
        auth: {
          accessToken: "at-1",
          refreshToken: "rt-1",
          user: { email: "inv@b.co", role: "INVESTOR", fullName: "Jane Doe" },
        },
      })
    );

    const { result } = await renderAuth();
    let res;
    await act(async () => {
      res = await result.current.login("inv@b.co", "pw");
    });

    expect(res).toEqual({ success: true, authenticated: true, role: "INVESTOR", portal: "investor" });
    expect(setTokens).toHaveBeenCalledWith("at-1", "rt-1");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userEmail).toBe("inv@b.co");
    expect(result.current.userRole).toBe("INVESTOR");
    expect(result.current.fullName).toBe("Jane Doe");
    expect(result.current.loginPortal).toBe("investor");
    expect(sessionStorage.getItem("auth:isAuthenticated")).toBe("true");
    expect(sessionStorage.getItem("auth:userEmail")).toBe("inv@b.co");
    expect(sessionStorage.getItem("auth:userRole")).toBe("INVESTOR");
    expect(sessionStorage.getItem("auth:loginPortal")).toBe("investor");
    expect(sessionStorage.getItem("auth:fullName")).toBe("Jane Doe");
  });

  test("HTTP failure → {success:false, status, message} from the server envelope", async () => {
    servicesMock.login.mockRejectedValue({
      response: { status: 401, data: { message: "Invalid credentials." } },
    });

    const { result } = await renderAuth();
    let res;
    await act(async () => {
      res = await result.current.login("a@b.co", "bad");
    });

    expect(res).toEqual({ success: false, status: 401, message: "Invalid credentials." });
  });
});

describe("verifyChallenge()", () => {
  const authFor = (role) =>
    envelope({
      auth: {
        accessToken: "at-2",
        refreshToken: "rt-2",
        user: { email: "staff@b.co", role, fullName: "Staff" },
      },
    }).data.auth;

  test("SUPER_ADMIN → portal 'admin'", async () => {
    servicesMock.verifyChallenge.mockResolvedValue(envelope(authFor("SUPER_ADMIN")));

    const { result } = await renderAuth();
    let res;
    await act(async () => {
      res = await result.current.verifyChallenge("ch-1", "12345678");
    });

    expect(servicesMock.verifyChallenge).toHaveBeenCalledWith({
      challengeId: "ch-1",
      answers: "12345678",
    });
    expect(res).toEqual({ success: true, role: "SUPER_ADMIN", portal: "admin" });
    expect(result.current.loginPortal).toBe("admin");
    expect(setTokens).toHaveBeenCalledWith("at-2", "rt-2");
  });

  test("DEV is a staff role → portal 'admin'", async () => {
    servicesMock.verifyChallenge.mockResolvedValue(envelope(authFor("DEV")));

    const { result } = await renderAuth();
    let res;
    await act(async () => {
      res = await result.current.verifyChallenge("ch-1", "12345678");
    });

    expect(res).toEqual({ success: true, role: "DEV", portal: "admin" });
  });

  test("failure → {success:false, message} from response.data.message", async () => {
    servicesMock.verifyChallenge.mockRejectedValue({
      response: { status: 400, data: { message: "Challenge answer incorrect. Please start again." } },
    });

    const { result } = await renderAuth();
    let res;
    await act(async () => {
      res = await result.current.verifyChallenge("ch-1", "00000000");
    });

    expect(res).toEqual({
      success: false,
      status: 400,
      message: "Challenge answer incorrect. Please start again.",
    });
    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe("logout()", () => {
  test("calls services.logout with the stored refresh token and clears all state", async () => {
    servicesMock.login.mockResolvedValue(
      envelope({
        auth: {
          accessToken: "at-1",
          refreshToken: "rt-1",
          user: { email: "inv@b.co", role: "INVESTOR", fullName: "Jane" },
        },
      })
    );
    getRefreshToken.mockReturnValue("rt-1");
    servicesMock.logout.mockResolvedValue(envelope({}));

    const { result } = await renderAuth();
    await act(async () => {
      await result.current.login("inv@b.co", "pw");
    });
    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(servicesMock.logout).toHaveBeenCalledWith({ refreshToken: "rt-1" });
    expect(clearTokens).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userEmail).toBe("");
    expect(result.current.userRole).toBe("");
    expect(result.current.loginPortal).toBe("");
    expect(sessionStorage.getItem("auth:isAuthenticated")).toBeNull();
    expect(sessionStorage.getItem("auth:userEmail")).toBeNull();
    expect(sessionStorage.getItem("auth:userRole")).toBeNull();
    expect(sessionStorage.getItem("auth:loginPortal")).toBeNull();
    expect(sessionStorage.getItem("auth:fullName")).toBeNull();
    // Investor session → back to the investor login.
    expect(window.location.href).toBe("/investor-portal/login");
  });

  test("skips the API call when no refresh token is stored, still clears local state", async () => {
    getRefreshToken.mockReturnValue(null);

    const { result } = await renderAuth();
    await act(async () => {
      await result.current.logout();
    });

    expect(servicesMock.logout).not.toHaveBeenCalled();
    expect(clearTokens).toHaveBeenCalled();
    expect(window.location.href).toBe("/investor-portal/login");
  });
});
