import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ArrowRight, ShieldAlert, Clock, Lock, ShieldCheck, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/InvestorPortal/ForgotPasswordModal';
import { login as loginApi, getSiteInfo } from '../api/services';

const CHALLENGE_TTL_SECONDS = 180;
const COOLDOWN_SECONDS = 5 * 60;

function ChallengeTimer({ secondsLeft }) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const low = secondsLeft <= 30;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${low ? 'text-red-600' : 'text-[#6E6E73]'}`}>
      <Clock size={13} />
      {mins}:{String(secs).padStart(2, '0')}
    </span>
  );
}

export default function HoldingCompanyLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();
  const { verifyChallenge } = useAuth();

  const [step, setStep] = useState('email');
  const [challengeId, setChallengeId] = useState('');
  const [letters, setLetters] = useState([]);
  const [answers, setAnswers] = useState({});
  const [challengeSecondsLeft, setChallengeSecondsLeft] = useState(CHALLENGE_TTL_SECONDS);
  const inputRefs = useRef([]);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const [locked, setLocked] = useState(false);

  // ── Math captcha (client-side, pre-auth gate) ──
  const [captchaA, setCaptchaA] = useState(0);
  const [captchaB, setCaptchaB] = useState(0);
  const [captchaOp, setCaptchaOp] = useState('+');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // ── Site stats for the left panel ──
  const [siteStats, setSiteStats] = useState({
    netAssets: null,
    portfolioCompanies: null,
    coreClusters: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await getSiteInfo();
        if (isMounted && res?.data) {
          setSiteStats({
            netAssets: res.data.totalPortfolioValue?.displayText ?? null,
            portfolioCompanies: res.data.totalCompanies ?? null,
            coreClusters: res.data.totalClusters ?? null,
          });
        }
      } catch (err) {
        console.error('Failed to load site stats:', err);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    const op = Math.random() < 0.5 ? '+' : '-';
    setCaptchaA(a);
    setCaptchaB(b);
    setCaptchaOp(op);
    setCaptchaAnswer(op === '+' ? a + b : a - b);
    setCaptchaInput('');
    setCaptchaError('');
  };

  // Generate the first captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (step !== 'challenge' || cooldownSecondsLeft > 0 || locked) return;
    if (challengeSecondsLeft <= 0) {
      setError('Challenge expired. Please sign in again.');
      setStep('email');
      setLetters([]);
      setAnswers({});
      setChallengeId('');
      generateCaptcha();
      return;
    }
    const t = setTimeout(() => setChallengeSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, challengeSecondsLeft, cooldownSecondsLeft, locked]);

  useEffect(() => {
    if (cooldownSecondsLeft <= 0) return;
    const t = setTimeout(() => setCooldownSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownSecondsLeft]);

  const handleCaptchaChange = (e) => {
    const value = e.target.value;
    if (!/^-?[0-9]*$/.test(value)) return;
    setCaptchaInput(value);

    if (value === '' || value === '-') {
      setCaptchaError('');
      return;
    }

    if (parseInt(value, 10) === captchaAnswer) {
      setCaptchaError('');
    } else {
      setCaptchaError('Incorrect answer, please try again');
    }
  };

  const isCaptchaCorrect =
    captchaInput !== '' && parseInt(captchaInput, 10) === captchaAnswer;

  // Phase 1 – call API directly
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isCaptchaCorrect) return;

    setError('');
    setIsLoading(true);

    try {
      const data = await loginApi({ email: email.trim(), password });

      const challenge = data?.data?.challenge;

      if (!challenge || !challenge.letters) {
        setError('Invalid response from server');
        return;
      }

      setChallengeId(challenge.challengeId);
      setLetters(challenge.letters);
      setChallengeSecondsLeft(challenge.expiresInSeconds || 180);
      setAnswers({});
      setFailedAttempts(0);
      setCooldownSecondsLeft(0);
      setLocked(false);
      setStep('challenge');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (letter, idx, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    setAnswers((prev) => ({ ...prev, [letter]: value }));
    if (value && idx < letters.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleAnswerKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const allAnswered =
    letters.length > 0 &&
    letters.every((letter) => answers[letter] !== undefined && answers[letter] !== '');

  // Phase 2
  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    if (!allAnswered || cooldownSecondsLeft > 0 || locked) return;

    setError('');
    setIsLoading(true);
    const answersString = letters.map((l) => answers[l]).join('');

    try {
      const result = await verifyChallenge(challengeId, answersString);

      if (result.success) {
        const portal = result.portal || 'investor';
        navigate(portal === 'admin' ? '/admin-portal/dashboard' : '/investor-portal/dashboard');
        return;
      }

      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);

      if (nextFail === 1) {
        setError(result.message || 'Incorrect answers. Please try again.');
        setStep('email');
        setLetters([]);
        setAnswers({});
        setChallengeId('');
        generateCaptcha();
      } else if (nextFail === 2) {
        setError('');
        setCooldownSecondsLeft(COOLDOWN_SECONDS);
      } else {
        setError('');
        setLocked(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'challenge' && locked) {
    return (
      <div className="relative h-[80vh] overflow-hidden bg-white flex items-center justify-center px-4">
        <div
          className="w-full max-w-md px-8 py-10 text-center bg-white rounded-2xl"
          style={{ border: '1px solid #E5E5EA', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 48px -8px rgba(0,0,0,0.10)' }}
        >
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full w-14 h-14 bg-red-50">
            <Lock size={24} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-2">Account Locked</h3>
          <p className="text-sm text-[#6E6E73] leading-relaxed mb-6">
            Too many failed attempts. This account has been locked and can only be unlocked by an administrator.
          </p>
          <button
            type="button"
            onClick={() => {
              setStep('email');
              setLocked(false);
              setFailedAttempts(0);
              generateCaptcha();
            }}
            className="text-sm text-[#1D1D1F] font-medium underline underline-offset-2 hover:text-[#6E6E73]"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-[80vh] overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle, #1D1D1F 0%, transparent 70%)',
              animation: 'float 25s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.02]"
            style={{
              background: 'radial-gradient(circle, #1D1D1F 0%, transparent 70%)',
              animation: 'float 30s ease-in-out infinite reverse',
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
          <div className="w-full mx-auto max-w-screen-3xl">
            <div className="grid h-full grid-cols-12">
              <div className="hidden col-span-1 lg:block" />

              <div className="flex items-center col-span-12 lg:col-span-10">
                <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-12">
                  {/* Left side */}
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
                        <div className="text-xl font-semibold text-[#1D1D1F] mb-1 xl:text-2xl">
                          {statsLoading ? '—' : (siteStats.netAssets ?? 'N/A')}
                        </div>
                        <div className="text-[10px] text-[#6E6E73] uppercase tracking-wide font-medium whitespace-nowrap">
                          NET ASSETS
                        </div>
                      </div>
                      <div className="bg-[#F5F5F7] rounded-xl p-3 xl:p-4">
                        <div className="text-xl font-semibold text-[#1D1D1F] mb-1 xl:text-2xl">
                          {statsLoading ? '—' : `${siteStats.portfolioCompanies ?? 0}+`}
                        </div>
                        <div className="text-[10px] text-[#6E6E73] uppercase tracking-wide font-medium whitespace-nowrap">
                          PORTFOLIO COMPANIES
                        </div>
                      </div>
                      <div className="bg-[#F5F5F7] rounded-xl p-3 xl:p-4">
                        <div className="text-xl font-semibold text-[#1D1D1F] mb-1 xl:text-2xl">
                          {statsLoading ? '—' : (siteStats.coreClusters ?? 0)}
                        </div>
                        <div className="text-[10px] text-[#6E6E73] uppercase tracking-wide font-medium whitespace-nowrap">
                          CORE CLUSTERS
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="flex items-center justify-center lg:justify-end">
                    <div
                      className="w-full max-w-lg px-8 py-8 bg-white rounded-2xl lg:px-10 lg:py-10"
                      style={{
                        border: '1px solid #E5E5EA',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 48px -8px rgba(0,0,0,0.10)',
                      }}
                    >
                      {/* EMAIL + PASSWORD STEP */}
                      {step === 'email' && (
                        <div className="space-y-7">
                          <div>
                            <h3 className="text-3xl font-semibold text-[#1D1D1F] mb-2">Sign In</h3>
                            <p className="text-[#6E6E73] text-sm">
                              Enter your credentials to continue
                            </p>
                          </div>

                          {error && (
                            <div className="px-4 py-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
                              {error}
                            </div>
                          )}

                          <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                                  required
                                  className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-4 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-transparent transition-all duration-200 pr-12"
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

                            <div className="p-5 space-y-4 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center rounded-full w-7 h-7 bg-[#1D1D1F]/5">
                                    <ShieldCheck size={15} className="text-[#1D1D1F]" />
                                  </div>
                                  <span className="text-xs font-semibold tracking-wide text-[#1D1D1F] uppercase">
                                    Quick Security Check
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={generateCaptcha}
                                  aria-label="Get a new question"
                                  className="flex items-center justify-center transition-colors rounded-full w-8 h-8 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white"
                                >
                                  <RefreshCw size={15} />
                                </button>
                              </div>

                              <div className="flex items-center justify-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 text-lg font-bold bg-white border border-[#D2D2D7] rounded-lg text-[#1D1D1F]">
                                  {captchaA}
                                </div>
                                <span className="text-lg font-semibold text-[#6E6E73]">{captchaOp}</span>
                                <div className="flex items-center justify-center w-12 h-12 text-lg font-bold bg-white border border-[#D2D2D7] rounded-lg text-[#1D1D1F]">
                                  {captchaB}
                                </div>
                                <span className="text-lg font-semibold text-[#6E6E73]">=</span>

                                <div className="relative">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    value={captchaInput}
                                    onChange={handleCaptchaChange}
                                    placeholder="?"
                                    aria-label={`What is ${captchaA} ${captchaOp} ${captchaB}?`}
                                    className={`w-16 h-12 text-center text-lg font-semibold rounded-lg border-2 bg-white placeholder:text-[#C7C7CC] focus:outline-none transition-colors duration-200 ${
                                      isCaptchaCorrect
                                        ? 'border-emerald-500 text-emerald-600 focus:ring-2 focus:ring-emerald-200'
                                        : captchaError
                                        ? 'border-red-400 text-red-600 focus:ring-2 focus:ring-red-100'
                                        : 'border-[#D2D2D7] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/20 focus:border-[#1D1D1F]'
                                    }`}
                                  />
                                  {isCaptchaCorrect && (
                                    <CheckCircle2
                                      size={16}
                                      className="absolute text-emerald-500 -top-1.5 -right-1.5 bg-white rounded-full"
                                    />
                                  )}
                                  {!isCaptchaCorrect && captchaError && (
                                    <XCircle
                                      size={16}
                                      className="absolute text-red-500 -top-1.5 -right-1.5 bg-white rounded-full"
                                    />
                                  )}
                                </div>
                              </div>

                              {captchaError ? (
                                <p className="text-xs text-center text-red-600">{captchaError}</p>
                              ) : (
                                <p className="text-xs text-center text-[#6E6E73]">
                                  Solve this to enable sign in
                                </p>
                              )}
                            </div>

                            <button
                              type="submit"
                              disabled={isLoading || !isCaptchaCorrect}
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
                        </div>
                      )}

                      {/* CHALLENGE STEP */}
                      {step === 'challenge' && (
                        <div className="space-y-7">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-2xl font-semibold text-[#1D1D1F]">Security Check</h3>
                              {cooldownSecondsLeft === 0 && (
                                <ChallengeTimer secondsLeft={challengeSecondsLeft} />
                              )}
                            </div>
                            <p className="text-[#6E6E73] text-sm">
                              Enter the number that matches each letter below.
                            </p>
                          </div>

                          {error && (
                            <div className="px-4 py-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
                              {error}
                            </div>
                          )}

                          {cooldownSecondsLeft > 0 ? (
                            <div className="px-4 py-6 text-center border border-amber-200 bg-amber-50 rounded-xl">
                              <ShieldAlert size={22} className="mx-auto mb-2 text-amber-500" />
                              <p className="text-sm font-medium text-[#1D1D1F] mb-1">Too many attempts</p>
                              <p className="text-xs text-[#6E6E73] mb-3">
                                Please wait before trying again.
                              </p>
                              <ChallengeTimer secondsLeft={cooldownSecondsLeft} />
                            </div>
                          ) : (
                            <form onSubmit={handleChallengeSubmit} className="space-y-6">
                              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                                {letters.map((letter, idx) => (
                                  <div key={`${letter}-${idx}`} className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 flex items-center justify-center bg-[#F5F5F7] rounded-lg border border-[#E5E5EA]">
                                      <span className="text-xl font-bold text-[#1D1D1F]">{letter}</span>
                                    </div>
                                    <input
                                      ref={(el) => (inputRefs.current[idx] = el)}
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={1}
                                      placeholder="•"
                                      value={answers[letter] || ''}
                                      onChange={(e) => handleAnswerChange(letter, idx, e.target.value)}
                                      onKeyDown={(e) => handleAnswerKeyDown(idx, e)}
                                      className="w-12 h-14 text-center text-xl font-semibold bg-white border-2 border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] focus:border-[#1D1D1F] placeholder:text-[#C7C7CC]"
                                    />
                                  </div>
                                ))}
                              </div>

                              <button
                                type="submit"
                                disabled={!allAnswered || isLoading}
                                className="w-full bg-[#1D1D1F] text-white font-medium py-4 rounded-xl hover:bg-[#2D2D2F] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md group"
                              >
                                {isLoading ? (
                                  <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                                ) : (
                                  <>
                                    <span>Verify &amp; Continue</span>
                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                  </>
                                )}
                              </button>
                            </form>
                          )}

                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setStep('email');
                                setError('');
                                setFailedAttempts(0);
                                setCooldownSecondsLeft(0);
                                setLetters([]);
                                setAnswers({});
                                setChallengeId('');
                                generateCaptcha();
                              }}
                              className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors font-medium"
                            >
                              ← Use a different email
                            </button>
                          </div>
                        </div>
                      )}
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