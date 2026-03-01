import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/renderer/lib/utils";
import { LayoutDashboard, Users, Activity, LogOut } from "lucide-react";
import { useAuthStore } from "@/renderer/features/auth/store";
import logo from "@/resources/public/flex.png";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Members", to: "/dashboard/members", icon: Users },
  { label: "Attendance", to: "/dashboard/attendance", icon: Activity },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside
      className="
        hidden md:flex flex-col
        w-72 h-screen fixed left-0 top-0
        bg-[var(--gym-black)]
        border-r border-[var(--gym-border)]
        px-6 py-8
        z-30
      "
    >
      {/* Logo Section */}
      <div className="mb-12 flex items-center gap-4">
        <motion.img
          src={logo}
          alt="Flex Gym Logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="
            w-20 h-20 object-contain
            drop-shadow-[0_0_20px_rgba(215,35,35,0.5)]
          "
        />

        <div>
          <h1 className="text-xl font-bold tracking-wide text-[var(--gym-light)]">
            FLEX GYM
          </h1>
          <div className="h-[2px] w-10 bg-[#D72323] mt-2 rounded-full" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.to} to={item.to}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={cn(
                    "relative flex items-center gap-4 px-4 py-3 rounded-xl",
                    "transition-all duration-300 ease-out",
                    isActive
                      ? "bg-[#3E3636] text-[#F5EDED] shadow-[0_0_20px_rgba(215,35,35,0.25)]"
                      : "text-neutral-400 hover:text-[#F5EDED] hover:bg-[#3E3636]/40",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-0 h-full w-1 bg-[#D72323] rounded-r"
                    />
                  )}

                  <Icon size={18} />
                  <span className="text-sm font-medium tracking-wide">
                    {item.label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="mt-auto pt-6 border-t border-[var(--gym-border)]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3
            px-4 py-3 rounded-xl
            text-neutral-400 hover:text-[#F5EDED]
            hover:bg-[#3E3636]/40
            transition-all duration-300
          "
        >
          <LogOut size={18} />
          <span className="text-sm font-medium tracking-wide">Logout</span>
        </motion.button>

        <div className="mt-6 text-xs text-neutral-600 text-center">
          © {new Date().getFullYear()} Flex Gym
        </div>
      </div>
    </aside>
  );
}
