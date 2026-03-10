import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeScope London — Area Intelligence for Home Buyers",
  description:
    "Comprehensive area intelligence for London home buyers. Property prices, crime data, school ratings, transport links, and demographics — all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
