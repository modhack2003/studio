
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { PrismaClient } from '@prisma/client';
import { SiteFooter } from "@/components/site-footer";

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: "Bikram's Cyber Fortress",
  description: "Portfolio of Bikram Dey, a cybersecurity student.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personalData = await prisma.personalData.findFirst();
  const plainPersonalData = JSON.parse(JSON.stringify(personalData));

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <SiteFooter personalData={plainPersonalData} />
        <Toaster />
      </body>
    </html>
  );
}
