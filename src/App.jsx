import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_ENDPOINT_URL;

  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showError, setShowError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
  try {
    const response = await axios.post(`${apiUrl}/login`, { email, password });

    if (response.data.success) {
      const userData = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };

      // ✅ Save to separate localStorage key depending on role
      if (userData.role === "admin") {
        localStorage.setItem("adminUser", JSON.stringify(userData));
        navigate("/admin-dashboard");
      } 
      else if (userData.role === "client") {
        localStorage.setItem("clientUser", JSON.stringify(userData));
        navigate("/client-dashboard");
      } 
      else if (userData.role === "professional") {
        localStorage.setItem("professionalUser", JSON.stringify(userData));
        navigate("/professional-dashboard");
      }
    } 
    else if (response.data.needsVerification && response.data.role !== "admin") {
      // only trigger verification for non-admin users
      setNeedsVerification(true);
      setShowError(response.data.message);
    } 
    else {
      setShowError("Invalid email or password");
    }
  } catch (error) {
    console.error("Login error:", error);
    setShowError("Login failed. Please try again.");
  }
};




  // ---------------- VERIFY ----------------
  const handleVerify = async () => {
  try {
    const res = await axios.post(`${apiUrl}/verify`, { email, code });

    if (res.data.success) {
      const userData = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      if (userData.role === "client") navigate("/client-dashboard");
      if (userData.role === "professional") navigate("/professional-dashboard");
    } else {
      setShowError(res.data.message);
    }
  } catch (err) {
    console.error(err);
    setShowError("Verification failed");
  }
};


  return (
    <div className="min-h-screen relative bg-gradient-to-br from-stone-100 via-amber-50 to-white">
      {/* Front Page */}
      <div className={`w-full h-screen flex flex-col justify-start items-center transition-all ${showLogin ? "blur-sm" : ""}`}>
        {/* Navbar */}
        <nav className="w-full flex justify-between items-center p-6 bg-white shadow-md fixed top-0 z-50">
          <div className="text-2xl font-bold text-stone-800 cursor-pointer">QuickJob</div>
          <ul className="flex gap-6 items-center text-stone-700 font-medium">
            <li>Home</li>
            <li>About Us</li>
            <li>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition"
              >
                Login
              </button>
            </li>
          </ul>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4 mt-24">
          <h1 className="text-5xl md:text-6xl font-extrabold text-stone-800 mb-6">
            Connect with Verified Professionals
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl">
            QuickJob is a web-based platform that connects verified professionals with clients. 
            Hire confidently and get the job done efficiently.
          </p>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-blur-sm bg-opacity-40">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl relative">
            <button
              onClick={() => {
                setShowLogin(false);
                setShowError("");
                setEmail("");
                setPassword("");
                setCode("");
                setNeedsVerification(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-3xl font-bold text-center mb-4">LOGIN</h2>
            <p className="text-center text-gray-500 text-sm mb-4">
              Please log in to your account
            </p>

            {showError && (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{showError}</div>
            )}

            {!needsVerification ? (
              <>
                {/* Email */}
                <div className="flex flex-col gap-1 mb-3">
                  <label className="text-gray-700 text-sm font-medium">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email || ""}
                    onChange={(e) => setEmail(e.target.value)}
                    className="outline-none border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-600 bg-gray-50 text-sm"
                    autoComplete="off"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1 mb-3">
                  <label className="text-gray-700 text-sm font-medium">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password || ""}
                    onChange={(e) => setPassword(e.target.value)}
                    className="outline-none border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-600 bg-gray-50 text-sm"
                    autoComplete="off"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full bg-stone-700 text-white py-3 font-semibold text-base rounded-lg shadow-md hover:bg-stone-800 transition mb-2"
                >
                  Log In
                </button>

                {/* Signup Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/signup-client")}
                    className="w-1/2 bg-amber-600 text-white py-2 text-sm font-medium rounded-lg shadow hover:bg-amber-700 transition"
                  >
                    Register as Client
                  </button>
                  <button
                    onClick={() => navigate("/signup-professional")}
                    className="w-1/2 bg-stone-600 text-white py-2 text-sm font-medium rounded-lg shadow hover:bg-stone-700 transition"
                  >
                    Register as Professional
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Verification */}
                <button
                  onClick={() => {
                    setNeedsVerification(false);
                    setShowError("");
                    setCode("");
                  }}
                  className="flex items-center text-gray-600 text-sm mb-3 hover:text-green-700 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 mr-1"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Login
                </button>

                <div className="flex flex-col gap-1 mb-3">
                  <label className="text-gray-700 text-sm font-medium">Verification Code</label>
                  <input
                    type="text"
                    placeholder="Enter code from email"
                    value={code || ""}
                    onChange={(e) => setCode(e.target.value)}
                    className="outline-none border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-600 bg-gray-50 text-sm"
                    autoComplete="off"
                  />
                </div>

                <button
                  onClick={handleVerify}
                  className="w-full bg-green-700 text-white py-3 font-semibold text-base rounded-lg shadow-md hover:bg-green-800 transition"
                >
                  Verify & Continue
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
