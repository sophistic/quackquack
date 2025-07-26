"use client";


import { useState, useEffect } from "react";
import axios from "axios";
import { LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    // const userEmail = providedEmail || email;
    // if (!userEmail) return;
    // setLoading(true);
    // setError("");
    // try {
    //   const response = await axios.post(
    //     "http://localhost:3000/api/user/electron",
    //     { email: userEmail },
    //   );
    //   const data = response.data;
    //   console.log("Server response:", data);
    //   if (data.isPremium || data.isSudoUser) {
    //     // ✅ Save email to localStorage
    //     localStorage.setItem("userEmail", userEmail);
    //     onLogin();
    //   } else {
    //     setError("Access denied: Not a premium or sudo user.");
    //   }
    // } catch (err) {
    //   console.error("Login failed:", err);
    //   setError("Something went wrong. Please try again.");
    // } finally {
    //   setLoading(false);
    // }
    onLogin();
  };

  return (
    
      <div className=" rounded-md  border border-border bg-card shadow-xl p-8 flex flex-col gap-6">
        <form
          className="flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Get started</label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              autoFocus
              className="bg-input border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
              required
            />
            {error && <div className="text-destructive text-xs mt-1">{error}</div>}
          </div>
          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full font-medium flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <LogIn size={18} />
            {loading ? "Checking..." : "Login"}
          </Button>
        </form>
      </div>
    
  );
}
