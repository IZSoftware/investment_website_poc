import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ResetPassword from "./ResetPassword";
import { resetPassword } from "../api/services";

// ForgotPasswordModal (rendered closed on the invalid-link screen) imports
// from the same module — mock every name it needs.
jest.mock("../api/services", () => ({
  resetPassword: jest.fn(),
  forgotPassword: jest.fn(),
  verifyResetChallenge: jest.fn(),
}));

const renderAt = (url) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/investor-portal/set-password" element={<ResetPassword />} />
        <Route path="/investor-portal/reset-password" element={<ResetPassword />} />
        <Route path="/investor-portal/login" element={<div>login page probe</div>} />
      </Routes>
    </MemoryRouter>
  );

const fillPasswords = (newPassword, confirmPassword = newPassword) => {
  userEvent.type(screen.getByPlaceholderText("At least 10 characters"), newPassword);
  userEvent.type(screen.getByPlaceholderText("Re-enter password"), confirmPassword);
};

const submitForm = () => {
  // fireEvent.submit sidesteps jsdom's native minLength gate so the page's own
  // validation branch is what gets exercised.
  fireEvent.submit(screen.getByRole("button", { name: /save password/i }).closest("form"));
};

beforeEach(() => {
  jest.clearAllMocks();
  resetPassword.mockResolvedValue({ success: true, message: "", data: {}, errors: [] });
});

describe("ResetPassword (set-password / reset-password page)", () => {
  test("renders the form when a token is present", () => {
    renderAt("/investor-portal/set-password?token=abc");
    expect(screen.getByRole("heading", { name: "Set Your Password" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("At least 10 characters")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Re-enter password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save password/i })).toBeInTheDocument();
  });

  test("password shorter than 10 chars → validation message, API NOT called", async () => {
    renderAt("/investor-portal/set-password?token=abc");
    fillPasswords("short1234"); // 9 chars
    submitForm();

    expect(await screen.findByText("At least 10 characters", { selector: "p" })).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  test("mismatched passwords → validation message, API NOT called", async () => {
    renderAt("/investor-portal/set-password?token=abc");
    fillPasswords("longenough123", "different4567");
    submitForm();

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  test("valid password → resetPassword called with {token,newPassword}; success state shown", async () => {
    renderAt("/investor-portal/set-password?token=abc");
    fillPasswords("longenough123");
    userEvent.click(screen.getByRole("button", { name: /save password/i }));

    await waitFor(() =>
      expect(resetPassword).toHaveBeenCalledWith({ token: "abc", newPassword: "longenough123" })
    );
    expect(await screen.findByRole("heading", { name: "Password Set" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to sign in/i })).toBeInTheDocument();
  });

  test("expired/invalid token rejection → server message shown", async () => {
    resetPassword.mockRejectedValue({
      response: { data: { message: "Invalid or expired reset request." } },
    });
    renderAt("/investor-portal/reset-password?token=expired");
    fillPasswords("longenough123");
    userEvent.click(screen.getByRole("button", { name: /save password/i }));

    expect(await screen.findByText("Invalid or expired reset request.")).toBeInTheDocument();
    // Still on the form so the user can retry via a fresh link.
    expect(screen.getByRole("heading", { name: "Set Your Password" })).toBeInTheDocument();
  });

  test("rejection without a server message → generic fallback shown", async () => {
    resetPassword.mockRejectedValue(new Error("Network Error"));
    renderAt("/investor-portal/set-password?token=abc");
    fillPasswords("longenough123");
    userEvent.click(screen.getByRole("button", { name: /save password/i }));

    expect(await screen.findByText("Invalid or expired reset request.")).toBeInTheDocument();
  });

  test("no token in the URL → invalid-link state, no form", () => {
    renderAt("/investor-portal/set-password");
    expect(screen.getByRole("heading", { name: "Invalid Link" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("At least 10 characters")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to sign in/i })).toBeInTheDocument();
  });
});
