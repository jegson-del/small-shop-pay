import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="py-8 sm:py-10 border-t border-slate-200 mt-12 sm:mt-16">
      <nav className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm" aria-label="Legal and support">
        <Link to="/terms" className="text-slate-500 hover:text-slate-900 transition-colors py-2 min-h-[44px] flex items-center">
          Terms & Conditions
        </Link>
        <Link to="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors">
          Privacy Policy
        </Link>
        <a href="mailto:support@smallshoppay.com" className="text-slate-500 hover:text-slate-900 transition-colors py-2 min-h-[44px] flex items-center">
          Support
        </a>
      </nav>
      <p className="text-center text-slate-400 text-xs mt-4">
        Powered by Stripe · UK only
      </p>
    </footer>
  );
}
