/**
 * Shared motion tokens, in the same spirit as `ui.js`: written once here so the
 * app moves consistently, rather than every component inventing its own
 * duration and easing.
 *
 * Framer Motion runs app-wide with `reducedMotion="user"` (see main.jsx), so
 * nothing in this file needs its own prefers-reduced-motion branch -- transform
 * and layout animation is dropped automatically for readers who ask for less
 * motion, while the opacity fades, which are what actually carry the meaning
 * here, are kept.
 *
 * Durations are deliberately short. This is a clinical tool people use all day;
 * motion is here to explain what moved where, not to be admired.
 */

/** Fast start, long settle -- reads as "arrived" rather than "drifted in". */
export const EASE = [0.16, 1, 0.3, 1];

export const DURATION = { fast: 0.14, base: 0.2 };

/**
 * Modal backdrop. A plain fade: the panel behind it is blurred, and animating a
 * backdrop-filter is expensive enough to drop frames on a laptop running a full
 * clinic's worth of tabs.
 */
export const backdropMotion = {
  hidden: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE } },
  visible: { opacity: 1, transition: { duration: DURATION.base, ease: EASE } },
};

/**
 * Modal panel. Rises and scales up slightly out of the backdrop. The floor is
 * 0.97 rather than something showier on purpose -- a dialog that zooms reads as
 * an alert, and most of these are routine forms.
 */
export const panelMotion = {
  hidden: { opacity: 0, scale: 0.97, y: 8, transition: { duration: DURATION.fast, ease: EASE } },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};

/**
 * Route change. Exit is quicker than enter so that under AnimatePresence
 * `mode="wait"` (Layout renders one page at a time) the outgoing page is gone
 * before the incoming one starts, without navigation feeling stalled.
 */
export const pageMotion = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.1, ease: "easeIn" } },
};

/**
 * Shared `layoutId` for the sliding pill behind the active sidebar link. One
 * constant so the sidebar and any future nav rail cannot disagree about the
 * name -- two elements sharing a layoutId is what makes the pill travel between
 * them instead of cross-fading.
 */
export const NAV_PILL_ID = "nav-active-pill";
