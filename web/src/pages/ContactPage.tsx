import { useState } from 'react';
import { API_BASE } from '@/api/client';

const inputBase =
  'w-full px-4 py-3 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow';
const inputError = 'border-red-300 focus:ring-red-500 focus:border-red-500';
const inputNormal = 'border-slate-300';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const next: { name?: string; email?: string; message?: string } = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Please enter a valid email';
    if (!message.trim()) next.message = 'Message is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setErrorMessage('');
    if (!validate()) return;

    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        throw new Error((data?.message as string) ?? 'Failed to send message.');
      }
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to send message. Please try again.'
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 sm:py-12">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Contact us</h1>
        <p className="text-slate-600 mb-6">
          Have a question or feedback? Send us a message and we'll get back to you soon.
        </p>

        {status === 'success' && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm text-green-800 bg-green-50 border border-green-200"
            role="status"
          >
            Thank you! Your message has been sent. We'll reply as soon as we can.
          </div>
        )}

        {status === 'error' && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm text-red-800 bg-red-50 border border-red-200"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
              placeholder="Your name"
              disabled={status === 'sending'}
              autoComplete="name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
              placeholder="your@email.com"
              disabled={status === 'sending'}
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors((p) => ({ ...p, message: undefined }));
              }}
              rows={5}
              className={`${inputBase} resize-none ${errors.message ? inputError : inputNormal}`}
              placeholder="How can we help?"
              disabled={status === 'sending'}
            />
            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full bg-primary hover:bg-[#0949b8] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-200 min-h-[48px]"
          >
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  );
}
