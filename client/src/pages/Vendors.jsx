import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { timeAgo } from '../utils.js';

export default function Vendors() {
  const [vendors, setVendors] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api('/vendors').then(setVendors).catch((e) => setError(e.message)); }, []);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl">Vendors</h1>
      <p className="mt-1 text-sm sm:text-base text-muted">Everyone selling at the mandi right now.</p>
      {error && <p className="error mt-6">{error}</p>}
      {!vendors && !error && <p className="mt-8 text-muted">Loading...</p>}
      <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vendors?.map((v) => (
          <Link key={v._id} to={`/vendors/${v._id}`} className="card p-4 sm:p-5 lg:p-5 transition-colors hover:border-leaf">
            <h3 className="text-lg sm:text-xl break-words" translate="no">{v.shopName}</h3>
            <p className="text-sm text-muted break-words">{v.stall ? <span translate="no">{v.stall}</span> : 'Mandi stall'}</p>
            <p className="mt-4 text-xs sm:text-sm"><span>{v.items === 1 ? '1 item in stock' : `${v.items} items in stock`}</span>{v.updatedAt && <span className="text-muted"> &bull; prices updated {timeAgo(v.updatedAt)}</span>}</p>
          </Link>
        ))}
      </div>
      {vendors?.length === 0 && <p className="mt-8 text-muted">No vendors yet. <Link to="/register" className="text-forest underline">Register as a vendor</Link> to be the first.</p>}
    </div>
  );
}
