import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, KeyRound, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/noc/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { nocApi, useCredentials, useEquipment } from "@/lib/noc/store";
import type { SshCredential } from "@/lib/noc/types";

export const Route = createFileRoute("/credenciais")({
  head: () => ({
    meta: [
      { title: "Credenciais SSH · Sexta-feira NOC" },
      { name: "description", content: "Cofre de credenciais SSH atreladas aos equipamentos." },
      { property: "og:title", content: "Credenciais SSH · Sexta-feira NOC" },
      { property: "og:description", content: "Cofre de credenciais SSH atreladas aos equipamentos." },
    ],
  }),
  component: CredentialsPage,
});

type FormState = { equipmentId: string; usuario: string; senha: string };
const empty: FormState = { equipmentId: "", usuario: "", senha: "" };

function CredentialsPage() {
  const credentials = useCredentials();
  const equipment = useEquipment();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SshCredential | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [showFormPwd, setShowFormPwd] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [toDelete, setToDelete] = useState<SshCredential | null>(null);

  const eqLabel = (id: string) => {
    const e = equipment.find((x) => x.id === id);
    return e ? `${e.hostname} (${e.ip})` : "—";
  };

  const openNew = () => { setEditing(null); setForm({ ...empty, equipmentId: equipment[0]?.id ?? "" }); setShowFormPwd(false); setOpen(true); };
  const openEdit = (c: SshCredential) => { setEditing(c); setForm({ equipmentId: c.equipmentId, usuario: c.usuario, senha: c.senha }); setShowFormPwd(false); setOpen(true); };

  const submit = () => {
    if (!form.equipmentId) { toast.error("Selecione um equipamento"); return; }
    if (!form.usuario.trim() || !form.senha.trim()) { toast.error("Usuário e senha obrigatórios"); return; }
    if (editing) { nocApi.updateCredential(editing.id, form); toast.success("Credencial atualizada"); }
    else { nocApi.createCredential(form); toast.success("Credencial armazenada"); }
    setOpen(false);
  };

  return (
    <PageShell
      title="Credenciais SSH"
      subtitle="Cofre de acessos atrelados aos equipamentos gerenciados."
      actions={<Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Nova credencial</Button>}
    >
      <Alert className="border-destructive/40 bg-destructive/10">
        <ShieldAlert className="h-4 w-4 text-destructive" />
        <AlertTitle className="font-mono-tech uppercase tracking-widest text-xs">Área restrita</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          Senhas ficam ofuscadas por padrão. Trate esta tela como material confidencial.
        </AlertDescription>
      </Alert>

      <Card className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Equipamento</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Usuário</TableHead>
              <TableHead className="font-mono-tech text-[11px] uppercase tracking-widest">Senha</TableHead>
              <TableHead className="w-[120px] text-right font-mono-tech text-[11px] uppercase tracking-widest">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.length === 0 && (
              <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Nenhuma credencial cadastrada.</TableCell></TableRow>
            )}
            {credentials.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /><span className="font-mono-tech text-sm">{eqLabel(c.equipmentId)}</span></div>
                </TableCell>
                <TableCell className="font-mono-tech text-xs">{c.usuario}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="font-mono-tech text-xs">{revealed[c.id] ? c.senha : "••••••••••••"}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRevealed((r) => ({ ...r, [c.id]: !r[c.id] }))} aria-label="Mostrar/ocultar senha">
                      {revealed[c.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setToDelete(c)} aria-label="Excluir"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar credencial" : "Nova credencial SSH"}</DialogTitle>
            <DialogDescription>Vincule usuário e senha a um equipamento gerenciado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Equipamento</Label>
              <Select value={form.equipmentId} onValueChange={(v) => setForm({ ...form, equipmentId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.hostname} — {e.ip}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cred-user">Usuário</Label>
              <Input id="cred-user" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} className="font-mono-tech text-sm" autoComplete="off" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cred-pwd">Senha</Label>
              <div className="relative">
                <Input id="cred-pwd" type={showFormPwd ? "text" : "password"} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} className="font-mono-tech text-sm pr-9" autoComplete="new-password" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShowFormPwd((s) => !s)} aria-label="Mostrar senha">
                  {showFormPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit}>{editing ? "Salvar" : "Armazenar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover credencial?</AlertDialogTitle>
            <AlertDialogDescription>A credencial SSH deste equipamento será excluída do cofre.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toDelete) { nocApi.deleteCredential(toDelete.id); toast.success("Removida"); setToDelete(null); } }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}