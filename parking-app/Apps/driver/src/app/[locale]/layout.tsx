import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import React from "react";

export const metadata: Metadata = {
  title: "Sammy Parks",
  description: "Driver app",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (

    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>

  )
}
