import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api/services";

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

function validate(password) {
  return {
    minLength: password.length >= 9,
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  };
}

function PasswordStrengthBar({ password }) {
  const rules = validate(password);
  const score = Object.values(rules).filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#e2ddd7", "#e87b7b", "#e8b97b", "#7bbde8", "#5a9e7a"];
  if (!password) return null;
  return (
    <div style={{ marginTop: 10, marginBottom: 4 }}>
      <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i <= score ? colors[score] : "#e2ddd7",
            transition: "background 0.3s"
          }} />
        ))}
      </div>
      <p style={{ fontSize: 12, color: score > 0 ? colors[score] : "#9e8e82", margin: 0, fontWeight: 500, textAlign: "right" }}>
        {score > 0 ? labels[score] : ""}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userEmail, userRole, fullName } = useAuth();

  // Real logged-in user info instead of hardcoded values
  const user = {
    fullName: fullName || "—",
    email: userEmail || "—",
    role: userRole || "—",
  };

  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [touched, setTouched] = useState({ current: false, newPass: false, confirm: false });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const rules = validate(form.newPass);
  const allRulesMet = Object.values(rules).every(Boolean);
  const passwordsMatch = form.newPass === form.confirm;
  const canSubmit = form.current && allRulesMet && form.confirm && passwordsMatch;

  const toggle = (field) => setShow(s => ({ ...s, [field]: !s[field] }));
  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setSubmitStatus(null);
    setErrorMessage("");
  };
  const handleBlur = (field) => () => setTouched(t => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      await changePassword({
        currentPassword: form.current,
        newPassword: form.newPass,
      });

      setSubmitStatus("success");
      setForm({ current: "", newPass: "", confirm: "" });
      setTouched({ current: false, newPass: false, confirm: false });
    } catch (err) {
      setSubmitStatus("error");
      setErrorMessage(
        err.response?.data?.message || "Unable to update password. Please check your current password and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const ruleItems = [
    { key: "minLength", label: "Minimum 9 characters" },
    { key: "hasUppercase", label: "At least one uppercase letter" },
    { key: "hasNumber", label: "At least one number" },
    { key: "hasSymbol", label: "At least one symbol (!@#$...)" },
  ];

  const showNewPassRules = touched.newPass && form.newPass.length > 0;
  const showConfirmError = touched.confirm && form.confirm.length > 0 && !passwordsMatch;
  const showConfirmSuccess = touched.confirm && form.confirm.length > 0 && passwordsMatch && allRulesMet;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8f7f5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .profile-outer {
          display: grid;
          width: 100%;
          grid-template-columns: repeat(12, 1fr);
          margin: 0 auto;
        }
        .profile-inner {
          grid-column: 1 / -1;
        }
        @media (min-width: 1024px) {
          .profile-inner { grid-column: 2 / 12; }
        }

        .page-content { padding: 52px 24px 72px; }
        @media (min-width: 640px) { .page-content { padding: 52px 28px 72px; } }
        @media (min-width: 1024px) { .page-content { padding: 56px 36px 80px; } }

        .cards-layout {
          display: grid;
          gap: 24px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 960px) {
          .cards-layout {
            grid-template-columns: 360px 1fr;
            align-items: start;
            gap: 28px;
          }
        }
        @media (min-width: 1200px) {
          .cards-layout {
            grid-template-columns: 400px 1fr;
            gap: 36px;
          }
        }

        .card {
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #e8e3dd;
          overflow: hidden;
        }

        .field-ro {
          width: 100%;
          padding: 15px 120px 15px 18px;
          background: #f5f2ee;
          border: 1.5px solid #e2ddd7;
          color: #6b6560;
          border-radius: 10px;
          font-size: 15.5px;
          font-family: 'DM Sans', sans-serif;
          cursor: not-allowed;
        }

        .field-pw {
          width: 100%;
          padding: 15px 52px 15px 18px;
          background: #ffffff;
          border: 1.5px solid #ddd8d2;
          color: #1a1814;
          border-radius: 10px;
          font-size: 15.5px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-pw:focus { outline: none; border-color: #b8a898; box-shadow: 0 0 0 4px rgba(184,168,152,0.14); }
        .field-pw.err { border-color: #d97b7b !important; box-shadow: 0 0 0 4px rgba(217,123,123,0.1) !important; }
        .field-pw.ok  { border-color: #7bbda0 !important; box-shadow: 0 0 0 4px rgba(90,158,122,0.1) !important; }

        .field-label {
          font-size: 13.5px; font-weight: 500; color: #4e4a46;
          margin-bottom: 9px; display: flex; align-items: center; gap: 8px;
          letter-spacing: 0.01em;
        }
        .ro-badge {
          font-size: 10px; font-weight: 600; letter-spacing: 0.09em;
          text-transform: uppercase; color: #a89e96;
          background: #ede9e4; padding: 3px 9px; border-radius: 5px;
          margin-left: auto; flex-shrink: 0;
        }
        .eye-btn {
          background: none; border: none; cursor: pointer; color: #9e8e82;
          padding: 0; display: flex; align-items: center;
          position: absolute; right: 16px; top: 50%;
          transform: translateY(-50%); transition: color 0.2s;
        }
        .eye-btn:hover { color: #1a1814; }

        .rule-row {
          display: flex; align-items: center; gap: 12px;
          font-size: 14px; padding: 9px 0;
          border-bottom: 1px solid #f0ede8; transition: color 0.2s;
        }
        .rule-row:last-child { border-bottom: none; }
        .rule-met { color: #3d8a62; }
        .rule-fail { color: #8a8078; }
        .rule-icon {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rule-icon-met { background: #eef6f1; }
        .rule-icon-fail { background: #f0ede8; }

        .btn-submit {
          width: 100%; padding: 17px 28px;
          background: #1a1814; color: #f8f7f5;
          border: none; border-radius: 10px;
          font-size: 15.5px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; letter-spacing: 0.03em; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.2s, transform 0.1s, opacity 0.2s;
        }
        .btn-submit:hover:not(:disabled) { background: #2e2a24; }
        .btn-submit:active:not(:disabled) { transform: scale(0.99); }
        .btn-submit:disabled { opacity: 0.35; cursor: not-allowed; }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #ffffff;
          border: 1.5px solid #e8e3dd;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #4e4a46;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 24px;
        }
        .back-button:hover {
          background: #f8f7f5;
          border-color: #b8a898;
        }

        .success-banner {
          background: #eef6f1; border: 1.5px solid #a8d5b8;
          color: #2d7a4f; border-radius: 12px; padding: 16px 20px;
          display: flex; align-items: flex-start; gap: 14px;
        }
        .error-banner {
          background: #fdecec; border: 1.5px solid #f3b3b3;
          color: #b3261e; border-radius: 12px; padding: 16px 20px;
          display: flex; align-items: flex-start; gap: 14px;
        }
        .divider { height: 1px; background: #ede9e4; }
        .section-tag {
          font-size: 11px; font-weight: 600; letter-spacing: 0.13em;
          text-transform: uppercase; color: #9e8e82;
        }
        .stat-val { font-family: 'DM Serif Display', serif; font-size: 30px; color: #1a1814; line-height: 1; }
        .stat-lbl { font-size: 11.5px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #9e8e82; margin-top: 5px; }

        .hint { font-size: 13.5px; margin-top: 9px; display: flex; align-items: center; gap: 7px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease forwards; }

        .tips-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        @media (min-width: 560px) { .tips-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="profile-outer">
        <div className="profile-inner">
          <div className="page-content">

            {/* Back Button */}
            <button onClick={() => navigate('/investor-portal/dashboard')} className="back-button">
              <ArrowLeftIcon />
              Back to Dashboard
            </button>

            {/* ── Page Header ── */}
            <div style={{ marginBottom: 52 }}>
              <p className="section-tag" style={{ marginBottom: 12 }}>Account Settings</p>
              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(34px, 4.5vw, 52px)",
                fontWeight: 400, color: "#1a1814", lineHeight: 1.08
              }}>
                Your Profile
              </h1>
              <p style={{ fontSize: 17, color: "#8a8078", marginTop: 12, maxWidth: 520, lineHeight: 1.65 }}>
                Manage your personal information and account security settings.
              </p>
            </div>

            <div className="cards-layout">

              {/* ════════════════ LEFT COLUMN ════════════════ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Avatar + Name Card */}
                <div className="card">
                  <div style={{
                    background: "linear-gradient(140deg, #2e2a24 0%, #1a1814 100%)",
                    padding: "40px 32px 32px", textAlign: "center"
                  }}>
                    <div style={{
                      width: 96, height: 96, borderRadius: "50%",
                      background: "linear-gradient(135deg, #c9b99a 0%, #9a7c60 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 18px", border: "3px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
                    }}>
                      <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: "#fff", userSelect: "none" }}>
                        {user.fullName !== "—"
                          ? user.fullName.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()
                          : "—"}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#fff", fontWeight: 400, marginBottom: 6 }}>
                      {user.fullName}
                    </h2>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}>{user.role}</p>
                  </div>
                </div>

                {/* Personal Information Card */}
                <div className="card">
                  <div style={{ padding: "28px 32px 24px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0ede8", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6560" }}>
                      <UserIcon />
                    </div>
                    <span className="section-tag">Personal Information</span>
                  </div>

                  <div className="divider" />

                  <div style={{ padding: "28px 32px" }}>
                    <div style={{ marginBottom: 26 }}>
                      <div className="field-label">
                        <UserIcon />
                        Full Name
                        <span className="ro-badge">Read only</span>
                      </div>
                      <div style={{ position: "relative" }}>
                        <input readOnly value={user.fullName} className="field-ro" />
                      </div>
                    </div>

                    <div>
                      <div className="field-label">
                        <MailIcon />
                        Email Address
                        <span className="ro-badge">Read only</span>
                      </div>
                      <div style={{ position: "relative" }}>
                        <input readOnly value={user.email} className="field-ro" />
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "0 32px 28px" }}>
                    <div style={{ background: "#f8f7f5", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5a9e7a", flexShrink: 0, marginTop: 5 }} />
                      <p style={{ fontSize: 13.5, color: "#6b6560", lineHeight: 1.6 }}>
                        To update your name or email address, please contact your account administrator.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* ════════════════ RIGHT COLUMN ════════════════ */}
              <div className="card">

                {/* Card Header */}
                <div style={{ padding: "28px 36px 24px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0ede8", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6560" }}>
                    <ShieldIcon />
                  </div>
                  <span className="section-tag">Security</span>
                </div>

                <div className="divider" />

                <div style={{ padding: "36px 36px 32px" }}>
                  <div style={{ marginBottom: 36 }}>
                    <h2 style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "clamp(24px, 2.5vw, 32px)",
                      fontWeight: 400, color: "#1a1814", marginBottom: 10
                    }}>
                      Change Password
                    </h2>
                    <p style={{ fontSize: 15.5, color: "#8a8078", lineHeight: 1.7, maxWidth: 520 }}>
                      Choose a strong, unique password to protect your account. Your new password must meet all the security requirements listed below.
                    </p>
                  </div>

                  {submitStatus === "success" && (
                    <div className="success-banner fade-in" style={{ marginBottom: 32 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#d4ede0", display: "flex", alignItems: "center", justifyContent: "center", color: "#2d7a4f", flexShrink: 0 }}>
                        <CheckIcon size={16} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 15 }}>Password updated successfully</p>
                        <p style={{ fontSize: 13.5, opacity: 0.75, marginTop: 3 }}>Your account is now secured with your new password.</p>
                      </div>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="error-banner fade-in" style={{ marginBottom: 32 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f8d7d7", display: "flex", alignItems: "center", justifyContent: "center", color: "#b3261e", flexShrink: 0 }}>
                        <XIcon size={16} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 15 }}>Password update failed</p>
                        <p style={{ fontSize: 13.5, opacity: 0.85, marginTop: 3 }}>{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>

                    {/* Current Password */}
                    <div style={{ marginBottom: 32 }}>
                      <div className="field-label">
                        <LockIcon /> Current Password
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          type={show.current ? "text" : "password"}
                          value={form.current}
                          onChange={handleChange("current")}
                          onBlur={handleBlur("current")}
                          placeholder="Enter your current password"
                          className="field-pw"
                        />
                        <button type="button" className="eye-btn" onClick={() => toggle("current")} tabIndex={-1}>
                          <EyeIcon open={show.current} />
                        </button>
                      </div>
                    </div>

                    <div className="divider" style={{ marginBottom: 32 }} />

                    {/* New Password */}
                    <div style={{ marginBottom: 10 }}>
                      <div className="field-label">
                        <LockIcon /> New Password
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          type={show.newPass ? "text" : "password"}
                          value={form.newPass}
                          onChange={handleChange("newPass")}
                          onBlur={handleBlur("newPass")}
                          placeholder="Create a strong new password"
                          className={`field-pw${touched.newPass && form.newPass && !allRulesMet ? " err" : touched.newPass && allRulesMet && form.newPass ? " ok" : ""}`}
                        />
                        <button type="button" className="eye-btn" onClick={() => toggle("newPass")} tabIndex={-1}>
                          <EyeIcon open={show.newPass} />
                        </button>
                      </div>
                      <PasswordStrengthBar password={form.newPass} />
                    </div>

                    {/* Password Rules Box */}
                    <div style={{
                      background: "#faf9f7", border: "1.5px solid #ede9e4",
                      borderRadius: 12, padding: "18px 24px", marginBottom: 32,
                      opacity: showNewPassRules ? 1 : 0.55, transition: "opacity 0.3s"
                    }}>
                      <p className="section-tag" style={{ marginBottom: 14 }}>Password Requirements</p>
                      {ruleItems.map(({ key, label }) => {
                        const met = rules[key];
                        return (
                          <div key={key} className={`rule-row ${met ? "rule-met" : "rule-fail"}`}>
                            <div className={`rule-icon ${met ? "rule-icon-met" : "rule-icon-fail"}`}>
                              {met ? <CheckIcon size={13} /> : <XIcon size={13} />}
                            </div>
                            {label}
                          </div>
                        );
                      })}
                    </div>

                    {/* Confirm Password */}
                    <div style={{ marginBottom: 36 }}>
                      <div className="field-label">
                        <LockIcon /> Confirm New Password
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          type={show.confirm ? "text" : "password"}
                          value={form.confirm}
                          onChange={handleChange("confirm")}
                          onBlur={handleBlur("confirm")}
                          placeholder="Re-enter your new password"
                          className={`field-pw${showConfirmError ? " err" : showConfirmSuccess ? " ok" : ""}`}
                        />
                        <button type="button" className="eye-btn" onClick={() => toggle("confirm")} tabIndex={-1}>
                          <EyeIcon open={show.confirm} />
                        </button>
                      </div>
                      {showConfirmError && (
                        <p className="hint" style={{ color: "#d97b7b" }}><XIcon size={13} /> Passwords do not match</p>
                      )}
                      {showConfirmSuccess && (
                        <p className="hint" style={{ color: "#5a9e7a" }}><CheckIcon size={13} /> Passwords match</p>
                      )}
                    </div>

                    <button type="submit" className="btn-submit" disabled={!canSubmit || loading}>
                      {loading ? (
                        <>
                          <span style={{
                            width: 18, height: 18,
                            border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                            borderRadius: "50%", display: "inline-block",
                            animation: "spin 0.75s linear infinite"
                          }} />
                          Updating password…
                        </>
                      ) : (
                        <><ShieldIcon /> Update Password</>
                      )}
                    </button>

                  </form>
                </div>

                {/* Security Tips Footer */}
                <div className="divider" />
                <div style={{ padding: "28px 36px 36px" }}>
                  <p className="section-tag" style={{ marginBottom: 18 }}>Security Tips</p>
                  <div className="tips-grid">
                    {[
                      "Never reuse passwords across different sites",
                      "Avoid using personal info in your password",
                      "Consider using a password manager",
                      "Change your password every 90 days",
                    ].map((tip, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: "#8a8078", lineHeight: 1.6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9b99a", marginTop: 7, flexShrink: 0 }} />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}