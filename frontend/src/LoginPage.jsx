import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d1117;
    --surface: #161b22;
    --surface2: #1c2330;
    --border: #2a3441;
    --accent: #e8a020;
    --accent2: #f5c842;
    --text: #e6edf3;
    --muted: #7d8590;
    --danger: #e05555;
    --success: #3fb950;
  }

  body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); }

  .login-root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .login-left {
    background: linear-gradient(135deg, #0d1117 0%, #1a2332 50%, #0d1117 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 80px;
    position: relative;
    overflow: hidden;
  }

  .login-left::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,160,32,0.08) 0%, transparent 70%);
    top: -100px; left: -100px;
    pointer-events: none;
  }

  .login-left::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(63,185,80,0.06) 0%, transparent 70%);
    bottom: 50px; right: 50px;
    pointer-events: none;
  }

  .brand-icon {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    margin-bottom: 40px;
    box-shadow: 0 8px 32px rgba(232,160,32,0.3);
  }

  .brand-title {
    font-family: 'Playfair Display', serif;
    font-size: 48px;
    font-weight: 700;
    line-height: 1.1;
    color: var(--text);
    margin-bottom: 20px;
  }

  .brand-title span { color: var(--accent); }

  .brand-desc {
    font-size: 16px;
    color: var(--muted);
    line-height: 1.7;
    max-width: 380px;
    margin-bottom: 60px;
  }

  .feature-list { display: flex; flex-direction: column; gap: 16px; }

  .feature-item {
    display: flex; align-items: center; gap: 12px;
    font-size: 14px; color: var(--muted);
  }

  .feature-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent); flex-shrink: 0;
  }

  .login-right {
    background: var(--surface);
    display: flex; align-items: center; justify-content: center;
    padding: 60px 80px;
    border-left: 1px solid var(--border);
  }

  .login-card { width: 100%; max-width: 400px; }

  .login-card h2 {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 600;
    color: var(--text); margin-bottom: 8px;
  }

  .login-card .subtitle {
    font-size: 14px; color: var(--muted); margin-bottom: 40px;
  }

  .role-tabs {
    display: grid; grid-template-columns: 1fr 1fr;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 32px;
  }

  .role-tab {
    padding: 10px; border: none; cursor: pointer;
    border-radius: 8px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    transition: all 0.2s;
    background: transparent; color: var(--muted);
  }

  .role-tab.active {
    background: var(--accent);
    color: #0d1117;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(232,160,32,0.3);
  }

  .form-group { margin-bottom: 20px; }

  .form-label {
    display: block; font-size: 13px; font-weight: 500;
    color: var(--muted); margin-bottom: 8px; letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .form-input {
    width: 100%; padding: 12px 16px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 15px;
    transition: border-color 0.2s;
    outline: none;
  }

  .form-input:focus { border-color: var(--accent); }
  .form-input::placeholder { color: var(--muted); }

  .login-btn {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none; border-radius: 8px;
    color: #0d1117; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600;
    cursor: pointer; margin-top: 8px;
    transition: opacity 0.2s, transform 0.1s;
    letter-spacing: 0.3px;
  }

  .login-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .login-btn:active { transform: translateY(0); }

  .error-msg {
    background: rgba(224,85,85,0.12); border: 1px solid rgba(224,85,85,0.3);
    color: #ff8080; border-radius: 8px;
    padding: 12px 16px; font-size: 13px; margin-bottom: 20px;
  }

  .demo-hint {
    margin-top: 24px; padding: 16px;
    background: rgba(232,160,32,0.06); border: 1px solid rgba(232,160,32,0.15);
    border-radius: 8px; font-size: 12px; color: var(--muted);
    line-height: 1.6;
  }

  .demo-hint strong { color: var(--accent); }

  @media (max-width: 768px) {
    .login-root { grid-template-columns: 1fr; }
    .login-left { display: none; }
    .login-right { padding: 40px 24px; }
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
      setError("Invalid credentials. Please check your ID and password.");
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="login-left">
          <h1 className="brand-title">
            Smart<span>Grade</span><br />Platform
          </h1>
          <p className="brand-desc">
            AI-powered semantic grading and learning analytics.
            Understand student mastery at the concept level, not just marks.
          </p>
          <div className="feature-list">
            <div className="feature-item"><div className="feature-dot" />Automatic PDF answer grading</div>
            <div className="feature-item"><div className="feature-dot" />Concept-level mastery tracking</div>
            <div className="feature-item"><div className="feature-dot" />Personalised remediation insights</div>
            <div className="feature-item"><div className="feature-dot" />Class-wide analytics for teachers</div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2>Welcome back</h2>
            <p className="subtitle">Sign in to your account to continue</p>

            <div className="role-tabs">
              <button className={`role-tab ${role === "student" ? "active" : ""}`} onClick={() => { setRole("student"); setError(""); }}>
                Student
              </button>
              <button className={`role-tab ${role === "teacher" ? "active" : ""}`} onClick={() => { setRole("teacher"); setError(""); }}>
                Teacher
              </button>
            </div>

            {error && <div className="error-msg">⚠️ {error}</div>}

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
              Sign In →
            </button>

            <div className="demo-hint">
              <strong>Demo credentials</strong><br />
              Student: ID <strong>1</strong> / password <strong>student1</strong><br />
              Teacher: ID <strong>t1</strong> / password <strong>teacher1</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}