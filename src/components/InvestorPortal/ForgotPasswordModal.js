import { useState, useEffect } from "react";
import { X, Shield, ArrowRight, Mail, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { forgotPassword, verifyResetChallenge, resetPassword } from "../../api/services";
import LetterChallengeInput, { ChallengeTimer } from "../auth/LetterChallengeInput";

const CHALLENGE_TTL_SECONDS = 180;
const COOLDOWN_SECONDS = 5 * 60;

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [letters, setLetters] = useState([]);
  const [answers, setAnswers] = useState([]); // index-keyed: answers[idx]
  const [challengeSecondsLeft, setChallengeSecondsLeft] = useState(CHALLENGE_TTL_SECONDS);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);

  const emailLocked = Boolean(initialEmail);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || "");
    } else {
      setStep("email");
      setEmail("");
      setChallengeId("");
      setLetters([]);
      setAnswers([]);
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setCooldownSecondsLeft(0);
    }
  }, [isOpen, initialEmail]);

  // Challenge countdown — on expiry the challenge is dead server-side too
  useEffect(() => {
    if (step !== "challenge") return;
    if (challengeSecondsLeft <= 0) {
      setError("Challenge expired. Please start again.");
      setStep("email");
      setLetters([]);
      setAnswers([]);
      setChallengeId("");
      return;
    }
    const t = setTimeout(() => setChallengeSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, challengeSecondsLeft]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldownSecondsLeft <= 0) return;
    const t = setTimeout(() => setCooldownSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownSecondsLeft]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (cooldownSecondsLeft > 0) return;
    setError("");
    setIsLoading(true);
    try {
      // forgot-password returns the challenge directly under data (not data.challenge)
      const response = await forgotPassword({ email: email.trim() });
      const data = response.data;

      setChallengeId(data.challengeId);
      setLetters(data.letters || []);
      setAnswers(new Array(data.letters?.length || 8).fill(""));
      setChallengeSecondsLeft(data.expiresInSeconds || CHALLENGE_TTL_SECONDS);
      setStep("challenge");
    } catch (err) {
      if (err.response?.status === 429) {
        setError("");
        setCooldownSecondsLeft(COOLDOWN_SECONDS);
      } else {
        setError(err.response?.data?.message || "Unable to start password reset.");
      }
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
    answers.length > 0 && answers.every((ans) => ans !== "" && ans !== undefined);

  // The challenge is single-use: ANY failure burns it server-side, so every
  // failure path returns to the email step.
  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    if (!allAnswered) return;

    setError("");
    setIsLoading(true);
    const answersString = answers.join("");

    try {
      const response = await verifyResetChallenge({ challengeId, answers: answersString });
      const data = response.data;
      setResetToken(data.resetToken);
      setStep("new-password");
    } catch (err) {
      if (err.response?.status === 429) {
        setError("");
        setCooldownSecondsLeft(COOLDOWN_SECONDS);
      } else {
        setError(err.response?.data?.message || "Incorrect answers. Please start again.");
      }
      setStep("email");
      setLetters([]);
      setAnswers([]);
      setChallengeId("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token: resetToken, newPassword });
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E5EA] p-8 text-center">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full w-14 h-14 bg-green-50">
            <Shield size={24} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-2">Password Updated</h3>
          <p className="text-sm text-[#6E6E73] mb-6">
            Your password has been changed successfully. You can now sign in.
          </p>
          <button
            onClick={() => {
              onClose();
              navigate("/investor-portal/login");
            }}
            className="w-full bg-[#1D1D1F] text-white font-medium py-4 rounded-xl hover:bg-[#2D2D2F]"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5E5EA]">
        <button
          onClick={onClose}
          className="absolute z-10 p-2 text-gray-500 top-4 right-4 hover:text-black hover:bg-gray-100 rounded-lg"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {step === "email" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-5 bg-gray-100 w-14 h-14 rounded-2xl">
                  <Mail size={28} className="text-black" />
                </div>
                <h3 className="mb-2 text-2xl font-semibold text-black">Reset Password</h3>
                <p className="text-sm text-gray-600">Enter your email to receive a security challenge</p>
              </div>

              {error && (
                <div className="p-4 text-sm text-center text-red-700 border border-red-200 bg-red-50 rounded-xl">
                  {error}
                </div>
              )}

              {cooldownSecondsLeft > 0 ? (
                <div className="px-4 py-6 text-center border border-amber-200 bg-amber-50 rounded-xl">
                  <ShieldAlert size={22} className="mx-auto mb-2 text-amber-500" />
                  <p className="text-sm font-medium text-[#1D1D1F] mb-1">Too many attempts</p>
                  <p className="text-xs text-[#6E6E73] mb-3">Please wait before trying again.</p>
                  <ChallengeTimer secondsLeft={cooldownSecondsLeft} />
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-black">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      autoFocus={!emailLocked}
                      disabled={emailLocked}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/30 focus:border-black disabled:bg-[#F5F5F7] disabled:text-[#6E6E73] disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="flex items-center justify-center w-full gap-2 py-4 font-medium text-white bg-black rounded-xl hover:bg-gray-900 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {step === "challenge" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-5 bg-gray-100 w-14 h-14 rounded-2xl">
                  <Shield size={28} className="text-black" />
                </div>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h3 className="text-2xl font-semibold text-black">Security Check</h3>
                  <ChallengeTimer secondsLeft={challengeSecondsLeft} />
                </div>
                <p className="text-sm text-gray-600">Enter the number that matches each letter below.</p>
              </div>

              {error && (
                <div className="p-4 text-sm text-center text-red-700 border border-red-200 bg-red-50 rounded-xl">
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
                  className="flex items-center justify-center w-full gap-2 py-4 font-medium text-white bg-black rounded-xl hover:bg-gray-900 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  ) : (
                    "Verify & Continue"
                  )}
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError("");
                    setLetters([]);
                    setAnswers([]);
                    setChallengeId("");
                  }}
                  className="text-sm text-gray-600 hover:text-black font-medium"
                >
                  ← Use a different email
                </button>
              </div>
            </div>
          )}

          {step === "new-password" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-5 bg-gray-100 w-14 h-14 rounded-2xl">
                  <Shield size={28} className="text-black" />
                </div>
                <h3 className="mb-2 text-2xl font-semibold text-black">Set New Password</h3>
                <p className="text-sm text-gray-600">Choose a password of at least 10 characters.</p>
              </div>

              {error && (
                <div className="p-4 text-sm text-center text-red-700 border border-red-200 bg-red-50 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-black">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 10 characters"
                      required
                      minLength={10}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-black/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-black">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat the password"
                      required
                      minLength={10}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-black/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || newPassword.length < 10 || newPassword !== confirmPassword}
                  className="flex items-center justify-center w-full gap-2 py-4 font-medium text-white bg-black rounded-xl hover:bg-gray-900 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
