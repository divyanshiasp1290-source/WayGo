export function shortId(id: string, prefix: string) {
  return `${prefix}-${id.slice(0, 6).toUpperCase()}`;
}

export function formatCurrency(amount: number | null | undefined) {
  return `Rs ${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "No expiry";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

export function monthLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(value));
}

export function relativeDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / 36e5));
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(value);
}

export function EmptyRows({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-8 text-center text-sm text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}

export function LoadingBlock({ label = "Loading live data..." }: { label?: string }) {
  return <div className="py-8 text-center text-sm text-muted-foreground">{label}</div>;
}
