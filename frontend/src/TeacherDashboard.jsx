import { useState } from "react";
import ClassOverview from "./teacher/ClassOverview";
import StudentList from "./teacher/StudentList";
import AddQuestion from "./teacher/AddQuestion";

function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div>
      <h2>Teacher Control Panel</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("overview")} style={{ marginRight: 10 }}>
          Class Overview
        </button>
        <button onClick={() => setActiveTab("students")} style={{ marginRight: 10 }}>
          Students
        </button>
        <button onClick={() => setActiveTab("add")}>
          Add Question
        </button>
      </div>

      {activeTab === "overview" && <ClassOverview />}
      {activeTab === "students" && <StudentList />}
      {activeTab === "add" && <AddQuestion />}
    </div>
  );
}

export default TeacherDashboard;