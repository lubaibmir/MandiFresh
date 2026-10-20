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
      <section className="rounded-2xl sm:rounded-3xl bg-mist px-5 py-8 sm:px-12 sm:py-16 lg:px-12 lg:py-16">
        <h1 className="max-w-xl text-3xl sm:text-5xl lg:text-5xl leading-tight">Fresh from the mandi, priced by the vendors themselves.</h1>
        <p className="mt-3 sm:mt-4 max-w-lg text-sm sm:text-base text-muted">See what each vendor is charging today, compare side by side, and order from whoever suits you best.</p>
        <div className="mt-6 sm:mt-7 flex flex-wrap gap-3">
          <a href="#produce" className="btn-primary min-h-[40px] sm:min-h-0">Browse vegetables</a>
          <Link to="/vendors" className="btn-ghost min-h-[40px] sm:min-h-0">See vendors</Link>
        </div>
      </section>

      <section id="produce" className="mt-10 sm:mt-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl">Today's vegetables</h2>
          <input className="input w-full sm:w-auto sm:max-w-xs" placeholder="Search tomato, onion..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search vegetables" />
        </div>
        <div className="mt-4 flex flex-nowrap overflow-x-auto no-scrollbar sm:flex-wrap gap-2 py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button className={`chip shrink-0 min-h-[40px] sm:min-h-0 flex items-center ${!category ? 'chip-on' : ''}`} onClick={() => setCategory('')}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={`chip shrink-0 min-h-[40px] sm:min-h-0 flex items-center ${category === c ? 'chip-on' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        {error && <p className="error mt-6">{error}</p>}
        {!produce && !error && <p className="mt-8 text-muted">Loading prices...</p>}
        {produce?.length === 0 && <p className="mt-8 text-muted">No vegetables match. Try another search or category.</p>}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {produce?.map((p) => (
            <Link key={p.key} to={`/produce/${encodeURIComponent(p.key)}`} className="card group p-3 sm:p-4 lg:p-4 transition-colors hover:border-leaf">
              <div className="flex h-28 sm:h-32 lg:h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-mist">
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
              <h3 className="mt-2.5 sm:mt-3 text-base sm:text-lg">{p.name}</h3>
              <p className="text-xs sm:text-sm text-muted">
                from <span className="font-semibold text-ink">{rupee(p.min)}</span>/{p.unit}
                {p.max > p.min && <span> up to {rupee(p.max)}</span>}
              </p>
              <p className="mt-1 text-[11px] sm:text-xs text-muted"><span>{p.vendors === 1 ? '1 vendor' : `${p.vendors} vendors`}</span> &bull; <span>updated {timeAgo(p.updatedAt)}</span></p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
