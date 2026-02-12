import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
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

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Homepage with all sections */}
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
            
            {/* Investor Portal - Direct URL access only */}
            <Route path="/investor-portal" element={<InvestorPortal />} />
            
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;