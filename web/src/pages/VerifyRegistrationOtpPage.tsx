import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import * as authApi from '@/api/auth';

const inputBase =
  'w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow';
const inputError = 'border-red-300 focus:ring-red-500 focus:border-red-500';
const inputNormal = 'border-slate-300';

export function VerifyRegistrationOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyRegistrationOtp(email.trim(), otp);
      navigate('/login', {
        replace: true,
        state: { message: 'Account created. Please log in.' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h1>
        <p className="text-slate-600 mb-6">
          We sent a 6-digit code to your email. Enter it below to complete registration.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm text-red-800 bg-red-50 border border-red-200"
              role="alert"
            >
              {error}
            </div>
          )}
          <div>
            <label htmlFor="verify-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="verify-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputBase} ${inputNormal}`}
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="verify-otp" className="block text-sm font-medium text-slate-700 mb-1">
              Verification code
            </label>
            <input
              id="verify-otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className={`${inputBase} ${inputNormal} text-center tracking-widest`}
              placeholder="000000"
              required
              disabled={loading}
              autoComplete="one-time-code"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-primary hover:bg-[#0949b8] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px]"
          >
            {loading ? 'Verifying…' : 'Complete registration'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600 text-sm">
          <Link to="/register" className="font-medium text-primary hover:underline">
            Back to registration
          </Link>
        </p>
      </div>
    </div>
  );
}
