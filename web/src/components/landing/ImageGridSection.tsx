export function ImageGridSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
        <div className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group animate-fade-in-up animation-delay-100 opacity-0 [animation-fill-mode:forwards]">
          <img
            src="/landing_one.png"
            alt=""
            className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group animate-fade-in-up animation-delay-200 opacity-0 [animation-fill-mode:forwards]">
          <img
            src="/landing_two.png"
            alt=""
            className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group animate-fade-in-up animation-delay-300 opacity-0 [animation-fill-mode:forwards]">
          <img
            src="/landing_three.png"
            alt=""
            className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </section>
  );
}
