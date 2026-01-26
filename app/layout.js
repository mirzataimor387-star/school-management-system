"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // 🔒 dashboard routes
  const isProtectedRoute =
    pathname.startsWith("/super_admin") ||
    pathname.startsWith("/principal") ||
    pathname.startsWith("/principal") ||
    pathname.startsWith("/login");

  return (
    <html lang="en">
      <body className="bg-white text-gray-900">

        {/* ✅ PUBLIC ONLY */}
        {!isProtectedRoute && <Navbar />}

        {children}

        {!isProtectedRoute && <Footer />}

      </body>
    </html>
  );
}
