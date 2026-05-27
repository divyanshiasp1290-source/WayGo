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
    <header className="sticky top-0 z-40 w-full glass-effect border-b border-white/10 transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow group-hover:shadow-premium-lg transition-all duration-300">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:inline">
            Way<span className="bg-gradient-primary bg-clip-text text-transparent">Go</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 md:flex absolute left-1/2 -translate-x-1/2">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 group"
          >
            Home
            <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-primary rounded-full transform scale-x-0 group-hover:scale-x-100 group-data-[status=active]:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          <Link
            to="/about"
            className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 group"
          >
            About
            <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-primary rounded-full transform scale-x-0 group-hover:scale-x-100 group-data-[status=active]:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          <Link
            to="/contact"
            className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 group"
          >
            Contact
            <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-primary rounded-full transform scale-x-0 group-hover:scale-x-100 group-data-[status=active]:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 group"
              >
                Bookings
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-primary rounded-full transform scale-x-0 group-hover:scale-x-100 group-data-[status=active]:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
              <Link
                to="/wallet"
                className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 group"
              >
                Wallet
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-primary rounded-full transform scale-x-0 group-hover:scale-x-100 group-data-[status=active]:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-white/20 hover:bg-white/10 hover-lift"
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden max-w-[120px] truncate sm:inline text-sm font-medium">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-effect-dark">
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
            <Button 
              size="sm" 
              className="premium-btn shadow-glow"
              onClick={() => navigate({ to: "/auth" })}
            >
              Sign in
            </Button>
          )}
        </div>

        {/* Mobile hamburger menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="glass-effect-dark">
              <DrawerHeader>
                <div className="flex items-center justify-between">
                  <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                      <Bus className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">WayGo</span>
                  </Link>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu" className="hover:bg-white/10">
                      <X className="h-5 w-5" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              <div className="p-4 space-y-3">
                <Link 
                  to="/" 
                  className="block px-4 py-3 text-base font-medium rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className="block px-4 py-3 text-base font-medium rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="block px-4 py-3 text-base font-medium rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Contact
                </Link>
                {user && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-3 text-base font-medium rounded-lg hover:bg-white/10 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Bookings
                    </Link>
                    <Link 
                      to="/wallet" 
                      className="block px-4 py-3 text-base font-medium rounded-lg hover:bg-white/10 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Wallet
                    </Link>
                  </>
                )}
                <div className="pt-4 border-t border-white/10">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-4 py-2 text-sm text-foreground/70 truncate">{user.email}</div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full border-white/20 hover:bg-white/10"
                        onClick={async () => {
                          await signOut();
                          navigate({ to: "/" });
                          setOpen(false);
                        }}
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      className="w-full premium-btn"
                      onClick={() => {
                        navigate({ to: "/auth" });
                        setOpen(false);
                      }}
                    >
                      Sign in
                    </Button>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
