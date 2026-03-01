import QRScanner from "./scanner";
import RecentAttendance from "./recent";
import { motion } from "framer-motion";

export default function AttendancePage() {
  return (
    <main className="relative flex-1 min-h-screen bg-black text-white overflow-hidden">
    
      <div className="relative p-8 space-y-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-4xl font-extrabold tracking-tight">
            Attendance Dashboard
          </h1>
          <p className="text-neutral-400 text-lg">
            Scan member QR codes and monitor live activity
          </p>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-10">
          
          {/* Scanner Area */}
          <div className="2xl:col-span-2">
            <QRScanner />
          </div>

          {/* Activity Feed */}
          <div>
            <RecentAttendance />
          </div>

        </div>
      </div>
    </main>
  );
}