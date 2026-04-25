import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import CustomCursor from "@/components/ui/CustomCursor";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Credo | Premium Corporate Gifting",
  description: "Curated corporate gifts that leave a lasting impression. From premium hampers to customized merchandise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#1E1E1E] text-white selection:bg-white/20 selection:text-white`}>
        <CustomCursor />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
