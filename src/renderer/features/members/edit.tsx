import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GlassCard } from "@/renderer/components/ui/glass-card";
import { Input } from "@/renderer/components/ui/input";
import { Button } from "@/renderer/components/ui/button";
import BackButton from "@/renderer/components/ui/back-button";
import { PLANS } from "@/renderer/lib/constants";
import { api } from "@/renderer/lib/api";

export default function MemberEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const result = await api.getMemberById(id);
      setForm(result);

      if (result?.photoPath) {
        const img = await api.getImage(result.photoPath);
        setPreview(img);
      }
    }
    load();
  }, [id]);

  if (!form) return <p>Loading...</p>;

  async function handleSave() {
    await api.updateMember(id!, form);
    navigate(`/dashboard/members/${id}`);
  }

  async function handleFileUpload(file: File) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      setPreview(base64);

      setForm((prev: any) => ({
        ...prev,
        photoBase64: base64,
      }));
    };

    reader.readAsDataURL(file);
  }

  async function handleCameraCapture() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    const video = document.createElement("video");
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/png");

    stream.getTracks().forEach((track) => track.stop());

    setPreview(base64);
    setForm({ ...form, photoBase64: base64 });
  }

  return (
    <GlassCard className="space-y-6">
      <BackButton />
      <h2 className="text-xl font-semibold text-[#F5EDED]">Edit Member</h2>

      {preview ? (
        <img
          src={preview}
          className="w-40 h-40 object-cover rounded-2xl border border-[#D72323]/30"
        />
      ) : (
        <div className="w-40 h-40 bg-black rounded-2xl border border-[#D72323]/20 flex items-center justify-center text-neutral-500">
          No Photo
        </div>
      )}

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => document.getElementById("photoInput")?.click()}
        >
          Upload Photo
        </Button>

        <Button variant="outline" onClick={handleCameraCapture}>
          Use Camera
        </Button>

        <input
          id="photoInput"
          type="file"
          hidden
          accept="image/*"
          onChange={(e) =>
            e.target.files && handleFileUpload(e.target.files[0])
          }
        />
      </div>

      <Input
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />

      <Input
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <Input
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <Input
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />

      <select
        value={form.plan}
        onChange={(e) => setForm({ ...form, plan: e.target.value })}
        className="bg-[#3E3636] text-[#F5EDED] rounded-xl p-3"
      >
        {PLANS.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      <Button onClick={handleSave} className="ms-4">Save Changes</Button>
    </GlassCard>
  );
}
