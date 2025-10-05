import { useNavigate } from "react-router-dom";

export default function FrontPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-stone-800 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
          QuickJob
        </div>
        <ul className="flex gap-6 items-center">
          <li className="cursor-pointer hover:text-amber-400" onClick={() => navigate("/")}>
            Home
          </li>
          <li className="cursor-pointer hover:text-amber-400" onClick={() => navigate("/about")}>
            About Us
          </li>
          <li>
            <button
              onClick={() => navigate("/login")}
              className="bg-amber-500 text-stone-900 px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition"
            >
              Login
            </button>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center bg-gradient-to-br from-stone-100 via-amber-50 to-white px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-stone-800 mb-4">
          Connect with Verified Professionals
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
          QuickJob is a web-based platform that connects verified professionals with clients efficiently and securely.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-stone-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-stone-800 transition"
        >
          Login
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-stone-800 text-white text-center py-4">
        &copy; {new Date().getFullYear()} QuickJob. All rights reserved.
      </footer>
    </div>
  );
}
