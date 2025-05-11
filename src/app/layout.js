import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Sequence Card Game",
  description: "A multiplayer online implementation of the popular Sequence board game using Next.js, React, and Socket.io.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
      {/* <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
