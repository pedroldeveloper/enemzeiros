export function ProgressBar({ value, label, compact = false }: { value: number; label?: string; compact?: boolean }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress-track${compact ? ' progress-track-compact' : ''}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(safeValue)}>
      <span className="progress-fill" style={{ width: `${safeValue}%` }} />
    </div>
  );
}
