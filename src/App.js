import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import InvestorNavbar from "./components/InvestorNavbar";
import DisclaimerModal from "./components/DisclaimerModal";
import HeroSection from "./components/HeroSection";
import LearnAboutUs from "./components/LearnAboutUs";
import LeadershipPhilanthropy from "./components/LeadershipPhilanthropy";
import LatestNews from "./components/LatestNews";
import Footer from "./components/Footer";
import PortfolioHighlights from "./components/PortfolioHighlights";
import Sectors from "./components/Sectors";
import TotalPortfolio from "./components/TotalPortfolio";
import CompanyDetailPage from "./components/CompanyDetailPage";
import ClusterDetailPage from "./components/ClusterDetailPage";
import Objectives from "./components/Objectives";
import InvestorPortal from "./page/InvestorPortal";
import HoldingCompanyLogin from "./components/HoldingCompanyLogin";
import PortfolioInvestment from "./page/PortfolioInvestment";
import NetAssets from "./page/NetAssets";
import AssetSubEntities from "./page/AssetSubEntities";
import Market from "./page/Market";
import Profile from "./page/Profilepage";
import ContactPage from "./page/ContactPage";
import PrivacyPolicy from "./page/PrivacyPolicy";
import InvestmentApproach from "./page/InvestmentApproach";
import TermsConditions from "./page/TermsConditions";
import AboutUs from "./page/Aboutpage";
import PortfolioPerformance from "./page/PortfolioPerformance";
import NotFound from "./page/Notfound";

// Admin imports
import AdminDashboard from "./page/admin/AdminDashboard";
import AdminUsers from "./page/admin/AdminUsers";
import AdminClusters from "./page/admin/AdminClusters";
import AdminPortfolio from "./page/admin/AdminPortfolio";
import AdminCountries from "./page/admin/AdminCountries";
import AdminTimeline from "./page/admin/AdminTimeline";
import AdminValues from "./page/admin/AdminValues";
import AdminLeadership from "./page/admin/AdminLeadership";
import AdminMedia from "./page/admin/AdminMedia";
import AdminNews from "./page/admin/AdminNews";
import AdminPages from "./page/admin/AdminPages";
import AdminFoundation from "./page/admin/AdminFoundation";
import AdminNewsletter from "./page/admin/AdminNewsletter";
import AdminContactMessages from "./page/admin/AdminContactMessages";
import AdminSettings from "./page/admin/AdminSettings";
import AdminUsdKesRates from "./page/admin/AdminUsdKesRates";
import AdminPerformance from "./page/admin/AdminPerformance";
import AdminLoginLocks from "./page/admin/AdminLoginLocks";

// Wake-up handling
import WakeupSplash from "./components/WakeupSplash";
import { useSessionWakeup } from "./hooks/useSessionWakeup";

// Helper function to check if user is admin
const isAdminRole = (role) => {
  if (!role) return false;

  const adminRoles = [
    "SUPER_ADMIN",
    "super_admin",
    "ADMIN",
    "admin",
    "ROLE_SUPER_ADMIN",
    "ROLE_ADMIN",
  ];

  return adminRoles.some((r) => role.toUpperCase() === r.toUpperCase());
};

// Protected Route for fully authenticated users
const FullyProtectedRoute = ({ children }) => {
  const { isFullyAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isFullyAuthenticated) {
    return <Navigate to="/portal-login" replace />;
  }

  return children;
};

// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
  const { isFullyAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isFullyAuthenticated) {
    return <Navigate to="/portal-login" replace />;
  }

  if (!isAdminRole(userRole)) {
    return <Navigate to="/investor-portal/dashboard" replace />;
  }

  return children;
};

