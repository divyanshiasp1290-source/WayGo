import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgePercent, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, LoadingBlock } from "@/lib/admin-live";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCoupons,
});

type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState("10");
  const [validUntil, setValidUntil] = useState("");
  const [active, setActive] = useState(true);

  async function loadCoupons() {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadCoupons();
  }, []);

  function openCreate() {
    setEditing(null);
    setCode("");
    setDescription("");
    setDiscountType("percent");
    setDiscountValue("10");
    setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setActive(true);
    setOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    setCode(c.code);
    setDescription(c.description ?? "");
    setDiscountType(c.discount_type as "percent" | "flat");
    setDiscountValue(String(c.discount_value));
    setValidUntil(c.valid_until?.slice(0, 10) ?? "");
    setActive(c.active);
    setOpen(true);
  }

  async function save() {
    if (!code.trim()) return toast.error("Code is required");
    const value = Number(discountValue);
    if (!Number.isFinite(value) || value <= 0) return toast.error("Invalid discount value");

    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discount_type: discountType,
      discount_value: value,
      valid_until: validUntil || null,
      active,
    };

    const { error } = editing
      ? await supabase.from("coupons").update(payload).eq("id", editing.id)
      : await supabase.from("coupons").insert(payload);

    if (error) return toast.error(error.message);
    toast.success(editing ? "Coupon updated" : "Coupon created");
    setOpen(false);
    await loadCoupons();
  }

  async function remove(c: Coupon) {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    const { error } = await supabase.from("coupons").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Coupon deleted");
    await loadCoupons();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Coupons</h1>
          <p className="text-sm text-muted-foreground">Promotions shown on wallet and at checkout.</p>
        </div>
        <Button className="gap-1.5 bg-gradient-primary shadow-glow" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New coupon
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit coupon" : "New coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as "percent" | "flat")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent</SelectItem>
                    <SelectItem value="flat">Flat (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valid until</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <LoadingBlock label="Loading coupons..." />
      ) : coupons.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {coupons.map((c) => {
            const expired = c.valid_until ? new Date(c.valid_until).getTime() < Date.now() : false;
            const status = c.active && !expired ? "active" : "expired";
            const discountLabel =
              c.discount_type === "percent"
                ? `${c.discount_value}%`
                : `₹${Number(c.discount_value).toLocaleString("en-IN")}`;

            return (
              <Card key={c.id} className="border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800 dark:bg-green-900/50">
                      <BadgePercent className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-mono text-base font-bold text-green-900 dark:text-green-100">{c.code}</p>
                      <p className="text-xs text-green-800/80 dark:text-green-300/80">
                        {c.description || `${discountLabel} off`}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-700 text-white hover:bg-green-800">{discountLabel}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span>{c.used_count} uses · </span>
                    <span>Expires {formatDate(c.valid_until)} · </span>
                    <Badge variant={status === "active" ? "default" : "secondary"} className="ml-1">
                      {status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => void remove(c)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-sm text-muted-foreground">No coupons yet.</Card>
      )}
    </div>
  );
}
