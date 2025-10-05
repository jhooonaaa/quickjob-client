import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Verify() {
  const apiUrl = import.meta.env.VITE_ENDPOINT_URL;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/verify`, { email, code });
      if (response.data.success) {
        if (response.data.role === "client") {
          navigate("/client-dashboard");
        } else if (response.data.role === "professional") {
          navigate("/professional-dashboard");
        }
      } else {
        setError("Invalid verification code.");
      }
    } catch (err) {
      setError("Verification failed.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-purple-200">
      <form
        onSubmit={handleVerify}
        className="bg-white p-6 rounded-2xl shadow-lg w-[420px] space-y-3"
      >
        <h1 className="text-xl font-bold text-center">Email Verification</h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm text-center">
            {error}
          </div>
        )}

        <input
          placeholder="Email"
          type="email"
          className="border p-2 w-full"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Verification Code"
          className="border p-2 w-full"
          onChange={(e) => setCode(e.target.value)}
        />

        {/* Verify Button */}
        <button
          type="submit"
          className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700"
        >
          Verify
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default Verify;
