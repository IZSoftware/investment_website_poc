import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PortfolioPerformance from "./PortfolioPerformance";
import {
  getSiteInfoAbout,
  getSiteInfoCluster,
  getSiteInfoPortfolio,
  getSiteInfoPortfolioHistory,
} from "../api/services";

jest.mock("../api/services", () => ({
  getSiteInfoAbout: jest.fn(),
  getSiteInfoCluster: jest.fn(),
  getSiteInfoPortfolio: jest.fn(),
  getSiteInfoPortfolioHistory: jest.fn(),
}));

// Recharts measures its container and renders nothing at zero width, which is what jsdom
// reports. These stubs stand in for the chart and publish the series they were handed, so the
// assertions are about the numbers this page computes rather than about SVG geometry.
jest.mock("recharts", () => {
  const series = (testid) => ({ data, children }) => (
    <div data-testid={testid} data-series={JSON.stringify(data)}>
      {children}
    </div>
  );
  return {
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    BarChart: series("barchart"),
    ComposedChart: series("composedchart"),
    Bar: ({ name }) => <div data-testid="bar-name">{name}</div>,
    Line: ({ name }) => <div data-testid="line-name">{name}</div>,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    PieChart: ({ children }) => <div>{children}</div>,
    Pie: () => null,
    Cell: () => null,
  };
});

const envelope = (data) => ({ success: true, message: "", data, errors: [] });

// 2021 has a rate of its own; 2022 has none and must fall back to the current default.
const HISTORY = [
  {
    month: 12,
    year: 2021,
    groupConsolidatedPortfolio: 980000000,
    groupConsolidatedRevenue: 448000000,
    groupConsolidatedGearing: 39.0,
    usdKesRate: { month: 12, year: 2021, kesValue: 113.2, usdValue: 1, currentDefault: false },
  },
  {
    month: 12,
    year: 2022,
    groupConsolidatedPortfolio: 1100000000,
    groupConsolidatedRevenue: 562000000,
    groupConsolidatedGearing: 33.2,
    usdKesRate: { month: 12, year: 2025, kesValue: 129.5, usdValue: 1, currentDefault: true },
  },
];

const seriesOf = (testid) => JSON.parse(screen.getByTestId(testid).getAttribute("data-series"));

// Key Facts and the KPI charts each have their own kes/usd toggle, and both drive the same
// state. The second one is the charts' own.
const switchToUsd = () => userEvent.click(screen.getAllByText("usd")[1]);

beforeEach(() => {
  jest.clearAllMocks();
  getSiteInfoAbout.mockResolvedValue(envelope({ assets: [] }));
  getSiteInfoCluster.mockResolvedValue(envelope({ countries: [] }));
  getSiteInfoPortfolio.mockResolvedValue(envelope({}));
  getSiteInfoPortfolioHistory.mockResolvedValue(envelope({ granularity: "YEARLY", points: HISTORY }));
});

const renderPage = async () => {
  render(<PortfolioPerformance />);
  await waitFor(() => expect(screen.getByTestId("barchart")).toBeInTheDocument());
};

describe("Key Performance Indicators charts", () => {
  test("asks the API for the series instead of drawing static data", async () => {
    await renderPage();
    expect(getSiteInfoPortfolioHistory).toHaveBeenCalledWith({ limit: 10 });
  });

  test("PORTFOLIO plots portfolio value, converted to KES millions at each period's own rate", async () => {
    await renderPage();

    // 980,000,000 USD × 113.2 / 1e6 = 110,936 ; 1,100,000,000 × 129.5 / 1e6 = 142,450
    expect(seriesOf("barchart")).toEqual([
      { year: "2021", value: 110936 },
      { year: "2022", value: 142450 },
    ]);
    expect(screen.getByTestId("bar-name")).toHaveTextContent("Portfolio Value (KES M)");
  });

  test("switching to USD divides by a million and leaves the rate out of it", async () => {
    await renderPage();
    await switchToUsd();

    expect(seriesOf("barchart")).toEqual([
      { year: "2021", value: 980 },
      { year: "2022", value: 1100 },
    ]);
    expect(screen.getByTestId("bar-name")).toHaveTextContent("Portfolio Value (USD M)");
  });

  test("REVENUE plots revenue, not the portfolio value the tab used to show", async () => {
    await renderPage();
    await userEvent.click(screen.getByText("REVENUE"));

    // 448,000,000 × 113.2 / 1e6 = 50,713.6 ; 562,000,000 × 129.5 / 1e6 = 72,779
    expect(seriesOf("barchart")).toEqual([
      { year: "2021", value: 50713.6 },
      { year: "2022", value: 72779 },
    ]);
    expect(screen.getByTestId("bar-name")).toHaveTextContent("Revenue (KES M)");
  });

  test("GEARING plots the percentage as-is, in either currency", async () => {
    await renderPage();
    await userEvent.click(screen.getByText("GEARING"));

    expect(seriesOf("composedchart")).toEqual([
      { year: "2021", gearing: 39 },
      { year: "2022", gearing: 33.2 },
    ]);
    expect(screen.getByTestId("line-name")).toHaveTextContent("Gearing %");
  });

  test("a period with no rate of its own is dropped from the KES series, kept in USD", async () => {
    getSiteInfoPortfolioHistory.mockResolvedValue(
      envelope({
        granularity: "YEARLY",
        points: [
          { month: 12, year: 2021, groupConsolidatedPortfolio: 980000000 },
          ...HISTORY.slice(1),
        ],
      })
    );
    await renderPage();

    // KES: 2021 has no rate, so plotting it would mean labelling a USD figure as KES.
    expect(seriesOf("barchart")).toEqual([{ year: "2022", value: 142450 }]);

    await switchToUsd();
    expect(seriesOf("barchart")).toEqual([
      { year: "2021", value: 980 },
      { year: "2022", value: 1100 },
    ]);
  });

  test("an empty series says so instead of drawing an empty axis", async () => {
    getSiteInfoPortfolioHistory.mockResolvedValue(envelope({ granularity: "YEARLY", points: [] }));
    render(<PortfolioPerformance />);

    expect(await screen.findByText(/no performance history has been published yet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("barchart")).not.toBeInTheDocument();
  });

  test("a metric nobody has entered says so, while the others still plot", async () => {
    getSiteInfoPortfolioHistory.mockResolvedValue(
      envelope({
        granularity: "YEARLY",
        points: HISTORY.map(({ groupConsolidatedGearing, ...rest }) => rest),
      })
    );
    await renderPage();
    await userEvent.click(screen.getByText("GEARING"));

    expect(screen.getByText(/no gearing figures recorded/i)).toBeInTheDocument();
  });

  test("a failed history call leaves the page standing", async () => {
    getSiteInfoPortfolioHistory.mockRejectedValue(new Error("network"));
    render(<PortfolioPerformance />);

    expect(await screen.findByText(/no performance history has been published yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Key Performance/)).toBeInTheDocument();
  });
});
