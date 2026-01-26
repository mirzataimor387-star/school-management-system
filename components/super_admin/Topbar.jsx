"use client";

import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Loader from "@/components/ui/Loader";
import { delay } from "@/utils/delay";

export default function SuperAdminTopbar({ onMenuClick }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    await Promise.all([
      fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }),
      delay(1500),
    ]);

    router.replace("/");
  };

  return (
    <div className="h-14 bg-white border-b px-4 flex items-center justify-between">

      <div className="flex items-center gap-3">
        {/* Hamburger (mobile only) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu />
        </button>

        <h2 className="font-semibold text-gray-700">
          Super Admin Panel
        </h2>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-2 text-sm text-red-600 font-medium"
      >
        {loading ? (
          <Loader text="Logging out..." />
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            Logout
          </>
        )}
      </button>

    </div>
  );
}
