import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CalendarDays, Phone } from "lucide-react";
import { cn } from "@/renderer/lib/utils";
import { api } from "@/renderer/lib/api";
import { useState, useEffect } from "react";

interface Props {
  member: any;
}

export default function MemberCard({ member }: Props) {
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (member.photoPath) {
        const img = await api.getImage(member.photoPath);
        if (mounted) setPhotoSrc(img);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [member.photoPath]);

  const expiry = new Date(member.expiryDate);
  const today = new Date();
  const isActive = expiry >= today;

  const daysLeft = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const progress = daysLeft <= 0 ? 0 : Math.min((daysLeft / 30) * 100, 100);

  return (
    <Link to={`/dashboard/members/${member.id}`}>
      <motion.div
        whileHover={{ scale: 1.03, rotateX: 3, rotateY: -3 }}
        transition={{ type: "spring", stiffness: 200 }}
        className={cn(
          "relative overflow-hidden rounded-3xl p-6",
          "bg-gradient-to-br from-[#3E3636]/60 to-[#000000]/80",
          "border border-[#D72323]/20",
          "backdrop-blur-xl",
          "shadow-[0_0_40px_rgba(215,35,35,0.15)]",
          "hover:shadow-[0_0_60px_rgba(215,35,35,0.35)]",
          "transition-all duration-300",
        )}
      >
        {/* Neon glow border */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none border border-[#D72323]/10" />

        {/* Header */}
        <div className="flex items-center gap-4">
          {/* Photo */}
          {photoSrc ? (
            <div className="relative">
              <img
                src={photoSrc}
                alt={member.fullName}
                className="w-20 h-20 rounded-2xl object-cover border border-[#D72323]/40 shadow-[0_0_25px_rgba(215,35,35,0.25)]"
              />

              {/* Active glow */}
              {isActive && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 shadow-[0_0_15px_rgba(0,255,0,0.6)]" />
              )}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#000000] flex items-center justify-center text-neutral-500 text-xs border border-[#D72323]/20">
              No Photo
            </div>
          )}

          {/* Name + Plan */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#F5EDED] tracking-wide">
              #{member.memberCode} • {member.fullName}
            </h3>

            <p className="text-sm text-neutral-400 mt-1">{member.plan}</p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center gap-2 text-neutral-400">
            <Phone size={14} />
            {member.phone}
          </div>

          <div className="flex items-center gap-2 text-neutral-400">
            <CalendarDays size={14} />
            Expiry: {member.expiryDate.split("T")[0]}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 w-full bg-[#000000] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
              className={cn(
                "h-full rounded-full",
                isActive
                  ? "bg-gradient-to-r from-green-500 to-emerald-400"
                  : "bg-gradient-to-r from-red-600 to-[#D72323]",
              )}
            />
          </div>

          <p
            className={cn(
              "text-xs mt-2 font-medium",
              isActive ? "text-green-400" : "text-red-400",
            )}
          >
            {isActive ? `${daysLeft} days remaining` : "Expired"}
          </p>
        </div>

        {/* Hover Accent Line */}
        <motion.div
          layoutId="member-hover"
          className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#D72323] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </motion.div>
    </Link>
  );
}
