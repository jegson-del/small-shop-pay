import { Outlet, Link } from 'react-router-dom';

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-50 text-slate-900 py-2 px-4 sm:px-6 shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center no-underline min-h-[44px] min-w-[44px]">
            <img
              src="/small-shop-pay-logo.png"
              alt="SmallShopPay"
              className="h-10 sm:h-14 md:h-16 w-auto object-contain"
            />
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/contact"
              className="text-slate-700 hover:text-primary font-medium text-sm no-underline min-h-[44px] flex items-center"
            >
              Contact
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-[#0949b8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 no-underline min-h-[44px]"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>

      <footer className="py-8 px-6 bg-slate-100 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-[#64748B] text-sm order-2 sm:order-1">
            © SmallShopPay · Tap to Pay for small shops
          </p>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <a
              href="https://www.linkedin.com/company/3ttechgroup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#64748B] hover:text-primary transition-colors"
              aria-label="3ttechgroup on LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <a
              href="https://x.com/3ttechgroup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#64748B] hover:text-primary transition-colors"
              aria-label="3ttechgroup on X"
            >
              <XIcon />
            </a>
          </div>
        </div>
        <p className="max-w-6xl mx-auto mt-4 pt-4 border-t border-slate-200 text-center text-[#64748B] text-xs">
          <Link to="/contact" className="text-[#64748B] hover:text-primary hover:underline">
            Contact us
          </Link>
          {' · '}
          Developed by{' '}
          <a
            href="https://www.3ttechgroup.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            3ttechgroup ltd
          </a>
        </p>
      </footer>
    </div>
  );
}
