// Textura's `Design` icon (@exp-textura/icons) only supports a solid `currentColor` stroke via
// CSS `color`, which can't express a multi-stop gradient. The design calls for one here, so this
// redraws the same path data with an SVG <linearGradient> stroke instead — reusing Textura's own
// governed AI-gradient token pair (color.brand.primary.purple → color.brand.tertiary.pink100),
// the only purple-to-pink gradient the design system defines.
export function DesignGradientIcon({
  width = 20,
  height = 20,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <defs>
        <linearGradient id="option3-design-gradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0" stopColor="var(--ntx-color-brand-primary-purple, #8439a6)" />
          <stop offset="1" stopColor="var(--ntx-color-brand-tertiary-pink100, #ed2891)" />
        </linearGradient>
      </defs>
      <g stroke="url(#option3-design-gradient)" strokeWidth={2}>
        <path d="m17.23 11.573 5.17 5.17-5.657 5.656-5.16-5.16M19.819 14.182l-3 3M9.819 4.182l-3 3M18.951 9.83l-4.78-4.781L17.22 2 22 6.78zM18.951 9.83 6.781 22H2v-4.78L14.17 5.049z" />
        <path d="M12.445 6.787 7.257 1.6 1.601 7.256l5.178 5.179" />
      </g>
    </svg>
  );
}
