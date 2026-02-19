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
  const { login, DEMO_EMAIL, DEMO_PASSWORD, DEMO_OTP } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Fake network delay – remove in real app
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
      <div className="relative h-screen overflow-hidden bg-white">
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

        <div className="relative z-10 flex items-center justify-center h-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            {/* Left side – Content */}
            <div className="flex-col hidden space-y-8 lg:flex">
              <div
                className="space-y-8"
                style={{ animation: 'slideInLeft 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <div className="space-y-6">
                  <h2
                    className="text-5xl font-semibold leading-[1.1] text-[#1D1D1F] tracking-tight xl:text-6xl"
                    style={{
                      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      animation: 'fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both'
                    }}
                  >
                    Enterprise
                    <br />
                    Access Portal
                  </h2>

                  <p
                    className="text-lg text-[#6E6E73] leading-relaxed max-w-md font-normal xl:text-xl"
                    style={{
                      fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
                      animation: 'fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both'
                    }}
                  >
                    Secure access to your comprehensive NF Holding s dashboard.
                    Monitor portfolio performance, strategic initiatives, and real-time analytics.
                  </p>
                </div>
              </div>

              <div
                className="grid grid-cols-3 gap-4 xl:gap-6"
                style={{ animation: 'fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}
              >
                <div className="bg-[#F5F5F7] rounded-xl p-4 xl:p-5">
                  <div className="text-2xl font-semibold text-[#1D1D1F] mb-1 xl:text-3xl">$4.2B</div>
                  <div className="text-xs text-[#6E6E73] uppercase tracking-wide font-medium">Net Assets</div>
                </div>
                <div className="bg-[#F5F5F7] rounded-xl p-4 xl:p-5">
                  <div className="text-2xl font-semibold text-[#1D1D1F] mb-1 xl:text-3xl">14+</div>
                  <div className="text-xs text-[#6E6E73] uppercase tracking-wide font-medium">Portfolio Companies</div>
                </div>
                <div className="bg-[#F5F5F7] rounded-xl p-4 xl:p-5">
                  <div className="text-2xl font-semibold text-[#1D1D1F] mb-1 xl:text-3xl">5</div>
                  <div className="text-xs text-[#6E6E73] uppercase tracking-wide font-medium">Core Sectors</div>
                </div>
              </div>
            </div>

            {/* Right side – Login form */}
            <div
              className="flex items-center justify-center"
              style={{ animation: 'slideInRight 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <div className="absolute -translate-x-1/2 top-8 left-1/2 lg:hidden">
                <div className="inline-flex items-center justify-center p-4 shadow-sm rounded-2xl">
                  <img
                    src="/NF Holding Logo.png"
                    alt="Company Logo"
                    className="object-contain w-auto h-10"
                  />
                </div>
              </div>

              <div
                className="w-full max-w-lg px-8 py-10 bg-white rounded-2xl lg:px-10"
                style={{
                  border: '1px solid #E5E5EA',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 48px -8px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  className="mb-8 rounded-full"
                  style={{
                    height: 3,
                    width: 40,
                    background: '#1D1D1F',
                  }}
                />

                <div className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-semibold text-[#1D1D1F] mb-2">Sign In</h3>
                    <p className="text-[#6E6E73] text-base">
                      Enter your credentials to access your account
                    </p>
                    <p className="text-xs text-[#6E6E73] mt-2">
                      Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
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
                        className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3.5 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all duration-200"
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
                          className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-3.5 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all duration-200 pr-12"
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

                      <div className="mt-1.5">
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
                        Secure Access
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
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}