import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';

const DisclaimerModal = ({ isOpen, onAgree, onDecline }) => { // Added props
  const [, setHasScrolledToBottom] = useState(false);
  const [showAgreeButton, setShowAgreeButton] = useState(false);
  const contentRef = useRef(null);

  // REMOVED the internal useEffect that was checking localStorage

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      
      setHasScrolledToBottom(isAtBottom);
      
      // Show agree button when scrolled to bottom
      if (isAtBottom) {
        setShowAgreeButton(true);
      }
    }
  };

  const handleClose = () => {
    // If they try to close without accepting, treat as decline
    onDecline();
  };

  // Control body overflow when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1D1D1F]/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-3xl bg-white shadow-2xl rounded-2xl max-h-[90vh] flex flex-col"
        style={{ 
          animation: 'modalScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid #E5E5EA'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#D2D2D7] bg-gradient-to-r from-[#F5F5F7] to-white">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl">
                <AlertCircle size={24} className="text-amber-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1D1D1F] leading-tight mb-1">
                PLEASE REVIEW THE FOLLOWING DISCLAIMER
              </h2>
              <p className="text-sm text-[#6E6E73]">
                (SCROLL DOWN) AND CLICK "ACCEPT" TO CONTINUE
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable Area */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: 'calc(90vh - 180px)' }}
        >
          {/* Main Disclaimer Content */}
          <div className="space-y-6">
            {/* Section 1 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">
                IMPORTANT INFORMATION ABOUT ACCESS TO THIS WEBSITE
              </h3>
              <p className="text-[#1D1D1F] leading-relaxed">
                The content of this website is issued by nf Holding , which is incorporated in the Republic of Kenya and operates in accordance with the regulations set forth by the Capital Markets Authority (CMA).
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <p className="text-[#1D1D1F] leading-relaxed">
                The information on this website is only directed at persons who are:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-[#1D1D1F]">
                <li>Professional Investors; and</li>
                <li>Eligible Counterparties</li>
              </ul>
              <p className="text-[#1D1D1F] leading-relaxed mt-2">
                as defined under the Capital Markets (Securities) (Public Offers, Listing and Disclosures) Regulations and the guidelines of the Capital Markets Authority of Kenya. Any strategy referred to on the website is only available to persons listed under (i) and (ii).
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <p className="text-[#1D1D1F] leading-relaxed">
                The information on this website should only be accessed by persons located in a jurisdiction or country where access to such information is not contrary to local law and regulation. Information on this website must not be relied or acted upon by any other persons.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-2">
              <p className="text-[#1D1D1F] leading-relaxed">
                The information in this website does not constitute an offer or solicitation in any jurisdiction in which it is not authorised, or to any person to whom such offer or solicitation is unlawful. All persons accessing this website do so on an unsolicited basis and on their own initiative. It is the responsibility of persons accessing this website to inform themselves of, and act in accordance with, the legal and regulatory requirements in their jurisdiction of citizenship, residence, or domicile. nf Holding  disclaims all responsibility if persons access the website, or the information on it, contrary to such legal and regulatory requirements.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-2">
              <p className="text-[#1D1D1F] leading-relaxed">
                The content on this website is not intended for the account of U.S. persons (as defined in Regulation S under the United States Securities Act of 1933, as amended (the "Securities Act")) other than persons who are "qualified purchasers" (as defined in the United States Investment Company Act of 1940, as amended) and/or "accredited investors" (as defined in Rule 501(a) under the Securities Act). Information contained on this website is not intended for investors in any jurisdiction in which distribution of the information or purchase is not authorised or permitted.
              </p>
            </div>

            {/* Section 6 */}
            <div className="space-y-2">
              <p className="text-[#1D1D1F] leading-relaxed">
                The information on this website is provided to you for informational purposes only and should not be regarded as an offer or solicitation of an offer to buy or sell any investments or related services that may be referenced on this website. Investors should consider carefully all specific risks prior to making an investment. Some general risks to consider include:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-[#1D1D1F] mt-2">
                <li>Past performance of an investment is not a guide to any future performance;</li>
                <li>The value of investments and any income generated may go down as well as up and is not guaranteed; and,</li>
                <li>Changes in exchange rates (including the Kenya Shilling) may have an adverse effect on the value, price, or income of investments.</li>
              </ul>
              <p className="text-[#1D1D1F] leading-relaxed mt-2">
                The information on this website is subject to change without notice. Opinions expressed herein reflect the opinion of nf Holding  and are subject to change without notice. Nothing on this website constitutes investment, legal, tax, or other advice nor should it be relied upon in making an investment decision.
              </p>
            </div>

            {/* Section 7 */}
            <div className="space-y-2">
              <p className="text-[#1D1D1F] leading-relaxed">
                The content of this website is based upon sources of information believed to be reliable; however, no guarantee, warranty, or representation (express or implied) is given to its accuracy or completeness. No responsibility or liability can be accepted for any errors or omissions or for any loss resulting from the use of any materials contained in this site. nf Holding  reserves the right to amend, alter, or withdraw any of the information in the site at any time without notice. No liability is accepted for such changes or for pages not being available at all times.
              </p>
            </div>

            {/* Section 8 */}
            <div className="space-y-2">
              <p className="text-[#1D1D1F] leading-relaxed">
                This website may contain links to other websites maintained by third parties over whom nf Holding  has no control. nf Holding  and its employees take no responsibility for approving, screening, or reviewing the contents of the linked websites and should not be regarded as an endorsement of the service or the site. nf Holding  makes no representations as to the accuracy, legality, or any other aspect of information contained in the linked or other websites.
              </p>
            </div>
          </div>

          {/* Scroll indicator - shows progress */}
          <div className="sticky bottom-0 left-0 right-0 h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1D1D1F] transition-all duration-300"
              style={{ 
                width: contentRef.current 
                  ? `${(contentRef.current.scrollTop / (contentRef.current.scrollHeight - contentRef.current.clientHeight)) * 100}%` 
                  : '0%' 
              }}
            />
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="p-6 border-t border-[#D2D2D7] bg-[#F5F5F7]">
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={onDecline} // Changed to use prop
              className="px-6 py-3 text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white rounded-xl transition-all border border-[#D2D2D7] bg-white"
            >
              Decline
            </button>
            <button
              onClick={onAgree} // Changed to use prop
              disabled={!showAgreeButton}
              className={`
                px-8 py-3 text-sm font-medium text-white rounded-xl transition-all
                ${showAgreeButton 
                  ? 'bg-[#1D1D1F] hover:bg-[#2D2D2F] cursor-pointer opacity-100' 
                  : 'bg-[#1D1D1F]/30 cursor-not-allowed backdrop-blur-sm'
                }
              `}
            >
              Agree
            </button>
          </div>
          {!showAgreeButton && (
            <p className="text-xs text-[#6E6E73] text-right mt-3">
              Please scroll to the bottom to enable the Agree button
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default DisclaimerModal;