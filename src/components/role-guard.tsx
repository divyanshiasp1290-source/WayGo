import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  allow: AppRole[];
  children: ReactNode;
  loginTo?: "/auth" | "/vendor/login" | "/driver-login";
}

export function RoleGuard({ allow, children, loginTo = "/auth" }: RoleGuardProps) {
  const { user, loading, roles, rolesLoading, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      if (loginTo === "/auth") {
        navigate({ to: "/auth", search: { redirect: window.location.pathname } });
      } else {
        navigate({ to: loginTo });
      }
    }
  }, [loading, loginTo, user, navigate]);

  if (loading || rolesLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const allowed = allow.some((r) => hasRole(r));
  if (!allowed) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Access denied</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          You don't have permission to view this page. This area is restricted to {allow.join(", ")}{" "}
          accounts. Your roles: {roles.length ? roles.join(", ") : "none"}.
        </p>
        <Button className="mt-5" onClick={() => navigate({ to: "/" })}>
          Back home
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
