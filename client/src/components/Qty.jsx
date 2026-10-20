export default function Qty({ value, onChange, step = 0.5, min = 0.5 }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white">
      <button type="button" aria-label="Decrease" className="flex h-10 w-10 sm:h-9 sm:w-9 lg:h-8 lg:w-8 items-center justify-center text-lg text-forest" onClick={() => onChange(Math.max(0, +(value - step).toFixed(2)))}>-</button>
      <span className="w-9 sm:w-10 text-center text-sm tabular-nums">{value}</span>
      <button type="button" aria-label="Increase" className="flex h-10 w-10 sm:h-9 sm:w-9 lg:h-8 lg:w-8 items-center justify-center text-lg text-forest" onClick={() => onChange(+(value + step).toFixed(2))}>+</button>
    </div>
  );
}
