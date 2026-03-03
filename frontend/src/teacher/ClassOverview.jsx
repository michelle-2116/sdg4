import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ClassOverview() {
  const [data, setData] = useState([]);
  const [weakConcepts, setWeakConcepts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/class-analytics"
        );

        const mastery = response.data.class_mastery;

        const formatted = Object.keys(mastery).map((concept) => ({
          concept,
          score: mastery[concept],
        }));

        setData(formatted);
        setWeakConcepts(response.data.weak_concepts_classwide);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h3>Class Mastery Overview</h3>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="concept" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Bar dataKey="score" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h4>Class-Wide Weak Concepts</h4>
      {weakConcepts.length === 0
        ? "None 🎉"
        : weakConcepts.join(", ")}
    </div>
  );
}

export default ClassOverview;