// Main application content
function AppContent() {
  const location = useLocation();

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const isInvestorPortal = location.pathname.startsWith("/investor-portal");
  const isAdminPortal = location.pathname.startsWith("/admin-portal");
  const isLoginPage = location.pathname === "/portal-login";
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (isHomePage) {
      const hasAccepted = localStorage.getItem("disclaimerAccepted");

      if (!hasAccepted) {
        setShowDisclaimer(true);
        document.body.style.overflow = "hidden";
      }
    }
  }, [isHomePage]);

  const handleAgree = () => {
    localStorage.setItem("disclaimerAccepted", "true");
    setShowDisclaimer(false);
    document.body.style.overflow = "unset";
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  const showInvestorNavbar = isInvestorPortal;
  const showFooter = !isLoginPage && !isAdminPortal;

  return (
    <div className="flex flex-col min-h-screen">
      {isHomePage && (
        <DisclaimerModal
          isOpen={showDisclaimer}
          onAgree={handleAgree}
          onDecline={handleDecline}
        />
      )}

      {!isAdminPortal && (showInvestorNavbar ? <InvestorNavbar /> : <Navbar />)}

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}

          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <LearnAboutUs />
                <LeadershipPhilanthropy />
                <LatestNews />
              </>
            }
          />

          <Route
            path="/clusters"
            element={
              <>
                <PortfolioHighlights />
                <Sectors />
                <TotalPortfolio />
                <Objectives />
              </>
            }
          />

          <Route path="/company/:companyId" element={<CompanyDetailPage />} />
          <Route path="/cluster/:clusterId" element={<ClusterDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/portfolio-performance"
            element={<PortfolioPerformance />}
          />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/investment-approach" element={<InvestmentApproach />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />

          {/* Single shared login page for all roles */}
          <Route path="/portal-login" element={<HoldingCompanyLogin />} />

          {/* Legacy entry points — redirect to the single login page */}
          <Route
            path="/investor-portal"
            element={<Navigate to="/portal-login" replace />}
          />
          <Route
            path="/investor-portal/login"
            element={<Navigate to="/portal-login" replace />}
          />
          <Route
            path="/admin-portal"
            element={<Navigate to="/portal-login" replace />}
          />
          <Route
            path="/admin-portal/login"
            element={<Navigate to="/portal-login" replace />}
          />

          {/* Investor Portal Routes */}

          <Route
            path="/investor-portal/dashboard"
            element={
              <FullyProtectedRoute>
                <InvestorPortal />
              </FullyProtectedRoute>
            }
          />

          <Route
            path="/investor-portal/portfolio-investment"
            element={
              <FullyProtectedRoute>
                <PortfolioInvestment />
              </FullyProtectedRoute>
            }
          />

          <Route
            path="/investor-portal/net-assets"
            element={
              <FullyProtectedRoute>
                <NetAssets />
              </FullyProtectedRoute>
            }
          />

          <Route
            path="/investor-portal/net-assets/:assetId"
            element={
              <FullyProtectedRoute>
                <AssetSubEntities />
              </FullyProtectedRoute>
            }
          />

          <Route
            path="/investor-portal/net-assets/:assetId/:subId"
            element={
              <FullyProtectedRoute>
                <AssetSubEntities />
              </FullyProtectedRoute>
            }
          />

          <Route
            path="/investor-portal/market"
            element={
              <FullyProtectedRoute>
                <Market />
              </FullyProtectedRoute>
            }
          />

          <Route
            path="/investor-portal/profile"
            element={
              <FullyProtectedRoute>
                <Profile />
              </FullyProtectedRoute>
            }
          />

          {/* Admin Portal Routes */}

          <Route
            path="/admin-portal/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/users"
            element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            }
          />

          {/* Admin Content */}

          <Route
            path="/admin-portal/content/clusters"
            element={
              <AdminProtectedRoute>
                <AdminClusters />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/content/portfolio"
            element={
              <AdminProtectedRoute>
                <AdminPortfolio />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/content/countries"
            element={
              <AdminProtectedRoute>
                <AdminCountries />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/content/timeline"
            element={
              <AdminProtectedRoute>
                <AdminTimeline />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/content/values"
            element={
              <AdminProtectedRoute>
                <AdminValues />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/content/leadership"
            element={
              <AdminProtectedRoute>
                <AdminLeadership />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/content/media"
            element={
              <AdminProtectedRoute>
                <AdminMedia />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/content/news"
            element={
              <AdminProtectedRoute>
                <AdminNews />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/content/pages"
            element={
              <AdminProtectedRoute>
                <AdminPages />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/content/foundation"
            element={
              <AdminProtectedRoute>
                <AdminFoundation />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/content/site"
            element={
              <AdminProtectedRoute>
                <AdminSettings />
              </AdminProtectedRoute>
            }
          />

          {/* Admin Engagement */}

          <Route
            path="/admin-portal/engagement/newsletter"
            element={
              <AdminProtectedRoute>
                <AdminNewsletter />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/engagement/messages"
            element={
              <AdminProtectedRoute>
                <AdminContactMessages />
              </AdminProtectedRoute>
            }
          />

          {/* Admin Financial */}

          <Route
            path="/admin-portal/financial/usd-kes-rates"
            element={
              <AdminProtectedRoute>
                <AdminUsdKesRates />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-portal/financial/performance"
            element={
              <AdminProtectedRoute>
                <AdminPerformance />
              </AdminProtectedRoute>
            }
          />

          {/* Admin System */}

          <Route
            path="/admin-portal/system/login-locks"
            element={
              <AdminProtectedRoute>
                <AdminLoginLocks />
              </AdminProtectedRoute>
            }
          />

          {/* Catch-all — any route that doesn't exist gets a normal 404
              instead of a blank page or a crash. Must stay last. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

// Controls application startup.
function AppInitializer() {
  const { isInitializing, isWakingUp } = useSessionWakeup();

  if (isInitializing || isWakingUp) {
    return <WakeupSplash />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Root application.
function App() {
  return (
    <Router>
      <AppInitializer />
    </Router>
  );
}

export default App;