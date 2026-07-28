import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/noc/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { nocApi, useProviders } from "@/lib/noc/store";
import type { Provider } from "@/lib/noc/types";

export const Route = createFileRoute("/provedores")({
  head: () => ({
    meta: [
      { title: "Provedores · Sexta-feira NOC" },
      { name: "description", content: "Cadastro de provedores de internet gerenciados pelo NOC." },
      { property: "og:title", content: "Provedores · Sexta-feira NOC" },
      { property: "og:description", content: "Cadastro de provedores de internet gerenciados pelo NOC." },
    ],
  }),
  component: ProvidersPage,
});

type FormState = { nome: string; descricao: string; status: boolean };
const empty: FormState = { nome: "", descricao: "", status: true };

function ProvidersPage() {
  const providers = useProviders();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [toDelete, setToDelete] = useState<Provider | null>(null);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Provider) => {
    setEditing(p);
    setForm({ nome: p.nome, descricao: p.descricao, status: p.status === "ativo" });
    setOpen(true);
  };

  const submit = () => {
    if (!form.nome.trim()) { toast.error("Nome obrigatório"); return; }
    const payload = { nome: form.nome.trim(), descricao: form.descricao.trim(), status: form.status ? "ativo" as const : "inativo" as const };
    if (editing) {
      nocApi.updateProvider(editing.id, payload);
      toast.success("Provedor atualizado");
    } else {
      nocApi.createProvider(payload);
      toast.success("Provedor criado");
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    nocApi.deleteProvider(toDelete.id);
    toast.success(`Provedor "${toDelete.nome}" removido`);
    setToDelete(null);
  };

  return (
    <PageShell
      title="Provedores"
      subtitle="ISPs gerenciados pela plataforma."
      actions={
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Novo provedor
        </Button>
      }
    >
      <Card className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Nome</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Descrição</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Status</TableHead>
              <TableHead className="w-[120px] text-right font-mono-tech text-[11px] uppercase tracking-widest">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Nenhum provedor cadastrado.
                </TableCell>
              </TableRow>
            )}
            {providers.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    {p.nome}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-md truncate">{p.descricao}</TableCell>
                <TableCell>
                  {p.status === "ativo" ? (
                    <Badge className="bg-primary/15 text-primary border border-primary/40 hover:bg-primary/20">Ativo</Badge>
                  ) : (
                    <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setToDelete(p)} aria-label="Excluir">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar provedor" : "Novo provedor"}</DialogTitle>
            <DialogDescription>Cadastre um ISP gerenciado pelo NOC.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: FibraNet Telecom" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} placeholder="Cobertura, região, notas operacionais..." />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <div>
                <Label htmlFor="status" className="cursor-pointer">Status ativo</Label>
                <p className="text-xs text-muted-foreground">Provedor disponível para operação</p>
              </div>
              <Switch id="status" checked={form.status} onCheckedChange={(v) => setForm({ ...form, status: v })} />
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
            <AlertDialogTitle>Excluir provedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá "{toDelete?.nome}" e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}