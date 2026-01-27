"use client";

import { Bell, Menu, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TeacherTopbar({ setOpen }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/login");
  };

  return (
    <div className="h-14 bg-white border-b px-4 md:px-6 flex items-center justify-between">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden"
        >
          <Menu />
        </button>

        <h2 className="font-semibold text-gray-800">
          Teacher Panel
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5 relative">

        {/* Notification */}
        <button className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div
          onClick={() => setOpenMenu(!openMenu)}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <User className="w-6 h-6 text-gray-700" />
          <span className="hidden sm:block text-sm font-medium">
            Teacher
          </span>
        </div>

        {/* Dropdown */}
        {openMenu && (
          <div className="absolute right-0 top-12 w-40 bg-white border rounded shadow-md z-50">
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
