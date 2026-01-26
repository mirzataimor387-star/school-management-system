"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Settings,
  X
} from "lucide-react";

export default function PrincipalSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition
     ${pathname === path
      ? "bg-blue-600 text-white"
      : "text-gray-300 hover:bg-slate-800"
    }`;

  return (
    <>
      {/* overlay (mobile) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:relative
          top-0 left-0
          z-50
          h-screen w-64
          bg-slate-900 text-white
          p-4
          flex flex-col
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">
            SCHOOL PANEL
          </h1>

          <button
            onClick={onClose}
            className="lg:hidden"
          >
            <X />
          </button>
        </div>

        {/* nav */}
        <nav className="space-y-2 flex-1">

          <Link href="/principal" onClick={onClose}
            className={linkClass("/principal")}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link href="/principal/teachers" onClick={onClose}
            className={linkClass("/principal/teachers")}>
            <Users size={18} />
            Teachers
          </Link>

          <Link href="/principal/students" onClick={onClose}
            className={linkClass("/principal/students")}>
            <Users size={18} />
            Students
          </Link>

          <Link href="/principal/classes" onClick={onClose}
            className={linkClass("/principal/classes")}>
            <BookOpen size={18} />
            Classes
          </Link>

          <Link href="/principal/assign-class-teacher" onClick={onClose}
            className={linkClass("/principal/assign-class-teacher")}>
            <BookOpen size={18} />
            Assign Teacher To Class
          </Link>


          <Link href="/principal/attendance" onClick={onClose}
            className={linkClass("/principal/attendance")}>
            <ClipboardList size={18} />
            Attendance
          </Link>

          <Link href="/principal/settings" onClick={onClose}
            className={linkClass("/principal/settings")}>
            <Settings size={18} />
            Settings
          </Link>

        </nav>
      </aside>
    </>
  );
}
