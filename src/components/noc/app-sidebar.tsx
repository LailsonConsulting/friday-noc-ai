import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Building2, Radio, Server, KeyRound, Terminal } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Provedores", url: "/provedores", icon: Building2 },
  { title: "Zabbix", url: "/zabbix", icon: Radio },
  { title: "Equipamentos", url: "/equipamentos", icon: Server },
  { title: "Credenciais SSH", url: "/credenciais", icon: KeyRound },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/40">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <div className="font-mono-tech text-sm font-bold text-glow tracking-wider">
              SEXTA-FEIRA
            </div>
            <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
              NOC · v1.0
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono-tech text-[10px] uppercase tracking-widest">
            Operações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
          <span className="font-mono-tech">Uplink estável</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}