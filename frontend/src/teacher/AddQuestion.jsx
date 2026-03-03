import { useState } from "react";
import axios from "axios";

function AddQuestion() {
  const [questionId, setQuestionId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [maxMarks, setMaxMarks] = useState(5);
  const [concepts, setConcepts] = useState("");

  const handleSubmit = async () => {
    try {
      const conceptObject = {};

      concepts.split(",").forEach((c) => {
        const trimmed = c.trim();
        if (trimmed) {
          conceptObject[trimmed] = trimmed;
        }
      });

      await axios.post("http://127.0.0.1:8000/add-question", {
        question_id: questionId,
        question_text: questionText,
        model_answer: modelAnswer,
        max_marks: maxMarks,
        tagged_concepts: conceptObject,
      });

      alert("Question added successfully!");
    } catch (error) {
      console.error(error);
      alert("Error adding question");
    }
  };

  return (
    <div>
      <h3>Add New Question</h3>

      <input
        placeholder="Question ID"
        value={questionId}
        onChange={(e) => setQuestionId(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Question Text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Model Answer"
        value={modelAnswer}
        onChange={(e) => setModelAnswer(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        value={maxMarks}
        onChange={(e) => setMaxMarks(Number(e.target.value))}
      />

      <br /><br />

      <input
        placeholder="Concepts (comma separated)"
        value={concepts}
        onChange={(e) => setConcepts(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        Add Question
      </button>
    </div>
  );
}

export default AddQuestion;