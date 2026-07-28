import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Building2, KeyRound, Server, Radio, ArrowRight } from "lucide-react";

import { PageShell } from "@/components/noc/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useProviders,
  useEquipment,
  useCredentials,
  useZabbixConfigs,
} from "@/lib/noc/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Sexta-feira NOC" },
      { name: "description", content: "Visão geral do NOC Sexta-feira: provedores, integrações Zabbix, equipamentos de rede e credenciais SSH." },
      { property: "og:title", content: "Dashboard · Sexta-feira NOC" },
      { property: "og:description", content: "Painel de controle do NOC Sexta-feira." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const providers = useProviders();
  const zabbix = useZabbixConfigs();
  const equipment = useEquipment();
  const credentials = useCredentials();

  const activos = providers.filter((p) => p.status === "ativo").length;

  const stats = [
    { label: "Provedores", value: providers.length, hint: `${activos} ativos`, icon: Building2, to: "/provedores" as const },
    { label: "Integrações Zabbix", value: zabbix.length, hint: "APIs vinculadas", icon: Radio, to: "/zabbix" as const },
    { label: "Equipamentos", value: equipment.length, hint: "roteadores + OLTs", icon: Server, to: "/equipamentos" as const },
    { label: "Credenciais SSH", value: credentials.length, hint: "cofre local", icon: KeyRound, to: "/credenciais" as const },
  ];

  return (
    <PageShell
      title="Central de Operações"
      subtitle="Panorama em tempo real da infraestrutura gerida pelo NOC Sexta-feira."
      actions={
        <Badge variant="outline" className="font-mono-tech border-primary/40 text-primary">
          <Activity className="mr-1 h-3 w-3" /> systems nominal
        </Badge>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="group">
            <Card className="surface-panel transition hover:border-primary/60 hover:shadow-[var(--shadow-glow)]">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </CardTitle>
                <s.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{s.value}</div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.hint}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="font-mono-tech text-sm uppercase tracking-widest text-muted-foreground">
            &gt; boot_log
          </CardTitle>
        </CardHeader>
        <CardContent className="font-mono-tech text-xs leading-relaxed text-muted-foreground space-y-1">
          <div><span className="text-primary">[OK]</span> conexão estabelecida com {providers.length} provedores</div>
          <div><span className="text-primary">[OK]</span> {zabbix.length} endpoints Zabbix respondendo</div>
          <div><span className="text-primary">[OK]</span> polling ativo em {equipment.length} equipamentos</div>
          <div><span className="text-accent">[i]</span> cofre SSH: {credentials.length} entradas cifradas</div>
          <div className="text-primary/70">&gt; aguardando próximo evento_</div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
