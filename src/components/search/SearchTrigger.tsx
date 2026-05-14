import { useState, useEffect } from "react";
import SearchModal from "./SearchModal";

type Role =
  | "administrador"
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor_centro"
  | "tutor_empresa";

interface SearchTriggerProps {
  userRole: Role;
}

/**
 * Drop this inside your Header's "right section", after the nav links.
 * It renders a compact search button that opens <SearchModal>.
 * CTRL+K / ⌘K is registered globally.
 */
export default function SearchTrigger({ userRole }: SearchTriggerProps) {
  const [open, setOpen] = useState(false);

  // Global CTRL+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Trigger button — place it in the header between nav and user menu */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir buscador (Ctrl+K)"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 10,
          border: "1px solid var(--color-border-strong)",
          background: "var(--color-surface)",
          color: "var(--color-text-muted)",
          cursor: "pointer",
          transition: "all 0.18s",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: 13,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(192,255,114,0.25)";
          e.currentTarget.style.background = "var(--color-surface-elevated)";
          e.currentTarget.style.color = "var(--color-text-secondary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border-strong)";
          e.currentTarget.style.background = "var(--color-surface)";
          e.currentTarget.style.color = "var(--color-text-muted)";
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        {/* Label: hidden on small screens */}
        <span className="hidden sm:inline">Buscar</span>

        {/* Shortcut badge: hidden on mobile */}
        <kbd
          className="hidden md:inline-flex"
          style={{
            fontSize: 10,
            padding: "1px 6px",
            borderRadius: 5,
            border: "1px solid var(--color-border-strong)",
            background: "var(--color-surface-strong)",
            color: "var(--color-text-subtle)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          ⌘K
        </kbd>
      </button>

      <SearchModal
        isOpen={open}
        onClose={() => setOpen(false)}
        userRole={userRole}
      />
    </>
  );
}
