export function DevicesSection() {
  return (
    <section className="py-10 sm:py-12 md:py-20 bg-surface rounded-2xl px-4 sm:px-6 md:px-12 shadow-inner">
      <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 mb-8 sm:mb-10 text-center tracking-tight">
        Supported devices
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
          <div className="flex-shrink-0 flex items-center">
            <img
              src="/ios_logo.png"
              alt="Download on the App Store"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 mb-2">App Store (iOS)</h3>
            <p className="text-slate-600 text-sm">
              iPhone XS or later with iOS 16+. Tap to Pay on iPhone available in the UK.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
          <div className="flex-shrink-0 flex items-center">
            <img
              src="/google_logo.png"
              alt="Get it on Google Play"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 mb-2">Google Play (Android)</h3>
            <p className="text-slate-600 text-sm">
              Compatible Android devices with NFC. Check Stripe&apos;s Tap to Pay requirements for your region.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
