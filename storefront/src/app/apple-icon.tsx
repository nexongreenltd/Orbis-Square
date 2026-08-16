import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/**
 * iOS home-screen icon. Apple ignores SVG here and crops to a rounded square,
 * so this is the solid-ink cut of the mark rendered to PNG.
 *
 * Satori (which backs ImageResponse) has only partial SVG support, so the mark
 * is built from divs instead: the orbit is a bordered circle, the part is a
 * filled one. Geometry is derived from the 64-unit grid the mark is drawn on —
 * the orbit's outer diameter is (19 * 2 + 3) / 64 and the part sits at cy 13/64.
 */
const UNIT = size.width / 64

export default function AppleIcon() {
  const orbit = 41 * UNIT // 2r + stroke
  const part = 12 * UNIT // 2r

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#201e1d",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: (size.width - orbit) / 2,
            top: (size.height - orbit) / 2,
            width: orbit,
            height: orbit,
            borderRadius: "50%",
            border: `${3 * UNIT}px solid #f3f2f2`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 32 * UNIT - part / 2,
            top: 13 * UNIT - part / 2,
            width: part,
            height: part,
            borderRadius: "50%",
            background: "#ec3013",
          }}
        />
      </div>
    ),
    size
  )
}
