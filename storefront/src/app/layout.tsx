import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Archivo } from "next/font/google"
import "styles/globals.css"

// The design's type face. Headings run at 800.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Orbis Square — Robotics & Technology Parts",
    template: "%s | Orbis Square",
  },
  description:
    "Microcontrollers, sensors, motors and bench tools for makers, students and engineers across Bangladesh. Shipped from Dhaka.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={archivo.variable}>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
