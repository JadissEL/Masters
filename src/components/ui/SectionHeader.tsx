interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
}

export default function SectionHeader({
  title,
  subtitle,
  action,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div className={`section-header ${align === "center" ? "section-header-center" : ""}`}>
      <div className="section-header-text">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="section-header-action">{action}</div>}
    </div>
  );
}
