import { useState, useRef, useEffect } from 'react';
import { X, Shield, RefreshCw, ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);

  const navigate = useNavigate();

  // Demo constants (matching your login page)
  const DEMO_EMAIL = 'investor@NF Holding company.com';
  const DEMO_OTP = '123456';

  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  if (!isOpen) return null;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL.toLowerCase()) {
        setStep('otp');
        setError('');
      } else {
        setError('No account found with that email address');
      }
      setIsSubmitting(false);
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter a complete 6-digit code');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (code === DEMO_OTP) {
        onClose();               // close modal first
        navigate('/investor-portal/reset-password'); // then redirect
      } else {
        setError(`Invalid code. For demo use: ${DEMO_OTP}`);
        setIsSubmitting(false);
      }
    }, 1200);
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    alert(`New code sent to ${email}\n\nDemo code is still: ${DEMO_OTP}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5E5EA]">
        
        <button
          onClick={onClose}
          className="absolute z-10 p-2 text-gray-500 transition-colors rounded-lg top-4 right-4 hover:text-black hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center mb-5 bg-gray-100 w-14 h-14 rounded-2xl">
              {step === 'email' ? (
                <Mail size={28} className="text-black" />
              ) : (
                <Shield size={28} className="text-black" />
              )}
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-black">
              {step === 'email' ? 'Reset Password' : 'Enter Verification Code'}
            </h3>
            <p className="text-sm text-gray-600">
              {step === 'email'
                ? 'Enter your email to receive a reset code'
                : `Code sent to ${email}`}
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 text-sm text-center text-red-700 border border-red-200 bg-red-50 rounded-xl">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-black">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investor@NF Holding company.com"
                  autoFocus
                  required
                  className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/30 focus:border-black transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="flex items-center justify-center w-full gap-2 py-4 font-medium text-white transition-all bg-black shadow-sm rounded-xl hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Code
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className="w-12 text-2xl font-bold text-center transition-all bg-white border-2 border-gray-300 outline-none h-14 rounded-xl focus:border-black focus:ring-2 focus:ring-black/20"
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                disabled={isSubmitting || otp.join('').length !== 6}
                className="flex items-center justify-center w-full gap-2 py-4 font-medium text-white transition-all bg-black shadow-sm rounded-xl hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="text-center">
                <p className="mb-2 text-sm text-gray-600">Didn't get the code?</p>
                <button
                  onClick={handleResend}
                  className="inline-flex items-center gap-2 text-sm font-medium text-black transition-colors hover:text-gray-700"
                >
                  <RefreshCw size={16} className="transition-transform group-hover:rotate-180" />
                  Resend Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}