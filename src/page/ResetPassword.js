import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    // Fake API delay – in real app: send to backend
    setTimeout(() => {
      // Success simulation
      setSuccess(true);
      setIsSubmitting(false);

      // In real app → redirect after 2–3 seconds or show "log in now" button
      setTimeout(() => {
        navigate('/investor-portal/login');
      }, 2500);
    }, 1400);
  };

  return (
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
          {/* Left padding column */}
          <div className="hidden col-span-1 lg:block" />

          {/* Main content column */}
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
                    Set New Password
                  </h2>
                  <p className="text-[#6E6E73] text-base">
                    Choose a strong password for your account
                  </p>
                </div>

                {error && (
                  <div className="px-4 py-3 mb-6 text-sm text-center text-red-600 border border-red-200 bg-red-50 rounded-xl">
                    {error}
                  </div>
                )}

                {success ? (
                  <div className="px-4 py-5 mb-6 text-center">
                    <div className="mb-2 text-lg font-medium text-green-600">
                      Password reset successful!
                    </div>
                    <p className="text-[#6E6E73]">
                      Redirecting you to login...
                    </p>
                  </div>
                ) : (
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
                          placeholder="At least 8 characters"
                          className="w-full px-4 py-3.5 bg-white border border-[#D2D2D7] rounded-xl text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent pr-12 transition-all duration-200"
                          required
                          minLength={8}
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
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <span>Reset Password</span>
                          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/investor-portal/login')}
                    className="text-sm text-[#1D1D1F] hover:text-[#6E6E73] transition-colors font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right padding column */}
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
}