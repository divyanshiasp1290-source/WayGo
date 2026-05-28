import { Link } from "@tanstack/react-router";
import { Bus, Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Bus className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">
              Way<span className="text-primary">Go</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Premium intercity travel — taxis, sharing rides and buses, in one app.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-foreground">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Partners</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/driver" className="hover:text-foreground">
                Drivers
              </Link>
            </li>
            <li>
              <Link to="/vendor/signup" className="hover:text-foreground">
                Become a Vendor
              </Link>
            </li>
            <li>
              <Link to="/vendor/login" className="hover:text-foreground">
                Vendor Login
              </Link>
            </li>

          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Reach us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> hello@waygo.app
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Bengaluru, India
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} WayGo Travel. All rights reserved.
      </div>
    </footer>
  );
}
