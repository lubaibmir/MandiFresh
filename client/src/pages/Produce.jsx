import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Qty from '../components/Qty.jsx';
import { emojiFor, imageFor, rupee, timeAgo } from '../utils.js';

function Offer({ offer, name, lowest }) {
  const { items, add, setQty } = useCart();
  const { user } = useAuth();
  const cartItem = items.find((i) => i.listingId === offer.listingId && i.qty > 0);

  const onAdd = () => {
    add({ listingId: offer.listingId, name, unit: offer.unit, price: offer.price, qty: 1, vendorId: offer.vendor.id, vendorName: offer.vendor.shopName });
  };

  return (
    <tr className="border-t border-line grid grid-cols-[1fr_auto] items-start gap-y-3 py-4 sm:table-row sm:gap-y-0 sm:py-0">
      <td className="col-start-1 sm:table-cell sm:py-4 sm:pr-3">
        <Link to={`/vendors/${offer.vendor.id}`} className="font-medium text-forest hover:underline" translate="no">{offer.vendor.shopName}</Link>
        <div className="text-xs text-muted"><span translate="no">{offer.vendor.stall}</span> &bull; <span>updated {timeAgo(offer.updatedAt)}</span></div>
      </td>
      <td className="col-start-2 whitespace-nowrap text-right sm:text-left sm:table-cell sm:py-4 sm:pr-3">
        <span className="text-base sm:text-lg font-semibold">{rupee(offer.price)}</span><span className="text-sm text-muted">/{offer.unit}</span>
        {lowest && <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-xs font-medium text-leaf">Lowest</span>}
      </td>
      <td className="col-span-2 pt-1 sm:pt-0 sm:table-cell sm:py-4 sm:text-right">
        {user?.role === 'vendor' ? (
          <span className="text-xs text-muted">Vendors can't order</span>
        ) : (
          <div className="flex items-center justify-end w-full sm:w-auto">
            {cartItem ? (
              <Qty value={cartItem.qty} onChange={(v) => setQty(offer.listingId, v)} step={offer.unit === 'kg' ? 0.5 : 1} />
            ) : (
              <button className="btn-primary btn-sm min-h-[40px] sm:min-h-0 w-28 sm:w-24" onClick={onAdd}>Add</button>
            )}
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
      <div className="mt-4 flex items-center gap-3 sm:gap-4">
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-mist">
          {imageFor(data.name) ? (
            <img src={imageFor(data.name)} alt={data.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl">{emojiFor(data.name)}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl">{data.name}</h1>
          <p className="text-xs sm:text-sm text-muted">{data.offers.length === 1 ? '1 vendor is selling this today, cheapest first.' : `${data.offers.length} vendors are selling this today, cheapest first.`}</p>
        </div>
      </div>
      <div className="card mt-6 sm:mt-8 px-4 sm:px-5 sm:overflow-x-auto">
        <table className="w-full text-left block sm:table sm:min-w-[520px]">
          <thead className="sr-only"><tr><th>Vendor</th><th>Price</th><th>Order</th></tr></thead>
          <tbody className="block sm:table-row-group divide-y divide-line sm:divide-y-0">
            {data.offers.map((o) => <Offer key={o.listingId} offer={o} name={data.name} lowest={o.price === lowest && data.offers.length > 1} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
