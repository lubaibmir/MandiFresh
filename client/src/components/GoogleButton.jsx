import { useEffect, useRef } from 'react';

export default function GoogleButton({ onCredential }) {
  const ref = useRef(null);
  useEffect(() => {
    const init = () => {
      if (!window.google) return false;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (r) => onCredential(r.credential),
      });
      window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 320 });
      return true;
    };
    if (init()) return;
    const t = setInterval(() => init() && clearInterval(t), 200);
    return () => clearInterval(t);
  }, []);
  return <div ref={ref} className="flex justify-center" />;
}
