"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  FileText,
  Settings
} from "lucide-react";

export default function TeacherSidebar() {
  const pathname = usePathname();

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-sm
     ${pathname === path
      ? "bg-green-600 text-white"
      : "text-gray-300 hover:bg-slate-800"
    }`;

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">

      {/* Logo */}
      <h1 className="text-xl font-bold mb-8 text-center">
        TEACHER PANEL
      </h1>

      {/* Menu */}
      <nav className="space-y-2">

        <Link href="/teacher" className={linkClass("/teacher")}>
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          href="/teacher/classes"
          className={linkClass("/teacher/classes")}
        >
          <BookOpen size={18} />
          My Class
        </Link>

        <Link
          href="/teacher/students"
          className={linkClass("/teacher/students")}
        >
          <Users size={18} />
          Students
        </Link>

        <Link
          href="/teacher/attendance"
          className={linkClass("/teacher/attendance")}
        >
          <ClipboardCheck size={18} />
          Attendance
        </Link>

        <Link
          href="/teacher/assignments"
          className={linkClass("/teacher/assignments")}
        >
          <FileText size={18} />
          Assignments
        </Link>

        <Link
          href="/teacher/settings"
          className={linkClass("/teacher/settings")}
        >
          <Settings size={18} />
          Settings
        </Link>

      </nav>
    </aside>
  );
}
