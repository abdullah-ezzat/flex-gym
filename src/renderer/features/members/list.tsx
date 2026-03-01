import { useEffect, useState } from "react";
import { Input } from "@/renderer/components/ui/input";
import { GlassCard } from "@/renderer/components/ui/glass-card";
import MemberCard from "@/renderer/components/gym/member-card";
import { api } from "@/renderer/lib/api";

export default function MembersListPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [search, status]);

  async function load() {
    setLoading(true);

    const result = await api.searchMembers({
      query: search,
      status,
      page: 1,
      limit: 50,
    });

    setMembers(result?.data ?? []);
    setLoading(false);
  }

  return (
    <GlassCard className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="
            rounded-xl
            bg-[#3E3636]
            text-[#F5EDED]
            border border-[#D72323]/20
            px-4 py-3 text-sm
          "
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="expiring">Expiring Soon</option>
        </select>
      </div>

      {loading && (
        <p className="text-neutral-400 text-sm">Loading members...</p>
      )}

      {!loading && members.length === 0 && (
        <p className="text-neutral-500 text-sm">No members found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
      </div>
    </GlassCard>
  );
}
