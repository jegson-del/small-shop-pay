import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-100 text-slate-900 py-2 px-4 sm:px-6 shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center">
          <Link to="/dashboard" className="flex items-center no-underline min-h-[44px] min-w-[44px]">
            <img
              src="/small-shop-pay-logo.png"
              alt="SmallShopPay"
              className="h-10 sm:h-14 md:h-16 w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
