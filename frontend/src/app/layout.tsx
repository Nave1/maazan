import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מאזן – Financial Operating System",
  description: "AI-powered personal finance platform for Israeli households",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-hebrew antialiased">
        {children}
      </body>
    </html>
  );
}
