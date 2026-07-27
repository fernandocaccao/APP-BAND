import React from "react";
import { X, Plus, Minus } from "lucide-react";
import { RED, RED_DEEP, PAPER, MUTED, MUTED_ON_RED } from "../lib/format";

export function StripeDivider({ height = 20 }) {
  return (
    <div
      style={{
        height,
        backgroundImage: `repeating-linear-gradient(90deg, ${RED} 0px, ${RED} 28px, ${RED_DEEP} 28px, ${RED_DEEP} 56px)`,
      }}
      className="w-full"
    />
  );
}

export function LoadingScreen({ label = "carregando súmula..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: RED_DEEP }}>
      <span style={{ fontFamily: "Anton", color: "#fff", fontSize: 22 }}>{label}</span>
    </div>
  );
}

export function JerseyBadge({ numero, foto, size = 56 }) {
  if (foto) {
    return (
      <img
        src={foto}
        alt=""
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size, border: "3px solid #ffffff", boxShadow: "0 0 0 2px " + RED }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 30%, ${RED}, ${RED_DEEP})`,
        border: "3px solid #ffffff",
      }}
    >
      <span style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: size * 0.4 }}>{numero || "-"}</span>
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, color = RED_DEEP, disabled = false }) {
  return (
    <div className="flex items-center gap-2">
      <button
        disabled={disabled}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition disabled:opacity-40"
        style={{ background: "#e7e2d3", color }}
      >
        <Minus size={14} strokeWidth={3} />
      </button>
      <span className="w-6 text-center font-semibold" style={{ fontFamily: "Anton, sans-serif", color, fontSize: 18 }}>
        {value}
      </span>
      <button
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition disabled:opacity-40"
        style={{ background: color, color: "#fff" }}
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  );
}

export function AddButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 font-medium"
      style={{ borderColor: "rgba(255,255,255,0.5)", color: MUTED_ON_RED }}
    >
      <Plus size={18} /> {label}
    </button>
  );
}

export function SummaryCard({ label, value, highlight }) {
  return (
    <div className="rounded-2xl p-3 text-center" style={{ background: highlight ? RED : PAPER }}>
      <div className="text-[10px] uppercase tracking-wide" style={{ color: highlight ? "#ffd9da" : MUTED }}>
        {label}
      </div>
      <div className="font-semibold text-sm mt-1" style={{ color: highlight ? "#fff" : "#2b2320", fontFamily: "Anton" }}>
        {value}
      </div>
    </div>
  );
}

export function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 flex items-end justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto" style={{ background: PAPER, maxWidth: 480 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: "Anton", color: "#2b2320", fontSize: 20 }}>{title}</h2>
          <button onClick={onClose}>
            <X size={20} color={MUTED} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputStyle = { background: "#fff", border: "1px solid #e0d3d1", color: "#2b2320" };

export function resizeImageFile(file, maxWidth = 400, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
