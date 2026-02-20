import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/InvestorPortal/ForgotPasswordModal';

export default function HoldingCompanyLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();
  const { login, DEMO_EMAIL, DEMO_OTP } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const result = login(email.trim(), password);
      if (result.success) {
        navigate('/investor-portal/verify-otp');
      } else {
        setError(result.message || 'Invalid email or password');
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <>
      <div className="relative h-[80vh] overflow-hidden bg-white">
        {/* Background gradients */}
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

        {/* Main content - centered vertically */}
        <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
          <div className="w-full mx-auto max-w-screen-3xl">
            <div className="grid h-full grid-cols-12">
              <div className="hidden col-span-1 lg:block" />

              <div className="flex items-center col-span-12 lg:col-span-10">
                <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-12">
                  {/* Left side content */}
                  <div className="hidden space-y-6 lg:flex lg:flex-col lg:justify-center">
                    <div className="space-y-4">
                      <h2
                        className="text-4xl font-semibold leading-tight text-[#1D1D1F] tracking-tight xl:text-5xl whitespace-nowrap"
                        style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        Enterprise Access Portal
                      </h2>

                      <p
                        className="text-base text-[#6E6E73] leading-relaxed max-w-md font-normal xl:text-lg"
                        style={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        Secure access to your comprehensive NF Holding dashboard. Monitor portfolio performance,
                        strategic initiatives, and real-time analytics.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#F5F5F7] rounded-xl p-3 xl:p-4">
                        <div className="text-xl font-semibold text-[#1D1D1F] mb-1 xl:text-2xl">$4.2B</div>
                        <div className="text-[10px] text-[#6E6E73] uppercase tracking-wide font-medium whitespace-nowrap">
                          NET ASSETS
                        </div>
                      </div>
                      <div className="bg-[#F5F5F7] rounded-xl p-3 xl:p-4">
                        <div className="text-xl font-semibold text-[#1D1D1F] mb-1 xl:text-2xl">14+</div>
                        <div className="text-[10px] text-[#6E6E73] uppercase tracking-wide font-medium whitespace-nowrap">
                          PORTFOLIO COMPANIES
                        </div>
                      </div>
                      <div className="bg-[#F5F5F7] rounded-xl p-3 xl:p-4">
                        <div className="text-xl font-semibold text-[#1D1D1F] mb-1 xl:text-2xl">5</div>
                        <div className="text-[10px] text-[#6E6E73] uppercase tracking-wide font-medium whitespace-nowrap">
                          CORE SECTORS
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Login form */}
                  <div className="flex items-center justify-center lg:justify-end">
                    <div
                      className="w-full max-w-lg px-8 py-8 bg-white rounded-2xl lg:px-10 lg:py-10"
                      style={{
                        border: '1px solid #E5E5EA',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 48px -8px rgba(0,0,0,0.10)',
                      }}
                    >
                      <div className="space-y-7">
                        <div>
                          <h3 className="text-3xl font-semibold text-[#1D1D1F] mb-2">Sign In</h3>
                          <p className="text-[#6E6E73] text-sm">
                            Enter your credentials to access your account
                          </p>
                        </div>

                        {error && (
                          <div className="px-4 py-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
                            {error}
                          </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[#1D1D1F] block">Email</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@company.com"
                              className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-4 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all duration-200"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[#1D1D1F] block">Password</label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-4 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all duration-200 pr-12"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
                              >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                            </div>

                            <div className="mt-2 text-right">
                              <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-sm text-[#1D1D1F] hover:text-[#6E6E73] transition-colors font-medium hover:underline"
                              >
                                Forgot password?
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1D1D1F] text-white font-medium py-4 rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md group"
                          >
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                            ) : (
                              <>
                                <span>Continue</span>
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </button>
                        </form>

                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#D2D2D7]" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-4 bg-white text-xs text-[#6E6E73] uppercase tracking-wider font-medium">
                              SECURE ACCESS
                            </span>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-[#6E6E73]">
                            Need access?{' '}
                            <button
                              type="button"
                              className="text-[#1D1D1F] hover:text-[#6E6E73] transition-colors font-medium underline underline-offset-2"
                            >
                              Contact your administrator
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden col-span-1 lg:block" />
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        demoEmail={DEMO_EMAIL}
        demoOtp={DEMO_OTP}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
      `}</style>
    </>
  );
}