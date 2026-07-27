import React from "react";
import { ShieldCheck, User } from "lucide-react";
import { PAPER, INK, MUTED, RED, RED_DEEP } from "../lib/format";

export default function UsuariosTab({ profiles, currentUserId, onSetRole }) {
  return (
    <div>
      <p className="text-xs mb-4" style={{ color: "#e7b3b5" }}>
        Promova membros a Admin para que possam editar dados, ou rebaixe um Admin para Membro (somente visualização).
      </p>
      <div className="flex flex-col gap-2">
        {profiles.map((p) => {
          const isAdmin = p.role === "admin";
          const isSelf = p.id === currentUserId;
          return (
            <div key={p.id} className="rounded-2xl p-3 flex items-center justify-between" style={{ background: PAPER }}>
              <div className="min-w-0 flex items-center gap-2">
                {isAdmin ? <ShieldCheck size={18} color={RED} /> : <User size={18} color={MUTED} />}
                <div className="min-w-0">
                  <div className="font-medium truncate" style={{ color: INK }}>{p.email}</div>
                  <div className="text-[10px] uppercase" style={{ color: MUTED }}>{isAdmin ? "admin" : "membro"} {isSelf ? "· você" : ""}</div>
                </div>
              </div>
              <button
                disabled={isSelf}
                onClick={() => onSetRole(p.id, isAdmin ? "member" : "admin")}
                className="px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-40"
                style={{ background: isAdmin ? "#f1dede" : RED_DEEP, color: isAdmin ? "#a8342a" : "#fff" }}
              >
                {isAdmin ? "Tornar membro" : "Tornar admin"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
