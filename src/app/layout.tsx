import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

// ✅ Corrected: Separate viewport export
export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

// ✅ Metadata (excluding viewport)
export const metadata: Metadata = {
  title: "Quiz Platform",
  description: "The Quiz Platform is an innovative online learning tool designed to help students enhance their knowledge through interactive and timed quizzes.",
  metadataBase: new URL("https://computerscienceanddesign.vercel.app/"), // ✅ Replace with your actual domain
  icons: "/favicon.ico",
  keywords: ["online quiz platform","educational quizzes","interactive learning","student quiz tool","timed quizzes","e-learning","quiz app","academic quizzes","online education","quiz platform India"],
  authors: [{ name: "Computer Science and Design", url: "https://computerscienceanddesign.vercel.app//" }],
  openGraph: {
    title: "Quiz Platform",
    description: "The Quiz Platform is an innovative online learning tool designed to help students enhance their knowledge through interactive and timed quizzes.",
    url: "https://computerscienceanddesign.vercel.app/",
    siteName: "Quiz Platform",
    images: [
      {
        url: "/logo.png", // ✅ Ensure this image exists in public/
        width: 1200,
        height: 630,
        alt: "Quiz Platform Preview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiz Platform",
    description: "The Quiz Platform is an innovative online learning tool designed to help students enhance their knowledge through interactive and timed quizzes.",
    images: ["/logo.png"], // ✅ Ensure this image exists in public/
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="bg-offwhite">{children}</main>
        <Toaster richColors />
      </body>
    </html>
  );
}