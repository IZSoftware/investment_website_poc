import React, { useState, useEffect } from 'react';
import { getSiteInfo, subscribeSiteNewsletter } from '../api/services';

const LOCAL_NEWS_IMAGES = [
  "/closeup-business-people-shaking-hands-outdoor-cafe.jpg",
  "/male-business-executive-giving-speech.jpg",
  "/corporate-employees-review-transactional-info-improve-customer-satisfaction.jpg",
];

const LatestNews = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    consent: false,
  });

  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  // API news only
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);

        const res = await getSiteInfo();

        if (!isMounted) return;

        if (Array.isArray(res?.data?.news)) {
          const mapped = res.data.news.slice(0, 3).map((article, index) => ({
            id: article.id ?? index,
            slug: article.slug ?? `news-${index}`,
            image: LOCAL_NEWS_IMAGES[index % LOCAL_NEWS_IMAGES.length],
            title: article.title || `News Article ${index + 1}`,
            description: article.message || '',
            date: article.publishedDate
              ? new Date(article.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Coming Soon',
            category: article.category || 'General',
          }));

          setNewsArticles(mapped);
        } else {
          setNewsArticles([]);
        }
      } catch (error) {
        console.error('Failed to load news:', error);

        if (isMounted) {
          setNewsError('Unable to load the latest news.');
          setNewsArticles([]);
        }
      } finally {
        if (isMounted) {
          setNewsLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
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
        captchaToken: '',
      });

      setSubmitMessage({
        type: 'success',
        text: 'Thank you for subscribing!',
      });

      setFormData({
        fullName: '',
        email: '',
        consent: false,
      });
    } catch (error) {
      console.error('Newsletter subscription failed:', error);

      setSubmitMessage({
        type: 'error',
        text: 'Something went wrong. Please try again.',
      });
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

              {/* NEWS */}
              <div className="lg:col-span-7">

                {/* =========================
                    LOADING STATE
                ========================== */}
                {newsLoading && (
                  <div className="flex flex-col items-center justify-center w-full min-h-[500px] bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-white shadow-md">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-[#0A2540] rounded-full animate-spin" />
                    </div>

                    <p className="text-base font-semibold text-gray-700">
                      Loading latest news...
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Please wait while we fetch the latest updates.
                    </p>
                  </div>
                )}

                {/* =========================
                    ERROR STATE
                ========================== */}
                {!newsLoading && newsError && (
                  <div className="flex flex-col items-center justify-center w-full min-h-[400px] bg-gray-50 rounded-2xl border border-gray-100 px-6 text-center">
                    <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-red-50">
                      <span className="text-xl text-red-500">!</span>
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-gray-800">
                      Unable to load news
                    </h3>

                    <p className="max-w-md text-sm text-gray-500">
                      {newsError}
                    </p>
                  </div>
                )}

                {/* =========================
                    EMPTY STATE
                ========================== */}
                {!newsLoading &&
                  !newsError &&
                  newsArticles.length === 0 && (
                    <div className="flex flex-col items-center justify-center w-full min-h-[400px] bg-gray-50 rounded-2xl border border-gray-100 px-6 text-center">
                      <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-white shadow-sm">
                        <span className="text-2xl text-gray-400">📰</span>
                      </div>

                      <h3 className="mb-2 text-lg font-semibold text-gray-800">
                        No news available
                      </h3>

                      <p className="max-w-md text-sm text-gray-500">
                        There are currently no latest news updates to display.
                      </p>
                    </div>
                  )}

                {/* =========================
                    API NEWS
                ========================== */}
                {!newsLoading &&
                  !newsError &&
                  newsArticles.length > 0 && (
                    <>
                      {/* Featured Article */}
                      <div className="mb-12 lg:mb-16">
                        <div className="mb-6 overflow-hidden rounded-xl">
                          <img
                            src={newsArticles[0].image}
                            alt={newsArticles[0].title}
                            className="object-cover w-full h-72 lg:h-96"
                            onError={(e) => {
                              e.target.style.display = 'none';
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

                        {newsArticles[0].description && (
                          <p className="mb-6 leading-relaxed text-justify text-gray-600">
                            {newsArticles[0].description}
                          </p>
                        )}

                        {/* <button className="text-[#0A2540] font-semibold hover:text-blue-700 transition-colors duration-300">
                          Read Full Story →
                        </button> */}
                      </div>

                      {/* Other Articles */}
                      {newsArticles.length > 1 && (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                          {newsArticles.slice(1).map((article) => (
                            <div
                              key={article.id}
                              className="cursor-pointer group"
                            >
                              <div className="mb-4 overflow-hidden rounded-lg">
                                <img
                                  src={article.image}
                                  alt={article.title}
                                  className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>

                              <div className="mb-2 text-sm font-medium text-gray-500">
                                {article.date}
                              </div>

                              <h4 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-[#0A2540] transition-colors duration-300 text-justify">
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
                      )}
                    </>
                  )}
              </div>

              {/* NEWSLETTER */}
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
                          <label className="block mb-2 text-sm font-medium">
                            Full Name
                          </label>

                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
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
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-white/60"
                            placeholder="john@example.com"
                            required
                          />
                        </div>

                        {/* Honeypot */}
                        <div
                          className="hidden"
                          aria-hidden="true"
                        >
                          <label htmlFor="website">
                            Website
                          </label>

                          <input
                            type="text"
                            id="website"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            value={website}
                            onChange={(e) =>
                              setWebsite(e.target.value)
                            }
                          />
                        </div>

                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={formData.consent}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                consent: e.target.checked,
                              })
                            }
                            className="mt-1 mr-3"
                            required
                          />

                          <label className="text-xs text-justify">
                            By clicking Subscribe, I agree that Heirs NF Holding may use my contact details to send me communications and I consent to the Terms as provided in the Privacy Policy and Data Collection Clause.
                          </label>
                        </div>

                        {submitMessage && (
                          <p
                            className={`text-sm ${
                              submitMessage.type === 'success'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {submitMessage.text}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-white text-[#0A2540] hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60"
                        >
                          {submitting
                            ? 'SUBSCRIBING...'
                            : 'SUBSCRIBE'}
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