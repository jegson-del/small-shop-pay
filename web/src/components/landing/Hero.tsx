import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="py-12 sm:py-16 md:py-28 text-center px-2">
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-5 animate-fade-in-up tracking-tight leading-tight">
        <span className="text-gradient-hero text-gradient-hero-animate">Tap to Pay</span>
        <span className="text-slate-800 font-extrabold"> for small shops</span>
      </h1>
      <p className="text-base sm:text-xl md:text-2xl text-slate-500 mb-8 sm:mb-10 max-w-2xl mx-auto px-2 animate-fade-in-up animation-delay-100 opacity-0 [animation-fill-mode:forwards]">
        Accept contactless payments with your iPhone or Android device. No extra hardware. <span className="text-[#635bff] font-medium">Powered by Stripe.</span>
      </p>
      <Link
        to="/register"
        className="inline-block bg-primary hover:bg-[#0949b8] text-white px-8 sm:px-10 py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-100 transition-all duration-300 animate-fade-in-up animation-delay-200 opacity-0 [animation-fill-mode:forwards] min-h-[48px] flex items-center justify-center"
      >
        Get Started
      </Link>
    </section>
  );
}
