import React, { useState, useEffect } from "react";
import { ArrowRight, Home, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "../components/InvestorPortal/ForgotPasswordModal";
import LetterChallengeInput, { ChallengeTimer } from "../components/auth/LetterChallengeInput";

const CHALLENGE_TTL_SECONDS = 180;
const COOLDOWN_SECONDS = 5 * 60;

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();
  const { login, verifyChallenge } = useAuth();

  const [step, setStep] = useState("email");
  const [challengeId, setChallengeId] = useState("");
  const [letters, setLetters] = useState([]);
  const [answers, setAnswers] = useState([]); // index-keyed: answers[idx]
  const [challengeSecondsLeft, setChallengeSecondsLeft] = useState(CHALLENGE_TTL_SECONDS);

  // Calm cooldown UX after a 429 (backend enforces the real rules)
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);

  const resetChallenge = () => {
    setStep("email");
    setLetters([]);
    setAnswers([]);
    setChallengeId("");
  };

  const routeByPortal = (portal) => {
    navigate(portal === "admin" ? "/admin-portal/dashboard" : "/investor-portal/dashboard");
  };

  // Challenge countdown — on expiry the challenge is dead server-side too
  useEffect(() => {
    if (step !== "challenge") return;
    if (challengeSecondsLeft <= 0) {
      setError("Challenge expired. Please sign in again.");
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (cooldownSecondsLeft > 0) return;
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (!result.success) {
        if (result.status === 429) {
          setError("");
          setCooldownSecondsLeft(COOLDOWN_SECONDS);
        } else {
          setError(result.message || "Invalid email or password");
        }
        return;
      }

      // Challenge disabled in this environment — tokens came back directly.
      if (result.authenticated) {
        routeByPortal(result.portal);
        return;
      }

      setChallengeId(result.challengeId);
      setLetters(result.letters || []);
      setAnswers(new Array((result.letters || []).length).fill(""));
      setChallengeSecondsLeft(result.expiresInSeconds || CHALLENGE_TTL_SECONDS);
      setStep("challenge");
    } catch {
      setError("Something went wrong. Please try again.");
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
    answers.every((a) => a !== "" && a !== undefined);

  // The challenge is single-use: ANY failure burns it server-side, so every
  // failure path returns to the credentials step.
  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    if (!allAnswered) return;

    setError("");
    setIsLoading(true);
    const answersString = answers.join("");

    try {
      const result = await verifyChallenge(challengeId, answersString);

      if (result.success) {
        routeByPortal(result.portal || "investor");
        return;
      }

      if (result.status === 429) {
        setError("");
        setCooldownSecondsLeft(COOLDOWN_SECONDS);
      } else {
        setError(result.message || "Incorrect answers. Please start again.");
      }
      resetChallenge();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex items-center justify-center min-h-screen bg-gray-50">
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-[#6E6E73] hover:text-[#0A2540] transition-colors duration-200 group"
        >
          <Home size={20} className="transition-transform group-hover:scale-110" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <div
          className="relative w-full max-w-lg px-8 py-8 bg-white rounded-2xl lg:px-10 lg:py-10"
          style={{
            border: "1px solid #E5E5EA",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 48px -8px rgba(0,0,0,0.10)",
          }}
        >
          <Link to="/" className="flex justify-center mb-8 transition-opacity duration-200 cursor-pointer hover:opacity-80">
            <img src="/NF Holding Logo.png" alt="NF Holding" className="h-14" />
          </Link>

          {/* EMAIL + PASSWORD STEP */}
          {step === "email" && (
            <div className="space-y-7">
              <div>
                <h3 className="text-3xl font-semibold text-[#1D1D1F] mb-2">Admin Sign In</h3>
                <p className="text-[#6E6E73] text-sm">Sign in with your admin credentials</p>
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
                    <p className="text-xs text-[#6E6E73] mb-3">Please wait before trying again.</p>
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
                      placeholder="superadmin@company.com"
                      className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-4 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1D1D1F] block">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-[#D2D2D7] rounded-xl px-4 py-4 text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:border-transparent transition-all duration-200 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F]"
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
                    className="w-full bg-[#0A2540] text-white font-medium py-4 rounded-xl hover:bg-[#003852] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md group"
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
            </div>
          )}

          {/* SECURITY CHECK STEP */}
          {step === "challenge" && (
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
                  className="w-full bg-[#0A2540] text-white font-medium py-4 rounded-xl hover:bg-[#003852] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    resetChallenge();
                  }}
                  className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] font-medium"
                >
                  ← Use a different email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        signInPath="/admin-portal/login"
      />
    </>
  );
}
