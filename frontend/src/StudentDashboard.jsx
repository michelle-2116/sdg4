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
        <div className="sidebar-brand-icon">🎓</div>
        <div>
          <div className="sidebar-brand-text">SmartGrade</div>
          <div className="sidebar-brand-sub">Student Portal</div>
        </div>
      </div>
      <div className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <button key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => setActive(item.id)}>
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
        <button className="logout-btn" onClick={onLogout}>↩ Sign Out</button>
      </div>
    </div>
  );
}

function SimilarityBadge({ label }) {
  const map = {
    "Excellent": "badge-success",
    "Good": "badge-blue",
    "Partial": "badge-warning",
    "Poor": "badge-danger"
  };
  const icons = { "Excellent": "✦", "Good": "●", "Partial": "◑", "Poor": "○" };
  return (
    <span className={`badge ${map[label] || "badge-warning"}`}>
      {icons[label]} {label}
    </span>
  );
}

function ConceptChips({ explanation }) {
  if (!explanation) return null;
  return (
    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
      {explanation.matched_concepts?.map(c => (
        <span key={c.concept} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 10px", borderRadius: 20, fontSize: 12,
          background: "rgba(106,158,106,0.12)", border: "1px solid rgba(106,158,106,0.3)",
          color: "var(--success)"
        }}>
          ✓ {c.concept} <span style={{ opacity: 0.7 }}>({Math.round(c.score * 100)}%)</span>
        </span>
      ))}
      {explanation.partial_concepts?.map(c => (
        <span key={c.concept} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 10px", borderRadius: 20, fontSize: 12,
          background: "rgba(211,152,88,0.12)", border: "1px solid rgba(211,152,88,0.3)",
          color: "var(--accent)"
        }}>
          ◑ {c.concept} <span style={{ opacity: 0.7 }}>({Math.round(c.score * 100)}%)</span>
        </span>
      ))}
      {explanation.missing_concepts?.map(c => (
        <span key={c.concept} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 10px", borderRadius: 20, fontSize: 12,
          background: "rgba(192,80,74,0.12)", border: "1px solid rgba(192,80,74,0.3)",
          color: "var(--danger)"
        }}>
          ✗ {c.concept} <span style={{ opacity: 0.7 }}>({Math.round(c.score * 100)}%)</span>
        </span>
      ))}
    </div>
  );
}

