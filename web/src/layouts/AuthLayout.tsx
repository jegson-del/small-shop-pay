import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '@/hooks/useAuth';

export function AuthLayout() {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation({
    onSuccess: () => navigate('/', { replace: true }),
  });
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-100 text-slate-900 py-2 px-4 sm:px-6 shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center no-underline min-h-[44px] min-w-[44px]">
            <img
              src="/small-shop-pay-logo.png"
              alt="SmallShopPay"
              className="h-10 sm:h-14 md:h-16 w-auto object-contain"
            />
          </Link>
          <nav className="flex items-center gap-4" aria-label="Account navigation">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium py-2 min-h-[44px] flex items-center transition-colors ${
                  isActive ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `text-sm font-medium py-2 min-h-[44px] flex items-center transition-colors ${
                  isActive ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Settings
            </NavLink>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-sm font-medium py-2 min-h-[44px] flex items-center text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-70"
            >
              {logoutMutation.isPending ? 'Signing out…' : 'Log out'}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>

      <footer className="py-6 px-6 border-t border-slate-200 bg-surface">
        <div className="max-w-6xl mx-auto">
          <nav className="flex flex-wrap justify-center gap-6 text-sm" aria-label="Footer">
            <Link to="/terms" className="text-slate-500 hover:text-slate-900 transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <a href="mailto:support@smallshoppay.com" className="text-slate-500 hover:text-slate-900 transition-colors">
              Support
            </a>
          </nav>
          <p className="text-center text-slate-400 text-xs mt-4">
            Powered by Stripe · UK only
          </p>
        </div>
      </footer>
    </div>
  );
}
