import Link from "next/link";

interface StatTileProps {
  value: string | number;
  label: string;
  href?: string;
  variant?: "default" | "success" | "accent" | "warning";
}

export default function StatTile({ value, label, href, variant = "default" }: StatTileProps) {
  const inner = (
    <>
      <div className={`stat-tile-value stat-tile-${variant}`}>{value}</div>
      <div className="stat-tile-label">{label}</div>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="card stat-tile stat-tile-link">
        {inner}
      </Link>
    );
  }
  return <div className="card stat-tile">{inner}</div>;
}
