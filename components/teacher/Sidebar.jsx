"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileText,
  Settings,
  X
} from "lucide-react";

export default function TeacherSidebar({ open, setOpen }) {
  const pathname = usePathname();

  // ✅ close sidebar on mobile
  const handleLinkClick = () => {
    setOpen(false);
  };

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition
     ${pathname === path
      ? "bg-green-600 text-white"
      : "text-gray-300 hover:bg-slate-800"
    }`;

  return (
    <>
      {/* ================= OVERLAY (mobile) ================= */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed lg:static z-50
          w-64 bg-slate-900 text-white min-h-screen p-4
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-lg font-bold tracking-wide">
            TEACHER PANEL
          </h1>

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            <X />
          </button>
        </div>

        {/* ================= MENU ================= */}
        <nav className="space-y-2">

          <Link
            href="/teacher"
            className={linkClass("/teacher")}
            onClick={handleLinkClick}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/teacher/students"
            className={linkClass("/teacher/students")}
            onClick={handleLinkClick}
          >
            <Users size={18} />
            Students
          </Link>

          <Link
            href="/teacher/attendance"
            className={linkClass("/teacher/attendance")}
            onClick={handleLinkClick}
          >
            <ClipboardCheck size={18} />
            Attendance
          </Link>

          <Link
            href="/teacher/assignments"
            className={linkClass("/teacher/assignments")}
            onClick={handleLinkClick}
          >
            <FileText size={18} />
            Assignments
          </Link>

          <Link
            href="/teacher/settings"
            className={linkClass("/teacher/settings")}
            onClick={handleLinkClick}
          >
            <Settings size={18} />
            Settings
          </Link>

        </nav>
      </aside>
    </>
  );
}
