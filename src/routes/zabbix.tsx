import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Radio, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/noc/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { nocApi, useProviders, useZabbixConfigs } from "@/lib/noc/store";
import type { ZabbixConfig } from "@/lib/noc/types";

export const Route = createFileRoute("/zabbix")({
  head: () => ({
    meta: [
      { title: "Zabbix · Sexta-feira NOC" },
      { name: "description", content: "Integrações Zabbix vinculadas a cada provedor." },
      { property: "og:title", content: "Zabbix · Sexta-feira NOC" },
      { property: "og:description", content: "Integrações Zabbix vinculadas a cada provedor." },
    ],
  }),
  component: ZabbixPage,
});

type FormState = { providerId: string; apiUrl: string; usuario: string; token: string };
const empty: FormState = { providerId: "", apiUrl: "", usuario: "", token: "" };

function mask(t: string) { return t.length <= 6 ? "•".repeat(t.length) : `${"•".repeat(t.length - 4)}${t.slice(-4)}`; }

function ZabbixPage() {
  const providers = useProviders();
  const configs = useZabbixConfigs();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ZabbixConfig | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [showToken, setShowToken] = useState(false);
  const [toDelete, setToDelete] = useState<ZabbixConfig | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const providerName = (id: string) => providers.find((p) => p.id === id)?.nome ?? "—";

  const openNew = () => { setEditing(null); setForm(empty); setShowToken(false); setOpen(true); };
  const openEdit = (z: ZabbixConfig) => {
    setEditing(z);
    setForm({ providerId: z.providerId, apiUrl: z.apiUrl, usuario: z.usuario, token: z.token });
    setShowToken(false);
    setOpen(true);
  };

  const submit = () => {
    if (!form.providerId) { toast.error("Selecione um provedor"); return; }
    if (!form.apiUrl.trim() || !form.usuario.trim() || !form.token.trim()) {
      toast.error("Preencha todos os campos"); return;
    }
    const payload = { ...form };
    if (editing) {
      nocApi.updateZabbix(editing.id, payload);
      toast.success("Configuração atualizada");
    } else {
      nocApi.createZabbix(payload);
      toast.success("Configuração criada");
    }
    setOpen(false);
  };

  return (
    <PageShell
      title="Configurações Zabbix"
      subtitle="Vincule API, usuário e token a cada provedor."
      actions={
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Nova integração
        </Button>
      }
    >
      <Card className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Provedor</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">API URL</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Usuário</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Token</TableHead>
              <TableHead className="w-[120px] text-right font-mono-tech text-[11px] uppercase tracking-widest">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.length === 0 && (
              <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Nenhuma integração configurada.</TableCell></TableRow>
            )}
            {configs.map((z) => (
              <TableRow key={z.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2"><Radio className="h-4 w-4 text-accent" />{providerName(z.providerId)}</div>
                </TableCell>
                <TableCell className="font-mono-tech text-xs text-muted-foreground max-w-xs truncate">{z.apiUrl}</TableCell>
                <TableCell className="font-mono-tech text-xs">{z.usuario}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="font-mono-tech text-xs">{revealed[z.id] ? z.token : mask(z.token)}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRevealed((r) => ({ ...r, [z.id]: !r[z.id] }))} aria-label="Mostrar/ocultar token">
                      {revealed[z.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(z)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setToDelete(z)} aria-label="Excluir"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar integração" : "Nova integração Zabbix"}</DialogTitle>
            <DialogDescription>Vincule as credenciais de API ao provedor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Provedor</Label>
              <Select value={form.providerId} onValueChange={(v) => setForm({ ...form, providerId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {providers.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">API URL</Label>
              <Input id="url" value={form.apiUrl} onChange={(e) => setForm({ ...form, apiUrl: e.target.value })} placeholder="https://zabbix.exemplo.com/api_jsonrpc.php" className="font-mono-tech text-sm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user">Usuário</Label>
              <Input id="user" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} className="font-mono-tech text-sm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="token">Token</Label>
              <div className="relative">
                <Input id="token" type={showToken ? "text" : "password"} value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} className="font-mono-tech text-sm pr-9" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShowToken((s) => !s)} aria-label="Mostrar token">
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit}>{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover integração?</AlertDialogTitle>
            <AlertDialogDescription>A configuração Zabbix associada será excluída.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toDelete) { nocApi.deleteZabbix(toDelete.id); toast.success("Removido"); setToDelete(null); } }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}