function RemediationCard({ concept, data }) {
  const [open, setOpen] = useState(false);

  const diffColor = {
    beginner: "var(--success)",
    intermediate: "var(--accent)",
    advanced: "var(--blue)"
  }[data.difficulty_level] || "var(--muted)";

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderLeft: "3px solid var(--danger)",
      borderRadius: 10, marginBottom: 12,
      background: "var(--surface2)", overflow: "hidden"
    }}>
      <div
        style={{ padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🎯</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{concept}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Mastery: {data.mastery_score}% ·{" "}
              <span style={{ color: diffColor }}>{data.difficulty_level} level</span>
            </div>
          </div>
        </div>
        <span style={{ color: "var(--muted)", fontSize: 14 }}>{open ? "▲ Hide" : "▼ Study Plan"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--border)" }}>

          {data.what_student_got_right && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                ✓ What you got right
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, background: "rgba(106,158,106,0.07)", padding: "10px 12px", borderRadius: 8 }}>
                {data.what_student_got_right}
              </div>
            </div>
          )}

          {data.what_was_missing && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                ✗ What was missing
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, background: "rgba(192,80,74,0.07)", padding: "10px 12px", borderRadius: 8 }}>
                {data.what_was_missing}
              </div>
            </div>
          )}

          {data.micro_lesson && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                📖 Micro Lesson
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, background: "rgba(122,158,181,0.07)", padding: "12px 14px", borderRadius: 8, borderLeft: "2px solid var(--blue)" }}>
                {data.micro_lesson}
              </div>
            </div>
          )}

          {data.practice_questions?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                ✏ Practice Questions
              </div>
              {data.practice_questions.map((q, i) => (
                <div key={i} style={{
                  fontSize: 13, color: "var(--text2)", lineHeight: 1.5,
                  padding: "8px 12px", marginBottom: 6, borderRadius: 8,
                  background: "var(--surface3)", border: "1px solid var(--border)",
                  display: "flex", gap: 10
                }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  {q}
                </div>
              ))}
            </div>
          )}

          {data.study_tip && (
            <div style={{
              marginTop: 12, padding: "10px 14px", borderRadius: 8,
              background: "rgba(211,152,88,0.08)", border: "1px solid rgba(211,152,88,0.2)"
            }}>
              <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>💡 Tip: </span>
              <span style={{ fontSize: 13, color: "var(--text2)" }}>{data.study_tip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    if (!selectedPaper || !pdfFile) { setError("Please select a paper and upload your PDF."); return; }
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
      setError(e.response?.data?.detail || "Submission failed.");
    } finally { setLoading(false); }
  };

  const totalMax = result
    ? Object.values(result.question_results).reduce((a, q) => a + q.max_marks, 0)
    : 0;
  const pct = result && totalMax ? Math.round((result.total_marks / totalMax) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Submit Exam</h1>
        <p className="page-subtitle">Select a paper, review questions, then upload your PDF answer sheet.</p>
      </div>

      {!result ? (
        <div className="two-col" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="card-title">📋 Submission Form</div>
            {error && <div className="alert alert-error">⚠ {error}</div>}

            <div className="form-group">
              <label className="form-label">Select Paper</label>
              <select className="form-select" value={selectedPaper}
                onChange={e => { setSelectedPaper(e.target.value); loadPaperDetails(e.target.value); }}
              >
                <option value="">Choose a paper...</option>
                {papers.map(p => <option key={p.paper_id} value={p.paper_id}>{p.title}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Upload PDF Answer Sheet</label>
              <div style={{
                border: `2px dashed ${pdfFile ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 8, padding: "20px", textAlign: "center",
                background: pdfFile ? "rgba(211,152,88,0.07)" : "transparent", transition: "all 0.2s"
              }}>
                <input type="file" accept="application/pdf" style={{ display: "none" }} id="pdf-upload"
                  onChange={e => setPdfFile(e.target.files[0])} />
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

            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 13 }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? "⏳ Grading your answers..." : "Submit & Grade →"}
            </button>
          </div>

          {paperDetails && (
            <div className="card">
              <div className="card-title">📖 {paperDetails.title}</div>
              {paperDetails.questions.map(q => (
                <div key={q.question_number} style={{
                  padding: "14px", background: "var(--surface2)", borderRadius: 8,
                  marginBottom: 10, borderLeft: "3px solid var(--accent)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>Q{q.question_number}</span>
                    <span className="badge badge-warning">{q.max_marks} marks</span>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.5 }}>{q.question_text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {success && <div className="alert alert-success" style={{ marginBottom: 24 }}>✓ {success}</div>}

          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              <div style={{
                width: 120, height: 120, borderRadius: "50%", flexShrink: 0,
                background: `conic-gradient(var(--accent) ${pct * 3.6}deg, var(--surface2) 0deg)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 0 6px var(--surface)"
              }}>
                <div style={{
                  width: 92, height: 92, borderRadius: "50%", background: "var(--surface)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{pct}%</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {result.total_marks.toFixed(1)} / {totalMax}
                </div>
                <div style={{ fontSize: 14, color: "var(--muted)" }}>Total marks across all questions</div>
                {result.weak_concepts?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <span style={{ fontSize: 13, color: "var(--danger)" }}>
                      ⚠ Weak areas: {result.weak_concepts.join(", ")}
                    </span>
                  </div>
                )}
              </div>
              <button className="btn btn-secondary" style={{ marginLeft: "auto" }}
                onClick={() => { setResult(null); setPdfFile(null); setSelectedPaper(""); setPaperDetails(null); }}>
                ← Submit Another
              </button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title">📋 Question-by-Question Breakdown</div>
            {Object.entries(result.question_results).map(([qNum, data]) => {
              const qPct = data.max_marks ? Math.round((data.marks / data.max_marks) * 100) : 0;
              const exp = data.explanation;
              return (
                <div key={qNum} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>Q{qNum}</span>
                      {exp && <SimilarityBadge label={exp.similarity_label} />}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                      {data.marks} / {data.max_marks}
                    </span>
                  </div>

                  <div className="progress-bar" style={{ marginBottom: 10 }}>
                    <div className="progress-fill" style={{
                      width: `${qPct}%`,
                      background: qPct >= 70 ? "var(--success)" : qPct >= 40 ? "var(--accent)" : "var(--danger)"
                    }} />
                  </div>

                  {exp && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                      Semantic similarity: <strong style={{ color: "var(--text2)" }}>{exp.similarity_percentage}%</strong>
                    </div>
                  )}

                  {exp?.feedback && (
                    <div style={{
                      fontSize: 13, color: "var(--text2)", lineHeight: 1.6,
                      padding: "10px 14px", background: "var(--surface2)",
                      borderRadius: 8, marginBottom: 8,
                      borderLeft: "2px solid var(--border2)"
                    }}>
                      {exp.feedback}
                    </div>
                  )}

                  {exp && <ConceptChips explanation={exp} />}
                </div>
              );
            })}
          </div>

          {result.remediation && Object.keys(result.remediation).length > 0 && (
            <div className="card">
              <div className="card-title">🎯 Personalised Study Plan</div>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
                Based on your answers, Gemini AI has identified these gaps and created a personalised remediation plan.
              </p>
              {Object.entries(result.remediation).map(([concept, data]) => (
                <RemediationCard key={concept} concept={concept} data={data} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MyResults({ studentId }) {
  const [mastery, setMastery] = useState({});
  const [trend, setTrend] = useState({});
  const [weakConcepts, setWeakConcepts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [expandedSub, setExpandedSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/student/${studentId}`),
      axios.get(`${API}/submissions/${studentId}`).catch(() => ({ data: [] }))
    ]).then(([studentRes, subsRes]) => {
      setMastery(studentRes.data.mastery || {});
      setTrend(studentRes.data.trend || {});
      setWeakConcepts(studentRes.data.weak_concepts || []);
      setSubmissions(Array.isArray(subsRes.data) ? subsRes.data : []);
    }).catch(console.error).finally(() => setLoading(false));
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
        <p className="page-subtitle">Concept mastery, performance trends, and full submission history.</p>
      </div>

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
          <div className="stat-value" style={{ color: weakConcepts.length > 0 ? "var(--danger)" : "var(--success)" }}>
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

      <div className="two-col" style={{ alignItems: "start", marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">📊 Concept Mastery</div>
          {masteryArr.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><p>Submit your first paper to see mastery data.</p></div>
          ) : (
            <>
              {masteryArr.map(({ concept, score }) => (
                <div key={concept} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, color: "var(--text2)" }}>{concept}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: score >= 70 ? "var(--success)" : score >= 50 ? "var(--accent)" : "var(--danger)" }}>
                      {score}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${score}%`,
                      background: score >= 70 ? "var(--success)" : score >= 50 ? "var(--accent)" : "var(--danger)"
                    }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={masteryArr} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="concept" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
                      formatter={v => [`${v}%`, "Mastery"]} />
                    <Bar dataKey="score" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-title">📈 Progress Trend</div>
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
                    {!data.improving && !data.declining && data.scores.length > 1 && <span className="badge badge-blue">→ Stable</span>}
                  </div>
                  <div style={{ height: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="attempt" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
                          formatter={v => [`${v}%`, "Score"]} />
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

      {submissions.length > 0 && (
        <div className="card">
          <div className="card-title">📜 Submission History</div>
          {submissions.map((s, i) => {
            const maxTotal = Object.values(s.question_results).reduce((a, q) => a + q.max_marks, 0);
            const pct = maxTotal ? Math.round((s.total_marks / maxTotal) * 100) : 0;
            const isOpen = expandedSub === i;
            return (
              <div key={i} style={{ marginBottom: 10, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
                <div
                  style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: "var(--surface2)" }}
                  onClick={() => setExpandedSub(isOpen ? null : i)}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Paper {s.paper_id}</span>
                    <span className={`badge ${pct >= 70 ? "badge-success" : pct >= 40 ? "badge-warning" : "badge-danger"}`}>{pct}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ fontSize: 14, color: "var(--text2)" }}>{s.total_marks.toFixed(1)} / {maxTotal}</span>
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: "16px 18px" }}>
                    {Object.entries(s.question_results).map(([qNum, data]) => {
                      const exp = data.explanation;
                      const qPct = data.max_marks ? Math.round((data.marks / data.max_marks) * 100) : 0;
                      return (
                        <div key={qNum} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>Q{qNum}</span>
                              {exp && <SimilarityBadge label={exp.similarity_label} />}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{data.marks} / {data.max_marks}</span>
                          </div>
                          <div className="progress-bar" style={{ marginBottom: 8 }}>
                            <div className="progress-fill" style={{
                              width: `${qPct}%`,
                              background: qPct >= 70 ? "var(--success)" : qPct >= 40 ? "var(--accent)" : "var(--danger)"
                            }} />
                          </div>
                          {exp?.feedback && (
                            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 6 }}>{exp.feedback}</div>
                          )}
                          {exp && <ConceptChips explanation={exp} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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