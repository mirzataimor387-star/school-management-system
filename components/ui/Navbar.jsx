"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Routes where navbar should be hidden
  const hideRoutes = [
    "/login",
    "/admin/login",
    "/teacher/login",
    "/super-admin",
    "/principal",
    "/teacher"
  ];

  if (hideRoutes.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">

        {/* Logo */}
        <h1 className="font-bold text-lg md:text-xl text-blue-700">
          The Aim School
        </h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-700 items-center">
          <a className="hover:text-blue-600" href="#">Home</a>
          <a className="hover:text-blue-600" href="#">About</a>
          <a className="hover:text-blue-600" href="#">Admissions</a>
          <a className="hover:text-blue-600" href="#">Classes</a>
          <a className="hover:text-blue-600" href="#">Contact</a>

          {/* Login Dropdown */}
          <div className="relative group">
            <button className="hover:text-blue-600 py-2">
              Login ▾
            </button>

            <div
              className="
                absolute right-0 top-full mt-3 w-44
                bg-white border rounded-md shadow-lg
                opacity-0 invisible
                group-hover:opacity-100
                group-hover:visible
                transition
                z-50
              "
            >
              <a href="/admin/login" className="block px-4 py-2 hover:bg-gray-100">
                Admin Login
              </a>
              <a href="/teacher/login" className="block px-4 py-2 hover:bg-gray-100">
                Teacher Login
              </a>
            </div>
          </div>
        </nav>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t px-6 py-4 space-y-4 text-sm">
          <a className="block" href="#">Home</a>
          <a className="block" href="#">About</a>
          <a className="block" href="#">Admissions</a>
          <a className="block" href="#">Classes</a>
          <a className="block" href="#">Contact</a>

          <div className="pt-2 border-t">
            <p className="font-semibold mb-2">Login</p>
            <a href="/admin/login" className="block py-1 text-blue-600">
              Admin Login
            </a>
            <a href="/teacher/login" className="block py-1 text-blue-600">
              Teacher Login
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
