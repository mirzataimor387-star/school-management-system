"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // admin routes check
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {/* show only on public pages */}
        {!isAdminRoute && <Navbar />}

        {children}

        {!isAdminRoute && <Footer />}
      </body>
    </html>
  );
}
