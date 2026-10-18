export default function Qty({ value, onChange, step = 0.5, min = 0.5 }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white">
      <button type="button" aria-label="Decrease" className="h-8 w-8 text-lg text-forest" onClick={() => onChange(Math.max(0, +(value - step).toFixed(2)))}>-</button>
      <span className="w-10 text-center text-sm tabular-nums">{value}</span>
      <button type="button" aria-label="Increase" className="h-8 w-8 text-lg text-forest" onClick={() => onChange(+(value + step).toFixed(2))}>+</button>
    </div>
  );
}
