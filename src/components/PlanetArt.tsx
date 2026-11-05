export function PlanetArt({ kind, className = '' }: { kind: string; className?: string }) {
  return (
    <div className={`planet-art planet-art--${kind} ${className}`} aria-hidden="true">
      <img src={`/art/planet-${kind}.svg`} alt="" draggable={false} />
    </div>
  );
}
