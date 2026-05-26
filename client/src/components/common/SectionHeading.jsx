import React from 'react';

export default function SectionHeading({ eyebrow, title, text, align = 'center' }) {
  return (
    <div className={`mx-auto mb-10 max-w-3xl ${align === 'center' ? 'text-center' : 'text-start'}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-7 text-white/68 sm:text-lg sm:leading-8">{text}</p>}
    </div>
  );
}
