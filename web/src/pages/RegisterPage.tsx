import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeQuery } from '@/hooks/useAuth';
import { RegisterForm } from '@/components/auth/RegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();
  const { data: user, isSuccess: isAuthenticated } = useMeQuery();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSuccess = () => {
    navigate('/login', { replace: true, state: { message: 'Account created. Please log in.' } });
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Create account</h1>
        <p className="text-slate-600 mb-6">
          Sign up to start accepting Tap to Pay payments. Subscription is £9/month after a 14-day
          free trial—cancel anytime. By registering, you agree to our Terms and Conditions and
          Privacy Policy.
        </p>
        <RegisterForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
