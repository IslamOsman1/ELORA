import React, { useEffect, useState } from 'react';

const FALLBACK_LOGO = '/logo.png';

function normalizeLogoUrl(src) {
  if (!src || src === '/logo.jpg') {
    return FALLBACK_LOGO;
  }

  return src;
}

export default function BrandLogo({ src, alt, className = '', ...props }) {
  const normalizedSrc = normalizeLogoUrl(src);
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);

  useEffect(() => {
    setCurrentSrc(normalizedSrc);
  }, [normalizedSrc]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== FALLBACK_LOGO) {
          setCurrentSrc(FALLBACK_LOGO);
        }
      }}
    />
  );
}
