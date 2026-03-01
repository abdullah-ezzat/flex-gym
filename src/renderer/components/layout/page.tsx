import { motion } from "framer-motion";
import Sidebar from "./sidebar";
import ParticleBackground from "../background/particles";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[var(--gym-black)] text-[var(--gym-light)]">
      {/* Background Layer */}
      <ParticleBackground />

      {/* Layout */}
      <div className="flex">
        <Sidebar />

        <main
          className="
            flex-1
            md:ml-72
            min-h-screen
            px-6 md:px-10 py-10
            bg-[var(--gym-black)]
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
