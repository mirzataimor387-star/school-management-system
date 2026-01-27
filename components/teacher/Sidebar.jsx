"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  FileText,
  Settings,
  X
} from "lucide-react";

export default function TeacherSidebar({ open, setOpen }) {
  const pathname = usePathname();

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-sm
     ${pathname === path
      ? "bg-green-600 text-white"
      : "text-gray-300 hover:bg-slate-800"
    }`;

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-50
          w-64 bg-slate-900 text-white min-h-screen p-4
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-lg font-bold">TEACHER PANEL</h1>

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            <X />
          </button>
        </div>

        {/* Menu */}
        <nav className="space-y-2">

          <Link href="/teacher" className={linkClass("/teacher")}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link href="/teacher/students" className={linkClass("/teacher/students")}>
            <Users size={18} />
            Students
          </Link>

          <Link href="/teacher/attendance" className={linkClass("/teacher/attendance")}>
            <ClipboardCheck size={18} />
            Attendance
          </Link>

          <Link href="/teacher/assignments" className={linkClass("/teacher/assignments")}>
            <FileText size={18} />
            Assignments
          </Link>

          <Link href="/teacher/settings" className={linkClass("/teacher/settings")}>
            <Settings size={18} />
            Settings
          </Link>

        </nav>
      </aside>
    </>
  );
}
