import { useState, useEffect } from "react";
import axios from "axios";
import { globalStyles } from "./styles";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

const API = "http://127.0.0.1:8000";

function Sidebar({ active, setActive, user, onLogout }) {
  const navItems = [
    { id: "exam", icon: "📝", label: "Submit Exam" },
    { id: "results", icon: "📊", label: "My Results" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">✎</div>
        <div>
          <div className="sidebar-brand-text">SmartGrade</div>
          <div className="sidebar-brand-sub">Student Portal</div>
        </div>
      </div>
      <div className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user.name[0]}</div>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-role">Student · ID {user.id}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          ↩ Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Exam Submission ────────────────────────────────────────────────
function ExamSubmission({ studentId }) {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState("");
  const [paperDetails, setPaperDetails] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    axios.get(`${API}/papers`).then(r => setPapers(r.data)).catch(console.error);
  }, []);

  const loadPaperDetails = async (paperId) => {
    if (!paperId) { setPaperDetails(null); return; }
    try {
      const r = await axios.get(`${API}/paper/${paperId}`);
      setPaperDetails(r.data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async () => {
    if (!selectedPaper || !pdfFile) {
      setError("Please select a paper and upload your PDF.");
      return;
    }
    setError(""); setSuccess(""); setLoading(true);
    const formData = new FormData();
    formData.append("student_id", studentId);
    formData.append("paper_id", selectedPaper);
    formData.append("file", pdfFile);
    try {
      const r = await axios.post(`${API}/submit-paper`, formData);
      setResult(r.data);
      setSuccess("Paper submitted and graded successfully!");
    } catch (e) {
      setError(e.response?.data?.detail || "Submission failed. Please try again.");
    } finally { setLoading(false); }
  };

  const totalMax = result
    ? Object.values(result.question_results).reduce((a, q) => a + q.max_marks, 0)
    : 0;

  const pct = result ? Math.round((result.total_marks / totalMax) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Submit Exam</h1>
        <p className="page-subtitle">Select your paper, review the questions, and upload your PDF answer sheet.</p>
      </div>

      <div className="two-col" style={{ alignItems: "start" }}>
        {/* Left: form */}
        <div className="card">
          <div className="card-title">Submission Form</div>

          {error && <div className="alert alert-error">⚠ {error}</div>}
          {success && <div className="alert alert-success">✓ {success}</div>}

          <div className="form-group">
            <label className="form-label">Select Paper</label>
            <select
              className="form-select"
              value={selectedPaper}
              onChange={e => { setSelectedPaper(e.target.value); loadPaperDetails(e.target.value); setResult(null); }}
            >
              <option value="">Choose a paper...</option>
              {papers.map(p => (
                <option key={p.paper_id} value={p.paper_id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Upload PDF Answer Sheet</label>
            <div style={{
              border: `2px dashed ${pdfFile ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 8, padding: "20px", textAlign: "center",
              cursor: "pointer", transition: "all 0.2s",
              background: pdfFile ? "var(--accent-soft)" : "transparent"
            }}>
              <input
                type="file" accept="application/pdf"
                style={{ display: "none" }} id="pdf-upload"
                onChange={e => setPdfFile(e.target.files[0])}
              />
              <label htmlFor="pdf-upload" style={{ cursor: "pointer" }}>
                {pdfFile ? (
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                    <div style={{ fontSize: 14, color: "var(--accent)", fontWeight: 500 }}>{pdfFile.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Click to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>☁️</div>
                    <div style={{ fontSize: 14, color: "var(--muted)" }}>Click to upload PDF</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Format: Q1. [answer] Q2. [answer]</div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "13px" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "⏳ Grading..." : "Submit & Grade →"}
          </button>
        </div>

        {/* Right: paper preview or results */}
        <div>
          {paperDetails && !result && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">📖 {paperDetails.title}</div>
              {paperDetails.questions.map(q => (
                <div key={q.question_number} style={{
                  padding: "14px", background: "var(--surface2)",
                  borderRadius: 8, marginBottom: 10,
                  borderLeft: "3px solid var(--accent)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>Q{q.question_number}</span>
                    <span className="badge badge-blue">{q.max_marks} marks</span>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.5 }}>{q.question_text}</div>
                </div>
              ))}
            </div>
          )}

          {result && (
            <div className="card">
              <div className="card-title">✅ Results</div>

              {/* Score circle */}
              <div style={{ textAlign: "center", padding: "20px 0 24px" }}>
                <div style={{
                  width: 110, height: 110, borderRadius: "50%",
                  background: `conic-gradient(var(--accent) ${pct * 3.6}deg, var(--surface2) 0deg)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 0 0 6px var(--surface)"
                }}>
                  <div style={{
                    width: 84, height: 84, borderRadius: "50%",
                    background: "var(--surface)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>
                  {result.total_marks.toFixed(1)} / {totalMax}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Total Marks</div>
              </div>

              <div className="divider" />

              {Object.entries(result.question_results).map(([qNum, data]) => {
                const qPct = Math.round((data.marks / data.max_marks) * 100);
                return (
                  <div key={qNum} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: "var(--text2)" }}>Question {qNum}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                        {data.marks} / {data.max_marks}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${qPct}%`,
                        background: qPct >= 70 ? "var(--success)" : qPct >= 40 ? "var(--accent)" : "var(--danger)"
                      }} />
                    </div>
                    {data.concept_scores && Object.keys(data.concept_scores).length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        {Object.entries(data.concept_scores).map(([concept, score]) => (
                          <span key={concept} className="chip" style={{ marginRight: 6, marginTop: 4 }}>
                            {concept}: {Math.round(score * 100)}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Past Results ───────────────────────────────────────────────────
function MyResults({ studentId }) {
  const [mastery, setMastery] = useState({});
  const [trend, setTrend] = useState({});
  const [weakConcepts, setWeakConcepts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [studentRes, subsRes] = await Promise.all([
          axios.get(`${API}/student/${studentId}`),
          axios.get(`${API}/submissions/${studentId}`).catch(() => ({ data: [] }))
        ]);
        setMastery(studentRes.data.mastery || {});
        setTrend(studentRes.data.trend || {});
        setWeakConcepts(studentRes.data.weak_concepts || []);
        setSubmissions(Array.isArray(subsRes.data) ? subsRes.data : []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [studentId]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--muted)" }}>
      Loading your results...
    </div>
  );

  const masteryArr = Object.entries(mastery).map(([concept, score]) => ({
    concept, score: Math.round(score * 100)
  }));

  const avgMastery = masteryArr.length
    ? Math.round(masteryArr.reduce((a, c) => a + c.score, 0) / masteryArr.length)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Results</h1>
        <p className="page-subtitle">Your concept mastery, performance trends, and submission history.</p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value stat-accent">{avgMastery}%</div>
          <div className="stat-label">Average Mastery</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Object.keys(mastery).length}</div>
          <div className="stat-label">Concepts Tracked</div>
        </div>
        <div className="stat-card">
          <div className={`stat-value ${weakConcepts.length === 0 ? "stat-success" : ""}`} style={{ color: weakConcepts.length > 0 ? "var(--danger)" : undefined }}>
            {weakConcepts.length}
          </div>
          <div className="stat-label">Weak Concepts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{submissions.length}</div>
          <div className="stat-label">Submissions</div>
        </div>
      </div>

      {weakConcepts.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          ⚠ Concepts needing attention: <strong>{weakConcepts.join(", ")}</strong>
        </div>
      )}

      <div className="two-col" style={{ alignItems: "start" }}>
        {/* Mastery chart */}
        <div className="card">
          <div className="card-title">Concept Mastery</div>
          {masteryArr.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><p>No mastery data yet. Submit your first paper!</p></div>
          ) : (
            <>
              {masteryArr.map(({ concept, score }) => (
                <div key={concept} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, color: "var(--text2)" }}>{concept}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: score >= 70 ? "var(--success)" : score >= 50 ? "var(--accent)" : "var(--danger)"
                    }}>{score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${score}%`,
                      background: score >= 70 ? "var(--success)" : score >= 50 ? "var(--accent)" : "var(--danger)"
                    }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 24, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={masteryArr} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="concept" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
                      formatter={(v) => [`${v}%`, "Mastery"]}
                    />
                    <Bar dataKey="score" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Trend */}
        <div className="card">
          <div className="card-title">Progress Trend</div>
          {Object.keys(trend).length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><p>No trend data yet.</p></div>
          ) : (
            Object.entries(trend).map(([concept, data]) => {
              const chartData = data.scores.map((score, i) => ({ attempt: `#${i + 1}`, score: Math.round(score * 100) }));
              return (
                <div key={concept} style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)" }}>{concept}</span>
                    {data.improving && <span className="badge badge-success">↑ Improving</span>}
                    {data.declining && <span className="badge badge-danger">↓ Declining</span>}
                    {!data.improving && !data.declining && data.scores.length > 1 && (
                      <span className="badge badge-blue">→ Stable</span>
                    )}
                  </div>
                  <div style={{ height: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="attempt" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
                          formatter={(v) => [`${v}%`, "Score"]}
                        />
                        <Bar dataKey="score" fill="var(--blue)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Submission history */}
      {submissions.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-title">Submission History</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Paper ID</th>
                <th>Total Marks</th>
                <th>Questions</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => {
                const maxTotal = Object.values(s.question_results).reduce((a, q) => a + q.max_marks, 0);
                const pct = maxTotal ? Math.round((s.total_marks / maxTotal) * 100) : 0;
                return (
                  <tr key={i}>
                    <td><span style={{ color: "var(--accent)", fontWeight: 500 }}>{s.paper_id}</span></td>
                    <td>{s.total_marks.toFixed(1)} / {maxTotal}</td>
                    <td>{Object.keys(s.question_results).length} questions</td>
                    <td>
                      <span className={`badge ${pct >= 70 ? "badge-success" : pct >= 40 ? "badge-warning" : "badge-danger"}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────
export default function StudentDashboard({ user, onLogout }) {
  const [active, setActive] = useState("exam");

  return (
    <>
      <style>{globalStyles}</style>
      <div className="app-shell">
        <Sidebar active={active} setActive={setActive} user={user} onLogout={onLogout} />
        <div className="main-content">
          {active === "exam" && <ExamSubmission studentId={user.id} />}
          {active === "results" && <MyResults studentId={user.id} />}
        </div>
      </div>
    </>
  );
}