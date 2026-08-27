import { initials } from "../lib/format";

/**
 * A user's own photo, or the initials circle as a fallback -- previously
 * hand-rolled just in Layout.jsx; now also used on the profile page's photo
 * card, so it lives here instead of being copied.
 *
 * Props: name, avatarUrl (User.avatarUrl -- undefined falls back to initials),
 * size ("sm", the sidebar's 36px, or "lg", the profile page's 64px), className
 * (extra classes, e.g. the sidebar's hover scale-up).
 */
const SIZE = {
  sm: "h-9 w-9 text-xs",
  lg: "h-16 w-16 text-xl",
};

export function Avatar({ name, avatarUrl, size = "sm", className = "" }) {
  const sizing = SIZE[size] ?? SIZE.sm;

  if (avatarUrl) {
    // alt="" -- decorative: every place this renders, the name is already
    // shown as adjacent text, so a screen reader announcing the image too
    // would just repeat it.
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover shadow-sm ${sizing} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-frost-400 to-aqua-400 font-semibold text-white shadow-sm ${sizing} ${className}`}
    >
      {initials(name)}
    </div>
  );
}
