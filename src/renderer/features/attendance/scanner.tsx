import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { GlassCard } from "@/renderer/components/ui/glass-card";
import { api } from "@/renderer/lib/api";
import MemberCard from "@/renderer/components/gym/member-card";

export default function QRScanner() {
  const containerId = "qr-reader";

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const cooldownRef = useRef(false);
  const mountedRef = useRef(true);
  const startingRef = useRef(false);
  const stoppingRef = useRef(false);

  const [status, setStatus] = useState<string | null>(null);
  const [member, setMember] = useState<any>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      try {
        const cams = await Html5Qrcode.getCameras();
        if (!mountedRef.current) return;

        if (!cams.length) {
          setStatus("No camera found");
          return;
        }

        setCameras(cams);
        setSelectedCamera(cams[0].id);
      } catch (e) {
        if (mountedRef.current) {
          setStatus("Camera permission denied");
        }
      }
    }

    init();

    return () => {
      mountedRef.current = false;
      stopScanner(true);
    };
  }, []);

  /* ---------------- CAMERA SWITCH ---------------- */

  useEffect(() => {
    if (!selectedCamera) return;

    startScanner(selectedCamera);

    return () => {
      stopScanner(true);
    };
  }, [selectedCamera]);

  /* ---------------- START SCANNER ---------------- */

  async function startScanner(cameraId: string) {
    if (startingRef.current) return;
    startingRef.current = true;

    await stopScanner();

    if (!mountedRef.current) {
      startingRef.current = false;
      return;
    }

    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        cameraId,
        {
          fps: 8,
          qrbox: 220,
          disableFlip: false,
        },
        async (decodedText) => {
          if (!mountedRef.current) return;
          if (cooldownRef.current) return;

          cooldownRef.current = true;
          playBeep();

          const found = await api.findMemberByQR(decodedText);

          if (!mountedRef.current) return;

          if (!found) {
            setFeedback("error");
            setStatus("Member not found");
            resetCooldown();
            return;
          }

          await api.logAttendance(found.id);

          if (!mountedRef.current) return;

          setMember(found);
          setFeedback("success");
          setStatus("Attendance logged");

          setTimeout(() => {
            if (!mountedRef.current) return;
            setMember(null);
            setStatus(null);
            setFeedback(null);
          }, 5000);

          resetCooldown();
        },
        () => {}
      );

      try {
        await scanner.applyVideoConstraints({
          advanced: [{ zoom: 2 }],
        });
      } catch {}

    } catch (err) {
      if (mountedRef.current) {
        setStatus("Camera failed");
      }
    }

    startingRef.current = false;
  }

  /* ---------------- STOP SCANNER ---------------- */

  async function stopScanner(force = false) {
    if (!scannerRef.current) return;
    if (stoppingRef.current) return;

    stoppingRef.current = true;

    const scanner = scannerRef.current;
    scannerRef.current = null;

    try {
      // isScanning prevents crash when stop called twice
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch {}

    try {
      await scanner.clear();
    } catch {}

    stoppingRef.current = false;
  }

  /* ---------------- HELPERS ---------------- */

  function resetCooldown() {
    setTimeout(() => {
      cooldownRef.current = false;
    }, 2000);
  }

  function playBeep() {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEA..."
    );
    audio.play().catch(() => {});
  }

  /* ---------------- UI ---------------- */

  return (
    <GlassCard className="space-y-6">
      <h2 className="text-lg font-semibold text-[#F5EDED]">
        Live Scanner
      </h2>

      <select
        value={selectedCamera || ""}
        onChange={(e) => setSelectedCamera(e.target.value)}
        className="w-full bg-[#3E3636] text-white rounded-xl p-2"
      >
        {cameras.map((cam) => (
          <option key={cam.id} value={cam.id}>
            {cam.label || "Camera"}
          </option>
        ))}
      </select>

      <div
        id={containerId}
        className={`relative rounded-2xl overflow-hidden border-2 ${
          feedback === "success"
            ? "border-green-500"
            : feedback === "error"
            ? "border-red-500"
            : "border-[#D72323]/30"
        }`}
      >
        <div className="absolute w-full h-1 bg-red-500 animate-pulse top-1/2" />
      </div>

      {status && (
        <div className="text-center text-white mt-4">
          {status}
          {member && (
            <MemberCard member={member} />
          )}
        </div>
      )}
    </GlassCard>
  );
}