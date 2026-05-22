import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SkillMeter.Ai - Transforming Content into Competence",
  description: "AI-powered personalized learning roadmaps, interactive practice labs, focus study rooms, and verified certificates. Bridge the 53% talent gap in AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <body className="antialiased bg-white text-black min-h-screen flex flex-col rounded-none">
        {children}
      </body>
    </html>
  );
}
