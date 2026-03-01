import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { GlassCard } from "@/renderer/components/ui/glass-card";
import { useAuthStore } from "./store";
import { api } from "@/renderer/lib/api";

export default function UpdateAdminScreen() {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.updateAdmin({
        token: token!,
        username,
        password,
      });

      logout();
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <GlassCard className="p-10 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Update Admin Credentials
        </h1>

        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            placeholder="New Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            placeholder="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Credentials"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
