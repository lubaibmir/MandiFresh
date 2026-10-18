import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { rupee, STATUS_LABEL } from '../utils.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api('/orders/mine').then(setOrders).catch((e) => setError(e.message)); }, []);

  return (
    <div>
      <h1 className="text-3xl">My orders</h1>
      {error && <p className="error mt-6">{error}</p>}
      {!orders && !error && <p className="mt-6 text-muted">Loading...</p>}
      {orders?.length === 0 && <p className="mt-6 text-muted">No orders yet.</p>}
      <div className="mt-6 space-y-4">
        {orders?.map((o) => (
          <article key={o._id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg" translate="no">{o.vendor?.shopName}</h3>
                <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <span className="rounded-full bg-mist px-3 py-1 text-sm font-medium text-forest">{STATUS_LABEL[o.status]}</span>
            </div>
            <ul className="mt-3 text-sm">
              {o.items.map((i, idx) => (
                <li key={idx} className="flex justify-between py-1"><span>{i.name} x {i.qty} {i.unit}</span><span>{rupee(i.price * i.qty)}</span></li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-line pt-3 font-medium"><span>Total</span><span>{rupee(o.total)}</span></div>
          </article>
        ))}
      </div>
    </div>
  );
}
