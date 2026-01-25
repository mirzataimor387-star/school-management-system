"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  const hidePrefixes = [
    "/login",
    "/admin/login",
    "/teacher",
    "/principal",
    "/super-admin",
  ];

  const shouldHide = hidePrefixes.some(prefix =>
    pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (shouldHide) return null;

  return (
    <footer className="bg-gray-900 text-white py-6 text-center">
      © {new Date().getFullYear()} The Aim School
    </footer>
  );
}
