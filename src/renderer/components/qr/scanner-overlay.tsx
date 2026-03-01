import { motion } from "framer-motion";

export default function QRScannerOverlay() {
  return (
    <div className="relative w-64 h-64 border-2 border-red-500/30 rounded-xl overflow-hidden">
      <motion.div
        className="absolute left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_red]"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}
