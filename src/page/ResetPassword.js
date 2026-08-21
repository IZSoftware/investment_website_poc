import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, CheckCircle2, Link2Off } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/services';
import ForgotPasswordModal from '../components/InvestorPortal/ForgotPasswordModal';

// Token-based password page. Serves BOTH flows with the same backend call:
// - /investor-portal/set-password  (invite email token)
// - /investor-portal/reset-password (reset token)
export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 10) {
      setError('At least 10 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const card = (children) => (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Subtle background blobs – matching login page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, #1D1D1F 0%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite'
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.02]"
          style={{
            background: 'radial-gradient(circle, #1D1D1F 0%, transparent 70%)',
            animation: 'float 30s ease-in-out infinite reverse'
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="col-span-12 lg:col-span-10">
            <div className="max-w-lg mx-auto">
              <div
                className="px-8 py-10 bg-white rounded-2xl lg:px-12"
                style={{
                  border: '1px solid #E5E5EA',
                  boxShadow:
                    '0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 48px -8px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.02)'
                }}
              >
                {children}
              </div>
            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
      `}</style>
    </div>
  );

  // No token in the URL — the link is incomplete
  if (!token) {
    return (
      <>
        {card(
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mb-5 mx-auto">
              <Link2Off size={28} className="text-red-500" />
            </div>
            <h2 className="text-3xl font-semibold text-[#1D1D1F] mb-3">Invalid Link</h2>
            <p className="text-[#6E6E73] text-base mb-8">
              This link is missing its token. Password links come from your invite email
              or from a password reset — request a new one if yours has expired.
            </p>
            <button
              type="button"
              onClick={() => navigate('/investor-portal/login')}
              className="w-full bg-[#1D1D1F] text-white font-medium py-4 rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 mb-4"
            >
              Go to Sign In
            </button>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-[#1D1D1F] hover:text-[#6E6E73] transition-colors font-medium hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}
        <ForgotPasswordModal
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
        />
      </>
    );
  }

  // Password set successfully
  if (success) {
    return card(
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-2xl mb-5 mx-auto">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-semibold text-[#1D1D1F] mb-3">Password Set</h2>
        <p className="text-[#6E6E73] text-base mb-8">
          Your password has been saved. You can now sign in with it.
        </p>
        <button
          type="button"
          onClick={() => navigate('/investor-portal/login')}
          className="w-full bg-[#1D1D1F] text-white font-medium py-4 rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <span>Go to Sign In</span>
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    );
  }

  return card(
    <>
      {/* Accent bar */}
      <div
        className="mx-auto mb-8 rounded-full"
        style={{ height: 3, width: 40, background: '#1D1D1F' }}
      />

      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#F5F5F7] rounded-2xl mb-5 mx-auto">
          <Shield size={28} className="text-[#1D1D1F]" />
        </div>
        <h2 className="text-3xl font-semibold text-[#1D1D1F] mb-3">
          Set Your Password
        </h2>
        <p className="text-[#6E6E73] text-base">
          Choose a password of at least 10 characters
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 mb-6 text-sm text-center text-red-600 border border-red-200 bg-red-50 rounded-xl">
          <p>{error}</p>
          <p className="mt-1 text-xs text-[#6E6E73]">
            If this link has expired, request a new invite or use Forgot password on the sign-in page.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#1D1D1F]">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 10 characters"
              className="w-full px-4 py-3.5 bg-white border border-[#D2D2D7] rounded-xl text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent pr-12 transition-all duration-200"
              required
              minLength={10}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F]"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#1D1D1F]">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-4 py-3.5 bg-white border border-[#D2D2D7] rounded-xl text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent pr-12 transition-all duration-200"
              required
              minLength={10}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F]"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1D1D1F] text-white font-medium py-4 rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md group"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Save Password</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => navigate('/investor-portal/login')}
          className="text-sm text-[#1D1D1F] hover:text-[#6E6E73] transition-colors font-medium"
        >
          Back to Sign In
        </button>
      </div>
    </>
  );
}
