import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Tasks from "./Tasks";
import Chat from "./Chat";
import "./styles.css";

function App() {
  const [user, setUser] = useState(null);

  // Auto login if user exists
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="container">
      <h1>Level 3 Full Stack App</h1>

      {!user ? (
        <>
          <div className="card">
            <Login setUser={setUser} />
          </div>

          <div className="card">
            <Register />
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <p>
              Welcome <strong>{user.name}</strong> ({user.role})
            </p>
            <button className="danger" onClick={logout}>
              Logout
            </button>
          </div>

          <div className="card">
            
            <Tasks />
          </div>

          {/* 🔥 THIS IS THE IMPORTANT FIX 🔥 */}
          <div className="card">
            <Chat />
          </div>
        </>
      )}
    </div>
  );
}

export default App;