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
    <form onSubmit={submit} className="card grid items-end gap-3 p-5 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
      <div>
        <label className="label" htmlFor="vname">Vegetable</label>
        <input id="vname" list="veg-list" required className="input" placeholder="e.g. Tomato" value={f.name} onChange={set('name')} />
        <datalist id="veg-list">{COMMON_VEG.map((v) => <option key={v} value={v} />)}</datalist>
      </div>
      <div><label className="label" htmlFor="vprice">Price</label><input id="vprice" type="number" min="0" step="0.5" required className="input" value={f.price} onChange={set('price')} /></div>
      <div><label className="label" htmlFor="vunit">Per</label><select id="vunit" className="input" value={f.unit} onChange={set('unit')}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
      <div><label className="label" htmlFor="vcat">Type</label><select id="vcat" className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <button className="btn-primary">Save price</button>
      {error && <p className="error sm:col-span-5">{error}</p>}
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
    <tr className={`border-t border-line ${l.inStock ? '' : 'opacity-60'}`}>
      <td className="py-3 pr-3">
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
      <td className="py-3 pr-3">
        <div className="flex items-center gap-2">
          <span className="text-muted">{'\u20B9'}</span>
          <input aria-label={`Price of ${l.name}`} type="number" min="0" step="0.5" className="input w-24" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && dirty && patch({ price })} />
          <span className="text-sm text-muted">/{l.unit}</span>
          {dirty && <button className="btn-primary btn-sm" onClick={() => patch({ price })}>Update</button>}
        </div>
        {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      </td>
      <td className="py-3 pr-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-forest" checked={l.inStock} onChange={(e) => patch({ inStock: e.target.checked })} /> In stock
        </label>
      </td>
      <td className="py-3 text-right"><button className="text-sm text-muted hover:text-red-600" onClick={del}>Remove</button></td>
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
      <div className="card overflow-x-auto px-5">
        <table className="w-full min-w-[560px] text-left">
          <tbody>{list?.map((l) => <PriceRow key={l._id + l.updatedAt} l={l} onChange={load} />)}</tbody>
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
        <article key={o._id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-lg"><span translate="no">{o.customer?.name}</span>{o.customer?.phone && <span className="text-sm text-muted"> - {o.customer.phone}</span>}</h3>
              <p className="text-sm text-muted" translate="no">{o.address}</p>
              {o.note && <p className="mt-1 text-sm">Note: {o.note}</p>}
            </div>
            <span className="rounded-full bg-mist px-3 py-1 text-sm font-medium text-forest">{STATUS_LABEL[o.status]}</span>
          </div>
          <ul className="mt-3 text-sm">
            {o.items.map((i, idx) => <li key={idx} className="flex justify-between py-1"><span>{i.name} x {i.qty} {i.unit}</span><span>{rupee(i.price * i.qty)}</span></li>)}
          </ul>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <span className="font-medium">Total {rupee(o.total)}</span>
            <div className="flex gap-2">
              {o.status === 'placed' && <button className="btn-ghost btn-sm" onClick={() => setStatus(o._id, 'cancelled')}>Decline</button>}
              {NEXT[o.status] && <button className="btn-primary btn-sm" onClick={() => setStatus(o._id, NEXT[o.status])}>{NEXT_LABEL[o.status]}</button>}
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
      <h1 className="text-3xl" translate="no">{user.shopName}</h1>
      <p className="mt-1 text-muted">Keep your prices current. Customers compare them live.</p>
      <div className="mt-6 flex gap-2">
        <button className={`chip ${tab === 'prices' ? 'chip-on' : ''}`} onClick={() => setTab('prices')}>Prices</button>
        <button className={`chip ${tab === 'orders' ? 'chip-on' : ''}`} onClick={() => setTab('orders')}>Orders</button>
      </div>
      <div className="mt-6">{tab === 'prices' ? <Prices /> : <Orders />}</div>
    </div>
  );
}
