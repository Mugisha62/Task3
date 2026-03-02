import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role) {
      alert("Please select a role");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/register", form);
      alert("Registration successful!");
    } catch (err) {
      console.log(err.response?.data);
      alert("Error registering user");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      <input
        placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <select
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        defaultValue=""
      >
        <option value="" disabled>
          Select Role
        </option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" className="primary">Login</button>
    </form>
  );
}

export default Register;