import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import InvestorPortal from "./InvestorPortal";
import { getInvestorDashboardCluster } from "../api/services";

jest.mock("../api/services", () => ({
  getInvestorDashboardCluster: jest.fn(),
}));

const DASHBOARD_DATA = {
  netAssets: { title: "NET ASSETS", subtitle: "Across 4 classes", value: "12" },
  portfolioInvestment: { title: "PORTFOLIO INVESTMENT", subtitle: "Across 3 clusters", value: "34" },
  settings: { title: "MARKET", subtitle: "Across 5 markets", value: "7" },
};

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={["/investor-portal/dashboard"]}>
      <Routes>
        <Route path="/investor-portal/dashboard" element={<InvestorPortal />} />
        <Route path="/investor-portal/net-assets" element={<div>net-assets probe</div>} />
        <Route path="/investor-portal/portfolio-investment" element={<div>portfolio probe</div>} />
        <Route path="/investor-portal/market" element={<div>market probe</div>} />
        <Route path="/investor-portal/login" element={<div>login probe</div>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
  getInvestorDashboardCluster.mockResolvedValue({
    success: true,
    message: "",
    data: DASHBOARD_DATA,
    errors: [],
  });
});

describe("InvestorPortal dashboard", () => {
  test("renders the three server-driven cards (titles, values, subtitles) — no redirect", async () => {
    renderDashboard();

    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();

    // Server titles/values render verbatim; the page never redirects based on
    // referrer — the cards are simply there.
    expect(await screen.findByText("NET ASSETS")).toBeInTheDocument();
    expect(screen.getByText("PORTFOLIO INVESTMENT")).toBeInTheDocument();
    expect(screen.getByText("MARKET")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("34")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Across 4 classes")).toBeInTheDocument();
    expect(screen.getByText("Across 3 clusters")).toBeInTheDocument();
    expect(screen.getByText("Across 5 markets")).toBeInTheDocument();
    expect(screen.queryByText("login probe")).not.toBeInTheDocument();
    expect(getInvestorDashboardCluster).toHaveBeenCalledTimes(1);
  });

  // Card order in the grid: netAssets, portfolioInvestment, settings.
  test.each([
    [0, "net-assets probe"],
    [1, "portfolio probe"],
    [2, "market probe"],
  ])("Manage button %i navigates to its page", async (index, probeText) => {
    renderDashboard();
    await screen.findByText("NET ASSETS");

    const manageButtons = screen.getAllByRole("button", { name: "Manage" });
    expect(manageButtons).toHaveLength(3);
    userEvent.click(manageButtons[index]);

    expect(await screen.findByText(probeText)).toBeInTheDocument();
  });

  test("envelope failure → server message shown instead of cards", async () => {
    getInvestorDashboardCluster.mockResolvedValue({
      success: false,
      message: "Dashboard unavailable",
      data: null,
      errors: [],
    });
    renderDashboard();

    expect(await screen.findByText("Dashboard unavailable")).toBeInTheDocument();
    expect(screen.queryByText("NET ASSETS")).not.toBeInTheDocument();
  });

  test("HTTP failure → response.data.message shown", async () => {
    getInvestorDashboardCluster.mockRejectedValue({
      response: { status: 500, data: { message: "Something broke" } },
    });
    renderDashboard();

    expect(await screen.findByText("Something broke")).toBeInTheDocument();
  });
});
