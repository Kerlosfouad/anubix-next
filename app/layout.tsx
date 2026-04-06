import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANUBIX",
  description: "Gym clothes brand in Egypt",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-[hsl(0,0%,93%)]">
        {children}
      </body>
    </html>
  );
}
