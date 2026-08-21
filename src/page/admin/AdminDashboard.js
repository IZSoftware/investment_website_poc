// src/page/admin/AdminDashboard.js
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminNavbar, { getVisibleMenu } from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import { getAdminUsers, getAdminNewsletter, getAdminNews, getAdminPerformance } from '../../api/services';

const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCIAL_ADMIN', 'DEV'];

const StatCard = ({ title, description, state, subtitle, onManage }) => (
  <div className="flex flex-col h-full p-4 transition-shadow duration-300 bg-white border border-gray-200 shadow-lg sm:p-5 lg:p-6 hover:shadow-xl rounded-xl">
    <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl lg:mb-4">{title}</h2>
    <p className="mb-4 text-xs leading-relaxed text-gray-600 lg:mb-6 sm:text-sm">{description}</p>
    <div className="mb-1">
      <span className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
        {state?.loading || state?.error ? '—' : state?.value ?? '—'}
      </span>
    </div>
    {state?.error ? (
      <p className="mb-4 text-xs text-red-600 lg:mb-6 sm:text-sm">Couldn't load this figure</p>
    ) : (
      <p className="mb-4 text-xs text-gray-500 lg:mb-6 sm:text-sm">{subtitle}</p>
    )}
    <hr className="mb-3 border-t border-gray-200 lg:mb-4" />
    <div className="mt-auto">
      <button
        onClick={onManage}
        className="bg-[#0A2540] hover:bg-[#003852] text-white font-medium py-2 sm:py-2.5 px-6 sm:px-8 rounded-md transition-colors duration-200 text-xs sm:text-sm tracking-wide"
      >
        Manage
      </button>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { fullName, userRole } = useAuth();

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const canSeeNewsletter = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);
  const isStaff = STAFF_ROLES.includes(userRole);

  const [users, setUsers] = useState({ loading: true });
  const [subscribers, setSubscribers] = useState({ loading: true });
  const [publishedNews, setPublishedNews] = useState({ loading: true });
  const [performance, setPerformance] = useState({ loading: true });
  const [recentNews, setRecentNews] = useState({ loading: true, items: [] });

  useEffect(() => {
    let alive = true;

    // Each tile fetches independently so one 403/failure never blanks the page.
    const loadCount = (fetcher, setState, count) => {
      fetcher()
        .then((res) => {
          if (!alive) return;
          if (res?.success === false) {
            setState({ error: true });
            return;
          }
          const list = Array.isArray(res?.data) ? res.data : [];
          setState({ value: count(list) });
        })
        .catch(() => {
          if (alive) setState({ error: true });
        });
    };

    if (isSuperAdmin) {
      loadCount(getAdminUsers, setUsers, (list) => list.length);
    }
    if (canSeeNewsletter) {
      loadCount(getAdminNewsletter, setSubscribers, (list) => list.length);
    }
    if (isStaff) {
      getAdminNews()
        .then((res) => {
          if (!alive) return;
          if (res?.success === false) {
            setPublishedNews({ error: true });
            setRecentNews({ error: true, items: [] });
            return;
          }
          const list = Array.isArray(res?.data) ? res.data : [];
          setPublishedNews({ value: list.filter((n) => n?.published === true).length });
          const latest = [...list]
            .sort((a, b) => (b?.publishDate ?? '').localeCompare(a?.publishDate ?? ''))
            .slice(0, 5);
          setRecentNews({ items: latest });
        })
        .catch(() => {
          if (!alive) return;
          setPublishedNews({ error: true });
          setRecentNews({ error: true, items: [] });
        });

      loadCount(getAdminPerformance, setPerformance, (list) => list.length);
    }

    return () => {
      alive = false;
    };
  }, [isSuperAdmin, canSeeNewsletter, isStaff]);

  // Same role-gated menu the navbar renders; Dashboard link itself is redundant here.
  const quickLinkSections = getVisibleMenu(userRole).filter((item) => item.path !== '/admin-portal/dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:pt-12 lg:pt-16 sm:pb-10 lg:pb-12 sm:px-6 lg:px-0">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:mb-3 lg:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
              WELCOME BACK{fullName ? `, ${fullName.split(' ')[0].toUpperCase()}` : ''}
            </h1>
            <p className="text-lg font-light text-gray-500 sm:text-xl lg:text-2xl">
              Here's what's happening on your site today
            </p>
          </div>

          {!isStaff && (
            <div className="px-4 pb-16 sm:px-6 lg:px-0">
              <p className="text-sm text-gray-500">There is nothing to show for your role here.</p>
            </div>
          )}

          {isStaff && (
            <>
              <div className="grid grid-cols-1 gap-4 px-4 pb-12 sm:gap-6 lg:gap-8 sm:pb-16 sm:px-6 lg:px-0 sm:grid-cols-2 xl:grid-cols-4">
                {isSuperAdmin && (
                  <StatCard
                    title="Users"
                    description="Portal accounts across all admin and investor roles."
                    state={users}
                    subtitle="Total accounts"
                    onManage={() => navigate('/admin-portal/users')}
                  />
                )}
                {canSeeNewsletter && (
                  <StatCard
                    title="Newsletter Subscribers"
                    description="People who've signed up to receive updates from NF Holding."
                    state={subscribers}
                    subtitle="Total subscribers"
                    onManage={() => navigate('/admin-portal/engagement/newsletter')}
                  />
                )}
                <StatCard
                  title="Published News"
                  description="Articles currently live on the public news section."
                  state={publishedNews}
                  subtitle="Live articles"
                  onManage={() => navigate('/admin-portal/content/news')}
                />
                <StatCard
                  title="Performance Periods"
                  description="Monthly performance entries recorded for the fund."
                  state={performance}
                  subtitle="Recorded periods"
                  onManage={() => navigate('/admin-portal/performance')}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 px-4 pb-16 sm:px-6 lg:px-0 lg:grid-cols-3 lg:gap-8">

                <div className="bg-white border border-gray-200 rounded-xl shadow-lg lg:col-span-2">
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
                    {recentNews.loading ? (
                      <div className="px-6 py-10 text-sm text-center text-gray-400">Loading…</div>
                    ) : recentNews.error ? (
                      <div className="px-6 py-10 text-sm text-center text-gray-400">Couldn't load recent news</div>
                    ) : recentNews.items.length === 0 ? (
                      <div className="px-6 py-10 text-sm text-center text-gray-400">No articles yet</div>
                    ) : (
                      recentNews.items.map((article) => (
                        <div key={article?.id} className="flex items-center justify-between px-6 py-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{article?.title}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {article?.category ?? '—'}
                              {article?.publishDate ? ` · ${article.publishDate.slice(0, 10)}` : ''}
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 ml-4 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              article?.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {article?.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Quick Links</h3>
                  </div>
                  <div className="px-6 py-5 space-y-5">
                    {quickLinkSections.map((section) =>
                      section.links ? (
                        <div key={section.label}>
                          <div className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                            {section.label}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {section.links.map((link) => (
                              <Link
                                key={link.path}
                                to={link.path}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors border border-gray-200 rounded-full hover:text-[#0A2540] hover:border-[#0A2540]"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div key={section.path}>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={section.path}
                              className="px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors border border-gray-200 rounded-full hover:text-[#0A2540] hover:border-[#0A2540]"
                            >
                              {section.label}
                            </Link>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>
    </div>
  );
};

export default AdminDashboard;
