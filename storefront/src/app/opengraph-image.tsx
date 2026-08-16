import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Orbis Square — Robotics & Technology Parts"

/**
 * The card that shows up when the store is shared on WhatsApp, Facebook or
 * Messenger — for a Bangladesh storefront this is the single most-seen brand
 * surface after the nav.
 *
 * Built from divs rather than the SVG mark because Satori, which backs
 * ImageResponse, only partially supports SVG. Type is deliberately set in the
 * default font at a single weight: Satori cannot read the woff2 files
 * `next/font` emits for Archivo, and it does not synthesise bold, so the layout
 * leans on scale, tracking and rules instead of weight contrast.
 */
const INK = "#201e1d"
const CANVAS = "#f3f2f2"
const ACCENT = "#ec3013"

function Mark({ px }: { px: number }) {
  const unit = px / 64
  const orbit = 40 * unit // 2r + stroke
  const part = 11 * unit // 2r

  // Every element is placed absolutely from the grid origin. Centring the orbit
  // with flexbox instead would leave the part — which is absolute, and so falls
  // back to its flex static position — sitting beside the orbit rather than on
  // its path.
  return (
    <div style={{ width: px, height: px, display: "flex", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: px,
          height: px,
          border: `${2 * unit}px solid ${INK}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: (64 - 40) / 2 * unit,
          top: (64 - 40) / 2 * unit,
          width: orbit,
          height: orbit,
          borderRadius: "50%",
          border: `${2 * unit}px solid ${INK}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 32 * unit - part / 2,
          top: 13 * unit - part / 2,
          width: part,
          height: part,
          borderRadius: "50%",
          background: ACCENT,
        }}
      />
    </div>
  )
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CANVAS,
          color: INK,
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <Mark px={160} />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 76, letterSpacing: 10, lineHeight: 1 }}>
              ORBIS SQUARE
            </div>
            <div style={{ fontSize: 24, letterSpacing: 6, color: "#605d5d" }}>
              ROBOTICS PARTS · DHAKA
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", height: 8, width: 160, background: ACCENT }} />
          <div style={{ fontSize: 34, lineHeight: 1.35, maxWidth: 900 }}>
            Microcontrollers, sensors, motors and bench tools for makers,
            students and engineers across Bangladesh.
          </div>
        </div>
      </div>
    ),
    size
  )
}
