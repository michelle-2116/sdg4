import { useState, useEffect } from "react";
import axios from "axios";

function StudentDashboard() {
  const [studentId, setStudentId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionId, setQuestionId] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch questions on load
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/questions"
        );

        setQuestions(response.data);

        if (response.data.length > 0) {
          setQuestionId(response.data[0].question_id);
        }
      } catch (error) {
        console.error("Error fetching questions", error);
      }
    };

    fetchQuestions();
  }, []);

  const handleSubmit = async () => {
    if (!studentId || !answer || !questionId) {
      alert("Please complete all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/submit-answer",
        {
          student_id: studentId,
          question_id: questionId,
          student_answer: answer,
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error submitting answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Student Submission</h2>

      <input
        style={styles.input}
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />

      <select
        style={styles.input}
        value={questionId}
        onChange={(e) => setQuestionId(e.target.value)}
      >
        {questions.map((q) => (
          <option key={q.question_id} value={q.question_id}>
            {q.question_text}
          </option>
        ))}
      </select>

      <textarea
        style={styles.textarea}
        placeholder="Enter your answer..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <button style={styles.button} onClick={handleSubmit}>
        {loading ? "Submitting..." : "Submit"}
      </button>

      {result && (
        <div style={styles.resultCard}>
          <h3>Results</h3>

          <p>
            <strong>Marks:</strong> {result.marks_awarded} /{" "}
            {result.max_marks}
          </p>

          <p>
            <strong>Similarity:</strong> {result.similarity_score}
          </p>

          <h4>Concept Breakdown</h4>
          {Object.entries(result.concept_breakdown).map(
            ([concept, score]) => (
              <div key={concept}>
                {concept}: {score}
              </div>
            )
          )}

          <h4>Weak Concepts</h4>
          {result.weak_concepts.length === 0
            ? "None 🎉"
            : result.weak_concepts.join(", ")}

          <h4>Trend Analysis</h4>
          {Object.entries(result.trend_analysis).map(
            ([concept, data]) => (
              <div key={concept}>
                {concept} → Scores: {data.scores.join(", ")} | Improving:{" "}
                {data.improving ? "Yes" : "No"}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
  },
  textarea: {
    display: "block",
    width: "100%",
    height: "120px",
    padding: "10px",
    marginBottom: "15px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  resultCard: {
    marginTop: "30px",
    border: "1px solid #4CAF50",
    padding: "20px",
    borderRadius: "8px",
  },
};

export default StudentDashboard;