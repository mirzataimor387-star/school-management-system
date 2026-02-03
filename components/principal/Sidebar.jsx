"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Settings,
  Wallet,
  FileText,
  History,
  AlertCircle,
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
          <h1 className="text-xl font-bold">SCHOOL PANEL</h1>

          <button onClick={onClose} className="lg:hidden">
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

          {/* ================= fee ================= */}

          <div className="pt-3 border-t border-slate-700 text-xs text-gray-400 px-4">
            fee MANAGEMENT
          </div>

          <Link href="/principal/fee/structure" onClick={onClose}
            className={linkClass("/principal/fee/structure")}>
            <Wallet size={18} />
            Fee Structure
          </Link>

          <Link href="/principal/fee/generate" onClick={onClose}
            className={linkClass("/principal/fee/generate")}>
            <FileText size={18} />
            Generate Fee
          </Link>

          {/* <Link href="/principal/fee/collect" onClick={onClose}
            className={linkClass("/principal/fee/collect")}>
            <Wallet size={18} />
            Collect Fee
          </Link> */}

          {/* <Link href="/principal/fee/history" onClick={onClose}
            className={linkClass("/principal/fee/history")}>
            <History size={18} />
            Fee History
          </Link> */}

          {/* <Link href="/principal/fee/defaulters" onClick={onClose}
            className={linkClass("/principal/fee/defaulters")}>
            <AlertCircle size={18} />
            Defaulters
          </Link> */}

          {/* ================= END ================= */}

          <Link href="/principal/fee/vouchers" onClick={onClose}
            className={linkClass("/principal/fee/vouchers")}>
            <Settings size={18} />
            Fee Vouchers
          </Link>

        </nav>
      </aside>
    </>
  );
}
