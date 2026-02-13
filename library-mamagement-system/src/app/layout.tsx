import { Work_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "TomeShelf",
  description: "Your personal library tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // CRITICAL CHANGE: data-theme="forest" forces Dark Mode everywhere
    <html lang="en" data-theme="forest">
      <body
        className={`${workSans.variable} ${playfair.variable} antialiased min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-primary-content`}
      >
        {children}
      </body>
    </html>
  );
}
