import { useState } from "react";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";

function App() {
  const [role, setRole] = useState("student");

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>AI Learning Analytics Platform</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setRole("student")}
          style={{ marginRight: "10px" }}
        >
          Student View
        </button>

        <button onClick={() => setRole("teacher")}>
          Teacher View
        </button>
      </div>

      {role === "student" && <StudentDashboard />}
      {role === "teacher" && <TeacherDashboard />}
    </div>
  );
}

export default App;