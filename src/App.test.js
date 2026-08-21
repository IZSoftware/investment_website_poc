import { render, screen } from "@testing-library/react";
import App from "./App";

// Smoke test: the full router + AuthProvider shell mounts and the home route
// renders. The home-page sections (and the chrome around them) each own their
// data fetching, so they are stubbed — no network, no heavy children.
jest.mock("./api/axios-http", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
}));

// Element-producing stubs (bare strings would merge into one text node and
// defeat getByText). Inlined because jest.mock factories are hoisted above
// any helper declaration.
/* eslint-disable react/display-name */
jest.mock("./components/Navbar", () => () =>
  require("react").createElement("div", null, "navbar-stub")
);
jest.mock("./components/InvestorNavbar", () => () =>
  require("react").createElement("div", null, "investor-navbar-stub")
);
jest.mock("./components/DisclaimerModal", () => () => null);
jest.mock("./components/HeroSection", () => () =>
  require("react").createElement("div", null, "hero-section-stub")
);
jest.mock("./components/LearnAboutUs", () => () =>
  require("react").createElement("div", null, "learn-about-us-stub")
);
jest.mock("./components/LatestNews", () => () =>
  require("react").createElement("div", null, "latest-news-stub")
);
jest.mock("./components/Footer", () => () =>
  require("react").createElement("div", null, "footer-stub")
);
/* eslint-enable react/display-name */

test("renders the home page inside the app shell", async () => {
  window.history.pushState({}, "", "/");
  render(<App />);

  expect(await screen.findByText("hero-section-stub")).toBeInTheDocument();
  expect(screen.getByText("learn-about-us-stub")).toBeInTheDocument();
  expect(screen.getByText("latest-news-stub")).toBeInTheDocument();
  expect(screen.getByText("navbar-stub")).toBeInTheDocument();
  expect(screen.getByText("footer-stub")).toBeInTheDocument();
});
