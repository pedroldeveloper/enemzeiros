import { Link } from 'react-router-dom';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" to={compact ? '/painel' : '/'} aria-label="Enemzeiros, página inicial">
      <span className="brand-mark" aria-hidden="true">E</span>
      {!compact && <span className="brand-name">Enemzeiros</span>}
    </Link>
  );
}
