
import Link from "next/link";

import { LayoutDashboard, School, UserPlus, Settings } from "lucide-react";

export default function SuperAdminSidebar() {

  return (

    <aside className="w-64 bg-slate-900 text-white p-5 min-h-screen">

      <h2 className="text-xl font-bold mb-8 tracking-wide">
        SUPER ADMIN
      </h2>

      <nav className="space-y-4 text-sm">

        <Link
          href="/super_admin"
          className="flex items-center gap-2 hover:text-blue-400"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          href="/super_admin/campuses"
          className="flex items-center gap-2 hover:text-blue-400"
        >
          <School size={18} />
          Campuses
        </Link>
        <Link
          href="/super_admin/create_campus"
          className="flex items-center gap-2 hover:text-blue-400"
        >
          <School size={18} />
          Create Campuse
        </Link>
        <Link
          href="/super_admin/settings"
          className="flex items-center gap-2 hover:text-blue-400"
        >
          <Settings size={18} />
          System Settings
        </Link>

      </nav>
    </aside>

  );

}
