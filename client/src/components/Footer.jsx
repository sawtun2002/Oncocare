import React from "react";
import heartRate from "../assets/heart-rate.jpg";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "About Us", href: "#about" },
    { label: "Our Services", href: "#services" },
    { label: "Medical Team", href: "#team" },
    { label: "Patient Portal", href: "#portal" },
    { label: "Careers", href: "#careers" },
    { label: "News & Events", href: "#news" },
  ];

  const patientResources = [
    { label: "Book Appointment", href: "#appointment" },
    { label: "Insurance Information", href: "#insurance" },
    { label: "Patient Forms", href: "#forms" },
    { label: "Billing & Payments", href: "#billing" },
    { label: "Test Results", href: "#results" },
    { label: "FAQs", href: "#faqs" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "#facebook",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: "#twitter",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "#linkedin",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "#instagram",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "#youtube",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
  ];

  const locations = [
    {
      city: "New York",
      address: "123 Medical Center Drive",
      phone: "+1 (212) 555-0100",
      hours: "Mon-Fri: 8AM - 8PM",
    },
    {
      city: "Los Angeles",
      address: "456 Healthcare Boulevard",
      phone: "+1 (310) 555-0100",
      hours: "Mon-Sat: 9AM - 7PM",
    },
    {
      city: "Chicago",
      address: "789 Wellness Avenue",
      phone: "+1 (312) 555-0100",
      hours: "Mon-Fri: 8AM - 6PM",
    },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heartRate})` }}
      />
      
      {/* Blue Transparent Overlay */}
      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-xs" />
      
      {/* Content */}
      <div className="relative z-10 text-white">
        {/* Main Footer Content */}
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">
                  OncoCare <span className="text-blue-400">HMIS</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-blue-100/90">
                Compassionate oncology care & health management. Providing world-class 
                cancer treatment and support services with cutting-edge technology 
                and a patient-centered approach.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-200">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                Your health, our priority
              </div>
              
              {/* Social Media Links */}
              <div className="flex gap-3 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="group rounded-lg bg-white/10 p-2.5 backdrop-blur-sm transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
                    aria-label={social.name}
                  >
                    <span className="text-blue-200 transition-colors group-hover:text-white">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group flex items-center text-sm text-blue-200 transition hover:text-white"
                    >
                      <span className="mr-2 inline-block h-1 w-1 rounded-full bg-blue-400 transition-all group-hover:w-3" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Patient Resources */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Patient Resources</h3>
              <ul className="space-y-2.5">
                {patientResources.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group flex items-center text-sm text-blue-200 transition hover:text-white"
                    >
                      <span className="mr-2 inline-block h-1 w-1 rounded-full bg-blue-400 transition-all group-hover:w-3" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Locations */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Our Locations</h3>
              <div className="space-y-4">
                {locations.map((location) => (
                  <div key={location.city} className="rounded-lg bg-white/5 p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-white">{location.city}</span>
                    </div>
                    <p className="mt-1 text-xs text-blue-200">{location.address}</p>
                    <p className="mt-0.5 text-xs text-blue-200">{location.phone}</p>
                    <p className="mt-0.5 text-xs text-blue-300">{location.hours}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 border-t border-white/20 pt-6">
            <div className="flex flex-col items-center justify-between gap-4 text-xs text-blue-200 sm:flex-row">
              <p>© {currentYear} OncoCare HMIS. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  HIPAA Compliant
                </span>
                <span className="h-1 w-1 rounded-full bg-blue-300" />
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ISO 27001 Certified
                </span>
                <span className="h-1 w-1 rounded-full bg-blue-300" />
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  24/7 Emergency
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}