import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const link = ({ isActive }) => `text-sm transition-colors ${isActive ? 'font-medium text-forest' : 'text-muted hover:text-forest'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [isHindi, setIsHindi] = useState(() => {
    return typeof document !== 'undefined' && document.cookie.includes('googtrans=/en/hi');
  });

  const toggleLanguage = () => {
    const nextIsHindi = !isHindi;
    const host = window.location.hostname;

    if (nextIsHindi) {
      document.cookie = 'googtrans=/en/hi; path=/';
      if (host && host !== 'localhost') {
        document.cookie = `googtrans=/en/hi; domain=${host}; path=/`;
      }
    } else {
      document.cookie = 'googtrans=/en/en; path=/';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      if (host && host !== 'localhost') {
        document.cookie = `googtrans=/en/en; domain=${host}; path=/`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${host}; path=/;`;
      }
    }
    setIsHindi(nextIsHindi);

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = nextIsHindi ? 'hi' : 'en';
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link to="/" className="font-serif text-xl font-semibold text-forest" translate="no">Mandi Fresh</Link>
        <nav className="flex items-center gap-5">
          <NavLink to="/" end className={link}>Produce</NavLink>
          <NavLink to="/vendors" className={link}>Vendors</NavLink>
          {user?.role === 'vendor' && <NavLink to="/dashboard" className={link}>My prices</NavLink>}
          {user?.role === 'customer' && <NavLink to="/orders" className={link}>My orders</NavLink>}
          {user?.role !== 'vendor' && (
            <NavLink to="/cart" className={link}>Cart{count > 0 && <span className="ml-1.5 rounded-full bg-forest px-1.5 py-0.5 text-xs text-white">{count}</span>}</NavLink>
          )}
          <button
            type="button"
            onClick={toggleLanguage}
            className="chip !px-3 !py-1 text-xs font-medium text-forest hover:border-forest flex items-center gap-1.5"
            translate="no"
            aria-label="Translate to Hindi or English"
          >
            <span className="text-sm">🌐</span>
            <span>{isHindi ? 'English' : 'हिन्दी'}</span>
          </button>
          {user ? (
            <button className="btn-ghost btn-sm" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          ) : (
            <Link to="/login" className="btn-primary btn-sm">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
