import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Bus, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/driver-login")({
  head: () => ({
    meta: [
      { title: "Driver Login - WayGo" },
      { name: "description", content: "Private driver login for WayGo transport partners." },
    ],
  }),
  component: DriverLoginPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Enter your driver password").max(128),
});

function DriverLoginPage() {
  const navigate = useNavigate();
  const { user, roles, rolesLoading, refreshRoles, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || rolesLoading) return;
    if (roles.includes("driver")) {
      navigate({ to: "/driver", replace: true });
    } else if (roles.length) {
      toast.error("This login is only for driver accounts");
      void signOut();
    }
  }, [navigate, roles, rolesLoading, signOut, user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ email: email.toLowerCase(), password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) throw error;
      if (!data.user) throw new Error("Sign in failed");

      const { data: roleRows, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if (roleError) throw roleError;
      const nextRoles = (roleRows ?? []).map((row) => row.role);
      if (!nextRoles.includes("driver")) {
        await supabase.auth.signOut();
        throw new Error("This account is not a driver account");
      }

      await refreshRoles(data.user);
      toast.success("Welcome, driver");
      navigate({ to: "/driver", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Driver sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">
            Way<span className="text-primary">Go</span>
          </span>
        </Link>

        <div className="rounded-2xl border bg-card p-6 shadow-elevated md:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Driver Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the credentials created by your vendor.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="driver-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="driver-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-9"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="driver-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="driver-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-9"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
              {loading ? "Signing in..." : "Sign in to driver dashboard"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
