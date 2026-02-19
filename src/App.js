import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import InvestorNavbar from './components/InvestorNavbar';
import DisclaimerModal from './components/DisclaimerModal';
import HeroSection from './components/HeroSection';
import LearnAboutUs from './components/LearnAboutUs';
import LeadershipPhilanthropy from './components/LeadershipPhilanthropy';
import LatestNews from './components/LatestNews';
import Footer from './components/Footer';
import PortfolioHighlights from './components/PortfolioHighlights';
import Sectors from './components/Sectors';
import TotalPortfolio from './components/TotalPortfolio';
import CompanyDetailPage from './components/CompanyDetailPage';
import ClusterDetailPage from './components/ClusterDetailPage';
import Objectives from './components/Objectives';
import InvestorPortal from './page/InvestorPortal';
import HoldingCompanyLogin from './components/HoldingCompanyLogin';
import OtpModal from './components/OtpModal';
import PortfolioInvestment from './page/PortfolioInvestment';
import NetAssets from './page/NetAssets';
import AssetSubEntities from './page/AssetSubEntities';
import Market from './page/Market';
import Profile from './page/Profilepage';
import ContactPage from './page/ContactPage';
import PrivacyPolicy from './page/PrivacyPolicy';
import InvestmentApproach from './page/InvestmentApproach';
import TermsConditions from './page/TermsConditions';
import AboutUs from './page/Aboutpage';
import PortfolioPerformance from './page/PortfolioPerformance';
import ResetPassword from './page/ResetPassword';

// Protected Route for fully authenticated (login + OTP)
const FullyProtectedRoute = ({ children }) => {
  const { isFullyAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isFullyAuthenticated) {
    return <Navigate to="/investor-portal/login" replace />;
  }
  
  return children;
};

// Route for OTP verification (only after login, before OTP)
const OtpRoute = ({ children }) => {
  const { isAuthenticated, isOtpVerified, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If fully authenticated, go to dashboard
  if (isAuthenticated && isOtpVerified) {
    return <Navigate to="/investor-portal/dashboard" replace />;
  }
  
  // If not authenticated at all, go to login
  if (!isAuthenticated) {
    return <Navigate to="/investor-portal/login" replace />;
  }
  
  // Authenticated but OTP not verified - show OTP page
  return children;
};

function AppContent() {
  const location = useLocation();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  const isInvestorPortal = location.pathname.startsWith('/investor-portal');
  const isLoginPage = location.pathname === '/investor-portal/login';
  const isOtpPage = location.pathname === '/investor-portal/verify-otp';
  const isHomePage = location.pathname === '/';
  
  const showInvestorNavbar = isInvestorPortal;
  const showFooter = !isLoginPage && !isOtpPage;

  // Check localStorage for disclaimer on homepage (changed from sessionStorage to localStorage)
  useEffect(() => {
    if (isHomePage) {
      const hasAccepted = localStorage.getItem('disclaimerAccepted'); // Changed to localStorage
      if (!hasAccepted) {
        setShowDisclaimer(true);
        document.body.style.overflow = 'hidden';
      }
    }
  }, [isHomePage]);

  const handleAgree = () => {
    localStorage.setItem('disclaimerAccepted', 'true'); // Changed to localStorage
    setShowDisclaimer(false);
    document.body.style.overflow = 'unset';
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Disclaimer Modal - only on homepage */}
      {isHomePage && (
        <DisclaimerModal 
          isOpen={showDisclaimer}
          onAgree={handleAgree}
          onDecline={handleDecline}
        />
      )}
      
      {/* Navbar */}
      {showInvestorNavbar ? <InvestorNavbar /> : <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          {/* Homepage */}
          <Route path="/" element={
            <>
              <HeroSection />
              <LearnAboutUs />
              <LeadershipPhilanthropy />
              <LatestNews />
            </>
          } />
          
          {/* Clusters/Portfolio Page */}
          <Route path="/clusters" element={
            <>
              <PortfolioHighlights />
              <Sectors />
              <TotalPortfolio />
              <Objectives />
            </>
          } />
          
          <Route path="/company/:companyId" element={<CompanyDetailPage />} />
          <Route path="/cluster/:clusterId" element={<ClusterDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/portfolio-performance" element={<PortfolioPerformance />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/investment-approach" element={<InvestmentApproach />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          
          {/* Investor Portal Routes */}
          <Route 
            path="/investor-portal" 
            element={<Navigate to="/investor-portal/login" replace />} 
          />
          
          <Route path="/investor-portal/login" element={<HoldingCompanyLogin />} />
          
          <Route 
            path="/investor-portal/verify-otp" 
            element={
              <OtpRoute>
                <OtpModal />
              </OtpRoute>
            } 
          />
          
          <Route 
            path="/investor-portal/reset-password" 
            element={<ResetPassword />} 
          />
          
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
        </Routes>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;