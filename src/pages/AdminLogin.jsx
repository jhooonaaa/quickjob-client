import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_ENDPOINT_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${apiUrl}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.user.role === "admin") {
        localStorage.setItem("admin", JSON.stringify(data.user));
        navigate("/admin-dashboard");
      } else {
        alert("Invalid admin credentials");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      alert("Login failed, try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-amber-50 to-white">
      <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

         <button
    type="button"
    onClick={handleLogin}
    className="w-full bg-stone-700 text-white py-3 rounded-lg hover:bg-stone-800"
  >
    Login
  </button>
      </form>
    </div>
  );
}

export default AdminLogin;
