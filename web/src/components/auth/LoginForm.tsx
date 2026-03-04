import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoginMutation } from '@/hooks/useAuth';
import { loginInputSchema, type LoginInput } from '@/schemas/auth';

type Props = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: Props) {
  const [values, setValues] = useState<LoginInput>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});

  const login = useLoginMutation({
    onSuccess: () => {
      onSuccess?.();
    },
    onError: () => {
      setFieldErrors({});
    },
  });

  const handleChange = (field: keyof LoginInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginInputSchema.safeParse(values);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      return;
    }
    setFieldErrors({});
    login.mutate(result.data);
  };

  const inputBase =
    'w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow';
  const inputError = 'border-red-300 focus:ring-red-500 focus:border-red-500';
  const inputNormal = 'border-slate-300';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={values.email}
          onChange={handleChange('email')}
          autoComplete="email"
          autoFocus
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
          className={`${inputBase} ${fieldErrors.email ? inputError : inputNormal}`}
          placeholder="you@example.com"
        />
        {fieldErrors.email && (
          <p id="login-email-error" className="mt-1 text-sm text-error" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={values.password}
          onChange={handleChange('password')}
          autoComplete="current-password"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
          className={`${inputBase} ${fieldErrors.password ? inputError : inputNormal}`}
          placeholder="••••••••"
        />
        {fieldErrors.password && (
          <p id="login-password-error" className="mt-1 text-sm text-error" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>
      {login.isError && (
        <div
          className="rounded-xl px-4 py-3 text-sm text-error bg-red-50 border border-red-100"
          role="alert"
        >
          {login.error?.message ?? 'Login failed'}
        </div>
      )}
      <button
        type="submit"
        disabled={login.isPending}
        className="w-full bg-primary hover:bg-[#0949b8] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-200 min-h-[48px]"
      >
        {login.isPending ? 'Logging in...' : 'Log in'}
      </button>
      <p className="text-center text-slate-600 text-sm">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
