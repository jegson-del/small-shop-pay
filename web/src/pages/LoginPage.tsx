import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMeQuery } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;
  const { data: user, isSuccess: isAuthenticated } = useMeQuery();

  const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const redirectTo = from?.pathname && from.pathname !== '/login'
    ? `${from.pathname}${from.search ?? ''}`
    : '/dashboard';
  const isReturnFromStripe = from?.search?.includes('stripe=return');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate, redirectTo]);

  const handleSuccess = () => {
    navigate(redirectTo, { replace: true });
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Log in</h1>
        <p className="text-slate-600 mb-6">
          {isReturnFromStripe
            ? 'Log in to complete your Stripe onboarding and continue to identity verification.'
            : 'Enter your email and password to access your dashboard.'}
        </p>
        {message && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm text-success bg-green-50 border border-green-100"
            role="status"
          >
            {message}
          </div>
        )}
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
