import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Terminal, LogIn, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authApi, useAuth } from "@/lib/noc/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login · Sexta-feira NOC" },
      { name: "description", content: "Acesso ao painel administrativo do NOC Sexta-feira." },
      { property: "og:title", content: "Login · Sexta-feira NOC" },
      { property: "og:description", content: "Autenticação para o NOC Sexta-feira." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && pathname === "/login") {
      navigate({ to: "/", replace: true });
    }
  }, [isAuthenticated, pathname, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      authApi.login(identifier, password);
      navigate({ to: "/", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_50%_0%,var(--primary)/15,transparent_60%)]"
      />
      <Card className="surface-panel relative z-10 w-full max-w-md border-primary/20 shadow-[var(--shadow-glow)]">
        <CardHeader className="items-center space-y-4 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/40">
            <Terminal className="h-7 w-7" />
          </div>
          <div>
            <div className="font-mono-tech text-lg font-bold tracking-widest text-glow">
              SEXTA-FEIRA
            </div>
            <div className="font-mono-tech text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              NOC · autenticação
            </div>
          </div>
          <CardTitle className="text-base font-normal text-muted-foreground">
            &gt; identifique-se para acessar o console_
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier" className="font-mono-tech text-[11px] uppercase tracking-widest">
                Usuário ou e-mail
              </Label>
              <Input
                id="identifier"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="font-mono-tech text-sm"
                placeholder="noc.operator"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="font-mono-tech text-[11px] uppercase tracking-widest">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-mono-tech text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <Alert className="border-destructive/40 bg-destructive/10">
                <AlertDescription className="font-mono-tech text-xs text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="gap-2">
              <LogIn className="h-4 w-4" />
              {loading ? "autenticando..." : "Entrar"}
            </Button>

            <div className="mt-2 flex items-center gap-2 text-[11px] font-mono-tech text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              sessão local · token JWT fictício armazenado no navegador
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}