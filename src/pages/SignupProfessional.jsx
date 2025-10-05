import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupProfessional() {
  const apiUrl = import.meta.env.VITE_ENDPOINT_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profession: "",
  });
  const [idPhoto, setIdPhoto] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // ✅ new state

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (idPhoto) fd.append("idPhoto", idPhoto);
    if (selfie) fd.append("selfie", selfie);

    try {
      const res = await axios.post(`${apiUrl}/signup-professional`, fd);
      if (res.data.success) {
        setError("");
        setSuccess("Registered successfully!");
        setTimeout(() => {
          navigate("/"); // redirect to login after 3 sec
        }, 3000);
      } else {
        setError(res.data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 via-stone-100 to-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-xl w-[380px] space-y-3 border border-blue-200"
      >
        {/* Header */}
        <h1 className="text-xl font-bold text-center text-stone-800">
          Professional Signup
        </h1>
        <p className="text-center text-gray-500 text-sm">
          Create your professional account
        </p>

        {/* Error */}
        {error && (
          <div className="text-red-600 text-sm text-center bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="text-green-600 text-sm text-center bg-green-100 p-2 rounded">
            {success}
          </div>
        )}

        {/* Name + Profession */}
        <div className="flex gap-2">
          <input
            placeholder="Full Name"
            className="flex-1 min-w-0 border border-gray-300 p-2 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Profession"
            className="flex-1 min-w-0 border border-gray-300 p-2 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            onChange={(e) => setForm({ ...form, profession: e.target.value })}
            required
          />
        </div>

        {/* Email */}
        <input
          placeholder="Email"
          type="email"
          className="border border-gray-300 p-2 w-full rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        {/* Password */}
        <input
          placeholder="Password"
          type="password"
          className="border border-gray-300 p-2 w-full rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {/* File Uploads */}
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload ID Photo
            </label>
            <input
              type="file"
              className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white cursor-pointer file:mr-3 file:py-1 file:px-3 file:border file:rounded-md file:border-blue-600 file:text-blue-700 file:bg-blue-50 hover:file:bg-blue-100"
              onChange={(e) => setIdPhoto(e.target.files[0])}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Selfie
            </label>
            <input
              type="file"
              className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white cursor-pointer file:mr-3 file:py-1 file:px-3 file:border file:rounded-md file:border-blue-600 file:text-blue-700 file:bg-blue-50 hover:file:bg-blue-100"
              onChange={(e) => setSelfie(e.target.files[0])}
            />
          </div>
        </div>

        {/* Buttons */}
        <button
          type="submit"
          className="w-full bg-stone-700 text-white py-2 rounded-lg font-semibold shadow hover:bg-stone-800 transition"
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold shadow hover:bg-red-600 transition"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default SignupProfessional;
