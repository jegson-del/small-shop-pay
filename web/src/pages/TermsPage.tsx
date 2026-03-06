export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Terms & Conditions</h1>
      <p className="text-slate-500 text-sm">Last updated: March 2025</p>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-2">1. Agreement to terms</h2>
        <p className="text-slate-600 leading-relaxed">
          By accessing or using SmallShopPay (&quot;Service&quot;), you agree to be bound by these Terms & Conditions.
          If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-2">2. Description of service</h2>
        <p className="text-slate-600 leading-relaxed">
          SmallShopPay provides a platform for small businesses in the UK to accept contactless payments
          via Stripe Tap to Pay on compatible mobile devices. The Service includes web onboarding,
          subscription management, and a mobile payment app.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-2">3. Eligibility</h2>
        <p className="text-slate-600 leading-relaxed">
          You must be at least 18 years old, have a UK business, and comply with Stripe&apos;s terms
          to use the Service. The Service is currently available in the United Kingdom only.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-2">4. Subscription and fees</h2>
        <p className="text-slate-600 leading-relaxed">
          The Service is offered under a subscription plan: <strong>£9 per month</strong> (plus
          applicable VAT if any). New users receive a <strong>14-day free trial</strong>; you will
          not be charged until the trial ends. You may cancel at any time before the trial ends to
          avoid being charged. Fees and trial terms are also displayed at sign-up and when starting
          the trial. You authorise us to charge your payment method in accordance with your plan.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-2">5. Account and security</h2>
        <p className="text-slate-600 leading-relaxed">
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity under your account. Notify us immediately of any unauthorised use.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-2">6. Acceptable use</h2>
        <p className="text-slate-600 leading-relaxed">
          You must use the Service lawfully and in accordance with Stripe&apos;s terms and
          applicable regulations. You may not use the Service for fraud, money laundering, or
          any prohibited purpose.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-2">7. Limitation of liability</h2>
        <p className="text-slate-600 leading-relaxed">
          The Service is provided &quot;as is&quot;. To the fullest extent permitted by law, we exclude
          liability for indirect, incidental, or consequential damages. Our total liability is
          limited to the fees you paid in the 12 months before the claim.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-2">8. Changes</h2>
        <p className="text-slate-600 leading-relaxed">
          We may update these Terms from time to time. We will notify you of material changes.
          Continued use after changes constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-2">9. Contact</h2>
        <p className="text-slate-600 leading-relaxed">
          For questions about these Terms, contact us at{' '}
          <a href="mailto:support@smallshoppay.com" className="text-primary hover:underline">
            support@smallshoppay.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
