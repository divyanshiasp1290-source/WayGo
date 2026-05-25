import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — WayGo" },
      {
        name: "description",
        content: "Get in touch with the WayGo team for support, partnerships, or press.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent. We'll get back to you within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 700);
  }

  return (
    <div className="bg-muted/30 pb-16">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            We'd love to hear from you
          </h1>
          <p className="mt-2 text-muted-foreground">
            Questions, feedback or partnership ideas — drop us a note and we'll reply soon.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required maxLength={255} />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" required maxLength={150} />
            </div>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" required maxLength={2000} rows={6} />
            </div>
            <Button
              type="submit"
              disabled={sending}
              size="lg"
              className="mt-5 w-full bg-gradient-primary shadow-glow"
            >
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>

          <aside className="space-y-3">
            {[
              { icon: Mail, title: "Email", value: "hello@waygo.app" },
              { icon: Phone, title: "Phone", value: "+91 98765 43210" },
              { icon: MessageCircle, title: "Live chat", value: "Mon–Sat, 9am – 9pm IST" },
              { icon: MapPin, title: "HQ", value: "WeWork, Bengaluru, India" },
            ].map((c) => (
              <div
                key={c.title}
                className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="text-sm text-muted-foreground">{c.value}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
