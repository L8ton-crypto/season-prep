import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeasonPrep - Get ahead of the next season",
  description:
    "Stop being caught out by the changing seasons. Track wardrobe sizing, school prep, holiday plans, and seasonal tasks with one shared family checklist.",
  openGraph: {
    title: "SeasonPrep - Get ahead of the next season",
    description: "One family checklist for every seasonal switch. Wardrobe, school, holidays, home.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
