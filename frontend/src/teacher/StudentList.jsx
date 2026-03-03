import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function StudentList() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/students"
        );
        setStudents(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStudents();
  }, []);

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/student/${studentId}`
      );
      setSelectedStudent(studentId);
      setDetails(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h3>Student List</h3>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Average Mastery</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.student_id} onClick={() => fetchStudentDetails(s.student_id)}>
              <td>{s.student_id}</td>
              <td>{s.average_mastery}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {details && (
        <div style={{ marginTop: "30px" }}>
          <h4>Details for {selectedStudent}</h4>

          <h5>Current Mastery</h5>
          {Object.entries(details.mastery).map(([concept, score]) => (
            <div key={concept}>
              {concept}: {score}
            </div>
          ))}

          <h5>Weak Concepts</h5>
          {details.weak_concepts.length === 0
            ? "None 🎉"
            : details.weak_concepts.join(", ")}

          <h5>Trend</h5>
          {Object.entries(details.trend).map(([concept, data]) => (
            <div key={concept} style={{ marginBottom: "20px" }}>
              <strong>{concept}</strong>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={data.scores.map((score, index) => ({
                      attempt: index + 1,
                      score,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="attempt" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentList;