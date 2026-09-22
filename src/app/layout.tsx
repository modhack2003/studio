import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: `Utopia Tokyo | Masked. Marked. Watched.`,
  description: `Step into Utopia Tokyo, where hidden histories converge with a reimagined future, and ancient masks become symbols of untold possibilities.`,
  keywords: ["cyberpunk", "tokyo", "masks", "futurism", "alternate history", "ritual tech"],
  authors: [{ name: "Utopia Tokyo" }],
  creator: "Utopia Tokyo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://utopiatokyo.com",
    title: "Utopia Tokyo | Masked. Marked. Watched.",
    description: `Step into Utopia Tokyo, where hidden histories converge with a reimagined future, and ancient masks become symbols of untold possibilities.`,
    siteName: "Utopia Tokyo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Utopia Tokyo | Masked. Marked. Watched.",
    description: `Step into Utopia Tokyo, where hidden histories converge with a reimagined future, and ancient masks become symbols of untold possibilities.`,
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

import { PrismaClient } from '@prisma/client';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let plainPersonalData: { name?: string; email?: string; github?: string; linkedin?: string; resumeUrl?: string } | null = null;

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  try {
    const record = await prisma.personalData.findFirst();
    if (record) {
      plainPersonalData = JSON.parse(JSON.stringify(record));
    }
  } catch (error) {
    console.error('Database connection failed in layout:', error);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Preconnect and preload fonts for faster first paint */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap"
        />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <SiteFooter personalData={plainPersonalData as Parameters<typeof SiteFooter>[0]['personalData']} />
        <Toaster />
      </body>
    </html>
  );
}
