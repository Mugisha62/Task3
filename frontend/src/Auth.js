import { useState } from "react";
import axios from "axios";

function Auth({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const register = async () => {
    await axios.post("http://localhost:5000/api/register", {
      name,
      email,
      password
    });
    alert("Registered successfully");
  };

  const login = async () => {
    const res = await axios.post("http://localhost:5000/api/login", {
      email,
      password
    });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={register}>Register</button>

      <h2>Login</h2>
      <button onClick={login}>Login</button>
    </div>
  );
}

export default Auth;