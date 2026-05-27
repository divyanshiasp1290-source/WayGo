import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, Bus, Shield, Clock, Wallet, Star, MapPin, Zap, Users, Smartphone, Download, CheckCircle2, Trophy, MessageSquare } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WayGo — Premium Travel Booking Platform" },
      {
        name: "description",
        content:
          "Book Smarter Travel Experiences. Reliable taxis, buses & rentals with real-time availability and transparent pricing.",
      },
      { property: "og:title", content: "WayGo — Premium Travel Booking Platform" },
      {
        property: "og:description",
        content: "Search routes, compare operators, and book your next ride in seconds.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* ============================================================
           HERO SECTION - Premium Cinematic Design
           ============================================================ */}
      <section className="relative overflow-hidden min-h-[calc(100vh-64px)]">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Modern taxi and bus on a scenic highway"
            className="h-full w-full object-cover scale-105"
            loading="eager"
          />
          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-slate-900/40" />
          {/* Animated Gradient Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl float-animate" />
            <div className="absolute top-1/2 -left-32 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl float-animate" style={{ animationDelay: "2s" }} />
          </div>
        </div>

        {/* Hero Content */}
        <div className="container relative mx-auto px-4 h-full min-h-[calc(100vh-64px)] flex flex-col justify-center">
          <div className="mx-auto max-w-4xl w-full pt-12">
            {/* Trust Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl glass-effect">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-white">Trusted by 1M+ Travellers</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight fade-in">
              Book Smarter Travel
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
                Experiences
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg md:text-2xl text-white/90 max-w-2xl leading-relaxed fade-in">
              Reliable taxis, buses & rentals with real-time availability and transparent pricing.
            </p>

            {/* CTA Preview Text */}
            <div className="mt-8 flex items-center gap-2 text-white/80 fade-in">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">Instant booking • Live tracking • Best prices</span>
            </div>
          </div>

          {/* Premium Search Card - Floating */}
          <div className="mt-20 mb-16">
            <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 rounded-2xl glass-effect shadow-premium-xl hover-lift backdrop-blur-xl border border-white/10">
              <SearchForm />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-center">
            <div className="text-white/60 text-xs font-medium mb-2">Scroll to explore</div>
            <svg className="w-5 h-5 text-white/40 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ============================================================
           WHY CHOOSE US - Premium Features
           ============================================================ */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Why Choose WayGo
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need for a seamless travel experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Wallet,
                title: "Best Price Guarantee",
                desc: "Transparent fares with zero hidden fees. What you see is what you pay.",
              },
              {
                icon: Zap,
                title: "Instant Confirmation",
                desc: "Book and receive your ticket instantly. No waiting, no hassle.",
              },
              {
                icon: Shield,
                title: "Verified Operators",
                desc: "Only safety-checked, top-rated taxi and bus partners.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="premium-card p-8 hover-lift group"
              >
                <div className="premium-icon-wrapper mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           SERVICE TYPES - Taxis & Buses
           ============================================================ */}
      <section className="py-20 md:py-32 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Our Services
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Explore all types of travel options available
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Car,
                title: "Taxi & Car Rentals",
                desc: "Book sedans, SUVs, and premium vehicles for city travels and outstation trips.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Bus,
                title: "Bus Tickets",
                desc: "Reserve seats on AC sleepers, semi-sleepers, and premium Volvo coaches.",
                color: "from-purple-500 to-pink-500",
              },
            ].map((service, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl p-8 md:p-12 cursor-pointer group"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${service.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {service.desc}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                    <span>Explore more</span>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           POPULAR DESTINATIONS
           ============================================================ */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Popular Destinations
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Discover the most booked routes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { route: "Delhi ↔ Agra", price: "₹599", trips: "1.2K+" },
              { route: "Mumbai ↔ Pune", price: "₹399", trips: "2.1K+" },
              { route: "Bengaluru ↔ Mysuru", price: "₹299", trips: "1.8K+" },
              { route: "Chennai ↔ Pondicherry", price: "₹199", trips: "950+" },
            ].map((dest, i) => (
              <div key={i} className="premium-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="premium-icon-wrapper bg-gradient-to-br from-blue-100 to-purple-100">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{dest.route}</h4>
                <p className="text-sm text-slate-600 mb-4">{dest.trips} bookings</p>
                <div className="pt-4 border-t border-slate-200">
                  <span className="text-lg font-bold text-blue-600">
                    From {dest.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           OFFERS & PROMOTIONS
           ============================================================ */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Exclusive Offers
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Save big on your next trip
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Save 20% on Bus Tickets",
                desc: "Use code BUSTRAVEL20",
                discount: "20%",
                icon: Bus,
              },
              {
                title: "Flat ₹200 Off on Taxi",
                desc: "Minimum booking ₹500",
                discount: "₹200",
                icon: Car,
              },
              {
                title: "Double Rewards Points",
                desc: "Valid this week only",
                discount: "2x",
                icon: Trophy,
              },
            ].map((offer, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white hover-lift group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="inline-flex p-3 rounded-lg bg-white/10 mb-4">
                    <offer.icon className="h-6 w-6" />
                  </div>
                  <div className="text-4xl font-black mb-2">{offer.discount}</div>
                  <h4 className="text-lg font-bold mb-2">{offer.title}</h4>
                  <p className="text-sm text-white/70">{offer.desc}</p>
                  <div className="mt-6">
                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold">
                      Claim Offer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           TESTIMONIALS
           ============================================================ */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              What Our Users Love
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Real reviews from real travellers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                role: "Frequent Traveller",
                text: "Best platform for booking buses and taxis. The transparency in pricing and instant confirmation is amazing!",
                rating: 5,
              },
              {
                name: "Rahul Verma",
                role: "Business Commuter",
                text: "WayGo has made my daily commute so convenient. Reliable operators and excellent customer support.",
                rating: 5,
              },
              {
                name: "Anjali Patel",
                role: "Travel Enthusiast",
                text: "Comparing prices across operators was never this easy. Saved a lot on my recent trip!",
                rating: 5,
              },
            ].map((review, i) => (
              <div key={i} className="premium-card p-8">
                <div className="flex items-center gap-2 mb-4">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 italic">
                  "{review.text}"
                </p>
                <div className="border-t border-slate-200 pt-4">
                  <div className="font-semibold text-slate-900">{review.name}</div>
                  <div className="text-sm text-slate-600">{review.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           DOWNLOAD APP CTA
           ============================================================ */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-32 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Left Content */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
                  <Smartphone className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">Mobile App</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                  Book on the Go
                </h2>
                <p className="text-lg text-white/90 mb-8 leading-relaxed">
                  Download the WayGo app and enjoy exclusive app-only deals, instant bookings, and real-time tracking on all your trips.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-white text-blue-600 hover:bg-slate-50 font-semibold px-8 py-6 text-base">
                    <Download className="mr-2 h-5 w-5" />
                    App Store
                  </Button>
                  <Button className="bg-white text-blue-600 hover:bg-slate-50 font-semibold px-8 py-6 text-base">
                    <Download className="mr-2 h-5 w-5" />
                    Play Store
                  </Button>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">4.8/5 Stars</div>
                    <div className="text-sm text-white/80">From 150K+ reviews</div>
                  </div>
                </div>
              </div>

              {/* Right: QR Code Preview */}
              <div className="flex-1 flex justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-premium-xl">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QRCodePlaceholder />
                      <p className="text-xs text-slate-600 mt-3">Scan QR to download</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           FOOTER - Already exists, will keep current design
           ============================================================ */}
    </>
  );
}

function QRCodePlaceholder() {
  return (
    <svg className="w-32 h-32 text-blue-400" fill="currentColor" viewBox="0 0 100 100">
      <rect x="10" y="10" width="30" height="30" className="text-blue-600" fill="currentColor" />
      <rect x="60" y="10" width="30" height="30" className="text-blue-600" fill="currentColor" />
      <rect x="10" y="60" width="30" height="30" className="text-blue-600" fill="currentColor" />
      <circle cx="75" cy="75" r="8" className="text-blue-600" fill="currentColor" />
    </svg>
  );
}
