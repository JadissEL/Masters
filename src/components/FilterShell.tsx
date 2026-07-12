"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

interface FilterShellProps {
  title: string;
  activeCount?: number;
  onClear?: () => void;
  showClear?: boolean;
  children: React.ReactNode;
}

export default function FilterShell({
  title,
  activeCount = 0,
  onClear,
  showClear = false,
  children,
}: FilterShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="filter-shell card">
      <div className="filter-shell-header">
        <button
          type="button"
          className="filter-shell-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="filter-shell-toggle-label">
            <SlidersHorizontal size={18} aria-hidden />
            {title}
            {activeCount > 0 && (
              <span className="badge badge-accent">{activeCount} active</span>
            )}
          </span>
          <ChevronDown
            size={20}
            className={`filter-shell-chevron${open ? " is-open" : ""}`}
            aria-hidden
          />
        </button>
        {showClear && onClear && (
          <button type="button" onClick={onClear} className="btn btn-secondary filter-shell-clear">
            Clear all
          </button>
        )}
      </div>
      <div className={`filter-shell-body${open ? " is-open" : ""}`}>{children}</div>
    </div>
  );
}
