import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import { getAdminUsers, getAdminNewsletter, getAdminNews } from '../../api/services';

const StatCard = ({ title, description, value, subtitle, onManage }) => (
  <div className="flex flex-col h-full p-4 transition-shadow duration-300 bg-white border border-gray-200 shadow-lg sm:p-5 lg:p-6 hover:shadow-xl rounded-xl">
    <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl lg:mb-4">{title}</h2>
    <p className="mb-4 text-xs leading-relaxed text-gray-600 lg:mb-6 sm:text-sm">{description}</p>
    <div className="mb-1">
      <span className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">{value}</span>
    </div>
    <p className="mb-4 text-xs text-gray-500 lg:mb-6 sm:text-sm">{subtitle}</p>
    <hr className="mb-3 border-t border-gray-200 lg:mb-4" />
    <div className="mt-auto">
      <button
        onClick={onManage}
        className="bg-black hover:bg-gray-800 text-white font-medium py-2 sm:py-2.5 px-6 sm:px-8 rounded-md transition-colors duration-200 text-xs sm:text-sm tracking-wide"
      >
        Manage
      </button>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ users: 0, subscribers: 0, publishedNews: 0 });
  const [recentNews, setRecentNews] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, newsletterRes, newsRes] = await Promise.all([
          getAdminUsers(),
          getAdminNewsletter(),
          getAdminNews(),
        ]);

        if (!isMounted) return;

        const usersCount = Array.isArray(usersRes?.data) ? usersRes.data.length : 0;
        const subscribersCount = Array.isArray(newsletterRes?.data) ? newsletterRes.data.length : 0;
        const newsList = Array.isArray(newsRes?.data) ? newsRes.data : [];
        const publishedCount = newsList.filter((n) => n.published).length;

        setStats({ users: usersCount, subscribers: subscribersCount, publishedNews: publishedCount });
        setRecentNews(newsList.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Could not load dashboard data. Please refresh.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:pt-12 lg:pt-16 sm:pb-10 lg:pb-12 sm:px-6 lg:px-0">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:mb-3 lg:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
              WELCOME BACK{user?.fullName ? `, ${user.fullName.split(' ')[0].toUpperCase()}` : ''}
            </h1>
            <p className="text-lg font-light text-gray-500 sm:text-xl lg:text-2xl">
              Here's what's happening on your site today
            </p>
          </div>

          {error && (
            <div className="px-4 pb-6 sm:px-6 lg:px-0">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 px-4 pb-12 sm:gap-6 lg:gap-8 sm:pb-16 lg:pb-20 sm:px-6 lg:px-0 md:grid-cols-3">
            <StatCard
              title="Total Users"
              description="Admin and investor accounts with portal access."
              value={loading ? '—' : stats.users}
              subtitle="Registered accounts"
              onManage={() => navigate('/admin-portal/users')}
            />
            <StatCard
              title="Newsletter Subscribers"
              description="People who've signed up to receive updates from NF Holding."
              value={loading ? '—' : stats.subscribers}
              subtitle="Total subscribers"
              onManage={() => navigate('/admin-portal/engagement/newsletter')}
            />
            <StatCard
              title="Published News"
              description="Articles currently live on the public news section."
              value={loading ? '—' : stats.publishedNews}
              subtitle="Live articles"
              onManage={() => navigate('/admin-portal/content/news')}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 px-4 pb-16 sm:px-6 lg:px-0">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Recent News</h3>
                <button
                  onClick={() => navigate('/admin-portal/content/news')}
                  className="text-sm font-semibold text-[#0A2540] hover:text-[#003852]"
                >
                  View all →
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="px-6 py-8 text-sm text-center text-gray-400">Loading…</div>
                ) : recentNews.length === 0 ? (
                  <div className="px-6 py-8 text-sm text-center text-gray-400">No articles yet</div>
                ) : (
                  recentNews.map((article) => (
                    <div key={article.id} className="flex items-center justify-between px-6 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{article.title}</p>
                        <p className="text-xs text-gray-500">{article.category}</p>
                      </div>
                      <span
                        className={`flex-shrink-0 ml-4 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          article.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>
    </div>
  );
};

export default AdminDashboard;