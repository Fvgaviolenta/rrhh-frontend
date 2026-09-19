"use client";

import { clearEmpresaContext } from "@/lib/auth/empresa";
import { signOut } from "next-auth/react";

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        clearEmpresaContext();
        signOut({ callbackUrl: "/ingresar" });
      }}
      className={
        className ??
        "rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
      }
    >
      Cerrar sesión
    </button>
  );
}
