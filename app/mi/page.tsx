import TrabajadorShell from "@/components/common/TrabajadorShell";

export default function MiInicioPage() {
  return (
    <TrabajadorShell>
      <h1 className="text-2xl font-semibold">Hola</h1>
      <p className="mt-2 text-sm text-slate-600">
        Esta vista es exclusiva de tu empresa. Desde aquí puedes ver horarios, solicitar ausencias
        y consultar liquidaciones.
      </p>
    </TrabajadorShell>
  );
}
