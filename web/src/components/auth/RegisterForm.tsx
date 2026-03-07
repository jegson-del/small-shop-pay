import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegisterMutation } from '@/hooks/useAuth';
import { registerInputSchema, type RegisterInput } from '@/schemas/auth';

type Props = {
  onSuccess?: () => void;
};

export function RegisterForm({ onSuccess }: Props) {
  const [values, setValues] = useState<RegisterInput>({
    email: '',
    email_confirmation: '',
    password: '',
    password_confirmation: '',
    terms_accepted: false,
    privacy_accepted: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});

  const register = useRegisterMutation({
    onSuccess: () => {
      onSuccess?.();
    },
    onError: () => {
      setFieldErrors({});
    },
  });

  const handleChange =
    (field: keyof RegisterInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerInputSchema.safeParse(values);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0],
        email_confirmation: errors.email_confirmation?.[0],
        password: errors.password?.[0],
        password_confirmation: errors.password_confirmation?.[0],
        terms_accepted: errors.terms_accepted?.[0],
        privacy_accepted: errors.privacy_accepted?.[0],
      });
      return;
    }
    setFieldErrors({});
    register.mutate({
      email: result.data.email,
      password: result.data.password,
      terms_accepted: result.data.terms_accepted,
      privacy_accepted: result.data.privacy_accepted,
    });
  };

  const inputBase =
    'w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow';
  const inputError = 'border-red-300 focus:ring-red-500 focus:border-red-500';
  const inputNormal = 'border-slate-300';
  const checkboxError = 'border-red-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          value={values.email}
          onChange={handleChange('email')}
          autoComplete="email"
          autoFocus
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
          className={`${inputBase} ${fieldErrors.email ? inputError : inputNormal}`}
          placeholder="you@example.com"
        />
        {fieldErrors.email && (
          <p id="register-email-error" className="mt-1 text-sm text-error" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="register-email-confirmation" className="block text-sm font-medium text-slate-700 mb-1">
          Confirm email
        </label>
        <input
          id="register-email-confirmation"
          type="email"
          value={values.email_confirmation}
          onChange={handleChange('email_confirmation')}
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email_confirmation)}
          aria-describedby={fieldErrors.email_confirmation ? 'register-email-confirmation-error' : undefined}
          className={`${inputBase} ${fieldErrors.email_confirmation ? inputError : inputNormal}`}
          placeholder="you@example.com"
        />
        {fieldErrors.email_confirmation && (
          <p id="register-email-confirmation-error" className="mt-1 text-sm text-error" role="alert">
            {fieldErrors.email_confirmation}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          value={values.password}
          onChange={handleChange('password')}
          autoComplete="new-password"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
          className={`${inputBase} ${fieldErrors.password ? inputError : inputNormal}`}
          placeholder="••••••••"
        />
        {fieldErrors.password && (
          <p id="register-password-error" className="mt-1 text-sm text-error" role="alert">
            {fieldErrors.password}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500">At least 8 characters</p>
      </div>
      <div>
        <label
          htmlFor="register-password-confirmation"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Confirm password
        </label>
        <input
          id="register-password-confirmation"
          type="password"
          value={values.password_confirmation}
          onChange={handleChange('password_confirmation')}
          autoComplete="new-password"
          aria-invalid={Boolean(fieldErrors.password_confirmation)}
          aria-describedby={
            fieldErrors.password_confirmation ? 'register-password-confirmation-error' : undefined
          }
          className={`${inputBase} ${
            fieldErrors.password_confirmation ? inputError : inputNormal
          }`}
          placeholder="••••••••"
        />
        {fieldErrors.password_confirmation && (
          <p
            id="register-password-confirmation-error"
            className="mt-1 text-sm text-error"
            role="alert"
          >
            {fieldErrors.password_confirmation}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={values.terms_accepted}
            onChange={handleChange('terms_accepted')}
            aria-invalid={Boolean(fieldErrors.terms_accepted)}
            aria-describedby={fieldErrors.terms_accepted ? 'register-terms-error' : undefined}
            className={`mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary ${
              fieldErrors.terms_accepted ? checkboxError : ''
            }`}
          />
          <span className="text-sm text-slate-700">
            I accept the{' '}
            <Link to="/terms" className="font-medium text-primary hover:underline">
              Terms and Conditions
            </Link>
          </span>
        </label>
        {fieldErrors.terms_accepted && (
          <p id="register-terms-error" className="text-sm text-error ml-8" role="alert">
            {fieldErrors.terms_accepted}
          </p>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={values.privacy_accepted}
            onChange={handleChange('privacy_accepted')}
            aria-invalid={Boolean(fieldErrors.privacy_accepted)}
            aria-describedby={fieldErrors.privacy_accepted ? 'register-privacy-error' : undefined}
            className={`mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary ${
              fieldErrors.privacy_accepted ? checkboxError : ''
            }`}
          />
          <span className="text-sm text-slate-700">
            I accept the{' '}
            <Link to="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        {fieldErrors.privacy_accepted && (
          <p id="register-privacy-error" className="text-sm text-error ml-8" role="alert">
            {fieldErrors.privacy_accepted}
          </p>
        )}
      </div>

      {register.isError && (
        <div
          className="rounded-xl px-4 py-3 text-sm text-error bg-red-50 border border-red-100"
          role="alert"
        >
          {register.error?.message ?? 'Registration failed'}
        </div>
      )}
      <button
        type="submit"
        disabled={register.isPending}
        className="w-full bg-primary hover:bg-[#0949b8] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-200 min-h-[48px]"
      >
        {register.isPending ? 'Creating account...' : 'Create account'}
      </button>
      <p className="text-center text-slate-600 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
