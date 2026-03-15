import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #06080b;
    --surface:     #0d1520;
    --surface2:    #111d2b;
    --border:      #1c2e40;
    --border2:     #2a4258;
    --accent:      #00e5ff;
    --accent-dim:  rgba(0,229,255,0.07);
    --accent-glow: rgba(0,229,255,0.18);
    --text:        #ddeeff;
    --text2:       #7a9bb5;
    --muted:       #3d5570;
    --danger:      #ff3a5c;
    --danger-soft: rgba(255,58,92,0.09);
  }

  body { background: var(--bg); font-family: 'Barlow', sans-serif; color: var(--text); }

  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px);
  }

  .login-root {
    min-height: 100vh; display: grid;
    grid-template-columns: 1.1fr 0.9fr;
  }

  /* ─ LEFT ─ */
  .login-left {
    background: var(--bg);
    padding: 60px 70px;
    display: flex; flex-direction: column; justify-content: center;
    position: relative; overflow: hidden;
  }

  .login-left::before {
    content: ''; position: absolute;
    inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 60% 50% at 20% 60%, rgba(0,229,255,0.04) 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 80% 20%, rgba(0,229,255,0.03) 0%, transparent 70%);
  }

  /* grid lines */
  .login-left::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 30% 50%, black 30%, transparent 80%);
  }

  .brand-eyebrow {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 4px;
    color: var(--accent); text-transform: uppercase;
    margin-bottom: 20px; display: flex; align-items: center; gap: 10px;
  }
  .brand-eyebrow::before {
    content: ''; display: block; width: 24px; height: 1px; background: var(--accent);
  }

  .brand-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 72px; font-weight: 800; line-height: 0.9;
    color: var(--text); letter-spacing: -1px;
    text-transform: uppercase; margin-bottom: 28px;
  }
  .brand-title span { color: var(--accent); display: block; }

  .brand-desc {
    font-size: 14px; color: var(--text2); line-height: 1.8;
    max-width: 400px; margin-bottom: 52px;
  }

  .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 28px; }
  .feature-item {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 0.5px;
    color: var(--muted); text-transform: uppercase;
  }
  .feature-dot {
    width: 6px; height: 6px; flex-shrink: 0;
    background: var(--accent); opacity: 0.5;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  /* ─ RIGHT ─ */
  .login-right {
    background: var(--surface);
    border-left: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    padding: 60px 64px;
    position: relative;
  }
  .login-right::before {
    content: ''; position: absolute; top: 0; left: -1px; bottom: 0; width: 1px;
    background: linear-gradient(to bottom, transparent, var(--accent) 50%, transparent);
    opacity: 0.25;
  }

  .login-card { width: 100%; max-width: 380px; }

  .login-heading {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 32px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 1px; color: var(--text); margin-bottom: 4px;
  }
  .login-sub { font-size: 13px; color: var(--muted); margin-bottom: 32px; }

  .role-tabs {
    display: grid; grid-template-columns: 1fr 1fr;
    background: var(--bg); border: 1px solid var(--border);
    padding: 3px; margin-bottom: 26px; gap: 3px;
  }
  .role-tab {
    padding: 10px; border: none; cursor: pointer;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    transition: all 0.18s; background: transparent; color: var(--muted);
  }
  .role-tab.active {
    background: var(--accent); color: var(--bg);
  }

  .form-group { margin-bottom: 16px; }
  .form-label {
    display: block;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;
  }
  .form-input {
    width: 100%; padding: 11px 14px;
    background: var(--bg); border: 1px solid var(--border);
    color: var(--text); font-family: 'Barlow', sans-serif; font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .form-input:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow);
  }
  .form-input::placeholder { color: var(--muted); opacity: 0.5; }

  .login-btn {
    width: 100%; padding: 13px;
    background: var(--accent); border: none; color: var(--bg);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; margin-top: 8px; transition: all 0.15s;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  }
  .login-btn:hover { background: #33eeff; box-shadow: 0 4px 24px var(--accent-glow); }
  .login-btn:active { transform: scale(0.99); }

  .error-msg {
    background: var(--danger-soft); border-left: 2px solid var(--danger);
    color: #ff6b78; padding: 11px 14px; font-size: 13px; margin-bottom: 16px;
  }

  .demo-hint {
    margin-top: 24px; padding: 14px 16px;
    background: var(--bg); border: 1px solid var(--border);
    border-left: 2px solid var(--accent);
    font-size: 12px; color: var(--muted); line-height: 1.9;
  }
  .demo-hint strong { color: var(--accent); font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.5px; }

  @media (max-width: 768px) {
    .login-root { grid-template-columns: 1fr; }
    .login-left { display: none; }
    .login-right { padding: 40px 24px; background: var(--bg); }
  }
`;

const DEMO_USERS = {
  student: [
    { id: "1", password: "student1", name: "Michelle R S" },
    { id: "2", password: "student2", name: "Rohan K G" },
  ],
  teacher: [
    { id: "t1", password: "teacher1", name: "Dr. John Snow" },
  ]
};

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState("student");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    const users = DEMO_USERS[role];
    const match = users.find(u => u.id === id && u.password === password);
    if (match) {
      onLogin({ id: match.id, role, name: match.name });
    } else {
      setError("Invalid credentials. Check your ID and password.");
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        {/* LEFT */}
        <div className="login-left">
          <div className="brand-eyebrow">AI-Powered Grading System</div>
          <h1 className="brand-title">
            Edu<span>Access</span>
          </h1>
          <p className="brand-desc">
            Semantic evaluation at the concept level- not just marks.
            Real-time mastery tracking and AI-generated remediation for every student.
          </p>
          <div className="feature-grid">
            {[
              "PDF Auto-Grading",
              "Concept Mastery",
              "Trend Analysis",
              "AI Remediation",
              "Class Analytics",
              "Paper Builder",
            ].map(f => (
              <div key={f} className="feature-item">
                <div className="feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-card">
            <h2 className="login-heading">Sign In</h2>
            <p className="login-sub">Access your dashboard to continue</p>

            <div className="role-tabs">
              <button
                className={`role-tab ${role === "student" ? "active" : ""}`}
                onClick={() => { setRole("student"); setError(""); }}
              >Student</button>
              <button
                className={`role-tab ${role === "teacher" ? "active" : ""}`}
                onClick={() => { setRole("teacher"); setError(""); }}
              >Teacher</button>
            </div>

            {error && <div className="error-msg">⚠ {error}</div>}

            <div className="form-group">
              <label className="form-label">{role === "student" ? "Student" : "Teacher"} ID</label>
              <input
                className="form-input"
                placeholder={role === "student" ? "e.g. 1" : "e.g. t1"}
                value={id}
                onChange={e => setId(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <button className="login-btn" onClick={handleLogin}>
              Authenticate →
            </button>

            <div className="demo-hint">
              <strong>Demo Credentials</strong><br />
              Student — ID: <strong>1</strong> &nbsp;/&nbsp; Password: <strong>student1</strong><br />
              Teacher — ID: <strong>t1</strong> &nbsp;/&nbsp; Password: <strong>teacher1</strong>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}