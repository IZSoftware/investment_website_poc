// The Key Performance Indicators charts read /api/site/info/portfolio/history. The hardcoded
// 2021-2025 series they used to draw is deleted; these tests keep it deleted, because a
// re-export would silently put static figures back on a page that looks live.
import * as data from "./data";

describe("static KPI series stay deleted", () => {
  test.each([
    "getChartData",
    "getPieChartSectors",
  ])("data.%s is undefined", (name) => {
    expect(data[name]).toBeUndefined();
  });

  test.each([
    "keyFacts",
    "revenueData",
    "netShareData",
    "netDebtGearingData",
    "portfolioTotals",
    "pieChartSectors",
  ])("portfolioKPI.%s is undefined", (key) => {
    expect(data.portfolioKPI[key]).toBeUndefined();
  });

  test("the investor-relations contact block is still served statically", () => {
    expect(data.portfolioKPI.investorRelations).toEqual(
      expect.objectContaining({ name: expect.any(String), email: expect.any(String) })
    );
  });
});
