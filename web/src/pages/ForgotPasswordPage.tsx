import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authApi from '@/api/auth';

const inputBase =
  'w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow';
const inputError = 'border-red-300 focus:ring-red-500 focus:border-red-500';
const inputNormal = 'border-slate-300';

type Step = 'email' | 'otp' | 'password';

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { reset_token } = await authApi.verifyForgotPasswordOtp(email, otp);
      setResetToken(reset_token);
      setStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, password, passwordConfirmation);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto py-8 sm:py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Password updated</h1>
          <p className="text-slate-600 mb-6">
            Your password has been reset. You can now log in with your new password.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary hover:bg-[#0949b8] text-white px-6 py-3 rounded-xl font-semibold"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot password</h1>

        {step === 'email' && (
          <>
            <p className="text-slate-600 mb-6">
              Enter your email and we'll send you a verification code to reset your password.
            </p>
            <form onSubmit={handleSendOtp} className="space-y-4">
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-800 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="fp-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="fp-email"
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-[#0949b8] text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-70 min-h-[48px]"
              >
                {loading ? 'Sending…' : 'Send code'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <p className="text-slate-600 mb-6">
              Enter the 6-digit code we sent to <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-800 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="fp-otp" className="block text-sm font-medium text-slate-700 mb-1">
                  Verification code
                </label>
                <input
                  id="fp-otp"
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
                className="w-full bg-primary hover:bg-[#0949b8] text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-70 min-h-[48px]"
              >
                {loading ? 'Verifying…' : 'Verify'}
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-slate-600 hover:text-slate-900 text-sm"
              >
                Use a different email
              </button>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <p className="text-slate-600 mb-6">Enter your new password.</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-800 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor="fp-password"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  New password
                </label>
                <input
                  id="fp-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <p className="mt-1 text-xs text-slate-500">At least 8 characters</p>
              </div>
              <div>
                <label
                  htmlFor="fp-password-confirm"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Confirm password
                </label>
                <input
                  id="fp-password-confirm"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-[#0949b8] text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-70 min-h-[48px]"
              >
                {loading ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-slate-600 text-sm">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
