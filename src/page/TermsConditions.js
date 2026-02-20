import React from 'react';

// Terms and conditions data in JSON format
const termsData = [
  {
    title: "Important Information",
    content: "This page states the Terms and Conditions under which you may use the website www.heirsNF Holding.com (referred to as the Site). Please read these Terms and Conditions carefully. If you do not accept the Terms and Conditions stated here, do not use the Site. Heirs NF Holding reserves the right to revise the enclosed Terms and Conditions on a frequent basis. You as the viewer agree to review the Terms and Conditions on a periodical basis. As a repeat visitor to the Site, you may consider the Terms and Conditions binding to successive visits."
  },
  {
    title: "Information on the site",
    content: "This Site aims to provide commercial information to clients prospective and current. However, personal comments, opinions and views expressed on this Site are not necessarily a representation of the views of Heirs NF Holding, its directors or its clients. Heirs NF Holding is not responsible for any injury, loss, damage or expense incurred by any individual as a result either directly or indirectly of any information published on this website. In using this site, you acknowledge and agree that the terms set forth above are fundamental to the usage of the Site, and that the Site would not be provided to you in the absence of such terms."
  },
  {
    title: "User interactions",
    content: "Generally, any communication which you transfer to the Site is considered to be non-confidential. Heirs NF Holding will not guarantee the privacy or confidentiality of any information relating to the user passing over the Internet."
  },
  {
    title: "Disclaimer",
    content: "Heirs NF Holding does not claim the Site will operate free of errors or that the Site and its servers are free of possibly harmful elements."
  },
  {
    title: "Third Party Links",
    content: "The Site may contain links to third party Web Sites. These links are provided solely as a convenience to you. Heirs NF Holding is not responsible for the content of linked third party sites and does not make any representations regarding the content or accuracy of materials on such third party Web Sites. If you decide to access linked third-party Web Sites, you do so at your own risk and in accordance with the prevailing terms and conditions and privacy policies of third party sites."
  },
  {
    title: "General",
    content: "Any disputes, claims or proceedings arising out of or in any way relating to the materials or the Site shall be governed by the laws of the Federal Republic of Nigeria. The Nigerian Courts shall have exclusive jurisdiction for the purpose of any proceedings arising out of or in any way relating to the materials or the Site. If any provision of this Agreement is found to be invalid by any court having competent jurisdiction, the invalidity of such provision shall not affect the validity of the remaining provisions of this Agreement, which shall remain in full force and effect. No waiver of any term of this Agreement shall be deemed a further or continuing waiver of such term or any other term. Heirs NF Holding may at any time and without liability modify, suspend or discontinue the Site or any materials (or any part or specification thereof), with or without notice, for any valid technical, operational or commercial reasons. These Terms and Conditions constitute the entire agreement between you and Heirs NF Holding with respect to the use of the Site."
  }
];
export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Fixed */}
      <div className="relative h-[400px] overflow-hidden">
        <img  
          src="/terms and condition.jpg" 
          alt="Terms and Conditions" 
          className="absolute inset-0 object-cover w-full h-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        
        {/* Added absolute positioning to grid container */}
        <div className="absolute inset-0 grid w-full h-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block"></div>
          <div className="flex items-center justify-center col-span-12 lg:col-span-10">
            <div className="text-center">
              <h1 className="mb-4 text-5xl font-semibold tracking-tight text-white lg:text-6xl">
                Terms & Conditions
              </h1>
              <div className="w-16 h-1 mx-auto bg-[#c4a078]" />
            </div>
          </div>
          <div className="hidden col-span-1 lg:block"></div>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col">
              {termsData.map((section, index) => (
                <div key={index} className="mb-12 last:mb-0">
                  <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-4">
                    {section.title}
                  </h2>
                  <p className="text-base text-[#6E6E73] leading-relaxed text-justify">
                    {section.content}
                  </p>
                  {index < termsData.length - 1 && (
                    <hr className="my-8 border-t border-[#D2D2D7]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hidden col-span-1 lg:block"></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .text-justify {
          text-align: justify;
          text-justify: inter-word;
        }
      `}</style>
    </div>
  );
}