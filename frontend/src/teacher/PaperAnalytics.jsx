import { useEffect, useState } from "react";
import axios from "axios";

function PaperAnalytics() {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState("");
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchPapers = async () => {
      const res = await axios.get("http://127.0.0.1:8000/papers");
      setPapers(res.data);
    };
    fetchPapers();
  }, []);

  const loadResults = async (paperId) => {
    const res = await axios.get(
      `http://127.0.0.1:8000/paper-results/${paperId}`
    );
    setResults(res.data);
  };

  return (
    <div>
      <h3>Paper Results</h3>

      <select
        value={selectedPaper}
        onChange={(e) => {
          setSelectedPaper(e.target.value);
          loadResults(e.target.value);
        }}
      >
        <option value="">Select Paper</option>
        {papers.map((p) => (
          <option key={p.paper_id} value={p.paper_id}>
            {p.title}
          </option>
        ))}
      </select>

      {results && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>Total Students:</strong> {results.total_students}</p>
          <p><strong>Average Marks:</strong> {results.average_marks}</p>

          <h4>Question-wise Average</h4>
          {results.question_average &&
            Object.entries(results.question_average).map(([q, avg]) => (
              <div key={q}>
                Q{q}: {avg}
              </div>
            ))}

          <h4>Individual Submissions</h4>
          {results.submissions &&
            results.submissions.map((s, index) => (
              <div key={index} style={{border:"1px solid #ccc", padding:"10px", marginBottom:"10px"}}>
                
                <strong>Student:</strong> {s.student_id}  
                <br />
                <strong>Total Marks:</strong> {s.total_marks}

                <div style={{marginTop:"10px"}}>
                  {Object.entries(s.question_results).map(([q, data]) => (
                    <div key={q}>
                      Q{q}: {data.marks}/{data.max_marks}
                    </div>
                  ))}
                </div>

              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default PaperAnalytics;