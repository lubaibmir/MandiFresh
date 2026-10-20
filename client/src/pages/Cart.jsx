import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Qty from '../components/Qty.jsx';
import { rupee } from '../utils.js';

export default function Cart() {
  const { items, setQty, remove, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || '');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!items.length)
    return (
      <div className="py-12 sm:py-16 text-center px-4">
        <h1 className="text-2xl sm:text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-sm sm:text-base text-muted">Pick vegetables from any vendor and they will show up here.</p>
        <Link to="/" className="btn-primary mt-6 min-h-[40px] sm:min-h-0">Browse vegetables</Link>
      </div>
    );

  const groups = Object.values(
    items.reduce((acc, i) => {
      (acc[i.vendorId] ||= { vendorId: i.vendorId, vendorName: i.vendorName, lines: [] }).lines.push(i);
      return acc;
    }, {})
  );

  const place = async () => {
    setError('');
    setBusy(true);
    try {
      await api('/orders', { method: 'POST', body: { items: items.map((i) => ({ listingId: i.listingId, qty: i.qty })), address, note } });
      clear();
      navigate('/orders');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="text-2xl sm:text-3xl">Your cart</h1>
        <p className="mt-1 text-sm text-muted">Items from different vendors are ordered separately, so each vendor delivers their own.</p>
        <div className="mt-6 space-y-5">
          {groups.map((g) => (
            <section key={g.vendorId} className="card px-4 sm:px-5 py-4">
              <Link to={`/vendors/${g.vendorId}`} className="font-serif text-lg text-forest hover:underline" translate="no">{g.vendorName}</Link>
              <ul className="mt-2 divide-y divide-line">
                {g.lines.map((l) => (
                  <li key={l.listingId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 sm:py-3">
                    <div className="flex items-start justify-between gap-2 sm:block">
                      <div>
                        <div className="font-medium text-base sm:text-sm">{l.name}</div>
                        <div className="text-sm text-muted">{rupee(l.price)}/{l.unit}</div>
                      </div>
                      <div className="text-right font-semibold sm:hidden">{rupee(l.price * l.qty)}</div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <Qty value={l.qty} onChange={(v) => setQty(l.listingId, v)} />
                      <span className="hidden sm:inline-block w-20 text-right font-medium">{rupee(l.price * l.qty)}</span>
                      <button className="text-sm text-muted hover:text-red-600 min-h-[40px] sm:min-h-0 px-2 py-1 flex items-center" onClick={() => remove(l.listingId)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-1 text-right text-sm text-muted">Subtotal {rupee(g.lines.reduce((s, l) => s + l.price * l.qty, 0))}</div>
            </section>
          ))}
        </div>
      </div>

      <aside className="card h-fit space-y-4 p-4 sm:p-5 lg:p-5">
        <h2 className="text-xl">Checkout</h2>
        <div className="flex justify-between"><span className="text-muted">Estimated total</span><span className="text-lg font-semibold">{rupee(total)}</span></div>
        <p className="text-xs text-muted">Final prices are confirmed when you place the order, in case a vendor has updated them.</p>
        {user?.role === 'customer' ? (
          <>
            <div>
              <label className="label" htmlFor="addr">Delivery address</label>
              <textarea id="addr" className="input" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="note">Note for vendors (optional)</label>
              <input id="note" className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. ripe tomatoes please" />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn-primary w-full min-h-[44px]" disabled={busy || !address.trim()} onClick={place}>{busy ? 'Placing order...' : 'Place order'}</button>
          </>
        ) : user ? (
          <p className="error">Vendor accounts can't place orders. Log in as a customer.</p>
        ) : (
          <Link to="/login" state={{ from: '/cart' }} className="btn-primary w-full min-h-[44px] text-center">Log in to order</Link>
        )}
      </aside>
    </div>
  );
}
