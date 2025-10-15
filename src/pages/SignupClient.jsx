import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupClient() {
  const apiUrl = import.meta.env.VITE_ENDPOINT_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
  });
  const [idPhoto, setIdPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (idPhoto) fd.append("idPhoto", idPhoto);

    try {
      await axios.post(`${apiUrl}/signup-client`, fd);
      setMessage("✅ Client registered successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Signup failed:", err);
      setError("❌ Signup failed. Please check your input and try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-amber-100 via-stone-100 to-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-[420px] space-y-4 border border-amber-200"
      >
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-stone-800">
          Client Signup
        </h1>
        <p className="text-center text-gray-500 text-sm">
          Create your account as a client
        </p>
         {/* Success/Error Messages */}
        {message && (
          <p className="text-center text-sm text-green-600 mt-3">{message}</p>
        )}
        {error && (
          <p className="text-center text-sm text-red-600 mt-3">{error}</p>
        )}

        {/* Inputs */}
        <input
          placeholder="Full Name"
          className="border border-gray-300 p-3 w-full rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-amber-600 outline-none"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          type="email"
          className="border border-gray-300 p-3 w-full rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-amber-600 outline-none"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          className="border border-gray-300 p-3 w-full rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-amber-600 outline-none"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          placeholder="Contact"
          className="border border-gray-300 p-3 w-full rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-amber-600 outline-none"
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          required
        />

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Valid ID
          </label>
          <input
            type="file"
            className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white cursor-pointer file:mr-3 file:py-1 file:px-3 file:border file:rounded-md file:border-amber-600 file:text-amber-700 file:bg-amber-50 hover:file:bg-amber-100"
            onChange={(e) => setIdPhoto(e.target.files[0])}
          />
        </div>

        {/* Buttons */}
        <button
          type="submit"
          className="w-full bg-stone-700 text-white py-3 rounded-lg font-semibold shadow hover:bg-stone-800 transition"
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold shadow hover:bg-red-600 transition"
        >
          Cancel
        </button>


      </form>
    </div>
  );
}

export default SignupClient;
