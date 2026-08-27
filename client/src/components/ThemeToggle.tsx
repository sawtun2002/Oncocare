import { useTheme, type ThemePreference } from "../context/ThemeContext";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match system" },
];

/**
 * Three-way theme control. "System" is a real option rather than just the
 * default, because a media query alone cannot express "I want light while my OS
 * is dark".
 *
 * Icon-only: it lives in a 240px sidebar. The accessible name comes from the
 * radio semantics plus the sr-only label, not the glyph.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="mt-3 flex gap-0.5 rounded-lg border border-hairline/70 bg-surface/40 p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={`flex flex-1 items-center justify-center rounded-md px-2 py-1.5 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-frost-400/60 ${
              active
                ? "bg-gradient-to-r from-frost-500/90 to-aqua-400/80 text-white shadow-sm"
                : "text-ink-400 hover:bg-surface/70 hover:text-ink-700"
            }`}
          >
            <ThemeIcon preference={option.value} />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (preference === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  if (preference === "dark") {
    return (
      <svg {...common}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
