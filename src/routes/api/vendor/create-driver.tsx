import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/vendor/create-driver")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/api/vendor/create-driver"!</div>;
}
