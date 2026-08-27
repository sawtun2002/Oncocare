export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-serenity-300/40 bg-serenity-100/25 text-serenity-700">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-base font-semibold text-serenity-900">
              OncoCare <span className="text-serenity-500">HMIS</span>
            </span>
            <p className="text-xs text-serenity-700/80">
              Compassionate oncology care & health management.
            </p>
          </div>

          {/* Quick Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-serenity-700">
            <a href="#privacy" className="transition hover:text-serenity-900">
              Privacy Policy
            </a>
            <a href="#terms" className="transition hover:text-serenity-900">
              Terms of Service
            </a>
            <a href="#support" className="transition hover:text-serenity-900">
              Support & Help Desk
            </a>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 border-t border-serenity-300/40 pt-6 text-center text-xs text-serenity-700/70">
          © {currentYear} OncoCare HMIS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
