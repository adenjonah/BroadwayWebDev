import { Source_Sans_3, Libre_Baskerville } from "next/font/google"
import { getNavbarData } from "../lib/data"
import { urlForImage } from "../lib/sanity-image"
import Navbar from "./components/Navbar"
import "./globals.css"

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata = {
  title: "Nine Mile Feed & Hardware | Family-Owned in Nine Mile Falls, WA",
  description:
    "Your local hardware store for tools, home improvement, feed, landscaping, and more. Family-owned and serving Nine Mile Falls for over 25 years.",
}

export default async function RootLayout({ children }) {
  const { storeInfo, logoImage } = await getNavbarData()
  const logoUrl = logoImage?.image
    ? urlForImage(logoImage.image).width(96).height(96).url()
    : null

  return (
    <html
      lang="en"
      className={`scroll-smooth ${sourceSans.variable} ${libreBaskerville.variable}`}
    >
      <body className="antialiased">
        <Navbar
          storeName={storeInfo?.storeName || "Nine Mile Feed & Hardware"}
          phone={storeInfo?.phone}
          logoUrl={logoUrl}
        />
        {children}
      </body>
    </html>
  )
}
