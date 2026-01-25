"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Settings
} from "lucide-react";

export default function PrincipalSidebar() {
  const pathname = usePathname();

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-sm
     ${
       pathname === path
         ? "bg-blue-600 text-white"
         : "text-gray-300 hover:bg-slate-800"
     }`;

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">

      {/* Logo */}
      <h1 className="text-xl font-bold mb-8 text-center">
        SCHOOL PANEL
      </h1>

      {/* Menu */}
      <nav className="space-y-2">

        <Link href="/principal" className={linkClass("/principal")}>
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          href="/principal/teachers"
          className={linkClass("/principal/teachers")}
        >
          <Users size={18} />
          Teachers
        </Link>

        <Link
          href="/principal/students"
          className={linkClass("/principal/students")}
        >
          <Users size={18} />
          Students
        </Link>

        <Link
          href="/principal/classes"
          className={linkClass("/principal/classes")}
        >
          <BookOpen size={18} />
          Classes
        </Link>

        <Link
          href="/principal/attendance"
          className={linkClass("/principal/attendance")}
        >
          <ClipboardList size={18} />
          Attendance
        </Link>

        <Link
          href="/principal/settings"
          className={linkClass("/principal/settings")}
        >
          <Settings size={18} />
          Settings
        </Link>

      </nav>
    </aside>
  );
}
