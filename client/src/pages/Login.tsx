import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginWithGoogle, loginWithEmail } from "../services/auth";
import { GoogleButton } from "../components/OAuthButtons";

export default function Login() {
  const { setAccessToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/";

  // Google Login Handler
  const onGoogleCredential = async (id_token: string) => {
    try {
      setLoading(true);
      const data = await loginWithGoogle(id_token);
      setAccessToken(data.accessToken);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await loginWithEmail(email, password);
      setAccessToken(data.accessToken);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-10">
        {/* 🔥 Replace this SVG with your final CK candle logo when ready */}
        <div className="flex items-center gap-2">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C10 5 8 7 8 9c0 2.21 1.79 4 4 4s4-1.79 4-4c0-2-2-4-4-7z"
              fill="#E8BA30"
            />
            <path
              d="M10 13h4v9h-4z"
              fill="#E8BA30"
              opacity="0.7"
            />
          </svg>
          <h1 className="text-[#E8BA30] font-serif font-bold text-3xl tracking-wide">
            Cozy Wick
          </h1>
        </div>
        <p className="text-gray-400 mt-2">Welcome back to warmth and light</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-gray-700">
        <h2 className="text-white text-2xl font-semibold text-center mb-6">Login to your account</h2>

        {error && (
          <div className="bg-red-500/20 text-red-300 text-sm text-center py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-gray-900 border border-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8BA30]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-gray-900 border border-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8BA30]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8BA30] hover:bg-[#cda028] text-gray-900 font-semibold rounded-md py-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-800 px-3 text-gray-400">or</span>
          </div>
        </div>

        {/* Google Login */}
        <GoogleButton onCredential={onGoogleCredential} />
      </div>

      {/* Footer */}
      <p className="text-gray-500 text-sm mt-6">
        Don’t have an account?{" "}
        <a href="/register" className="text-[#E8BA30] hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}
