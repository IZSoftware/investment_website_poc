import React, { useState } from 'react';

const LatestNews = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    agreeToTerms: false
  });

  const newsArticles = [
    {
      id: 1,
      image: "/closeup-business-people-shaking-hands-outdoor-cafe.jpg",
      title: "Holdings Leadership Engages European Investors to Advance Africa-Europe Investment Partnerships",
      description: "Holdings executives participated in high-level meetings with institutional investors and business leaders in Germany, aimed at strengthening Africa-Europe investment collaboration. The engagements focused on long-term capital deployment, sustainable infrastructure, and private sector growth across key African markets.",
      date: "December 12, 2025",
      category: "Investor Relations",
      featured: true
    },
    {
      id: 2,
      image: "/male-business-executive-giving-speech.jpg",
      title: "Holdings CEO Honored for Excellence in Investment Leadership",
      date: "December 14, 2025",
      category: "Awards"
    },
    {
      id: 3,
      image: "/corporate-employees-review-transactional-info-improve-customer-satisfaction.jpg",
      title: "Holdings Executives Engage in Portfolio Review Discussions",
      date: "December 16, 2025",
      category: "Corporate"
    }
  ];

  return (
    <section className="py-16 bg-white lg:py-24">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>
        
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">
            
            <h2 className="mb-12 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl lg:mb-16">
              Latest News
            </h2>

            {/* TWO COLUMNS LAYOUT */}
            <div className="grid items-stretch grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
              
              {/* LEFT: NEWS ARTICLES */}
              <div className="lg:col-span-7">
                {/* Big Featured Article */}
                <div className="mb-12 lg:mb-16">
                  <div className="mb-6 overflow-hidden rounded-xl">
                    <img
                      src={newsArticles[0].image}
                      alt={newsArticles[0].title}
                      className="object-cover w-full h-72 lg:h-96"
                    />
                  </div>
                  <div className="flex items-center mb-4">
                    <span className="mr-4 text-sm font-medium text-gray-500">
                      {newsArticles[0].date}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                      {newsArticles[0].category}
                    </span>
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-900 lg:text-3xl">
                    {newsArticles[0].title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    {newsArticles[0].description}
                  </p>
                  <button className="text-[#0A2540] font-semibold hover:text-blue-700 transition-colors duration-300">
                    Read Full Story →
                  </button>
                </div>

                {/* Two Smaller Articles */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {newsArticles.slice(1).map((article) => (
                    <div key={article.id} className="cursor-pointer group">
                      <div className="mb-4 overflow-hidden rounded-lg">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="mb-2 text-sm font-medium text-gray-500">
                        {article.date}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#0A2540] transition-colors duration-300">
                        {article.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* RIGHT: NEWSLETTER - VERTICALLY CENTERED */}
              <div className="lg:col-span-5">
                <div className="bg-[#1C1F26] text-white rounded-2xl h-full">
                  <div className="flex flex-col h-full p-8 lg:p-10">
                    <div className="mb-auto"></div>
                    
                    {/* Centered content */}
                    <div className="my-auto">
                      <h3 className="text-2xl font-bold mb-9 lg:text-3xl">
                        Stay in touch to get exclusive news and insights from across our investment portfolio.
                      </h3>
                      
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        alert('Thank you for subscribing!');
                        setFormData({ fullName: '', email: '', agreeToTerms: false });
                      }} className="space-y-6">
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-white/60"
                            placeholder="John Smith"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Your Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-white/60"
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                        
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={formData.agreeToTerms}
                            onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                            className="mt-1 mr-3"
                            required
                          />
                          <label className="text-xs">
                           By clicking Subscribe, I agree that Heirs Holdings may use my contact details to send me communications and I consent to the Terms as provided in the Privacy Policy and Data Collection Clause.
                          </label>
                        </div>
                        
                        <button
                          type="submit"
                          className="w-full bg-white text-[#0A2540] hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          SUBSCRIBE
                        </button>
                      </form>
                    </div>
                    
                    <div className="mt-auto"></div>
                  </div>
                </div>
              </div>
              
            </div>

          </div>
        </div>
        
        <div className="hidden col-span-1 lg:block"></div>
      </div>
    </section>
  );
};

export default LatestNews;