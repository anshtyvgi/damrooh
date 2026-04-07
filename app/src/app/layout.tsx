import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Damrooh — Make a song for someone you love",
  description:
    "Create personalized AI-generated songs and dedicate them to the people you love. Birthday, anniversary, love, apology — say it with a Damrooh.",
  openGraph: {
    title: "Damrooh — Make a song for someone you love",
    description:
      "Create personalized AI-generated songs and dedicate them to the people you love.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
