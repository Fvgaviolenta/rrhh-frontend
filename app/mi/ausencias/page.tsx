import TrabajadorShell from "@/components/common/TrabajadorShell";

export default function MiAusenciasPage() {
  return (
    <TrabajadorShell>
      <h1 className="text-2xl font-semibold">Solicitudes de ausencia</h1>
      <p className="mt-2 text-sm text-slate-600">
        Levanta y sigue tus solicitudes de inasistencia. La aprobación la hace tu jefatura.
      </p>
    </TrabajadorShell>
  );
}
