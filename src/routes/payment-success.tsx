import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Calendar, Download, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment-success")({
  head: () => ({
    meta: [
      { title: "Payment successful — WayGo" },
      {
        name: "description",
        content: "Your booking is confirmed. View ticket details and QR code.",
      },
    ],
  }),
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const ref = "WG" + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="travel-shell pb-16">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 shadow-premium-xl backdrop-blur">
          <div className="bg-gradient-hero p-8 text-center text-primary-foreground">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
              Confirmation ready
            </p>
            <h1 className="mt-2 text-2xl font-bold">Payment successful</h1>
            <p className="mt-1 text-white/85">
              Your booking is confirmed. A receipt is on its way.
            </p>
          </div>

          <div className="travel-surface space-y-4 p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <span className="text-sm text-muted-foreground">Booking reference</span>
              <span className="font-mono text-base font-semibold">{ref}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">From</p>
                <p className="flex items-center gap-1.5 font-semibold">
                  <MapPin className="h-3.5 w-3.5" /> Mumbai
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">To</p>
                <p className="flex items-center gap-1.5 font-semibold">
                  <MapPin className="h-3.5 w-3.5" /> Pune
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Departure</p>
                <p className="flex items-center gap-1.5 font-semibold">
                  <Calendar className="h-3.5 w-3.5" /> Today · 14:30
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total paid</p>
                <p className="font-semibold text-primary">₹1,240</p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed bg-muted/40 p-6 text-center">
              <div className="mx-auto h-32 w-32 rounded-lg bg-foreground/90 p-2">
                <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-px">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${(i * 7 + 3) % 3 === 0 ? "bg-background" : "bg-foreground/0"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Show this QR code at boarding</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Ticket
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
              <Button asChild className="bg-gradient-primary shadow-glow">
                <Link to="/dashboard">View bookings</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
