"use client";

import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">

        {/* Logo */}
        <h1 className="font-bold text-lg md:text-xl text-blue-700">
          The Aim School
        </h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
          <a className="hover:text-blue-600" href="#">Home</a>
          <a className="hover:text-blue-600" href="#">About</a>
          <a className="hover:text-blue-600" href="#">Admissions</a>
          <a className="hover:text-blue-600" href="#">Classes</a>
          <a className="hover:text-blue-600" href="#">Contact</a>
          <a className="hover:text-blue-600" href="#">Admin</a>
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
          <a className="block" href="#">Admin</a>
          <a className="block" href="#">Contact</a>
        </div>
      )}
    </header>
  );
}
