import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyFlow",
  description: "A premium, modern dark-mode course study planner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col pt-16">
        <AuthProvider>
          <StoreProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
