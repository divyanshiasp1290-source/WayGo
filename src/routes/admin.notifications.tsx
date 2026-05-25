import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Bell, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { relativeDate } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotifications,
});

type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

function AdminNotifications() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Notification[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  async function loadNotifications() {
    const [notificationsResult, profilesResult] = await Promise.all([
      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("profiles").select("*"),
    ]);
    setSent(notificationsResult.data ?? []);
    setProfiles(profilesResult.data ?? []);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    try {
      if (!profiles.length) throw new Error("No users found to notify.");
      const { error } = await supabase.from("notifications").insert(
        profiles.map((profile) => ({
          user_id: profile.user_id,
          title,
          message,
          type: "admin",
        })),
      );
      if (error) throw error;
      toast.success("Notification sent");
      e.currentTarget.reset();
      loadNotifications();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send notification");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Notifications</h1>
        <p className="text-sm text-muted-foreground">Compose and send platform-wide updates.</p>
      </div>

      <Card className="p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              name="title"
              id="title"
              required
              maxLength={100}
              placeholder="e.g. Festive 25% off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea name="message" id="message" required maxLength={300} rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aud">Audience</Label>
            <Input id="aud" value={`All users (${profiles.length})`} readOnly />
          </div>
          <Button
            type="submit"
            disabled={sending}
            className="gap-2 bg-gradient-primary shadow-glow"
          >
            <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send notification"}
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Bell className="h-4 w-4" /> Recently sent
        </h2>
        <div className="mt-3 divide-y text-sm">
          {sent.length ? (
            sent.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.message} - {relativeDate(s.created_at)}
                  </p>
                </div>
                <Badge variant={s.read ? "secondary" : "default"}>
                  {s.read ? "read" : "unread"}
                </Badge>
              </div>
            ))
          ) : (
            <p className="py-6 text-sm text-muted-foreground">No notifications sent yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
