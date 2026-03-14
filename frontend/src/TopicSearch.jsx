import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function DifficultyBar({ difficulty }) {
  const levels = ["beginner", "intermediate", "advanced"];
  const idx = levels.indexOf(difficulty);
  const colors = ["var(--success)", "var(--warn)", "var(--danger)"];
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {levels.map((l, i) => (
        <div key={l} style={{
          height: 6, flex: 1,
          background: i <= idx ? colors[idx] : "var(--surface3)",
          opacity: i <= idx ? (i === idx ? 1 : 0.35) : 0.2,
          transition: "all 0.3s",
        }} />
      ))}
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 10, fontWeight: 700, letterSpacing: 1,
        color: colors[idx] || "var(--muted)",
        textTransform: "uppercase", marginLeft: 6, whiteSpace: "nowrap",
      }}>
        {difficulty || "—"}
      </span>
    </div>
  );
}

function YoutubeCard({ video, index }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "flex", gap: 14, padding: "14px 16px",
        border: "1px solid var(--border)",
        background: "var(--surface2)",
        textDecoration: "none",
        transition: "all 0.15s",
        marginBottom: 8,
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.background = "var(--accent-dim)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--surface2)";
      }}
    >
      {/* Rank indicator */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 2,
        background: index === 0 ? "var(--accent)" : "var(--border2)",
      }} />

      {/* Thumbnail or placeholder */}
      {video.thumbnail ? (
        <img
          src={video.thumbnail}
          alt=""
          style={{ width: 96, height: 54, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }}
          onError={e => { e.target.style.display = "none"; }}
        />
      ) : (
        <div style={{
          width: 96, height: 54, flexShrink: 0,
          background: "var(--surface3)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>▶</div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 500, color: "var(--text)",
          marginBottom: 5, lineHeight: 1.4,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {video.is_search_link ? "🔍 " : ""}{video.title}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {video.channel && (
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, color: "var(--muted)", letterSpacing: 0.5,
            }}>
              {video.channel}
            </span>
          )}
          {video.duration && (
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700, letterSpacing: 1,
              color: "var(--accent)", padding: "1px 6px",
              background: "var(--accent-dim)", border: "1px solid rgba(0,229,255,0.15)",
            }}>
              {video.duration}
            </span>
          )}
          {video.views && (
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{video.views} views</span>
          )}
        </div>
      </div>

      <div style={{ alignSelf: "center", color: "var(--accent)", fontSize: 14, flexShrink: 0 }}>→</div>
    </a>
  );
}

