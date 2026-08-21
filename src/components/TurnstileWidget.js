// src/components/TurnstileWidget.js
import { useEffect, useRef } from 'react';

const TURNSTILE_SITE_KEY = '0x4AAAAAAD6mhyUheJJ19lDK';

const TurnstileWidget = ({ onVerify }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted) return;
      if (window.turnstile && containerRef.current && widgetIdRef.current === null) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token) => {
              if (isMounted) onVerify(token);
            },
            'expired-callback': () => {
              if (isMounted) onVerify('');
            },
            'error-callback': () => {
              if (isMounted) onVerify('');
              console.warn('Turnstile error occurred');
            },
          });
        } catch (error) {
          console.warn('Turnstile render error:', error);
          if (isMounted) onVerify('');
        }
      }
    };

    const loadScript = () => {
      // Check if already loaded
      if (window.turnstile) {
        renderWidget();
        return;
      }

      // Remove any existing script to prevent duplicates
      const existingScript = document.querySelector('script[src*="turnstile"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
      script.async = true;
      script.defer = true;
      
      // Global callback for script load
      window.onTurnstileLoad = () => {
        if (isMounted) renderWidget();
      };

      script.onerror = () => {
        console.warn('Failed to load Turnstile script');
        if (isMounted) onVerify('');
      };

      document.body.appendChild(script);
    };

    loadScript();

    return () => {
      isMounted = false;
      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Ignore removal errors
        }
        widgetIdRef.current = null;
      }
      // Clean up global callback
      delete window.onTurnstileLoad;
    };
  }, [onVerify]);

  return <div ref={containerRef} style={{ minHeight: '70px' }} />;
};

export default TurnstileWidget;