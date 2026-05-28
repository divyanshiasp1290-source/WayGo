import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "customer" | "driver" | "vendor" | "admin";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  rolesLoading: boolean;
  hasRole: (role: AppRole) => boolean;
  signOut: () => Promise<void>;
  refreshRoles: (currentUser?: User | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const loadRoles = useCallback(async (currentUser: User | null | undefined) => {
    if (!currentUser?.id) {
      setRoles([]);
      setRolesLoading(false);
      return;
    }
    setRolesLoading(true);
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id);
      setRoles((data ?? []).map((r) => r.role as AppRole));
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const refreshRoles = useCallback(
    (currentUser: User | null = user) => loadRoles(currentUser),
    [loadRoles, user],
  );

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setRolesLoading(Boolean(sess?.user));
      // Defer to avoid deadlock with auth client
      setTimeout(() => loadRoles(sess?.user), 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setRolesLoading(Boolean(data.session?.user));
      setLoading(false);
      loadRoles(data.session?.user);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadRoles]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        rolesLoading,
        hasRole: (role) => roles.includes(role),
        signOut: async () => {
          await supabase.auth.signOut();
        },
        refreshRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
