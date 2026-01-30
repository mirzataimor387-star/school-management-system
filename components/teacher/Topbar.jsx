"use client";

import { Bell, Menu, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeacherTopbar({ setOpen }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/login");
  };

  return (
    <div className="h-14 bg-white border-b px-4 md:px-6 flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden"
        >
          <Menu />
        </button>

        <h2 className="font-semibold text-gray-800">
          The Asian School & College
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">

        {/* Notification */}
        {/* <button className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button> */}

        {/* Teacher label */}
        {/* <div className="flex items-center gap-2 text-gray-700">
          <span className="hidden sm:block text-sm font-medium">
            Teacher
          </span>
        </div> */}

        {/* LOGOUT — ALWAYS VISIBLE */}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>
    </div>
  );
}
