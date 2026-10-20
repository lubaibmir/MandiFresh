import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { rupee, STATUS_LABEL } from '../utils.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api('/orders/mine').then(setOrders).catch((e) => setError(e.message)); }, []);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl">My orders</h1>
      {error && <p className="error mt-6">{error}</p>}
      {!orders && !error && <p className="mt-6 text-muted">Loading...</p>}
      {orders?.length === 0 && <p className="mt-6 text-muted">No orders yet.</p>}
      <div className="mt-6 space-y-4">
        {orders?.map((o) => (
          <article key={o._id} className="card p-4 sm:p-5 lg:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg break-words" translate="no">{o.vendor?.shopName}</h3>
                <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <span className="self-start sm:self-auto rounded-full bg-mist px-3 py-1 text-xs sm:text-sm font-medium text-forest shrink-0">{STATUS_LABEL[o.status]}</span>
            </div>
            <ul className="mt-3 text-sm">
              {o.items.map((i, idx) => (
                <li key={idx} className="flex justify-between py-1 gap-2"><span>{i.name} x {i.qty} {i.unit}</span><span className="shrink-0">{rupee(i.price * i.qty)}</span></li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-line pt-3 font-medium"><span>Total</span><span>{rupee(o.total)}</span></div>
          </article>
        ))}
      </div>
    </div>
  );
}
