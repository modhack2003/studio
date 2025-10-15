
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { PrismaClient } from '@prisma/client';
import { SiteFooter } from "@/components/site-footer";

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: "Bikram's Cyber Fortress | Cybersecurity Analyst & Penetration Tester",
  description: "Professional portfolio of Bikram Dey, a cybersecurity analyst and penetration tester specializing in network security, vulnerability assessment, and security architecture.",
  keywords: ["cybersecurity", "penetration testing", "security analyst", "vulnerability assessment", "network security", "ethical hacking"],
  authors: [{ name: "Bikram Dey" }],
  creator: "Bikram Dey",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bikram-portfolio.vercel.app",
    title: "Bikram's Cyber Fortress | Cybersecurity Professional",
    description: "Professional portfolio of Bikram Dey, a cybersecurity analyst and penetration tester.",
    siteName: "Bikram's Cyber Fortress",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bikram's Cyber Fortress | Cybersecurity Professional",
    description: "Professional portfolio of Bikram Dey, a cybersecurity analyst and penetration tester.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let personalData = null;
  
  try {
    personalData = await prisma.personalData.findFirst();
  } catch (error) {
    console.error('Database connection failed in layout:', error);
  }
  
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
