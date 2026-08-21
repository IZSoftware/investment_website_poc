import { useState } from 'react';
import { ArrowLeft, User, Mail, ShieldCheck, KeyRound, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/InvestorPortal/ForgotPasswordModal';

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  DEV: 'Developer',
  FINANCIAL_ADMIN: 'Financial Admin',
  INVESTOR: 'Investor',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { fullName, userEmail, userRole, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const normalizedRole = String(userRole || '').toUpperCase().replace(/^ROLE_/, '');
  const roleLabel = ROLE_LABELS[normalizedRole] || normalizedRole || '—';
  const initials = (fullName || userEmail || '')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-white">
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 py-8 sm:px-6 lg:px-8 sm:py-10 lg:py-12">

            <button
              onClick={() => navigate('/investor-portal/dashboard')}
              className="flex items-center gap-1.5 lg:gap-2 mb-6 lg:mb-8 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-xs font-medium sm:text-sm">Back to Dashboard</span>
            </button>

            <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center lg:mb-12">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1D1D1F] tracking-tight">
                Your Profile
              </h1>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-sm font-medium text-[#6E6E73] border border-[#D2D2D7] rounded-xl hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>

            <div className="max-w-4xl mb-10 lg:mb-12">
              <p className="text-sm sm:text-base lg:text-lg text-[#6E6E73] leading-relaxed">
                Your account details and security settings.
              </p>
            </div>

            <div className="grid max-w-5xl grid-cols-1 gap-4 sm:gap-5 lg:gap-6 lg:grid-cols-2">

              {/* Identity */}
              <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-6 lg:mb-8">
                  <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 text-xl font-semibold text-white bg-[#1D1D1F] rounded-full">
                    {initials || <User size={22} />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg lg:text-xl font-semibold text-[#1D1D1F] truncate">
                      {fullName || '—'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6E6E73]">{roleLabel}</p>
                  </div>
                </div>

                <dl className="space-y-4">
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-[#6E6E73] uppercase mb-1">
                      <User size={14} />
                      Full Name
                    </dt>
                    <dd className="text-sm sm:text-base text-[#1D1D1F] break-words">{fullName || '—'}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-[#6E6E73] uppercase mb-1">
                      <Mail size={14} />
                      Email Address
                    </dt>
                    <dd className="text-sm sm:text-base text-[#1D1D1F] break-words">{userEmail || '—'}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-[#6E6E73] uppercase mb-1">
                      <ShieldCheck size={14} />
                      Role
                    </dt>
                    <dd className="text-sm sm:text-base text-[#1D1D1F]">{roleLabel}</dd>
                  </div>
                </dl>

                <p className="mt-6 text-xs text-[#6E6E73] leading-relaxed lg:mt-8">
                  To change your name, email address or role, contact your account administrator.
                </p>
              </div>

              {/* Security */}
              <div className="bg-[#F5F5F7] rounded-xl lg:rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg flex flex-col">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl text-[#1D1D1F]">
                    <KeyRound size={18} />
                  </div>
                  <h2 className="text-lg lg:text-xl font-semibold text-[#1D1D1F]">Security</h2>
                </div>

                <p className="text-sm text-[#6E6E73] leading-relaxed mb-4">
                  Passwords are changed through the verified reset flow: we email nothing to
                  guess — you answer a one-time letter challenge, then set a new password of at
                  least 10 characters.
                </p>
                <p className="text-sm text-[#6E6E73] leading-relaxed mb-6 lg:mb-8">
                  Once the password is updated you will be taken to the sign-in page to
                  re-authenticate with your new credentials.
                </p>

                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-auto text-sm font-medium text-white bg-[#1D1D1F] rounded-xl hover:bg-[#2D2D2F] transition-all shadow-lg hover:shadow-xl"
                >
                  <KeyRound size={16} />
                  Change Password
                </button>
              </div>

            </div>

          </div>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>

      {/* The modal owns the whole email → challenge → new-password flow. Changing the
          password does not invalidate this session server-side, so end it here: the
          page promises re-authentication, and leaving the old tokens live would keep a
          session going on credentials the user just replaced. `logout()` clears both
          tokens and redirects to the right portal's sign-in. */}
      <ForgotPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        initialEmail={userEmail}
        onCompleted={logout}
      />
    </div>
  );
}
