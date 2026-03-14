import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function SyllabusUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [existing, setExisting] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Load existing syllabus on mount
  useEffect(() => {
    axios.get(`${API}/syllabus`)
      .then(r => { if (r.data.available) setExisting(r.data); })
      .catch(() => {});
  }, []);

  const handleUpload = async () => {
    if (!file) { setMsg({ type: "error", text: "Please select a PDF file." }); return; }
    setMsg({ type: "", text: "" });
    setUploading(true);
    setResult(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const r = await axios.post(`${API}/upload-syllabus`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(r.data);
      setExisting(r.data);
      setMsg({ type: "success", text: `Syllabus processed — ${r.data.topic_count} topics extracted.` });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.detail || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const toggleTopic = (id) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const displayData = result || existing;
  const topics = displayData?.topics || [];

  const diffColor = (d) => ({
    beginner: "var(--success)", intermediate: "var(--warn)", advanced: "var(--danger)"
  }[d] || "var(--muted)");

  const diffBadge = (d) => ({
    beginner: "badge-success", intermediate: "badge-warning", advanced: "badge-danger"
  }[d] || "badge-blue");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Syllabus</h1>
        <p className="page-subtitle">
          Upload a syllabus PDF — AI will extract topics and make them searchable for students.
        </p>
      </div>

      {/* ── UPLOAD PANEL ── */}
      <div className="two-col" style={{ alignItems: "start", marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">// Upload Syllabus PDF</div>

          {msg.text && (
            <div className={`alert alert-${msg.type === "error" ? "error" : "success"}`}>
              {msg.text}
            </div>
          )}

          {/* Drop zone */}
          <div
            onClick={() => document.getElementById("syllabus-input").click()}
            style={{
              border: `1px dashed ${file ? "var(--accent)" : "var(--border2)"}`,
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: file ? "var(--accent-dim)" : "var(--bg2)",
              transition: "all 0.15s",
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{file ? "📄" : "⬆"}</div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13, fontWeight: 700, letterSpacing: 1,
              color: file ? "var(--accent)" : "var(--muted)",
              textTransform: "uppercase",
            }}>
              {file ? file.name : "Click to select PDF"}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
              Syllabus, curriculum document, or course outline
            </div>
          </div>
          <input
            id="syllabus-input"
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={e => setFile(e.target.files[0])}
          />

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "⏳ Processing..." : "Upload & Extract Topics →"}
          </button>

          {uploading && (
            <div style={{
              marginTop: 14, padding: "10px 14px",
              background: "var(--accent-dim)", borderLeft: "2px solid var(--accent)",
              fontSize: 12, color: "var(--accent)",
              fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5,
            }}>
              Gemini is reading the syllabus and extracting topics...
            </div>
          )}
        </div>

        {/* Current syllabus info */}
        <div className="card">
          <div className="card-title">// Current Syllabus</div>
          {!displayData ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No syllabus uploaded yet.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 18 }}>
                {[
                  ["File", displayData.filename],
                  ["Subject", displayData.subject || "—"],
                  ["Level", displayData.level || "—"],
                  ["Pages", displayData.total_pages],
                  ["Topics found", displayData.topic_count ?? topics.length],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "8px 0", borderBottom: "1px solid var(--border)",
                    fontSize: 13,
                  }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                      color: "var(--muted)", textTransform: "uppercase",
                      alignSelf: "center",
                    }}>{k}</span>
                    <span style={{ color: "var(--text2)" }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700, letterSpacing: 2,
                color: "var(--accent)", textTransform: "uppercase",
                marginBottom: 10,
              }}>
                Topic Overview
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {topics.slice(0, 12).map(t => (
                  <span key={t.id} style={{
                    padding: "3px 10px",
                    background: "var(--surface2)", border: "1px solid var(--border)",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 11, color: "var(--text2)", letterSpacing: 0.5,
                  }}>
                    {t.name}
                  </span>
                ))}
                {topics.length > 12 && (
                  <span style={{ fontSize: 11, color: "var(--muted)", alignSelf: "center" }}>
                    +{topics.length - 12} more
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── FULL TOPIC LIST ── */}
      {topics.length > 0 && (
        <div className="card">
          <div className="card-title">
            // Extracted Topics ({topics.length})
            <span style={{
              marginLeft: "auto", fontSize: 10, color: "var(--muted)",
              fontWeight: 400, letterSpacing: 0.5, textTransform: "none",
            }}>
              {selectedTopics.length > 0
                ? `${selectedTopics.length} selected`
                : "Click to expand a topic"}
            </span>
          </div>

          {topics.map(t => {
            const expanded = selectedTopics.includes(t.id);
            return (
              <div
                key={t.id}
                style={{
                  border: `1px solid ${expanded ? "var(--accent)" : "var(--border)"}`,
                  marginBottom: 8,
                  background: expanded ? "var(--accent-dim)" : "var(--surface2)",
                  transition: "all 0.15s",
                }}
              >
                {/* Header */}
                <div
                  onClick={() => toggleTopic(t.id)}
                  style={{
                    padding: "12px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                >
                  {/* Accent bar */}
                  <div style={{
                    width: 2, height: 20, flexShrink: 0,
                    background: expanded ? "var(--accent)" : "var(--border2)",
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 14, fontWeight: 700, color: expanded ? "var(--accent)" : "var(--text)",
                        letterSpacing: 0.5,
                      }}>
                        {t.name}
                      </span>
                      <span className={`badge ${diffBadge(t.difficulty)}`}>
                        {t.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Page refs */}
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {(t.pages || []).map(p => (
                      <span key={p} style={{
                        padding: "2px 7px",
                        background: "var(--surface3)", border: "1px solid var(--border)",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 10, color: "var(--muted)", letterSpacing: 0.5,
                      }}>
                        p.{p}
                      </span>
                    ))}
                  </div>

                  <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>
                    {expanded ? "▲" : "▼"}
                  </span>
                </div>

                {/* Expanded content */}
                {expanded && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
                    {t.subtopics?.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 9, fontWeight: 700, color: "var(--muted)",
                          textTransform: "uppercase", letterSpacing: 2, marginBottom: 8,
                        }}>Subtopics</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {t.subtopics.map((s, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: 8,
                              fontSize: 13, color: "var(--text2)",
                            }}>
                              <div style={{
                                width: 4, height: 4, flexShrink: 0,
                                background: "var(--accent)", opacity: 0.5,
                                clip: "none",
                              }} />
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {t.keywords?.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 9, fontWeight: 700, color: "var(--muted)",
                          textTransform: "uppercase", letterSpacing: 2, marginBottom: 8,
                        }}>Keywords</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {t.keywords.map((k, i) => (
                            <span key={i} className="chip">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}
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