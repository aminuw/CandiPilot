import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CandiPilot - Tracker de candidatures pour étudiants",
  description: "Suivez vos candidatures de stage facilement. Kanban, relances IA, statistiques. Gratuit pour les étudiants.",
  keywords: ["candidatures", "stage", "étudiant", "tracker", "emploi", "recherche"],
  openGraph: {
    title: "CandiPilot - Tracker de candidatures",
    description: "Suivez vos candidatures de stage facilement",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
