import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Bus, Mail, Lock, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

import { useAuth, type AppRole } from "@/hooks/use-auth";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — WayGo" },
      {
        name: "description",
        content: "Sign in or create your WayGo account to book taxis and buses.",
      },
    ],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(128),
});
const signupSchema = credSchema.extend({
  fullName: z.string().trim().min(2, "Enter your name").max(100),
});
const emailSchema = z.object({ email: z.string().trim().email().max(255) });

function roleHome(roles: AppRole[]): string {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("vendor")) return "/vendor";
  if (roles.includes("driver")) return "/driver";
  return "/dashboard";
}

function authCallbackUrl() {
  return `${window.location.origin}/auth`;
}



function AuthPage() {
  const navigate = useNavigate();
  Route.useSearch();
  const { user, roles, rolesLoading, refreshRoles } = useAuth();
  const handledAuthCode = useRef(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");


  // signin/signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    if (user && !rolesLoading) {
      navigate({ to: roleHome(roles), replace: true });
    }
  }, [user, roles, rolesLoading, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code || handledAuthCode.current) return;
    handledAuthCode.current = true;

    setLoading(true);
    async function handleAuthCode() {
      const existing = await supabase.auth.getSession();
      if (existing.data.session) {
        await refreshRoles(existing.data.session.user);
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      await refreshRoles(data.session?.user ?? undefined);

    }

    handleAuthCode()
      .catch((err) => {
        handledAuthCode.current = false;
        toast.error(err instanceof Error ? err.message : "Could not verify sign-in link");
      })
      .finally(() => setLoading(false));
  }, [refreshRoles]);

  async function onSignIn(e: FormEvent) {
    e.preventDefault();
    const parsed = credSchema.safeParse({ email: email.toLowerCase(), password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          throw new Error("Please confirm your email before signing in.");
        }
        throw error;
      }
      if (!data.user) throw new Error("Sign in failed");
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function onSignUp(e: FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ email: email.toLowerCase(), password, fullName });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: authCallbackUrl(),
          data: { full_name: parsed.data.fullName, email: parsed.data.email },
        },
      });
      if (error) throw error;
      toast.success("Account created. If email confirmation is enabled, check your inbox.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="travel-shell">
      <div className="container mx-auto grid min-h-[calc(100vh-4rem)] gap-6 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="travel-surface p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#008cff]">
            <Bus className="h-3.5 w-3.5" /> WayGo travel
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Book with confidence.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600 md:text-base">
            Search, compare, and confirm taxis, shared rides, and buses in one premium booking journey.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              { title: "Flexible search", caption: "Route + date + trip type" },
              { title: "Live confirmations", caption: "Instant operator updates" },
              { title: "Secure payments", caption: "Protected checkout" },
              { title: "Traveler tracking", caption: "Booking status at a glance" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/88 p-4">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.caption}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-xl justify-self-center">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Bus className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Way<span className="text-primary">Go</span>
            </span>
          </Link>

          <div className="travel-surface p-6 shadow-elevated md:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Welcome</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in or create an account.

          </p>

          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>

            </TabsList>

            <TabsContent value="signin" className="mt-5">
              <form onSubmit={onSignIn} className="space-y-4">
                <Field
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />
                <Field
                  icon={Lock}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary shadow-glow"
                >
                  {loading ? "Please wait…" : "Sign in"}
                </Button>


              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={onSignUp} className="space-y-4">
                <Field
                  icon={UserIcon}
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  autoComplete="name"
                />
                <Field
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />
                <Field
                  icon={Lock}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary shadow-glow"
                >
                  {loading ? "Please wait…" : "Create account"}
                </Button>
              </form>
            </TabsContent>


          </Tabs>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing you agree to WayGo's terms and privacy policy.
          </p>
        </section>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  icon: typeof Mail;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
          autoComplete={autoComplete}
          required
        />
      </div>
    </div>
  );
}
