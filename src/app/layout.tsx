import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameSnap - Chess Scoresheet to PGN",
  description: "Convert handwritten chess scoresheets to PGN format instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
