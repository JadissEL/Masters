"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  SlidersHorizontal,
  Bookmark,
  GraduationCap,
  BarChart3,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

const CANDIDATES = [
  { slug: "dina", name: "Dina", tint: "dina" as const },
  { slug: "jadiss", name: "Jadiss", tint: "jadiss" as const },
];

function extractSlug(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "dina" || parts[0] === "jadiss") return parts[0];
  return null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = extractSlug(pathname);
  const { theme, setTheme, resolved } = useTheme();
  const base = slug ? `/${slug}` : null;

  const navItems = base
    ? [
        { href: base, label: "Home", icon: Home, exact: true },
        { href: `${base}/filter`, label: "Explore", icon: SlidersHorizontal },
        { href: `${base}/tracker`, label: "Tracker", icon: Bookmark },
        ...(slug === "dina"
          ? [{ href: `${base}/phd`, label: "PhD", icon: GraduationCap }]
          : []),
      ]
    : [];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const cycleTheme = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  };

  const ThemeIcon =
    theme === "system" ? Monitor : resolved === "dark" ? Moon : Sun;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link href="/" className="app-brand">
            <span className="app-brand-mark">MF</span>
            <span className="app-brand-text">Master Finder</span>
          </Link>

          {slug && (
            <div className="app-candidate-switcher">
              {CANDIDATES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className={`app-candidate-pill ${slug === c.slug ? "is-active" : ""} tint-${c.tint}`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <div className="app-header-actions">
            <Link href="/audit" className="app-header-link">
              <BarChart3 size={18} />
              <span className="app-header-link-label">Audit</span>
            </Link>
            <button
              type="button"
              className="app-icon-btn"
              onClick={cycleTheme}
              aria-label="Toggle theme"
              title={`Theme: ${theme}`}
            >
              <ThemeIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="app-frame">
        {base && (
          <aside className="app-sidebar" aria-label="Main navigation">
            <nav className="app-sidebar-nav">
              {navItems.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={`app-nav-item ${isActive(href, exact) ? "is-active" : ""}`}
                >
                  <Icon size={20} strokeWidth={1.75} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        )}

        <main className="app-main">
          <div className="page-enter">{children}</div>
        </main>
      </div>

      {base && (
        <nav className="app-tab-bar" aria-label="Mobile navigation">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`app-tab-item ${isActive(href, exact) ? "is-active" : ""}`}
            >
              <Icon size={22} strokeWidth={1.75} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
