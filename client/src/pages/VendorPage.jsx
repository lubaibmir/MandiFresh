import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Qty from '../components/Qty.jsx';
import { emojiFor, imageFor, rupee, timeAgo } from '../utils.js';

function Row({ l, vendor }) {
  const { add } = useCart();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = !l.inStock;

  const onAdd = () => {
    add({ listingId: l._id, name: l.name, unit: l.unit, price: l.price, qty, vendorId: vendor._id, vendorName: vendor.shopName });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <tr className={`border-t border-line ${out ? 'opacity-50' : ''}`}>
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-3">
          {imageFor(l.name) ? (
            <img src={imageFor(l.name)} alt={l.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist text-xl">{emojiFor(l.name)}</span>
          )}
          <div>
            <Link to={`/produce/${encodeURIComponent(l.nameKey)}`} className="font-medium hover:underline">{l.name}</Link>
            <div className="text-xs text-muted">updated {timeAgo(l.updatedAt)}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap py-3.5 pr-3"><span className="font-semibold">{rupee(l.price)}</span><span className="text-sm text-muted">/{l.unit}</span></td>
      <td className="py-3.5 text-right">
        {out ? <span className="text-sm text-muted">Out of stock</span> : user?.role === 'vendor' ? null : (
          <div className="flex items-center justify-end gap-3">
            <Qty value={qty} onChange={(v) => setQty(Math.max(0.5, v))} />
            <button className="btn-primary btn-sm w-24" onClick={onAdd}>{added ? 'Added' : 'Add'}</button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function VendorPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api(`/vendors/${id}`).then(setData).catch((e) => setError(e.message)); }, [id]);

  if (error) return <div><Link to="/vendors" className="text-sm text-muted hover:underline">Back to vendors</Link><p className="error mt-4">{error}</p></div>;
  if (!data) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <Link to="/vendors" className="text-sm text-muted hover:underline">Back to vendors</Link>
      <h1 className="mt-3 text-3xl" translate="no">{data.vendor.shopName}</h1>
      <p className="text-muted">{data.vendor.stall ? <span translate="no">{data.vendor.stall}</span> : null}{data.vendor.phone && ` - ${data.vendor.phone}`}</p>
      <div className="card mt-8 overflow-x-auto px-5">
        <table className="w-full min-w-[520px] text-left">
          <tbody>{data.listings.map((l) => <Row key={l._id} l={l} vendor={data.vendor} />)}</tbody>
        </table>
        {data.listings.length === 0 && <p className="py-8 text-muted">This vendor hasn't posted prices yet.</p>}
      </div>
    </div>
  );
}
