import React from 'react';

const teeth = [
  { top: '8%', left: '6%', size: 52, delay: '0s', duration: '18s', opacity: 0.11 },
  { top: '22%', right: '10%', size: 76, delay: '2s', duration: '22s', opacity: 0.08 },
  { top: '44%', left: '4%', size: 60, delay: '4s', duration: '20s', opacity: 0.09 },
  { top: '62%', right: '6%', size: 88, delay: '1s', duration: '24s', opacity: 0.07 },
  { top: '78%', left: '18%', size: 48, delay: '3s', duration: '19s', opacity: 0.1 },
  { top: '84%', right: '22%', size: 58, delay: '5s', duration: '21s', opacity: 0.08 }
];

function Tooth({ style }) {
  return (
    <svg
      viewBox="0 0 160 190"
      className="floating-tooth"
      style={style}
      aria-hidden="true"
    >
      <path
        d="M80 18c-24 0-46 10-46 38 0 22 11 38 16 53 4 11 4 32 14 32 7 0 11-11 13-19 2-9 4-16 12-16s10 7 12 16c2 8 6 19 13 19 10 0 10-21 14-32 5-15 16-31 16-53 0-28-22-38-46-38-7 0-13 2-18 4-5-2-11-4-18-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FloatingTeethBackground() {
  return (
    <div className="floating-teeth-layer" aria-hidden="true">
      {teeth.map((tooth, index) => (
        <Tooth
          key={index}
          style={{
            top: tooth.top,
            left: tooth.left,
            right: tooth.right,
            width: `${tooth.size}px`,
            height: `${tooth.size * 1.18}px`,
            animationDelay: tooth.delay,
            animationDuration: tooth.duration,
            opacity: tooth.opacity
          }}
        />
      ))}
    </div>
  );
}
