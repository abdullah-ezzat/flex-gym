import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { GlassCard } from "@/renderer/components/ui/glass-card";
import { api } from "@/renderer/lib/api";
import { APP_NAME } from "@/renderer/lib/constants";
import { useAuthStore } from "./store";
import { jwtDecode } from "jwt-decode";

export default function LoginScreen() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((s) => s.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await api.login({ username, password });
      loginStore(token);

      const decoded: any = jwtDecode(token);

      if (decoded.forcePasswordChange) {
        navigate("/update-admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-[#000000] text-[#F5EDED]">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-linear-to-br from-[#D72323]/10 via-transparent to-[#D72323]/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-wide">{APP_NAME}</h1>
            <p className="text-sm text-neutral-400">
              Welcome back. Please sign in.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />

            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#D72323] text-center"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </GlassCard>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          Secure Gym Management System
        </p>
      </motion.div>
    </div>
  );
}
