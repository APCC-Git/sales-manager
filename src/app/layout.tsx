import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import React from 'react';

const notoSans = Noto_Sans_JP({
  variable: '--font-noto',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: '売上管理アプリ',
  description: '文化祭用売上管理アプリです。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
