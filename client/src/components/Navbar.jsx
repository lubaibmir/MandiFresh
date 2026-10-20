import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const link = ({ isActive }) => `text-sm transition-colors ${isActive ? 'font-medium text-forest' : 'text-muted hover:text-forest'}`;
const mobileLink = ({ isActive }) =>
  `flex items-center min-h-[40px] px-3 rounded-xl text-base transition-colors ${
    isActive ? 'font-medium text-forest bg-mist' : 'text-muted hover:text-forest hover:bg-mist/60'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHindi, setIsHindi] = useState(() => {
    return typeof document !== 'undefined' && document.cookie.includes('googtrans=/en/hi');
  });

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setIsOpen(false);

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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-5 lg:px-5 py-3.5">
        <Link to="/" className="font-serif text-xl font-semibold text-forest" translate="no">Mandi Fresh</Link>
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center rounded-xl p-2 text-forest hover:bg-mist md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-leaf min-h-[40px] min-w-[40px]"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
        <nav className="hidden md:flex items-center gap-5">
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
      {isOpen && (
        <nav className="border-t border-line bg-paper px-4 py-4 md:hidden flex flex-col gap-2 shadow-lg" aria-label="Mobile Navigation">
          <NavLink to="/" end className={mobileLink} onClick={closeMenu}>Produce</NavLink>
          <NavLink to="/vendors" className={mobileLink} onClick={closeMenu}>Vendors</NavLink>
          {user?.role === 'vendor' && <NavLink to="/dashboard" className={mobileLink} onClick={closeMenu}>My prices</NavLink>}
          {user?.role === 'customer' && <NavLink to="/orders" className={mobileLink} onClick={closeMenu}>My orders</NavLink>}
          {user?.role !== 'vendor' && (
            <NavLink to="/cart" className={mobileLink} onClick={closeMenu}>
              <span>Cart</span>
              {count > 0 && <span className="ml-2 rounded-full bg-forest px-2 py-0.5 text-xs text-white">{count}</span>}
            </NavLink>
          )}
          <div className="pt-2 border-t border-line flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => { toggleLanguage(); }}
              className="chip !px-3 !py-2 text-xs font-medium text-forest hover:border-forest flex items-center justify-center gap-1.5 min-h-[40px] w-full"
              translate="no"
              aria-label="Translate to Hindi or English"
            >
              <span className="text-sm">🌐</span>
              <span>{isHindi ? 'English' : 'हिन्दी'}</span>
            </button>
            {user ? (
              <button className="btn-ghost btn-sm min-h-[40px] w-full" onClick={() => { logout(); navigate('/'); closeMenu(); }}>Log out</button>
            ) : (
              <Link to="/login" onClick={closeMenu} className="btn-primary btn-sm min-h-[40px] w-full text-center">Log in</Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
