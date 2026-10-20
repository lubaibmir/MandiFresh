import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORIES, COMMON_VEG, STATUS_LABEL, UNITS, emojiFor, imageFor, rupee, timeAgo } from '../utils.js';

function AddForm({ onSaved }) {
  const [f, setF] = useState({ name: '', price: '', unit: 'kg', category: 'Everyday' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/listings', { method: 'POST', body: f });
      setF({ ...f, name: '', price: '' });
      onSaved();
    } catch (err) { setError(err.message); }
  };

  return (
    <form onSubmit={submit} className="card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-end gap-3 p-4 sm:p-5 lg:p-5">
      <div className="col-span-1 sm:col-span-2 lg:col-span-1">
        <label className="label" htmlFor="vname">Vegetable</label>
        <input id="vname" list="veg-list" required className="input" placeholder="e.g. Tomato" value={f.name} onChange={set('name')} />
        <datalist id="veg-list">{COMMON_VEG.map((v) => <option key={v} value={v} />)}</datalist>
      </div>
      <div className="col-span-1"><label className="label" htmlFor="vprice">Price</label><input id="vprice" type="number" min="0" step="0.5" required className="input" value={f.price} onChange={set('price')} /></div>
      <div className="col-span-1"><label className="label" htmlFor="vunit">Per</label><select id="vunit" className="input" value={f.unit} onChange={set('unit')}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
      <div className="col-span-1"><label className="label" htmlFor="vcat">Type</label><select id="vcat" className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <button className="btn-primary col-span-1 w-full lg:w-auto min-h-[40px] sm:min-h-0">Save price</button>
      {error && <p className="error col-span-1 sm:col-span-2 lg:col-span-5">{error}</p>}
    </form>
  );
}

