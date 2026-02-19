import React from 'react';
import { ArrowLeft } from 'lucide-react';

// Privacy policy data in JSON format
const privacyPolicyData = {
  lastUpdated: "February 2026",
  introduction: "At nf Holding , we are committed to protecting the privacy and security of your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information in accordance with the Constitution of Kenya (Article 31) and the Data Protection Act, No. 24 of 2019.",
  sections: [
    {
      id: 1,
      title: "Information We Collect",
      content: "We may collect and process the following categories of personal data:",
      list: [
        { item: "Identity Data: IP Address, Country of IP Address, and Name." },
        { item: "Contact Data: Email address, and telephone numbers" },
        { item: "Technical Data: IP address, browser type, and usage data collected via cookies when you visit our website." }
      ]
    },
    {
      id: 2,
      title: "Lawful Basis for Processing",
      content: "We only process your data when we have a legal basis to do so, including:",
      list: [
        { item: "Consent: Where you have given clear, informed consent for a specific purpose." },
        { item: "Contractual Necessity: To perform a contract we have with you." },
        { item: "Legal Obligation: To comply with Kenyan law, including CMA regulations and Anti-Money Laundering (AML) requirements." },
        { item: "Legitimate Interests: For our internal business purposes, provided they do not override your fundamental rights." }
      ]
    },
    {
      id: 3,
      title: "How We Use Your Data",
      content: "NF Holding  uses your information to:",
      list: [
        { item: "Verify your status as a professional investor or eligible counterparty." },
        { item: "Provide information regarding our investment strategies and services." },
        { item: "Comply with statutory requirements under the Capital Markets Act and Proceeds of Crime and Anti-Money Laundering Act." },
        { item: "Improve website functionality and user experience." }
      ]
    },
    {
      id: 4,
      title: "Data Sharing and International Transfers",
      content: "We do not sell your personal data. We may share your information with:",
      list: [
        { item: "Regulatory Bodies: Such as the Capital Markets Authority (CMA) or the Office of the Data Protection Commissioner (ODPC)." },
        { item: "Service Providers: Third-party partners (e.g., IT providers, legal auditors) who act as 'Data Processors' under strict confidentiality." },
        { item: "Cross-Border Transfers: If your data is transferred outside Kenya, we ensure that the recipient country has adequate data protection laws or that appropriate safeguards (such as Standard Contractual Clauses) are in place, as required by Section 48 of the Act." }
      ]
    },
    {
      id: 5,
      title: "Your Rights as a Data Subject",
      content: "Under the Data Protection Act, you have the following rights:",
      list: [
        { item: "Right to be Informed: To know why and how your data is being used." },
        { item: "Right of Access: To request a copy of the personal data we hold about you." },
        { item: "Right to Rectification: To request the correction of false or misleading data." },
        { item: "Right to Erasure: To request the deletion of data that is no longer necessary." },
        { item: "Right to Object: To oppose the processing of your data for direct marketing or profiling." }
      ]
    },
    {
      id: 6,
      title: "Data Security and Retention",
      content: "We implement robust technical and organizational measures (including encryption and access controls) to prevent unauthorized access or disclosure. We retain your data only for as long as necessary to fulfill the purposes for which it was collected or to comply with legal retention periods (typically 7 years for financial records in Kenya).",
      list: []
    }
  ],
  contact: {
    title: "Contact Our Data Protection Officer",
    description: "If you have questions about this policy or wish to exercise your rights, please contact our Data Protection Officer (DPO):",
    email: "dpo@nfnf-holding.co.ke",
    phone: "+254 (0) 20 123 4567",
    address: ["nf Holding  Towers, Upper Hill", "P.O. Box 12345-00100", "Nairobi, Kenya"],
    note: "You also have the right to lodge a complaint with the Office of the Data Protection Commissioner (ODPC) of Kenya if you believe your rights have been infringed."
  }
};

const PrivacyPolicy = () => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-12 sm:px-6 lg:px-8">
            
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-8 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Header */}
            <div className="max-w-4xl mb-12">
              <h1 className="text-4xl font-semibold text-[#1D1D1F] tracking-tight mb-2">
                PRIVACY POLICY
              </h1>
              <p className="text-sm text-[#6E6E73]">
                Last Updated: {privacyPolicyData.lastUpdated}
              </p>
            </div>

            {/* Introduction */}
            <div className="max-w-4xl mb-12">
              <p className="text-base text-[#1D1D1F] leading-relaxed">
                {privacyPolicyData.introduction}
              </p>
            </div>

            {/* Sections */}
            <div className="max-w-4xl space-y-10">
              {privacyPolicyData.sections.map((section) => (
                <div key={section.id} className="space-y-3">
                  <h2 className="text-xl font-semibold text-[#1D1D1F]">
                    {section.id}. {section.title}
                  </h2>
                  
                  {section.content && (
                    <p className="text-base text-[#1D1D1F] leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  
                  {section.list && section.list.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {section.list.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-base text-[#1D1D1F]">
                          <span className="text-[#6E6E73] mt-1">•</span>
                          <span>{item.item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Contact Section */}
              <div className="pt-6 mt-8 border-t border-[#E5E5EA]">
                <h2 className="text-xl font-semibold text-[#1D1D1F] mb-3">
                  7. {privacyPolicyData.contact.title}
                </h2>
                
                <p className="text-base text-[#1D1D1F] leading-relaxed mb-4">
                  {privacyPolicyData.contact.description}
                </p>
                
                <div className="space-y-2 text-base text-[#1D1D1F]">
                  <p>Email: {privacyPolicyData.contact.email}</p>
                  <p>Phone: {privacyPolicyData.contact.phone}</p>
                  <p className="whitespace-pre-line">
                    Address: {privacyPolicyData.contact.address.join(', ')}
                  </p>
                </div>

                <div className="mt-4 p-4 bg-[#F5F5F7] rounded-lg">
                  <p className="text-sm text-[#6E6E73]">
                    <span className="font-medium text-[#1D1D1F]">Note:</span> {privacyPolicyData.contact.note}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-8 text-sm text-[#6E6E73] border-t border-[#E5E5EA]">
                <p>© {new Date().getFullYear()} nf-holding. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;