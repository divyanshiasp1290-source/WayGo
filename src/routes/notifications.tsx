import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, CreditCard, Gift, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — WayGo" },
      { name: "description", content: "Trip updates, offers, and account activity." },
    ],
  }),
  component: NotificationsPage,
});

const ITEMS = [
  {
    icon: MapPin,
    title: "Driver assigned",
    body: "Suresh K. is heading to your pickup. ETA 6 min.",
    time: "2 min ago",
    unread: true,
  },
  {
    icon: CreditCard,
    title: "Payment received",
    body: "₹1,240 for Mumbai → Pune trip.",
    time: "1 hr ago",
    unread: true,
  },
  {
    icon: Gift,
    title: "Coupon for you",
    body: "Use WAYGO20 for 20% off your next sharing ride.",
    time: "Yesterday",
    unread: false,
  },
  {
    icon: Sparkles,
    title: "New: Sharing rides",
    body: "Save up to 60% on intercity travel by sharing your ride.",
    time: "2 days ago",
    unread: false,
  },
];

function NotificationsPage() {
  return (
    <div className="bg-muted/30 pb-16">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
              <Bell className="h-6 w-6" /> Notifications
            </h1>
            <p className="text-sm text-muted-foreground">Stay on top of your trips and offers.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        </div>

        <div className="mt-6 space-y-2">
          {ITEMS.map((n, i) => (
            <article
              key={i}
              className={`flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-soft transition-smooth hover:shadow-elevated ${n.unread ? "ring-1 ring-primary/30" : ""}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <n.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{n.title}</h3>
                  <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              </div>
              {n.unread && <Badge className="bg-primary">New</Badge>}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
