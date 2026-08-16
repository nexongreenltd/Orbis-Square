import React from "react"

type LogoTone = "ink" | "light" | "mono"

type LogoProps = {
  /** Rendered pixel size of the square mark. */
  size?: number
  /**
   * `ink` for light grounds, `light` for the ink/dark grounds used by the
   * footer and side menu, `mono` for single-colour contexts (print, faxable
   * documents) where the red dot has to survive as ink.
   */
  tone?: LogoTone
} & Omit<React.SVGProps<SVGSVGElement>, "ref">

/**
 * The Orbis Square mark: a square grid cell, an orbit inscribed in it, and one
 * part travelling that path — the two words of the name in one figure.
 *
 * Drawn on a 64-unit grid with 2-unit rules so it stays aligned to the flat,
 * zero-radius construction used across the storefront. The stroke is not scaled
 * with `size`, so the mark holds its weight from 16px to full-bleed.
 */
const Logo: React.FC<LogoProps> = ({
  size = 32,
  tone = "ink",
  ...attributes
}) => {
  // The dot is the only element that carries the accent, and on the red ground
  // it has to invert to stay visible.
  const stroke = tone === "light" ? "#f3f2f2" : "#201e1d"
  const dot = tone === "mono" ? stroke : "#ec3013"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...attributes}
    >
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
      />
      <circle
        cx="32"
        cy="32"
        r="19"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
      />
      <circle cx="32" cy="13" r="5.5" fill={dot} />
    </svg>
  )
}

export default Logo
