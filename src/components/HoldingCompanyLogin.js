// src/components/HoldingCompanyLogin.js
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSiteInfo } from '../api/services';
import ForgotPasswordModal from '../components/InvestorPortal/ForgotPasswordModal';
import LetterChallengeInput, { ChallengeTimer } from './auth/LetterChallengeInput';

const CHALLENGE_TTL_SECONDS = 180;
const COOLDOWN_SECONDS = 5 * 60;

export default function HoldingCompanyLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();
  const { login, verifyChallenge } = useAuth();

  // step: 'email' → 'challenge'
  const [step, setStep] = useState('email');

  // Challenge state (from real API)
  const [challengeId, setChallengeId] = useState('');
  const [letters, setLetters] = useState([]);          // string[] from backend
  const [answers, setAnswers] = useState([]);          // index-keyed: answers[idx]
  const [challengeSecondsLeft, setChallengeSecondsLeft] = useState(CHALLENGE_TTL_SECONDS);

  // Calm cooldown UX after a 429 (backend enforces the real rules)
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);

  // Public site stats for the marketing panel — no auth, failures stay silent
  const [siteInfo, setSiteInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const envelope = await getSiteInfo();
        if (!cancelled && envelope.success) setSiteInfo(envelope.data);
      } catch (err) {
        // Marketing copy only — leave the placeholders in place.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetChallenge = () => {
    setStep('email');
    setLetters([]);
    setAnswers([]);
    setChallengeId('');
  };

  const routeByPortal = (portal) => {
    navigate(portal === 'admin' ? '/admin-portal/dashboard' : '/investor-portal/dashboard');
  };

  // Challenge countdown — on expiry the challenge is dead server-side too
  useEffect(() => {
    if (step !== 'challenge') return;
    if (challengeSecondsLeft <= 0) {
      setError('Challenge expired. Please sign in again.');
      resetChallenge();
      return;
    }
    const t = setTimeout(() => setChallengeSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, challengeSecondsLeft]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldownSecondsLeft <= 0) return;
    const t = setTimeout(() => setCooldownSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownSecondsLeft]);

  // Phase 1 – credentials → challenge (or straight to a session when the challenge is disabled)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (cooldownSecondsLeft > 0) return;
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (!result.success) {
        if (result.status === 429) {
          setError('');
          setCooldownSecondsLeft(COOLDOWN_SECONDS);
        } else {
          setError(result.message || 'Invalid email or password');
        }
        setIsLoading(false);
        return;
      }

      if (result.authenticated) {
        routeByPortal(result.portal);
        return;
      }

      setChallengeId(result.challengeId);
      setLetters(result.letters || []);
      setAnswers(new Array((result.letters || []).length).fill(''));
      setChallengeSecondsLeft(result.expiresInSeconds || CHALLENGE_TTL_SECONDS);
      setStep('challenge');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (idx, digit) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
  };

  const allAnswered =
    letters.length > 0 &&
    answers.length === letters.length &&
    answers.every((a) => a !== '' && a !== undefined);

  // Phase 2 – verify challenge → tokens.
  // The challenge is single-use: ANY failure burns it server-side, so every
  // failure path returns to the credentials step.
  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    if (!allAnswered) return;

    setError('');
    setIsLoading(true);

    // answers must be the 8-digit string in the same order as letters
    const answersString = answers.join('');

    try {
      const result = await verifyChallenge(challengeId, answersString);

      if (result.success) {
        routeByPortal(result.portal || 'investor');
        return;
      }

      if (result.status === 429) {
        setError('');
        setCooldownSecondsLeft(COOLDOWN_SECONDS);
      } else {
        setError(result.message || 'Incorrect answers. Please start again.');
      }
      resetChallenge();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                          {siteInfo?.totalPortfolioValue?.displayText || '—'}
                        </div>
                        <div className="text-[10px] text-[#6E6E73] uppercase tracking-wide font-medium whitespace-nowrap">
                          PORTFOLIO VALUE
                        </div>
                      </div>
                      <div className="bg-[#F5F5F7] rounded-xl p-3 xl:p-4">
                        <div className="text-xl font-semibold text-[#1D1D1F] mb-1 xl:text-2xl">
                          {siteInfo?.totalClusters ?? '—'}
                        </div>
                        <div className="text-[10px] text-[#6E6E73] uppercase tracking-wide font-medium whitespace-nowrap">
                          CORE CLUSTERS
                        </div>
                      </div>
                      <div className="bg-[#F5F5F7] rounded-xl p-3 xl:p-4">
                        <div className="text-xl font-semibold text-[#1D1D1F] mb-1 xl:text-2xl">
                          {siteInfo?.totalCountries ?? '—'}
                        </div>
                        <div className="text-[10px] text-[#6E6E73] uppercase tracking-wide font-medium whitespace-nowrap">
                          COUNTRIES
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

                          {cooldownSecondsLeft > 0 ? (
                            <div className="space-y-4">
                              <div className="px-4 py-6 text-center border border-amber-200 bg-amber-50 rounded-xl">
                                <ShieldAlert size={22} className="mx-auto mb-2 text-amber-500" />
                                <p className="text-sm font-medium text-[#1D1D1F] mb-1">Too many attempts</p>
                                <p className="text-xs text-[#6E6E73] mb-3">
                                  Please wait before trying again.
                                </p>
                                <ChallengeTimer secondsLeft={cooldownSecondsLeft} />
                              </div>
                              <div className="text-center">
                                <button
                                  type="button"
                                  onClick={() => setShowForgotModal(true)}
                                  className="text-sm text-[#1D1D1F] hover:text-[#6E6E73] transition-colors font-medium hover:underline"
                                >
                                  Forgot password?
                                </button>
                              </div>
                            </div>
                          ) : (
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
                          )}

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
                      )}

                      {/* CHALLENGE STEP */}
                      {step === 'challenge' && (
                        <div className="space-y-7">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-2xl font-semibold text-[#1D1D1F]">Security Check</h3>
                              <ChallengeTimer secondsLeft={challengeSecondsLeft} />
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

                          <form onSubmit={handleChallengeSubmit} className="space-y-6">
                            <LetterChallengeInput
                              letters={letters}
                              answers={answers}
                              onChange={handleAnswerChange}
                              disabled={isLoading}
                            />

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

                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setError('');
                                resetChallenge();
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
