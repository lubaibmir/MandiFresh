import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import GoogleButton from '../components/GoogleButton.jsx';

function Shell({ title, children, footer }) {
  return (
    <div className="mx-auto max-w-md py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl">{title}</h1>
      <div className="card mt-4 sm:mt-6 space-y-4 p-4 sm:p-6 lg:p-6">{children}</div>
      {footer && <p className="mt-4 sm:mt-5 text-center text-sm text-muted">{footer}</p>}
    </div>
  );
}

function RoleStep({ googleData, onCancel }) {
  const { completeGoogle } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isVendor = role === 'vendor';
  const f = (k) => ({ value: form[k] || '', onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await completeGoogle({
        signupToken: googleData.signupToken,
        role,
        shopName: form.shopName,
        stall: form.stall,
        address: form.address,
        phone: form.phone,
      });
      navigate(u.role === 'vendor' ? '/dashboard' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="One last step" footer={null}>
      <div className="space-y-1 rounded-xl bg-mist p-3.5 text-sm">
        <div className="font-medium text-ink">{googleData.profile?.name}</div>
        <div className="text-xs text-muted">{googleData.profile?.email}</div>
      </div>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
        {[['customer', 'I want to buy'], ['vendor', 'I sell at the mandi']].map(([r, label]) => (
          <button key={r} type="button" role="radio" aria-checked={role === r} onClick={() => setRole(r)} className={`chip text-xs sm:text-sm px-2 sm:px-4 py-2 min-h-[40px] flex items-center justify-center text-center ${role === r ? 'chip-on' : ''}`}>{label}</button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {isVendor ? (
          <>
            <div><label className="label" htmlFor="g-shop">Shop name</label><input id="g-shop" required className="input" {...f('shopName')} /></div>
            <div><label className="label" htmlFor="g-stall">Stall location</label><input id="g-stall" className="input" placeholder="e.g. Stall 12, Row B" {...f('stall')} /></div>
            <div><label className="label" htmlFor="g-phone">Phone</label><input id="g-phone" className="input" {...f('phone')} /></div>
          </>
        ) : (
          <>
            <div><label className="label" htmlFor="g-address">Delivery address</label><textarea id="g-address" rows={2} className="input" {...f('address')} /></div>
            <div><label className="label" htmlFor="g-phone">Phone</label><input id="g-phone" className="input" {...f('phone')} /></div>
          </>
        )}
        {error && <p className="error">{error}</p>}
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 min-h-[40px]" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn-primary flex-1 min-h-[40px]" disabled={busy}>{busy ? 'Finishing...' : 'Finish signup'}</button>
        </div>
      </form>
    </Shell>
  );
}

const field = (form, set) => (name) => ({ value: form[name] || '', onChange: (e) => set({ ...form, [name]: e.target.value }) });

export function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from;
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [googleData, setGoogleData] = useState(null);
  const f = field(form, setForm);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const u = await login(form.email, form.password);
      navigate(from || (u.role === 'vendor' ? '/dashboard' : '/'));
    } catch (err) { setError(err.message); }
  };

  const handleGoogle = async (credential) => {
    setError('');
    try {
      const res = await googleLogin(credential);
      if (res?.needsRole) {
        setGoogleData({ signupToken: res.signupToken, profile: res.profile });
      } else {
        navigate(from || (res.user?.role === 'vendor' ? '/dashboard' : '/'));
      }
    } catch (err) { setError(err.message); }
  };

  if (googleData) {
    return <RoleStep googleData={googleData} onCancel={() => setGoogleData(null)} />;
  }

  return (
    <Shell title="Log in" footer={<>New here? <Link to="/register" className="text-forest underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="input" {...f('email')} /></div>
        <div><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" required className="input" {...f('password')} /></div>
        {error && <p className="error">{error}</p>}
        <button className="btn-primary w-full min-h-[44px]">Log in</button>
      </form>
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-line" />
        <span className="absolute bg-white px-3 text-xs text-muted">or</span>
      </div>
      <GoogleButton onCredential={handleGoogle} />
    </Shell>
  );
}

export function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: 'customer' });
  const [error, setError] = useState('');
  const [googleData, setGoogleData] = useState(null);
  const f = field(form, setForm);
  const isVendor = form.role === 'vendor';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const u = await register(form);
      navigate(u.role === 'vendor' ? '/dashboard' : '/');
    } catch (err) { setError(err.message); }
  };

  const handleGoogle = async (credential) => {
    setError('');
    try {
      const res = await googleLogin(credential);
      if (res?.needsRole) {
        setGoogleData({ signupToken: res.signupToken, profile: res.profile });
      } else {
        navigate(res.user?.role === 'vendor' ? '/dashboard' : '/');
      }
    } catch (err) { setError(err.message); }
  };

  if (googleData) {
    return <RoleStep googleData={googleData} onCancel={() => setGoogleData(null)} />;
  }

  return (
    <Shell title="Create an account" footer={<>Already registered? <Link to="/login" className="text-forest underline">Log in</Link></>}>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
        {[['customer', 'I want to buy'], ['vendor', 'I sell at the mandi']].map(([r, label]) => (
          <button key={r} type="button" role="radio" aria-checked={form.role === r} onClick={() => setForm({ ...form, role: r })} className={`chip text-xs sm:text-sm px-2 sm:px-4 py-2 min-h-[40px] flex items-center justify-center text-center ${form.role === r ? 'chip-on' : ''}`}>{label}</button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="name">Your name</label><input id="name" required className="input" {...f('name')} /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="input" {...f('email')} /></div>
        <div><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" minLength={6} required className="input" {...f('password')} /></div>
        <div><label className="label" htmlFor="phone">Phone</label><input id="phone" className="input" {...f('phone')} /></div>
        {isVendor ? (
          <>
            <div><label className="label" htmlFor="shop">Shop name</label><input id="shop" required className="input" {...f('shopName')} /></div>
            <div><label className="label" htmlFor="stall">Stall location</label><input id="stall" className="input" placeholder="e.g. Stall 12, Row B" {...f('stall')} /></div>
          </>
        ) : (
          <div><label className="label" htmlFor="address">Delivery address</label><textarea id="address" rows={2} className="input" {...f('address')} /></div>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn-primary w-full min-h-[44px]">Create account</button>
      </form>
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-line" />
        <span className="absolute bg-white px-3 text-xs text-muted">or</span>
      </div>
      <GoogleButton onCredential={handleGoogle} />
    </Shell>
  );
}
