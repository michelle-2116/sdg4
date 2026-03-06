import { useEffect, useState } from "react";
import axios from "axios";

function StudentDashboard() {
  const [studentId, setStudentId] = useState("");
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState("");
  const [paperDetails, setPaperDetails] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [result, setResult] = useState(null);

  // Load papers on mount
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/papers"
        );
        setPapers(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPapers();
  }, []);

  const loadPaperDetails = async (paperId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/paper/${paperId}`
      );
      setPaperDetails(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!studentId || !selectedPaper || !pdfFile) {
      alert("Fill all fields and upload PDF");
      return;
    }

    const formData = new FormData();
    formData.append("student_id", studentId);
    formData.append("paper_id", selectedPaper);
    formData.append("file", pdfFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/submit-paper",
        formData
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Submission failed");
    }
  };

  return (
    <div>
      <h2>Exam Submission</h2>

      <input
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />

      <br /><br />

      <select
        value={selectedPaper}
        onChange={(e) => {
          setSelectedPaper(e.target.value);
          loadPaperDetails(e.target.value);
        }}
      >
        <option value="">Select Paper</option>
        {papers.map((paper) => (
          <option key={paper.paper_id} value={paper.paper_id}>
            {paper.title}
          </option>
        ))}
      </select>

      <br /><br />

      {paperDetails && (
        <div style={{ border: "1px solid #ccc", padding: "15px" }}>
          <h3>{paperDetails.title}</h3>
          {paperDetails.questions.map((q) => (
            <div key={q.question_number} style={{ marginBottom: "10px" }}>
              <strong>Q{q.question_number}</strong> — {q.question_text}
              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                Max Marks: {q.max_marks}
              </div>
            </div>
          ))}
        </div>
      )}

      <br />

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setPdfFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        Submit Paper
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>Results</h3>
          <p><strong>Total Marks:</strong> {result.total_marks}</p>

          {Object.entries(result.question_results).map(
            ([qNum, data]) => (
              <div key={qNum}>
                <strong>Q{qNum}</strong> — {data.marks}/{data.max_marks}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;