import { useState } from "react";
import LoginPage from "./LoginPage";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";

function App() {
  const [user, setUser] = useState(null); // { id, role, name }

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  if (!user) return <LoginPage onLogin={handleLogin} />;
  if (user.role === "student") return <StudentDashboard user={user} onLogout={handleLogout} />;
  if (user.role === "teacher") return <TeacherDashboard user={user} onLogout={handleLogout} />;
}

export default App;