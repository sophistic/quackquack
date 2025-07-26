"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { LogIn } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Auto-fetch email from localStorage when app starts
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setEmail(savedEmail);

      // ✅ Optionally auto-login if you want to skip login screen
      // handleLogin(savedEmail);
    }
  }, []);

  const handleLogin = async (providedEmail?: string) => {
    const userEmail = providedEmail || email;
    if (!userEmail) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/electron",
        { email: userEmail },
      );

      const data = response.data;
      console.log("Server response:", data);

      if (data.isPremium || data.isSudoUser) {
        // ✅ Save email to localStorage
        localStorage.setItem("userEmail", userEmail);
        onLogin();
      } else {
        setError("Access denied: Not a premium or sudo user.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-drag w-full max-w-sm mx-auto flex flex-col items-center justify-center p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-blue-500/30 border border-purple-400/20 shadow-lg shadow-purple-500/10">
      {/* Title */}
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6">
        Welcome Back
      </h2>

      {/* Email Input */}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-black/30 text-white rounded-xl px-4 py-3 mb-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all placeholder-gray-400"
      />

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
      )}

      {/* Login Button */}
      <button
        onClick={() => handleLogin()}
        disabled={loading || !email}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/40 hover:to-purple-500/40 border border-blue-400/30 hover:border-blue-400/50 px-4 py-3 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogIn size={18} />
        {loading ? "Checking..." : "Login"}
      </button>
    </div>
  );
}
