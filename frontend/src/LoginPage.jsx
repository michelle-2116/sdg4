import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --champagne: #EACEAA;
    --honey-garlic: #85431E;
    --whiskey-sour: #D39858;
    --burnt-coffee: #34150F;
    --balsamico: #150C0C;
  }

  body { background: var(--balsamico); font-family: 'DM Sans', sans-serif; color: var(--champagne); }

  .login-root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .login-left {
    background: linear-gradient(160deg, var(--balsamico) 0%, var(--burnt-coffee) 60%, #4a1e0a 100%);
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
    width: 560px; height: 560px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(211,152,88,0.08) 0%, transparent 65%);
    top: -150px; left: -150px;
    pointer-events: none;
  }

  .login-left::after {
    content: '';
    position: absolute;
    width: 380px; height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(133,67,30,0.2) 0%, transparent 70%);
    bottom: 20px; right: 20px;
    pointer-events: none;
  }

  .brand-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 52px;
    font-weight: 700;
    line-height: 1.1;
    color: var(--champagne);
    margin-bottom: 20px;
    letter-spacing: 0.5px;
  }

  .brand-title span { color: var(--whiskey-sour); }

  .brand-desc {
    font-size: 15px;
    color: rgba(234,206,170,0.65);
    line-height: 1.8;
    max-width: 380px;
    margin-bottom: 56px;
  }

  .brand-desc strong { color: var(--champagne); }

  .feature-list { display: flex; flex-direction: column; gap: 14px; }

  .feature-item {
    display: flex; align-items: center; gap: 12px;
    font-size: 14px; color: rgba(234,206,170,0.6);
  }

  .feature-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--whiskey-sour); flex-shrink: 0;
  }

  .login-right {
    background: var(--burnt-coffee);
    display: flex; align-items: center; justify-content: center;
    padding: 60px 80px;
    border-left: 1px solid rgba(133,67,30,0.3);
  }

  .login-card { width: 100%; max-width: 400px; }

  .login-card h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 34px; font-weight: 600;
    color: var(--champagne); margin-bottom: 8px;
    letter-spacing: 0.3px;
  }

  .login-card .subtitle {
    font-size: 14px;
    color: rgba(234,206,170,0.5);
    margin-bottom: 36px;
  }

  .role-tabs {
    display: grid; grid-template-columns: 1fr 1fr;
    background: rgba(21,12,12,0.6);
    border: 1px solid rgba(133,67,30,0.35);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 28px;
  }

  .role-tab {
    padding: 10px; border: none; cursor: pointer;
    border-radius: 8px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    transition: all 0.2s;
    background: transparent;
    color: rgba(234,206,170,0.45);
  }

  .role-tab.active {
    background: var(--honey-garlic);
    color: var(--champagne);
    font-weight: 600;
    box-shadow: 0 2px 14px rgba(133,67,30,0.45);
  }

  .form-group { margin-bottom: 18px; }

  .form-label {
    display: block; font-size: 11px; font-weight: 600;
    color: rgba(234,206,170,0.5); margin-bottom: 8px;
    letter-spacing: 0.8px; text-transform: uppercase;
  }

  .form-input {
    width: 100%; padding: 12px 16px;
    background: rgba(21,12,12,0.5);
    border: 1px solid rgba(133,67,30,0.35);
    border-radius: 8px; color: var(--champagne);
    font-family: 'DM Sans', sans-serif; font-size: 15px;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }

  .form-input:focus {
    border-color: var(--whiskey-sour);
    box-shadow: 0 0 0 3px rgba(211,152,88,0.12);
  }
  .form-input::placeholder { color: rgba(234,206,170,0.25); }

  .login-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, var(--honey-garlic), var(--whiskey-sour));
    border: none; border-radius: 8px;
    color: var(--champagne); font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 700;
    cursor: pointer; margin-top: 8px;
    transition: opacity 0.2s, transform 0.1s;
    letter-spacing: 0.4px;
    box-shadow: 0 4px 20px rgba(133,67,30,0.35);
  }

  .login-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .login-btn:active { transform: translateY(0); }

  .error-msg {
    background: rgba(133,67,30,0.15);
    border: 1px solid rgba(211,152,88,0.3);
    color: var(--whiskey-sour); border-radius: 8px;
    padding: 12px 16px; font-size: 13px; margin-bottom: 18px;
  }

  .demo-hint {
    margin-top: 22px; padding: 14px 16px;
    background: rgba(21,12,12,0.4);
    border: 1px solid rgba(133,67,30,0.25);
    border-radius: 8px; font-size: 12px;
    color: rgba(234,206,170,0.45); line-height: 1.7;
  }

  .demo-hint strong { color: var(--whiskey-sour); }

  @media (max-width: 768px) {
    .login-root { grid-template-columns: 1fr; }
    .login-left { display: none; }
    .login-right { padding: 40px 24px; background: var(--balsamico); }
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
            <span>AI4OneEarth</span><br />Project Name
          </h1>
          <p className="brand-desc">
            Team Name: <strong>Miro</strong><br />
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