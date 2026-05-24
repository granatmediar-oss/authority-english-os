import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Authority English OS",
  description: "A speaking trainer for Product Architecture Authority in no-code and AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
