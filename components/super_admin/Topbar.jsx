"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";
import Loader from "@/components/ui/Loader";
import { delay } from "@/utils/delay";

export default function SuperAdminTopbar() {
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
      delay(2000), // ⏳ minimum UX delay
    ]);

    router.replace("/");
  };

  return (
    <div className="h-14 bg-white border-b px-6 flex items-center justify-between">

      <h2 className="font-semibold text-gray-700">
        Super Admin Panel
      </h2>

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
