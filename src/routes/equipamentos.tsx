import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Server } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/noc/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { nocApi, useEquipment, useProviders } from "@/lib/noc/store";
import type { Equipment, Vendor, Funcao } from "@/lib/noc/types";

export const Route = createFileRoute("/equipamentos")({
  head: () => ({
    meta: [
      { title: "Equipamentos · Sexta-feira NOC" },
      { name: "description", content: "Roteadores e OLTs gerenciados pelo NOC." },
      { property: "og:title", content: "Equipamentos · Sexta-feira NOC" },
      { property: "og:description", content: "Roteadores e OLTs gerenciados pelo NOC." },
    ],
  }),
  component: EquipmentPage,
});

const VENDORS: Vendor[] = ["MikroTik", "Huawei", "Datacom", "V-SOL"];
const FUNCOES: Funcao[] = ["Borda", "Concentrador PPPoE", "OLT"];

type FormState = { hostname: string; ip: string; vendor: Vendor; funcao: Funcao; providerId: string };
const empty: FormState = { hostname: "", ip: "", vendor: "MikroTik", funcao: "Borda", providerId: "" };

function EquipmentPage() {
  const equipment = useEquipment();
  const providers = useProviders();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [toDelete, setToDelete] = useState<Equipment | null>(null);

  const providerName = (id: string) => providers.find((p) => p.id === id)?.nome ?? "—";

  const openNew = () => { setEditing(null); setForm({ ...empty, providerId: providers[0]?.id ?? "" }); setOpen(true); };
  const openEdit = (e: Equipment) => { setEditing(e); setForm({ hostname: e.hostname, ip: e.ip, vendor: e.vendor, funcao: e.funcao, providerId: e.providerId }); setOpen(true); };

  const submit = () => {
    if (!form.hostname.trim() || !form.ip.trim()) { toast.error("Hostname e IP são obrigatórios"); return; }
    if (!form.providerId) { toast.error("Selecione um provedor"); return; }
    if (editing) { nocApi.updateEquipment(editing.id, form); toast.success("Equipamento atualizado"); }
    else { nocApi.createEquipment(form); toast.success("Equipamento criado"); }
    setOpen(false);
  };

  return (
    <PageShell
      title="Equipamentos de Rede"
      subtitle="Roteadores, concentradores e OLTs."
      actions={<Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Novo equipamento</Button>}
    >
      <Card className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Hostname</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">IP de Gerência</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Vendor</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Função</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Provedor</TableHead>
              <TableHead className="w-[120px] text-right font-mono-tech text-[11px] uppercase tracking-widest">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.length === 0 && (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Nenhum equipamento cadastrado.</TableCell></TableRow>
            )}
            {equipment.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2"><Server className="h-4 w-4 text-primary" /><span className="font-mono-tech">{e.hostname}</span></div>
                </TableCell>
                <TableCell className="font-mono-tech text-xs">{e.ip}</TableCell>
                <TableCell><Badge variant="outline" className="border-accent/40 text-accent">{e.vendor}</Badge></TableCell>
                <TableCell className="text-sm">{e.funcao}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{providerName(e.providerId)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setToDelete(e)} aria-label="Excluir"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar equipamento" : "Novo equipamento"}</DialogTitle>
            <DialogDescription>Cadastre um roteador ou OLT gerenciado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="host">Hostname</Label>
              <Input id="host" value={form.hostname} onChange={(e) => setForm({ ...form, hostname: e.target.value })} className="font-mono-tech text-sm" placeholder="brd-core-01" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ip">IP de Gerência</Label>
              <Input id="ip" value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} className="font-mono-tech text-sm" placeholder="10.0.0.1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Vendor</Label>
                <Select value={form.vendor} onValueChange={(v) => setForm({ ...form, vendor: v as Vendor })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VENDORS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Função</Label>
                <Select value={form.funcao} onValueChange={(v) => setForm({ ...form, funcao: v as Funcao })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FUNCOES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Provedor</Label>
              <Select value={form.providerId} onValueChange={(v) => setForm({ ...form, providerId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{providers.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
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
            <AlertDialogTitle>Remover equipamento?</AlertDialogTitle>
            <AlertDialogDescription>"{toDelete?.hostname}" será excluído do inventário.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toDelete) { nocApi.deleteEquipment(toDelete.id); toast.success("Removido"); setToDelete(null); } }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}