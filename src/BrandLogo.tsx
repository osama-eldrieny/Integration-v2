import type { SVGProps } from "react";

// Neutral placeholder brand mark (replaces the product logo in every prototype).
const Mark = () => (
  <>
    <circle cx="10" cy="10" r="7" fill="none" stroke="#FFF9F4" strokeWidth="2.4" />
    <circle cx="10" cy="10" r="2.6" fill="#FFF9F4" />
  </>
);

export const BrandLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 80 20" {...props}>
    <Mark />
    <text
      x="24"
      y="15"
      fill="#FFF9F4"
      fontFamily="Inter, system-ui, sans-serif"
      fontSize="14"
      fontWeight="700"
      letterSpacing="-0.2"
    >
      Lumen
    </text>
  </svg>
);

export const BrandLogoSquare = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 28 28" {...props}>
    <g transform="translate(4 4)">
      <Mark />
    </g>
  </svg>
);
