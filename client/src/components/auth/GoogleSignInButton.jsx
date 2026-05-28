import React from 'react';
import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleScript() {
  const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.body.appendChild(script);
  });
}

export default function GoogleSignInButton({ clientId, language, text, onCredential, onError }) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    if (!clientId || !buttonRef.current) {
      return undefined;
    }

    loadGoogleScript()
      .then(() => {
        if (!active || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential?.(response.credential),
          ux_mode: 'popup'
        });

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          locale: language === 'ar' ? 'ar' : 'en'
        });

        setReady(true);
      })
      .catch((error) => onError?.(error));

    return () => {
      active = false;
    };
  }, [clientId, language, onCredential, onError]);

  if (!clientId) {
    return (
      <div className="rounded-[1.25rem] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100/90">
        Google sign-in is disabled until `VITE_GOOGLE_CLIENT_ID` is configured.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div ref={buttonRef} className="min-h-[44px]" />
      {!ready ? <p className="text-center text-xs text-white/45">{text}</p> : null}
    </div>
  );
}
