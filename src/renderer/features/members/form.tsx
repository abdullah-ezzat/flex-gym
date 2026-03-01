import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/renderer/components/ui/glass-card";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { PLANS } from "@/renderer/lib/constants";
import { calculateExpiry } from "@/renderer/lib/date";
import { api } from "@/renderer/lib/api";

export default function MemberForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    plan: PLANS[0].name,
    photoBase64: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const selectedPlan = PLANS.find((p) => p.name === form.plan)!;

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  // --------------------------
  // FILE UPLOAD
  // --------------------------
  function handleFileUpload(file: File) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (!base64) return;

      setPhotoPreview(base64);

      setForm((prev: any) => ({
        ...prev,
        photoBase64: base64,
      }));
    };

    reader.readAsDataURL(file);
  }

  // --------------------------
  // START CAMERA
  // --------------------------
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      setCameraMode(true);

      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error("Camera failed:", err);
      alert("Camera permission denied or unavailable.");
    }
  }

  // --------------------------
  // CAPTURE
  // --------------------------
  function capturePhoto() {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

    const base64 = canvas.toDataURL("image/png");

    stopCamera();
    setCameraMode(false);

    setPhotoPreview(base64);

    setForm((prev: any) => ({
      ...prev,
      photoBase64: base64,
    }));
  }

  function cancelCamera() {
    stopCamera();
    setCameraMode(false);
  }

  // --------------------------
  // SUBMIT
  // --------------------------
  async function submit() {
    if (!form.fullName || !form.phone) return;

    setLoading(true);

    const startDate = new Date().toISOString();
    const expiryDate = calculateExpiry(
      startDate,
      selectedPlan.duration
    );

    await api.createMember({
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      address: form.address,
      plan: selectedPlan.name,
      price: selectedPlan.price,
      startDate,
      expiryDate,
      photoPath: form.photoBase64,
    });

    setLoading(false);
    navigate("/dashboard/members");
  }

  return (
    <GlassCard className="space-y-8">
      <h2 className="text-xl font-semibold">
        Register New Member
      </h2>

      {/* BASIC INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) =>
            setForm({ ...form, fullName: e.target.value })
          }
        />
        <Input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />
        <Input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />
        <Input
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
        />
      </div>

      {/* PLAN */}
      <select
        value={form.plan}
        onChange={(e) =>
          setForm({ ...form, plan: e.target.value })
        }
        className="w-full rounded-xl bg-[#3E3636] text-[#F5EDED] p-3"
      >
        {PLANS.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name} - ${p.price}
          </option>
        ))}
      </select>

      {/* PHOTO */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() =>
              document.getElementById("photoInput")?.click()
            }
          >
            Upload Photo
          </Button>

          <Button variant="outline" onClick={startCamera}>
            Use Camera
          </Button>

          <input
            id="photoInput"
            type="file"
            hidden
            accept="image/*"
            onChange={(e) =>
              e.target.files &&
              handleFileUpload(e.target.files[0])
            }
          />
        </div>

        {cameraMode && (
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-xl w-full"
            />
            <div className="flex gap-4">
              <Button onClick={capturePhoto}>Capture</Button>
              <Button variant="outline" onClick={cancelCamera}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {photoPreview && (
          <img
            src={photoPreview}
            className="rounded-xl w-40 h-40 object-cover"
          />
        )}
      </div>

      <Button onClick={submit} disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Member"}
      </Button>
    </GlassCard>
  );
}