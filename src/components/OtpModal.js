// src/pages/OtpModal.js
import React, { useState, useRef, useEffect } from 'react';
import { Shield, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OtpModal() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, userEmail, loginPortal } = useAuth();

  // Auto-fill with 493817 for testing
  useEffect(() => {
    // Check if we're in development and auto-fill the test OTP
    if (process.env.NODE_ENV === 'development') {
      const testOtp = ['4', '9', '3', '8', '1', '7'];
      setOtp(testOtp);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    } else {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    const result = await verifyOtp(otpCode);
    setIsVerifying(false);

    if (result.success) {
      navigate(loginPortal === 'admin' ? '/admin-portal/dashboard' : '/investor-portal/dashboard');
    } else {
      setError(result.message || 'Invalid or expired code.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();

    const result = await resendOtp();
    if (result.success) {
      setResendCooldown(30);
    } else {
      setError(result.message || 'Could not resend code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1D1F]/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl">
        {/* Close button */}
        <button
          onClick={() => navigate(loginPortal === 'admin' ? '/admin-portal/login' : '/investor-portal/login')}
          className="absolute top-4 right-4 p-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center">
              <Shield size={32} className="text-[#1D1D1F]" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
              Verify Your Identity
            </h3>
            <p className="text-[#6E6E73] text-sm leading-relaxed">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-medium text-[#1D1D1F]">{userEmail}</span>
            </p>
            {/* Temporary test OTP display */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-2 mt-3 text-xs text-yellow-800 border border-yellow-200 rounded-lg bg-yellow-50">
                <span className="font-medium">Test OTP:</span> <span className="font-bold">493817</span> (auto-filled)
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="px-4 py-3 mb-4 text-sm text-center text-red-600 border border-red-200 bg-red-50 rounded-xl">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <div className="flex justify-center gap-3 mb-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-semibold bg-white border-2 border-[#D2D2D7] rounded-xl text-[#1D1D1F] focus:outline-none focus:border-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 transition-all"
                />
              ))}
            </div>
          </div>

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={isVerifying || otp.join('').length !== 6}
            className="w-full bg-[#1D1D1F] text-white font-medium py-4 rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md mb-4"
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>

          {/* Resend */}
          <div className="text-center">
            <p className="text-sm text-[#6E6E73] mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="inline-flex items-center gap-2 text-sm text-[#1D1D1F] hover:text-[#6E6E73] font-medium transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className="transition-transform duration-500 group-hover:rotate-180" />
              <span>{resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}</span>
            </button>
          </div>

          {/* Security note */}
          <div className="mt-8 pt-6 border-t border-[#D2D2D7]">
            <div className="flex items-start gap-3 bg-[#F5F5F7] rounded-xl p-4">
              <Shield size={18} className="text-[#6E6E73] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                This code will expire in 10 minutes. Never share your verification
                code with anyone, including our support team.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}