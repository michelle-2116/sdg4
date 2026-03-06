import { useEffect, useState } from "react";
import axios from "axios";

function CreatePaper() {
  const [paperId, setPaperId] = useState("");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);

  // Load available questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/questions"
        );
        setQuestions(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchQuestions();
  }, []);

  const toggleQuestion = (questionId) => {
    setSelected((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleCreate = async () => {
    if (!paperId || !title || selected.length === 0) {
      alert("Fill all fields and select at least one question");
      return;
    }

    const formattedQuestions = selected.map((qId, index) => ({
      question_id: qId,
      question_number: index + 1
    }));

    try {
      await axios.post("http://127.0.0.1:8000/create-paper", {
        paper_id: paperId,
        title: title,
        questions: formattedQuestions
      });

      alert("Paper created successfully");
      setPaperId("");
      setTitle("");
      setSelected([]);
    } catch (error) {
      console.error(error);
      alert("Error creating paper");
    }
  };

  return (
    <div>
      <h3>Create Paper</h3>

      <input
        placeholder="Paper ID"
        value={paperId}
        onChange={(e) => setPaperId(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Paper Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <h4>Select Questions</h4>

      {questions.map((q) => (
        <div key={q.question_id}>
          <input
            type="checkbox"
            checked={selected.includes(q.question_id)}
            onChange={() => toggleQuestion(q.question_id)}
          />
          {q.question_id} — {q.question_text}
        </div>
      ))}

      <br />

      <button onClick={handleCreate}>
        Create Paper
      </button>
    </div>
  );
}

export default CreatePaper;