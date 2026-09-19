import PlataformaShell from "@/components/common/PlataformaShell";

export default function PlataformaPage() {
  return (
    <PlataformaShell>
      <h1 className="text-2xl font-semibold">Operación de plataforma</h1>
      <p className="mt-2 text-sm text-slate-600">
        Vista de <code>OperadorSaaS</code>: empresas cliente, usuarios pendientes y soporte.
        Las métricas agregadas y KPI quedarán en una iteración posterior.
      </p>
    </PlataformaShell>
  );
}
