"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { clearEmpresaContext } from "@/lib/auth/empresa";

const navItems = [
  { href: "/mi", label: "Inicio" },
  { href: "/mi/asistencia", label: "Horarios" },
  { href: "/mi/ausencias", label: "Ausencias" },
  { href: "/mi/liquidaciones", label: "Liquidaciones" },
];

export default function TrabajadorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-semibold">Mi espacio</p>
            <p className="text-xs text-slate-500">{session?.user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearEmpresaContext();
              signOut({ callbackUrl: "/ingresar" });
            }}
            className="rounded-md border px-3 py-1 text-sm hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                pathname === item.href ? "bg-slate-900 text-white" : "hover:bg-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="rounded-xl border bg-white p-6 shadow-sm">{children}</main>
      </div>
    </div>
  );
}
