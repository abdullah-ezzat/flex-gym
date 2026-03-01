import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GlassCard } from "@/renderer/components/ui/glass-card";
import { Button } from "@/renderer/components/ui/button";
import BackButton from "@/renderer/components/ui/back-button";
import { api } from "@/renderer/lib/api";
import { motion } from "framer-motion";

export default function MemberDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState<any>(null);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;

      const result = await api.getMemberById(id);
      if (!mounted) return;

      setMember(result);

      const statsResult = await api.getMemberAttendanceStats(id);
      if (!mounted) return;
      setStats(statsResult);

      if (result?.photoPath) {
        const img = await api.getImage(result.photoPath);
        if (mounted) setPhotoSrc(img);
      }

      if (result?.qrCode) {
        const qr = await api.getImage(result.qrCode);
        if (mounted) setQrSrc(qr);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    await api.deleteMember(id);
    navigate("/dashboard/members");
  }

  if (loading) return <p>Loading...</p>;
  if (!member) return <p>Member not found</p>;

  const isActive = new Date(member.expiryDate) >= new Date();

  return (
    <GlassCard className="space-y-8">
      <div className="flex justify-between items-center">
        <BackButton />

        <div className="flex gap-3">
          <Button onClick={() => navigate(`/dashboard/members/${id}/edit`)}>
            Edit
          </Button>

          <Button variant="outline" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row gap-8"
      >
        {photoSrc ? (
          <img
            src={photoSrc}
            className="w-48 h-48 rounded-3xl object-cover border border-[#D72323]/30"
          />
        ) : (
          <div className="w-48 h-48 rounded-3xl bg-black flex items-center justify-center text-neutral-500 border border-[#D72323]/20">
            No Photo
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-[#F5EDED]">
            {member.fullName}
          </h2>
          <p>Id: FLEX_MEMBER_{member.id}</p>
          <p>Member Code: {member.memberCode}</p>
          <p>Phone: {member.phone}</p>
          <p>Email: {member.email}</p>
          <p>Address: {member.address}</p>
          <p>Plan: {member.plan}</p>
          <p>Expiry: {member.expiryDate.split("T")[0]}</p>

          <p className={isActive ? "text-green-400" : "text-red-400"}>
            {isActive ? "Active" : "Expired"}
          </p>
        </div>
      </motion.div>

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10"
        >
          <div className="p-6 rounded-2xl bg-[#3E3636]/40 border border-[#D72323]/20 backdrop-blur-xl">
            <p className="text-neutral-400 text-sm">Total Visits</p>
            <p className="text-3xl font-bold text-white mt-2">
              {stats.totalVisits}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#3E3636]/40 border border-[#D72323]/20 backdrop-blur-xl">
            <p className="text-neutral-400 text-sm">Today</p>
            <p className="text-3xl font-bold text-[#D72323] mt-2">
              {stats.visitsToday}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#3E3636]/40 border border-[#D72323]/20 backdrop-blur-xl">
            <p className="text-neutral-400 text-sm">This Month</p>
            <p className="text-3xl font-bold text-white mt-2">
              {stats.visitsThisMonth}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#3E3636]/40 border border-[#D72323]/20 backdrop-blur-xl">
            <p className="text-neutral-400 text-sm">Last Visit</p>
            <p className="text-sm text-white mt-2">
              {stats.lastVisit
                ? new Date(stats.lastVisit).toLocaleString()
                : "No visits yet"}
            </p>
          </div>
        </motion.div>
      )}

      {qrSrc && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-[#F5EDED]">
            Membership QR
          </h3>

          <img
            src={qrSrc}
            onClick={() => setShowQR(true)}
            className="w-48 rounded-2xl border border-[#D72323]/30 cursor-pointer hover:scale-105 transition"
          />

          <div className="flex gap-3">
            <a
              href={qrSrc}
              download={`${member.fullName}-${member.memberCode}-qr.png`}
              className="px-4 py-2 bg-[#D72323] text-white rounded-xl text-sm"
            >
              Download
            </a>

            <Button onClick={() => window.print()}>Print</Button>
          </div>
        </div>
      )}

      {showQR && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50"
          onClick={() => setShowQR(false)}
        >
          <img
            src={qrSrc!}
            className="w-96 rounded-3xl border border-[#D72323]/40 shadow-[0_0_60px_rgba(215,35,35,0.5)]"
          />
        </div>
      )}
    </GlassCard>
  );
}
