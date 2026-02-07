"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  School,
  Settings,
  X,
  PlusSquare,
  UserPlus,
  UserCheck,
} from "lucide-react";

export default function SuperAdminSidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay (mobile only) */}
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
          h-screen
          w-64
          bg-slate-900 text-white
          flex flex-col
          p-5
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold tracking-wide">
            SUPER ADMIN
          </h2>

          <button
            onClick={onClose}
            className="lg:hidden"
          >
            <X />
          </button>
        </div>

        {/* Nav */}
        <nav className="space-y-4 text-sm flex-1">

          <Link
            href="/superadmin"
            onClick={onClose}
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/superadmin/campuses"
            onClick={onClose}
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <School size={18} />
            Campuses
          </Link>

          <Link
            href="/superadmin/create_campus"
            onClick={onClose}
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <PlusSquare size={18} />
            Create Campus
          </Link>

          <Link
            href="/superadmin/create_principal"
            onClick={onClose}
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <UserPlus size={18} />
            Create Principal
          </Link>

          <Link
            href="/superadmin/assign_principal"
            onClick={onClose}
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <UserCheck size={18} />
            Assign Principal
          </Link>

          {/* <Link
            href="/superadmin/settings"
            onClick={onClose}
            className="flex items-center gap-3 hover:text-blue-400"
          >
            <Settings size={18} />
            System Settings
          </Link> */}

        </nav>
      </aside>
    </>
  );
}
