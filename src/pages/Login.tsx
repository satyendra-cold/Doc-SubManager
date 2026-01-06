import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setAuthenticatedUser = useAuthStore((state) => state.setAuthenticatedUser);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    try {
      setIsLoading(true);
      const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";
      if (!GOOGLE_SCRIPT_URL) {
        toast.error("Google Script URL is missing");
        return;
      }

      const url = new URL(GOOGLE_SCRIPT_URL);
      url.searchParams.set("sheet", "Pass");
      url.searchParams.set("_t", Date.now().toString());

      const response = await fetch(url.toString());
      const json = await response.json();

      if (!json.success || !Array.isArray(json.data)) {
        throw new Error("Failed to fetch login data");
      }

      const rows: any[][] = json.data.slice(1); // Skip header [Name, username, Password, Role]
      const foundRow = rows.find(row =>
        String(row[1] || "").trim() === username.trim() &&
        String(row[2] || "").trim() === password.trim()
      );

      if (foundRow) {
        const role = (foundRow[3] || "user").toLowerCase() as 'admin' | 'user';

        // Map permissions same as authStore defaults
        const permissions = role === 'admin'
          ? ['Dashboard', 'Document', 'Subscription', 'Loan', 'Calendar', 'Master', 'Settings']
          : ['Dashboard', 'Document', 'Calendar'];

        setAuthenticatedUser({
          id: foundRow[1], // username
          role: role,
          permissions: permissions
        });

        toast.success(`Welcome back, ${foundRow[0] || foundRow[1]}!`);
        navigate("/", { replace: true });
      } else {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Document & Subscription System
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-indigo-600 transition-colors" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-indigo-600 transition-colors" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all duration-200 ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md transform active:scale-95"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Powered by{' '}
            <a
              href="https://www.botivate.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Botivate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;