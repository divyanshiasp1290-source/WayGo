import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VendorAuthShell } from "@/components/vendor-auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { resolveVendorLoginEmail } from "@/lib/vendor-auth-actions";

export const Route = createFileRoute("/vendor_/login")({
  head: () => ({
    meta: [
      { title: "Vendor Login - WayGo" },
      { name: "description", content: "Secure vendor sign in for WayGo fleet partners." },
    ],
  }),
  component: VendorLoginPage,
});

function VendorLoginPage() {
  const navigate = useNavigate();
  const { user, roles, rolesLoading, refreshRoles, signOut } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    async function redirectApprovedVendor() {
      if (!user || rolesLoading || !roles.includes("vendor")) return;
      const { data } = await supabase
        .from("vendor_profiles")
        .select("approval_status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.approval_status === "approved") navigate({ to: "/vendor", replace: true });
    }
    void redirectApprovedVendor();
  }, [navigate, roles, rolesLoading, user]);

  async function resolveEmail() {
    const value = identifier.trim().toLowerCase();
    const result = await resolveVendorLoginEmail({ data: { identifier: value } });
    return result.email;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!identifier.trim()) return toast.error("Email or mobile number is required");
    if (!password) return toast.error("Password is required");

    setLoading(true);
    try {
      const email = await resolveEmail();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Sign in failed");

      const { data: profile, error: profileError } = await supabase
        .from("vendor_profiles")
        .select("approval_status")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile) throw new Error("This account is not registered as a vendor");

      if (profile.approval_status !== "approved") {
        await supabase.auth.signOut();
        const messages = {
          pending: "Your vendor account is under admin review.",
          rejected: "Your vendor account was rejected. Contact support for the review details.",
          suspended: "Your vendor account is suspended. Contact support to restore access.",
          approved: "",
        };
        throw new Error(messages[profile.approval_status]);
      }

      await supabase.from("vendor_auth").update({ last_login_at: new Date().toISOString(), remember_me: remember }).eq("user_id", data.user.id);
      await refreshRoles(data.user);
      toast.success("Welcome back, vendor");
      navigate({ to: "/vendor", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Vendor login failed");
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    try {
      setForgotLoading(true);
      const email = await resolveEmail();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send password reset");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <VendorAuthShell
      title="Vendor sign in"
      subtitle="Access your fleet dashboard with a dedicated vendor login. Customer accounts cannot enter this panel."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Vendor Login</h2>
          <p className="text-sm text-muted-foreground">Only approved vendors can access the dashboard.</p>
        </div>

        <div className="space-y-2">
          <Label>Email or mobile number</Label>
          <div className="relative">
            {identifier.includes("@") ? (
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            ) : (
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="pl-9" autoComplete="username" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="px-9"
              autoComplete="current-password"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={remember} onCheckedChange={(checked) => setRemember(Boolean(checked))} />
            Remember me
          </label>
          <Button type="button" variant="link" className="h-auto p-0 text-sm" disabled={forgotLoading} onClick={() => void forgotPassword()}>
            Forgot password?
          </Button>
        </div>

        <Button type="submit" disabled={loading} className="w-full gap-2 bg-gradient-primary shadow-glow">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Checking approval..." : "Sign in to vendor dashboard"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New vendor?{" "}
          <Link to="/vendor/signup" className="font-medium text-primary">
            Become a Vendor
          </Link>
        </p>
      </form>
    </VendorAuthShell>
  );
}
