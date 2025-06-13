import type { Metadata } from "next";
import { Poppins, Roboto } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '600', '700'],
});

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: "Sammy Parks",
  description: "Sammy Parks Landing Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${roboto.variable}`}>
        {children}
      </body>
    </html>
  );
}
