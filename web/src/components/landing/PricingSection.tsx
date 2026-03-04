export function PricingSection() {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 mb-8 sm:mb-12 text-center tracking-tight animate-fade-in-up px-2">
        Simple, transparent pricing
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="text-accent font-semibold text-lg mb-3">Stripe rates</div>
          <p className="text-slate-600 mb-4 leading-relaxed">
            Pay standard Stripe fees on each transaction. No monthly fees, no hidden costs.
          </p>
          <p className="text-slate-500 text-sm">
            UK: 1.5% + 20p per Tap to Pay transaction
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="text-accent font-semibold text-lg mb-3">Get started free</div>
          <p className="text-slate-600 mb-4 leading-relaxed">
            Sign up, connect or create your stripe connect account, and start accepting payments in minutes.
          </p>
          <p className="text-slate-500 text-sm">
            No setup fee · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
