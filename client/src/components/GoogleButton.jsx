import { useEffect, useRef } from 'react';

export default function GoogleButton({ onCredential }) {
  const ref = useRef(null);
  useEffect(() => {
    const init = () => {
      if (!window.google || !ref.current) return false;
      const parentWidth = ref.current.parentElement?.clientWidth || 320;
      const targetWidth = Math.min(320, Math.max(200, Math.floor(parentWidth)));
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (r) => onCredential(r.credential),
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: targetWidth,
      });
      return true;
    };
    if (init()) return;
    const t = setInterval(() => init() && clearInterval(t), 200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-full max-w-full overflow-hidden flex justify-center">
      <div ref={ref} className="max-w-full flex justify-center [&>div]:max-w-full [&_iframe]:max-w-full" />
    </div>
  );
}
