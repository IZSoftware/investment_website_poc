import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import HoldingCompanyLogin from "./HoldingCompanyLogin";
import { useAuth } from "../context/AuthContext";
import { getSiteInfo } from "../api/services";

const mockNavigate = jest.fn();
// requireActual must target the dist file: react-router-dom@7's bare specifier
// is unresolvable under jest 27 (see src/__mocks__/react-router-dom.js).
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom/dist/index.js"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// ForgotPasswordModal (rendered closed) also imports from this module — the
// full mock keeps every named import harmless.
jest.mock("../api/services", () => ({
  getSiteInfo: jest.fn(),
  forgotPassword: jest.fn(),
  verifyResetChallenge: jest.fn(),
  resetPassword: jest.fn(),
}));

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const mockLogin = jest.fn();
const mockVerifyChallenge = jest.fn();

const renderLogin = async () => {
  const utils = render(
    <MemoryRouter initialEntries={["/investor-portal/login"]}>
      <HoldingCompanyLogin />
    </MemoryRouter>
  );
  // Flush the getSiteInfo effect so its setState lands inside act.
  await waitFor(() => expect(getSiteInfo).toHaveBeenCalled());
  return utils;
};

const submitCredentials = async () => {
  userEvent.type(screen.getByPlaceholderText("name@company.com"), "inv@b.co");
  userEvent.type(screen.getByPlaceholderText("Enter your password"), "secretpw01");
  userEvent.click(screen.getByRole("button", { name: /continue/i }));
};

beforeEach(() => {
  jest.clearAllMocks();
  getSiteInfo.mockResolvedValue({ success: true, message: "", data: {}, errors: [] });
  useAuth.mockReturnValue({ login: mockLogin, verifyChallenge: mockVerifyChallenge });
});

describe("HoldingCompanyLogin", () => {
  test("submits credentials → login called; challenge letters render", async () => {
    mockLogin.mockResolvedValue({
      success: true,
      challengeId: "ch-1",
      letters: LETTERS,
      expiresInSeconds: 180,
    });

    await renderLogin();
    await submitCredentials();

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith("inv@b.co", "secretpw01")
    );

    // Challenge step: all 8 letters and 8 digit inputs.
    expect(await screen.findByText("Security Check")).toBeInTheDocument();
    LETTERS.forEach((letter) => expect(screen.getByText(letter)).toBeInTheDocument());
    expect(screen.getAllByRole("textbox")).toHaveLength(8);
  });

  test("failed challenge (single-use) → back on the credentials step with the server message", async () => {
    mockLogin.mockResolvedValue({
      success: true,
      challengeId: "ch-1",
      letters: LETTERS,
      expiresInSeconds: 180,
    });
    mockVerifyChallenge.mockResolvedValue({
      success: false,
      status: 400,
      message: "Challenge answer incorrect. Please start again.",
    });

    await renderLogin();
    await submitCredentials();
    await screen.findByText("Security Check");

    // Answer all 8 digits, then verify.
    const digitInputs = screen.getAllByRole("textbox");
    digitInputs.forEach((input, idx) => userEvent.type(input, String((idx + 1) % 10)));
    userEvent.click(screen.getByRole("button", { name: /verify & continue/i }));

    await waitFor(() =>
      expect(mockVerifyChallenge).toHaveBeenCalledWith("ch-1", "12345678")
    );

    // Any failure burns the challenge → back to credentials with the message.
    expect(
      await screen.findByText("Challenge answer incorrect. Please start again.")
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@company.com")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("429 on login → calm cooldown UI replaces the form, no error text", async () => {
    mockLogin.mockResolvedValue({
      success: false,
      status: 429,
      message: "Too many failed attempts. Try again later.",
    });

    await renderLogin();
    await submitCredentials();

    expect(await screen.findByText("Too many attempts")).toBeInTheDocument();
    expect(screen.getByText("Please wait before trying again.")).toBeInTheDocument();
    // The credentials form is gone — no way to hammer the endpoint.
    expect(screen.queryByPlaceholderText("name@company.com")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue/i })).not.toBeInTheDocument();
    // The raw 429 message is NOT surfaced (calm generic cooldown instead).
    expect(
      screen.queryByText("Too many failed attempts. Try again later.")
    ).not.toBeInTheDocument();
    // Reset path stays available.
    expect(screen.getByRole("button", { name: /forgot password/i })).toBeInTheDocument();
  });

  test("direct login (challenge disabled) → navigates by portal", async () => {
    mockLogin.mockResolvedValue({
      success: true,
      authenticated: true,
      role: "INVESTOR",
      portal: "investor",
    });

    await renderLogin();
    await submitCredentials();

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/investor-portal/dashboard")
    );
  });

  test("challenge success for a staff portal → /admin-portal/dashboard", async () => {
    mockLogin.mockResolvedValue({
      success: true,
      challengeId: "ch-1",
      letters: LETTERS,
      expiresInSeconds: 180,
    });
    mockVerifyChallenge.mockResolvedValue({ success: true, role: "ADMIN", portal: "admin" });

    await renderLogin();
    await submitCredentials();
    await screen.findByText("Security Check");

    screen.getAllByRole("textbox").forEach((input, idx) => {
      userEvent.type(input, String((idx + 1) % 10));
    });
    userEvent.click(screen.getByRole("button", { name: /verify & continue/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/admin-portal/dashboard")
    );
  });

  test("non-429 login failure → server message shown, still on credentials step", async () => {
    mockLogin.mockResolvedValue({
      success: false,
      status: 401,
      message: "Invalid email or password",
    });

    await renderLogin();
    await submitCredentials();

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@company.com")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