export default function TopicSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const r = await axios.post(`${API}/search-topic`, { query: query.trim() });
      setResult(r.data);
      setHistory(h => [{ query: query.trim(), result: r.data }, ...h.slice(0, 9)]);
    } catch (e) {
      setError(e.response?.data?.detail || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSearch(); };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Topic Search</h1>
        <p className="page-subtitle">
          Search any topic — we'll find it in your syllabus and recommend YouTube videos at the right level.
        </p>
      </div>

      {/* ── SEARCH BAR ── */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 28,
        background: "var(--surface)", border: "1px solid var(--border)",
        padding: "4px 4px 4px 16px",
        position: "relative",
      }}>
        <span style={{ fontSize: 14, color: "var(--muted)", alignSelf: "center" }}>⌕</span>
        <input
          style={{
            flex: 1, background: "none", border: "none",
            color: "var(--text)", fontFamily: "'Barlow', sans-serif", fontSize: 15,
            outline: "none", padding: "10px 0",
          }}
          placeholder="e.g. Mitosis, Newton's laws, The French Revolution..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
        />
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? "Searching..." : "Search →"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── LOADING STATE ── */}
      {loading && (
        <div style={{
          padding: "28px 24px",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderLeft: "2px solid var(--accent)",
          marginBottom: 20,
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            color: "var(--accent)", textTransform: "uppercase", marginBottom: 8,
          }}>
            // Searching syllabus & finding videos
          </div>
          {[
            "Scanning syllabus for matching topics...",
            "Identifying page references...",
            "Finding best YouTube videos at your level...",
          ].map((step, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 6,
              fontSize: 13, color: "var(--muted)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--accent)", opacity: 0.6,
                animation: `pulse ${0.8 + i * 0.3}s infinite alternate`,
              }} />
              {step}
            </div>
          ))}
          <style>{`@keyframes pulse { from { opacity: 0.3 } to { opacity: 1 } }`}</style>
        </div>
      )}

      {/* ── RESULTS ── */}
      {result && (
        <div>
          {/* Syllabus match card */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">
              {result.found_in_syllabus ? "// Found in Syllabus" : "// Not in Syllabus"}
            </div>

            {!result.syllabus_available && (
              <div className="alert alert-info" style={{ marginBottom: 14 }}>
                No syllabus has been uploaded by your teacher yet. Showing general results.
              </div>
            )}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              {/* Found / not found indicator */}
              <span className={`badge ${result.found_in_syllabus ? "badge-success" : "badge-warning"}`}>
                {result.found_in_syllabus ? "✓ In Syllabus" : "⚠ Not Found"}
              </span>
              {result.difficulty && (
                <span className={`badge ${
                  { beginner: "badge-success", intermediate: "badge-warning", advanced: "badge-danger" }[result.difficulty]
                }`}>
                  {result.difficulty}
                </span>
              )}
            </div>

            {result.found_in_syllabus && result.matched_topic && (
              <div style={{ marginBottom: 14 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 9, fontWeight: 700, color: "var(--muted)",
                  textTransform: "uppercase", letterSpacing: 2, marginBottom: 6,
                }}>Matched Topic</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                  {result.matched_topic}
                </div>
              </div>
            )}

            {/* Page citations */}
            {result.pages?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 9, fontWeight: 700, color: "var(--muted)",
                  textTransform: "uppercase", letterSpacing: 2, marginBottom: 8,
                }}>Page References</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {result.pages.map(p => (
                    <div key={p} style={{
                      padding: "6px 14px",
                      background: "var(--accent-dim)", border: "1px solid rgba(0,229,255,0.25)",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 14, fontWeight: 700, color: "var(--accent)",
                      letterSpacing: 1,
                    }}>
                      p.{p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtopics */}
            {result.matched_subtopics?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 9, fontWeight: 700, color: "var(--muted)",
                  textTransform: "uppercase", letterSpacing: 2, marginBottom: 8,
                }}>Relevant Subtopics</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {result.matched_subtopics.map((s, i) => (
                    <span key={i} className="chip">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty visual */}
            {result.difficulty && (
              <div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 9, fontWeight: 700, color: "var(--muted)",
                  textTransform: "uppercase", letterSpacing: 2, marginBottom: 8,
                }}>Difficulty Level</div>
                <DifficultyBar difficulty={result.difficulty} />
              </div>
            )}

            {/* AI note */}
            {result.syllabus_note && (
              <div style={{
                marginTop: 14, padding: "10px 14px",
                background: "var(--bg2)", borderLeft: "2px solid var(--border2)",
                fontSize: 13, color: "var(--text2)", lineHeight: 1.6,
              }}>
                {result.syllabus_note}
              </div>
            )}
          </div>

          {/* YouTube results */}
          <div className="card">
            <div className="card-title">
              // YouTube Resources
              {result.youtube_search_query && (
                <span style={{
                  fontSize: 10, color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: 0.5, fontWeight: 400, textTransform: "none",
                  marginLeft: "auto",
                }}>
                  Search: "{result.youtube_search_query}"
                </span>
              )}
            </div>

            {result.youtube_results?.length > 0 ? (
              result.youtube_results.map((v, i) => (
                <YoutubeCard key={i} video={v} index={i} />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📺</div>
                <p>No videos found. Try rephrasing your query.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RECENT SEARCHES ── */}
      {!result && !loading && history.length > 0 && (
        <div className="card">
          <div className="card-title">// Recent Searches</div>
          {history.map((h, i) => (
            <div
              key={i}
              onClick={() => { setQuery(h.query); setResult(h.result); }}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", cursor: "pointer",
                border: "1px solid var(--border)", marginBottom: 6,
                background: "var(--surface2)", transition: "all 0.13s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>⌕</span>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>{h.query}</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span className={`badge ${h.result.found_in_syllabus ? "badge-success" : "badge-warning"}`}>
                  {h.result.found_in_syllabus ? "In syllabus" : "Not found"}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  {h.result.youtube_results?.length || 0} videos
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!result && !loading && history.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          color: "var(--muted)",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>📚</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13, fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", marginBottom: 8,
          }}>
            Search any topic
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
            Type a topic above — we'll check your teacher's syllabus for page references
            and find the best YouTube videos at your level.
          </div>
        </div>
      )}
    </div>
  );
}