import React, { useState, useEffect } from 'react';
import { getSiteInfo, subscribeSiteNewsletter } from '../api/services';

const LOCAL_NEWS_IMAGES = [
  "/closeup-business-people-shaking-hands-outdoor-cafe.jpg",
  "/male-business-executive-giving-speech.jpg",
  "/corporate-employees-review-transactional-info-improve-customer-satisfaction.jpg",
];

const LatestNews = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', consent: false });
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const [newsArticles, setNewsArticles] = useState([
    {
      id: 1,
      image: LOCAL_NEWS_IMAGES[0],
      title: "NF Holding Leadership Engages European Investors to Advance Africa-Europe Investment Partnerships",
      description: "NF Holding executives participated in high-level meetings with institutional investors and business leaders in Germany, aimed at strengthening Africa-Europe investment collaboration. The engagements focused on long-term capital deployment, sustainable infrastructure, and private sector growth across key African markets.",
      date: "December 12, 2025",
      category: "Investor Relations",
    },
    {
      id: 2,
      image: LOCAL_NEWS_IMAGES[1],
      title: "NF Holding CEO Honored for Excellence in Investment Leadership",
      date: "December 14, 2025",
      category: "Awards",
    },
    {
      id: 3,
      image: LOCAL_NEWS_IMAGES[2],
      title: "NF Holding Executives Engage in Portfolio Review Discussions",
      date: "December 16, 2025",
      category: "Corporate",
    },
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        const res = await getSiteInfo();
        if (isMounted && Array.isArray(res?.data?.news) && res.data.news.length > 0) {
          // ✅ News from data.news
          const mapped = res.data.news.slice(0, 3).map((article, index) => ({
            id: index,
            slug: `news-${index}`,
            image: LOCAL_NEWS_IMAGES[index % LOCAL_NEWS_IMAGES.length],
            title: article.title || `News Article ${index + 1}`,
            description: article.message || '', // ✅ message is the full body
            date: article.publishedDate 
              ? new Date(article.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : 'Coming Soon',
            category: article.category || 'General',
          }));
          setNewsArticles(mapped);
        }
      } catch (error) {
        console.error('Failed to load news:', error);
      }
    };

    fetchNews();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (website) return; // Honeypot
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      await subscribeSiteNewsletter({
        fullName: formData.fullName,
        email: formData.email,
        consent: formData.consent,
        website: website,
        captchaToken: '', // Add CAPTCHA token in production
      });
      setSubmitMessage({ type: 'success', text: 'Thank you for subscribing!' });
      setFormData({ fullName: '', email: '', consent: false });
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setSubmitMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-white lg:py-24">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block"></div>

        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 sm:px-6 lg:px-8">

            <h2 className="mb-12 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl lg:mb-16">
              Latest News
            </h2>

            <div className="grid items-stretch grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">

              <div className="lg:col-span-7">
                {newsArticles.length > 0 && (
                  <>
                    <div className="mb-12 lg:mb-16">
                      <div className="mb-6 overflow-hidden rounded-xl">
                        <img
                          src={newsArticles[0].image}
                          alt={newsArticles[0].title}
                          className="object-cover w-full h-72 lg:h-96"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
                          }}
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
                      <p className="mb-6 leading-relaxed text-justify text-gray-600">
                        {newsArticles[0].description}
                      </p>
                      <button className="text-[#0A2540] font-semibold hover:text-blue-700 transition-colors duration-300">
                        Read Full Story →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      {newsArticles.slice(1).map((article) => (
                        <div key={article.id} className="cursor-pointer group">
                          <div className="mb-4 overflow-hidden rounded-lg">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                          </div>
                          <div className="mb-2 text-sm font-medium text-gray-500">
                            {article.date}
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#0A2540] transition-colors duration-300 text-justify">
                            {article.title}
                          </h4>
                          {article.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {article.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-5">
                <div className="bg-[#1C1F26] text-white rounded-2xl h-full">
                  <div className="flex flex-col h-full p-8 lg:p-10">
                    <div className="mb-auto"></div>

                    <div className="my-auto">
                      <h3 className="text-2xl font-bold mb-9 lg:text-3xl">
                        Stay in touch to get exclusive news and insights from across our investment portfolio.
                      </h3>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label className="block mb-2 text-sm font-medium">Full Name</label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-white/60"
                            placeholder="John Smith"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium">Your Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-white/60"
                            placeholder="john@example.com"
                            required
                          />
                        </div>

                        <div className="hidden" aria-hidden="true">
                          <label htmlFor="website">Website</label>
                          <input
                            type="text"
                            id="website"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                          />
                        </div>

                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={formData.consent}
                            onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                            className="mt-1 mr-3"
                            required
                          />
                          <label className="text-xs text-justify">
                            By clicking Subscribe, I agree that Heirs NF Holding may use my contact details to send me communications and I consent to the Terms as provided in the Privacy Policy and Data Collection Clause.
                          </label>
                        </div>

                        {submitMessage && (
                          <p className={`text-sm ${submitMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {submitMessage.text}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-white text-[#0A2540] hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60"
                        >
                          {submitting ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
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