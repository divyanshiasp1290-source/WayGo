import { Link } from "@tanstack/react-router";
import { Bus, Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function SiteFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-blue-600/10 to-slate-900">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Stay Updated
            </h3>
            <p className="text-slate-400 mb-6">
              Subscribe to get exclusive offers, travel tips, and updates delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
              />
              <Button className="premium-btn px-8">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                Way<span className="text-blue-400">Go</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
              Your premium travel companion for booking taxis, buses, and car rentals with transparency, trust, and ease.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 font-medium">Follow us:</span>
              <div className="flex gap-2">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Instagram, label: "Instagram" },
                  { icon: Linkedin, label: "LinkedIn" },
                ].map((social) => (
                  <button
                    key={social.label}
                    className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5 text-slate-300 hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h4 className="font-bold text-white mb-6">For Partners</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/driver" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Drive with Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/vendor/signup" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link 
                  to="/vendor/login" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Vendor Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Partner Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-bold text-white mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Safety
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-8 py-8 border-t border-slate-800 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                <Mail className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400">Email us</p>
              <a href="mailto:hello@waygo.app" className="text-white font-semibold hover:text-blue-400 transition-colors">
                hello@waygo.app
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                <Phone className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400">Call us</p>
              <a href="tel:+919876543210" className="text-white font-semibold hover:text-blue-400 transition-colors">
                +91 98765 43210
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400">Visit us</p>
              <p className="text-white font-semibold">Bengaluru, India</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} WayGo Travel. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="text-slate-700">•</span>
              <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                Terms
              </Link>
              <span className="text-slate-700">•</span>
              <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
