import { useState, useEffect } from "react";
import axios from "axios";
import { globalStyles } from "./styles";
import SyllabusUpload from "./SyllabusUpload";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, LineChart, Line
} from "recharts";

const API = "http://127.0.0.1:8000";

// ── Sidebar ────────────────────────────────────────────────────────
function Sidebar({ active, setActive, user, onLogout }) {
  const navItems = [
    { id: "overview", icon: "🏛", label: "Class Overview" },
    { id: "students", icon: "👥", label: "Students" },
    { id: "questions", icon: "❓", label: "Question Bank" },
    { id: "papers", icon: "📄", label: "Papers" },
    { id: "syllabus", icon: "📚", label: "Syllabus" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">⟡</div>
        <div>
          <div className="sidebar-brand-text">SmartGrade</div>
          <div className="sidebar-brand-sub">Teacher Portal</div>
        </div>
      </div>
      <div className="sidebar-nav">
        <div className="nav-section-label">Dashboard</div>
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
            <div className="user-role">Teacher · ID {user.id}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>↩ Sign Out</button>
      </div>
    </div>
  );
}

// ── Class Overview ─────────────────────────────────────────────────
function ClassOverview() {
  const [data, setData] = useState([]);
  const [weakConcepts, setWeakConcepts] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/class-analytics`),
      axios.get(`${API}/students`)
    ]).then(([analytics, studs]) => {
      const mastery = analytics.data.class_mastery;
      setData(Object.entries(mastery).map(([concept, score]) => ({
        concept, score: Math.round(score * 100)
      })));
      setWeakConcepts(analytics.data.weak_concepts_classwide);
      setStudents(studs.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const avgClassMastery = data.length
    ? Math.round(data.reduce((a, d) => a + d.score, 0) / data.length)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Class Overview</h1>
        <p className="page-subtitle">Aggregated concept mastery and class-wide analytics.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value stat-accent">{avgClassMastery}%</div>
          <div className="stat-label">Class Avg. Mastery</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{students.length}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.length}</div>
          <div className="stat-label">Concepts Tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: weakConcepts.length > 0 ? "var(--danger)" : "var(--success)" }}>
            {weakConcepts.length}
          </div>
          <div className="stat-label">Weak Concepts</div>
        </div>
      </div>

      {weakConcepts.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          ⚠ Class-wide weak areas: <strong>{weakConcepts.join(", ")}</strong> — consider reviewing these topics.
        </div>
      )}

      <div className="card">
        <div className="card-title">Concept Mastery — Class Average</div>
        {data.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📭</div><p>No analytics data yet.</p></div>
        ) : (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="concept" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
                  formatter={(v) => [`${v}%`, "Class Mastery"]}
                />
                <Bar dataKey="score" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {students.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-title">Student Summary</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Average Mastery</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const pct = Math.round(s.average_mastery * 100);
                return (
                  <tr key={s.student_id}>
                    <td style={{ color: "var(--accent)", fontWeight: 500 }}>#{s.student_id}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="progress-bar" style={{ flex: 1, maxWidth: 120 }}>
                          <div className="progress-fill" style={{
                            width: `${pct}%`,
                            background: pct >= 70 ? "var(--success)" : pct >= 50 ? "var(--accent)" : "var(--danger)"
                          }} />
                        </div>
                        <span style={{ fontSize: 13 }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${pct >= 70 ? "badge-success" : pct >= 50 ? "badge-warning" : "badge-danger"}`}>
                        {pct >= 70 ? "On Track" : pct >= 50 ? "Needs Review" : "At Risk"}
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

// ── Students ───────────────────────────────────────────────────────
function Students() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    axios.get(`${API}/students`).then(r => setStudents(r.data)).catch(console.error);
  }, []);

  const selectStudent = async (id) => {
    if (selectedId === id) { setSelectedId(null); setDetails(null); return; }
    setSelectedId(id);
    try {
      const r = await axios.get(`${API}/student/${id}`);
      setDetails(r.data);
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-subtitle">Click a student to view detailed mastery and trend analysis.</p>
      </div>

      <div className="two-col" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-title">All Students ({students.length})</div>
          {students.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👤</div><p>No students yet.</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Student ID</th><th>Avg. Mastery</th><th>Status</th></tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const pct = Math.round(s.average_mastery * 100);
                  const isSelected = selectedId === s.student_id;
                  return (
                    <tr key={s.student_id}
                      onClick={() => selectStudent(s.student_id)}
                      style={{ background: isSelected ? "var(--accent-soft)" : undefined }}
                    >
                      <td style={{ color: "var(--accent)", fontWeight: 500 }}>
                        {isSelected ? "▶ " : ""}#{s.student_id}
                      </td>
                      <td>{pct}%</td>
                      <td>
                        <span className={`badge ${pct >= 70 ? "badge-success" : pct >= 50 ? "badge-warning" : "badge-danger"}`}>
                          {pct >= 70 ? "On Track" : pct >= 50 ? "Needs Review" : "At Risk"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {details && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">📊 Student #{selectedId} — Mastery</div>
              {details.weak_concepts.length > 0 && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  Weak: <strong>{details.weak_concepts.join(", ")}</strong>
                </div>
              )}
              {Object.entries(details.mastery).map(([concept, score]) => {
                const pct = Math.round(score * 100);
                return (
                  <div key={concept} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: "var(--text2)" }}>{concept}</span>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: pct >= 70 ? "var(--success)" : pct >= 50 ? "var(--accent)" : "var(--danger)"
                      }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${pct}%`,
                        background: pct >= 70 ? "var(--success)" : pct >= 50 ? "var(--accent)" : "var(--danger)"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(details.trend).length > 0 && (
              <div className="card">
                <div className="card-title">📈 Trend Analysis</div>
                {Object.entries(details.trend).map(([concept, data]) => {
                  const chartData = data.scores.map((score, i) => ({
                    attempt: `#${i + 1}`, score: Math.round(score * 100)
                  }));
                  return (
                    <div key={concept} style={{ marginBottom: 24 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>{concept}</span>
                        {data.improving && <span className="badge badge-success">↑ Improving</span>}
                        {data.declining && <span className="badge badge-danger">↓ Declining</span>}
                      </div>
                      <div style={{ height: 140 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="attempt" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
                              formatter={(v) => [`${v}%`, "Score"]}
                            />
                            <Line type="monotone" dataKey="score" stroke="var(--blue)" strokeWidth={2} dot={{ fill: "var(--blue)" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Question Bank ──────────────────────────────────────────────────
function QuestionBank() {
  const [tab, setTab] = useState("view");
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [form, setForm] = useState({ question_id: "", question_text: "", model_answer: "", max_marks: 5, concepts: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchQuestions = () => {
    axios.get(`${API}/questions-full`).then(r => setQuestions(r.data)).catch(() => {
      axios.get(`${API}/questions`).then(r => setQuestions(r.data)).catch(console.error);
    });
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleAdd = async () => {
    setMsg({ type: "", text: "" });
    const { question_id, question_text, model_answer, max_marks, concepts } = form;
    if (!question_id || !question_text || !model_answer) {
      setMsg({ type: "error", text: "Please fill in all required fields." });
      return;
    }
    const conceptObject = {};
    concepts.split(",").forEach(c => { const t = c.trim(); if (t) conceptObject[t] = t; });
    try {
      await axios.post(`${API}/add-question`, {
        question_id, question_text, model_answer,
        max_marks: Number(max_marks), tagged_concepts: conceptObject
      });
      setMsg({ type: "success", text: "Question added successfully!" });
      setForm({ question_id: "", question_text: "", model_answer: "", max_marks: 5, concepts: "" });
      fetchQuestions();
      setTimeout(() => setTab("view"), 1000);
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.detail || "Error adding question." });
    }
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Question Bank</h1>
        <p className="page-subtitle">Manage all exam questions and their model answers.</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "view" ? "active" : ""}`} onClick={() => setTab("view")}>
          View Questions ({questions.length})
        </button>
        <button className={`tab ${tab === "add" ? "active" : ""}`} onClick={() => setTab("add")}>
          + Add Question
        </button>
      </div>

      {tab === "view" && (
        <div>
          {questions.length === 0 ? (
            <div className="empty-state card"><div className="empty-icon">❓</div><p>No questions yet. Add one!</p></div>
          ) : (
            questions.map((q) => (
              <div key={q.question_id} className="card" style={{ marginBottom: 12, cursor: "pointer" }}
                onClick={() => setExpanded(expanded === q.question_id ? null : q.question_id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: 1, textTransform: "uppercase" }}>
                        Q{q.question_id}
                      </span>
                      {q.max_marks && <span className="badge badge-warning">{q.max_marks} marks</span>}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.5 }}>{q.question_text}</div>
                  </div>
                  <span style={{ color: "var(--muted)", fontSize: 18, marginLeft: 12 }}>
                    {expanded === q.question_id ? "▲" : "▼"}
                  </span>
                </div>

                {expanded === q.question_id && q.model_answer && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                      Model Answer
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, background: "var(--surface2)", padding: "12px", borderRadius: 8 }}>
                      {q.model_answer}
                    </div>
                    {q.tagged_concepts && Object.keys(q.tagged_concepts).length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                          Concepts
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {Object.keys(q.tagged_concepts).map(c => (
                            <span key={c} className="badge badge-warning">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "add" && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-title">➕ Add New Question</div>

          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Question ID *</label>
              <input className="form-input" placeholder="e.g. 4" value={form.question_id} onChange={e => setField("question_id", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Marks</label>
              <input className="form-input" type="number" value={form.max_marks} onChange={e => setField("max_marks", e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Question Text *</label>
            <textarea className="form-textarea" placeholder="Enter the question..." value={form.question_text} onChange={e => setField("question_text", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Model Answer *</label>
            <textarea className="form-textarea" style={{ minHeight: 100 }} placeholder="Enter the ideal answer..." value={form.model_answer} onChange={e => setField("model_answer", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Concepts (comma-separated)</label>
            <input className="form-input" placeholder="e.g. Photosynthesis, Cell Biology" value={form.concepts} onChange={e => setField("concepts", e.target.value)} />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleAdd}>
            Add Question →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Papers ─────────────────────────────────────────────────────────
function Papers() {
  const [tab, setTab] = useState("view");
  const [papers, setPapers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [paperResults, setPaperResults] = useState(null);

  const [form, setForm] = useState({ paper_id: "", title: "", selected: [] });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchPapers = () => axios.get(`${API}/papers`).then(r => setPapers(r.data)).catch(console.error);

  useEffect(() => {
    fetchPapers();
    axios.get(`${API}/questions`).then(r => setQuestions(r.data)).catch(console.error);
  }, []);

  const toggleQ = (id) => {
    setForm(f => ({
      ...f,
      selected: f.selected.includes(id) ? f.selected.filter(x => x !== id) : [...f.selected, id]
    }));
  };

  const handleCreate = async () => {
    setMsg({ type: "", text: "" });
    if (!form.paper_id || !form.title || form.selected.length === 0) {
      setMsg({ type: "error", text: "Fill all fields and select at least one question." });
      return;
    }
    try {
      await axios.post(`${API}/create-paper`, {
        paper_id: form.paper_id, title: form.title,
        questions: form.selected.map((qId, i) => ({ question_id: qId, question_number: i + 1 }))
      });
      setMsg({ type: "success", text: "Paper created successfully!" });
      setForm({ paper_id: "", title: "", selected: [] });
      fetchPapers();
      setTimeout(() => setTab("view"), 1000);
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.detail || "Error creating paper." });
    }
  };

  const loadResults = async (paperId) => {
    if (selectedPaper === paperId) { setSelectedPaper(null); setPaperResults(null); return; }
    setSelectedPaper(paperId);
    try {
      const r = await axios.get(`${API}/paper-results/${paperId}`);
      setPaperResults(r.data);
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Papers</h1>
        <p className="page-subtitle">Create exam papers and view submission results.</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "view" ? "active" : ""}`} onClick={() => setTab("view")}>
          View Papers ({papers.length})
        </button>
        <button className={`tab ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>
          + Create Paper
        </button>
      </div>

      {tab === "view" && (
        <div>
          {papers.length === 0 ? (
            <div className="empty-state card"><div className="empty-icon">📄</div><p>No papers yet. Create one!</p></div>
          ) : (
            papers.map(paper => (
              <div key={paper.paper_id} style={{ marginBottom: 12 }}>
                <div className="card" style={{ cursor: "pointer", borderColor: selectedPaper === paper.paper_id ? "var(--accent)" : "var(--border)" }}
                  onClick={() => loadResults(paper.paper_id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: 1, textTransform: "uppercase" }}>
                          #{paper.paper_id}
                        </span>
                        <span className="badge badge-blue">{paper.questions?.length || 0} questions</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{paper.title}</div>
                    </div>
                    <span style={{ color: "var(--muted)" }}>{selectedPaper === paper.paper_id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {selectedPaper === paper.paper_id && paperResults && (
                  <div className="card" style={{ borderTop: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderColor: "var(--accent)" }}>
                    {paperResults.message ? (
                      <div className="empty-state" style={{ padding: "20px" }}>
                        <div className="empty-icon">📭</div>
                        <p>No submissions yet.</p>
                      </div>
                    ) : (
                      <>
                        <div className="stat-grid" style={{ marginBottom: 20 }}>
                          <div className="stat-card">
                            <div className="stat-value">{paperResults.total_students}</div>
                            <div className="stat-label">Submissions</div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-value stat-accent">{paperResults.average_marks?.toFixed(1)}</div>
                            <div className="stat-label">Avg. Marks</div>
                          </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Question Averages
                          </div>
                          {Object.entries(paperResults.question_average || {}).map(([q, avg]) => (
                            <div key={q} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                              <span style={{ fontSize: 14, color: "var(--text2)" }}>Question {q}</span>
                              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>{avg.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Individual Submissions
                          </div>
                          <table className="data-table">
                            <thead>
                              <tr><th>Student</th><th>Total Marks</th><th>Breakdown</th></tr>
                            </thead>
                            <tbody>
                              {paperResults.submissions?.map((s, i) => {
                                const maxTotal = Object.values(s.question_results).reduce((a, q) => a + q.max_marks, 0);
                                const pct = maxTotal ? Math.round((s.total_marks / maxTotal) * 100) : 0;
                                return (
                                  <tr key={i}>
                                    <td style={{ color: "var(--accent)", fontWeight: 500 }}>#{s.student_id}</td>
                                    <td>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {s.total_marks.toFixed(1)} / {maxTotal}
                                        <span className={`badge ${pct >= 70 ? "badge-success" : pct >= 40 ? "badge-warning" : "badge-danger"}`}>{pct}%</span>
                                      </div>
                                    </td>
                                    <td>
                                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {Object.entries(s.question_results).map(([q, d]) => (
                                          <span key={q} className="chip">Q{q}: {d.marks}/{d.max_marks}</span>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "create" && (
        <div className="two-col" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="card-title">📄 Paper Details</div>

            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

            <div className="form-group">
              <label className="form-label">Paper ID *</label>
              <input className="form-input" placeholder="e.g. 2" value={form.paper_id} onChange={e => setForm(f => ({ ...f, paper_id: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Paper Title *</label>
              <input className="form-input" placeholder="e.g. Biology Unit 2" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleCreate}>
              Create Paper →
            </button>
          </div>

          <div className="card">
            <div className="card-title">❓ Select Questions ({form.selected.length} selected)</div>
            {questions.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">❓</div><p>No questions available.</p></div>
            ) : (
              questions.map(q => (
                <div key={q.question_id}
                  style={{
                    padding: "12px 14px", borderRadius: 8, marginBottom: 8, cursor: "pointer",
                    background: form.selected.includes(q.question_id) ? "var(--accent-soft)" : "var(--surface2)",
                    border: `1px solid ${form.selected.includes(q.question_id) ? "var(--accent)" : "var(--border)"}`,
                    transition: "all 0.15s"
                  }}
                  onClick={() => toggleQ(q.question_id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", display: "block", marginBottom: 4 }}>Q{q.question_id}</span>
                      <span style={{ fontSize: 13, color: "var(--text2)" }}>{q.question_text}</span>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4, border: "2px solid",
                      borderColor: form.selected.includes(q.question_id) ? "var(--accent)" : "var(--border)",
                      background: form.selected.includes(q.question_id) ? "var(--accent)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginLeft: 12, flexShrink: 0,
                      color: "var(--bg)", fontSize: 12, fontWeight: 700
                    }}>
                      {form.selected.includes(q.question_id) ? "✓" : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────
export default function TeacherDashboard({ user, onLogout }) {
  const [active, setActive] = useState("overview");

  return (
    <>
      <style>{globalStyles}</style>
      <div className="app-shell">
        <Sidebar active={active} setActive={setActive} user={user} onLogout={onLogout} />
        <div className="main-content">
          {active === "overview" && <ClassOverview />}
          {active === "students" && <Students />}
          {active === "questions" && <QuestionBank />}
          {active === "papers" && <Papers />}
          {active === "syllabus" && <SyllabusUpload />}
        </div>
      </div>
    </>
  );
}