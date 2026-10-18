import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Qty from '../components/Qty.jsx';
import { emojiFor, imageFor, rupee, timeAgo } from '../utils.js';

function Offer({ offer, name, lowest }) {
  const { add } = useCart();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    add({ listingId: offer.listingId, name, unit: offer.unit, price: offer.price, qty, vendorId: offer.vendor.id, vendorName: offer.vendor.shopName });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <tr className="border-t border-line">
      <td className="py-4 pr-3">
        <Link to={`/vendors/${offer.vendor.id}`} className="font-medium text-forest hover:underline" translate="no">{offer.vendor.shopName}</Link>
        <div className="text-xs text-muted"><span translate="no">{offer.vendor.stall}</span> &bull; <span>updated {timeAgo(offer.updatedAt)}</span></div>
      </td>
      <td className="whitespace-nowrap py-4 pr-3">
        <span className="text-lg font-semibold">{rupee(offer.price)}</span><span className="text-sm text-muted">/{offer.unit}</span>
        {lowest && <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-xs font-medium text-leaf">Lowest</span>}
      </td>
      <td className="py-4 text-right">
        {user?.role === 'vendor' ? (
          <span className="text-xs text-muted">Vendors can't order</span>
        ) : (
          <div className="flex items-center justify-end gap-3">
            <Qty value={qty} onChange={(v) => setQty(Math.max(0.5, v))} />
            <button className="btn-primary btn-sm w-24" onClick={onAdd}>{added ? 'Added' : 'Add'}</button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function Produce() {
  const { key } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    api(`/produce/${encodeURIComponent(key)}`).then(setData).catch((e) => setError(e.message));
  }, [key]);

  if (error) return <div><Link to="/" className="text-sm text-muted hover:underline">Back to vegetables</Link><p className="error mt-4">{error}</p></div>;
  if (!data) return <p className="text-muted">Loading...</p>;

  const lowest = data.offers[0].price;
  return (
    <div>
      <Link to="/" className="text-sm text-muted hover:underline">Back to vegetables</Link>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-mist">
          {imageFor(data.name) ? (
            <img src={imageFor(data.name)} alt={data.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl">{emojiFor(data.name)}</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl">{data.name}</h1>
          <p className="text-sm text-muted">{data.offers.length === 1 ? '1 vendor is selling this today, cheapest first.' : `${data.offers.length} vendors are selling this today, cheapest first.`}</p>
        </div>
      </div>
      <div className="card mt-8 overflow-x-auto px-5">
        <table className="w-full min-w-[520px] text-left">
          <thead className="sr-only"><tr><th>Vendor</th><th>Price</th><th>Order</th></tr></thead>
          <tbody>
            {data.offers.map((o) => <Offer key={o.listingId} offer={o} name={data.name} lowest={o.price === lowest && data.offers.length > 1} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
