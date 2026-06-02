import React from 'react';

export default function PageHero({ eyebrow, title, text, image }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,213,154,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(114,84,42,0.35),transparent_35%)]" />
      <div className="mx-auto grid max-w-7xl grid-cols-[1.08fr_.92fr] items-center gap-5 px-4 py-12 sm:gap-8 sm:py-16 md:py-20 lg:grid-cols-[.95fr_1.05fr]">
        <div className="relative z-10">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 font-display text-[2rem] leading-[1.05] sm:mt-5 sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-[0.92rem] leading-6 text-white/70 sm:mt-5 sm:text-lg sm:leading-8">{text}</p>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 rounded-[2rem] bg-[#d8b66a]/20 blur-3xl sm:-inset-6 sm:rounded-[2.5rem]" />
          <img src={image} alt={title} loading="eager" fetchPriority="high" decoding="async" className="relative h-[220px] w-full rounded-[1.75rem] object-cover object-center shadow-2xl shadow-black/30 sm:h-[320px] sm:rounded-[2.25rem] lg:h-[360px]" />
        </div>
      </div>
    </section>
  );
}