function PriceRow({ l, onChange }) {
  const [price, setPrice] = useState(l.price);
  const [err, setErr] = useState('');
  const dirty = Number(price) !== l.price;

  const patch = async (body) => {
    setErr('');
    try { await api(`/listings/${l._id}`, { method: 'PATCH', body }); onChange(); } catch (e) { setErr(e.message); }
  };
  const del = async () => {
    if (!window.confirm(`Remove ${l.name} from your list?`)) return;
    await api(`/listings/${l._id}`, { method: 'DELETE' });
    onChange();
  };

  return (
    <tr className={`border-t border-line grid grid-cols-2 items-center gap-y-3 py-4 sm:table-row sm:gap-y-0 sm:py-0 ${l.inStock ? '' : 'opacity-60'}`}>
      <td className="col-span-2 sm:col-span-1 sm:table-cell sm:py-3 sm:pr-3">
        <div className="flex items-center gap-3">
          {imageFor(l.name) ? (
            <img src={imageFor(l.name)} alt={l.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist text-xl">{emojiFor(l.name)}</span>
          )}
          <div>
            <span className="font-medium">{l.name}</span>
            <div className="text-xs text-muted">updated {timeAgo(l.updatedAt)}</div>
          </div>
        </div>
      </td>
      <td className="col-span-2 sm:col-span-1 sm:table-cell sm:py-3 sm:pr-3">
        <div className="flex items-center gap-2">
          <span className="text-muted">{'\u20B9'}</span>
          <input aria-label={`Price of ${l.name}`} type="number" min="0" step="0.5" className="input w-24" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && dirty && patch({ price })} />
          <span className="text-sm text-muted">/{l.unit}</span>
          {dirty && <button className="btn-primary btn-sm min-h-[40px] sm:min-h-0" onClick={() => patch({ price })}>Update</button>}
        </div>
        {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      </td>
      <td className="col-span-1 sm:table-cell sm:py-3 sm:pr-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm min-h-[40px] sm:min-h-0">
          <input type="checkbox" className="h-4 w-4 accent-forest" checked={l.inStock} onChange={(e) => patch({ inStock: e.target.checked })} /> In stock
        </label>
      </td>
      <td className="col-span-1 text-right sm:table-cell sm:py-3 sm:text-right">
        <button className="text-sm text-muted hover:text-red-600 min-h-[40px] sm:min-h-0 inline-flex items-center justify-end" onClick={del}>Remove</button>
      </td>
    </tr>
  );
}

function Prices() {
  const [list, setList] = useState(null);
  const load = useCallback(() => api('/listings/mine').then(setList), []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <AddForm onSaved={load} />
      <div className="card px-4 sm:px-5 sm:overflow-x-auto">
        <table className="w-full text-left block sm:table sm:min-w-[560px]">
          <tbody className="block sm:table-row-group divide-y divide-line sm:divide-y-0">{list?.map((l) => <PriceRow key={l._id + l.updatedAt} l={l} onChange={load} />)}</tbody>
        </table>
        {list?.length === 0 && <p className="py-8 text-muted">Add your first vegetable above. Customers will see your price right away.</p>}
        {!list && <p className="py-8 text-muted">Loading...</p>}
      </div>
    </div>
  );
}

const NEXT = { placed: 'accepted', accepted: 'out_for_delivery', out_for_delivery: 'delivered' };
const NEXT_LABEL = { placed: 'Accept order', accepted: 'Out for delivery', out_for_delivery: 'Mark delivered' };

function Orders() {
  const [orders, setOrders] = useState(null);
  const load = useCallback(() => api('/orders/vendor').then(setOrders), []);
  useEffect(() => { load(); }, [load]);
  const setStatus = async (id, status) => { await api(`/orders/${id}/status`, { method: 'PATCH', body: { status } }); load(); };

  if (!orders) return <p className="text-muted">Loading...</p>;
  if (!orders.length) return <p className="text-muted">No orders yet. They will appear here as customers place them.</p>;
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <article key={o._id} className="card p-4 sm:p-5 lg:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg break-words"><span translate="no">{o.customer?.name}</span>{o.customer?.phone && <span className="text-sm text-muted"> - {o.customer.phone}</span>}</h3>
              <p className="text-sm text-muted break-words" translate="no">{o.address}</p>
              {o.note && <p className="mt-1 text-sm break-words">Note: {o.note}</p>}
            </div>
            <span className="self-start sm:self-auto rounded-full bg-mist px-3 py-1 text-xs sm:text-sm font-medium text-forest shrink-0">{STATUS_LABEL[o.status]}</span>
          </div>
          <ul className="mt-3 text-sm">
            {o.items.map((i, idx) => <li key={idx} className="flex justify-between py-1 gap-2"><span>{i.name} x {i.qty} {i.unit}</span><span className="shrink-0">{rupee(i.price * i.qty)}</span></li>)}
          </ul>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-line pt-3">
            <span className="font-medium">Total {rupee(o.total)}</span>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {o.status === 'placed' && <button className="btn-ghost btn-sm flex-1 sm:flex-none min-h-[40px] sm:min-h-0 text-center" onClick={() => setStatus(o._id, 'cancelled')}>Decline</button>}
              {NEXT[o.status] && <button className="btn-primary btn-sm flex-1 sm:flex-none min-h-[40px] sm:min-h-0 text-center" onClick={() => setStatus(o._id, NEXT[o.status])}>{NEXT_LABEL[o.status]}</button>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('prices');
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl break-words" translate="no">{user.shopName}</h1>
      <p className="mt-1 text-sm sm:text-base text-muted">Keep your prices current. Customers compare them live.</p>
      <div className="mt-6 flex gap-2">
        <button className={`chip min-h-[40px] sm:min-h-0 flex items-center ${tab === 'prices' ? 'chip-on' : ''}`} onClick={() => setTab('prices')}>Prices</button>
        <button className={`chip min-h-[40px] sm:min-h-0 flex items-center ${tab === 'orders' ? 'chip-on' : ''}`} onClick={() => setTab('orders')}>Orders</button>
      </div>
      <div className="mt-6">{tab === 'prices' ? <Prices /> : <Orders />}</div>
    </div>
  );
}
