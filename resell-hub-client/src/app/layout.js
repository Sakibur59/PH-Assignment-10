
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/Components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ReSell Hub",
  description: "Buy and sell used items on ReSell Hub marketplace",
  keywords: "buy, sell, used items, marketplace, Bangladesh",
  authors: [{ name: "ReSell Hub" }],
  openGraph: {
    title: "ReSell Hub",
    description: "Buy and sell used items on ReSell Hub marketplace",
    url: "https://resellhub.com",
    siteName: "ReSell Hub",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}