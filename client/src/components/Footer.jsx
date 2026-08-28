import React from "react";
import heartRate from "../assets/images/heart-rate.jpg";

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
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "#linkedin",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: "#twitter",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "#youtube",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
    <>
      {/* Wave Divider */}
      <div className="relative w-full overflow-hidden bg-transparent leading-[0] -mb-px">
        <svg 
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block w-full h-[100px] md:h-[150px]"
        >
          <path 
            d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,64C1200,75,1320,85,1380,90.7L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
            fill="#0D3B66"
            stroke="none"
          />
        </svg>
      </div>

      {/* Main Footer */}
      <footer className="relative bg-[var(--serenity-900)] text-white pt-5 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heartRate} 
            alt="Footer Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--serenity-900)]/90 to-slate-950/60"></div>
        </div>

        {/* Newsletter Section */}
        <div className="relative z-10 container mx-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-5 sm:p-8 md:p-10 border border-white/20 shadow-2xl mb-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-center">
              <div className="md:col-span-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2">
                  Stay Updated with <span className="opacity-90 underline decoration-white/40 decoration-2">OncoCare</span>
                </h3>
                <p className="text-slate-200 text-sm">
                  Get the latest health tips, oncology news, and platform updates delivered to your inbox.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 md:mt-0">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="flex-1 px-4 py-2 lg:py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/20 transition-all duration-300 text-sm"
                />
                <button className="bg-white text-blue-900 hover:bg-slate-100 px-6 py-2 lg:py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 transform whitespace-nowrap text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-44 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Column 1: Brand & About */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 sm:gap-3 border-b-2 border-white pb-1">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-wide text-white">
                      OncoCare
                    </span>
                    <span className="text-[10px] sm:text-xs lg:text-sm text-gray-200 font-light">
                      Compassionate Oncology Care
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-200 text-sm leading-relaxed max-w-md">
                World-class cancer treatment and support services with cutting-edge technology and a patient-centered approach. Your health, our priority.
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-slate-100 border border-white/10">
                  <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  HIPAA Compliant
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-slate-100 border border-white/10">
                  <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  ISO 27001 Certified
                </span>
              </div>

              {/* Social Media Icons */}
              <div className="flex space-x-3 pt-3">
                {socialLinks.map((social) => (
                  <a 
                    key={social.name}
                    href={social.href} 
                    className="w-10 h-10 bg-white/10 hover:bg-white text-white hover:text-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-blue-900/20" 
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-5 border-b border-white/20 pb-2 inline-block">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-slate-200 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      <svg className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Patient Resources */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-5 border-b border-white/20 pb-2 inline-block">
                Patient Resources
              </h4>
              <ul className="space-y-3">
                {patientResources.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-slate-200 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      <svg className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Locations */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-5 border-b border-white/20 pb-2 inline-block">
                Our Locations
              </h4>
              <ul className="space-y-4">
                {locations.map((location) => (
                  <li key={location.city} className="text-slate-200 text-sm">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {location.city}
                    </div>
                    <p className="mt-1 text-xs text-slate-300">{location.address}</p>
                    <p className="text-xs text-slate-300">{location.phone}</p>
                    <p className="text-xs text-slate-400">{location.hours}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 border-t border-white/20 bg-black/10">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-xl md:text-2xl font-black text-white">10K+</div>
                <p className="text-xs text-slate-300 mt-1">Patients Served</p>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-white">50+</div>
                <p className="text-xs text-slate-300 mt-1">Specialist Doctors</p>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-white">24/7</div>
                <p className="text-xs text-slate-300 mt-1">Emergency Support</p>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-white">98%</div>
                <p className="text-xs text-slate-300 mt-1">Patient Satisfaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="relative z-10 bg-black/30 border-t border-white/10">
          <div className="container mx-auto px-4 md:px-6 py-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span>© {currentYear} OncoCare HMIS. All rights reserved.</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="text-white/20">|</span>
                <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
                <span className="text-white/20">|</span>
                <a href="#cookies" className="hover:text-white transition-colors">Cookie Settings</a>
                <span className="text-white/20">|</span>
                <a href="#contact" className="hover:text-white transition-colors">Report Issue</a>
              </div>

              <p className="flex items-center gap-1">
                Made with 
                <svg className="w-4 h-4 text-red-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
                for Cancer Care
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}