import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { CATEGORIES, emojiFor, imageFor, rupee, timeAgo } from '../utils.js';

export default function Home() {
  const [produce, setProduce] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      const q = new URLSearchParams({ ...(search && { search }), ...(category && { category }) });
      api(`/produce?${q}`).then(setProduce).catch((e) => setError(e.message));
    }, 200);
    return () => clearTimeout(t);
  }, [search, category]);

  return (
    <div>
      <section className="rounded-3xl bg-mist px-6 py-12 sm:px-12 sm:py-16">
        <h1 className="max-w-xl text-4xl leading-tight sm:text-5xl">Fresh from the mandi, priced by the vendors themselves.</h1>
        <p className="mt-4 max-w-lg text-muted">See what each vendor is charging today, compare side by side, and order from whoever suits you best.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#produce" className="btn-primary">Browse vegetables</a>
          <Link to="/vendors" className="btn-ghost">See vendors</Link>
        </div>
      </section>

      <section id="produce" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl">Today's vegetables</h2>
          <input className="input max-w-xs" placeholder="Search tomato, onion..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search vegetables" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={`chip ${!category ? 'chip-on' : ''}`} onClick={() => setCategory('')}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={`chip ${category === c ? 'chip-on' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        {error && <p className="error mt-6">{error}</p>}
        {!produce && !error && <p className="mt-8 text-muted">Loading prices...</p>}
        {produce?.length === 0 && <p className="mt-8 text-muted">No vegetables match. Try another search or category.</p>}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {produce?.map((p) => (
            <Link key={p.key} to={`/produce/${encodeURIComponent(p.key)}`} className="card group p-4 transition-colors hover:border-leaf">
              <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-mist">
                {imageFor(p.name) ? (
                  <img
                    src={imageFor(p.name)}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-5xl">{emojiFor(p.name)}</span>
                )}
              </div>
              <h3 className="mt-3 text-lg">{p.name}</h3>
              <p className="text-sm text-muted">
                from <span className="font-semibold text-ink">{rupee(p.min)}</span>/{p.unit}
                {p.max > p.min && <span> up to {rupee(p.max)}</span>}
              </p>
              <p className="mt-1 text-xs text-muted"><span>{p.vendors === 1 ? '1 vendor' : `${p.vendors} vendors`}</span> &bull; <span>updated {timeAgo(p.updatedAt)}</span></p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
