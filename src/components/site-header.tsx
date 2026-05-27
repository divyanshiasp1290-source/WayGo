import { Link, useNavigate } from "@tanstack/react-router";
import { Bus, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerOverlay,
} from "@/components/ui/drawer";
import { useState } from "react";

export function SiteHeader() {
  const { user, signOut, hasRole } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Way<span className="text-primary">Go</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground data-[status=active]:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground data-[status=active]:text-foreground"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground data-[status=active]:text-foreground"
          >
            Contact
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground data-[status=active]:text-foreground"
              >
                Bookings
              </Link>
              <Link
                to="/wallet"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground data-[status=active]:text-foreground"
              >
                Wallet
              </Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden max-w-[120px] truncate sm:inline">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                  My Bookings
                </DropdownMenuItem>
                {hasRole("driver") && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/driver" })}>
                    Driver panel
                  </DropdownMenuItem>
                )}
                {hasRole("vendor") && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/vendor" })}>
                    Vendor panel
                  </DropdownMenuItem>
                )}
                {hasRole("admin") && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    Admin panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="bg-primary" onClick={() => navigate({ to: "/auth" })}>
              Sign in
            </Button>
          )}

        </div>

        {/* Mobile actions: hamburger + drawer */}
        <div className="flex items-center gap-2 md:hidden">
          <Drawer open={open} onOpenChange={(v) => setOpen(v)}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <div className="flex items-center justify-between">
                  <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                      <Bus className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">WayGo</span>
                  </Link>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X className="h-5 w-5" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              <div className="p-4 space-y-3">
                <Link to="/" className="block text-lg font-medium">
                  Home
                </Link>
                <Link to="/about" className="block text-lg font-medium">
                  About
                </Link>
                <Link to="/contact" className="block text-lg font-medium">
                  Contact
                </Link>
                {user ? (
                  <Button size="sm" onClick={() => navigate({ to: "/dashboard" })}>
                    My Bookings
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => navigate({ to: "/auth" })}>
                    Sign in
                  </Button>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
