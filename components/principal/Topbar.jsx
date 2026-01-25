"use client";

import { Bell, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { delay } from "@/utils/delay";

export default function PrincipalTopbar() {
  const router = useRouter();

  const [principal, setPrincipal] = useState(null);
  const [campus, setCampus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNotice, setShowNotice] = useState(true);

  useEffect(() => {
    fetch("/api/principal/me", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrincipal(data.principal);
          setCampus(data.campus);
        }
      });
  }, []);

  const handleLogout = async () => {
    setLoading(true);

    await Promise.all([
      fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }),
      delay(2000),
    ]);

    router.replace("/");
  };

  return (
    <div className="bg-white border-b">



      {/* TOP BAR */}
      <div className="h-14 px-6 flex items-center justify-between">

        {/* LEFT */}
        <h2 className="font-semibold text-gray-800">
          Principal Panel
        </h2>

        {/* RIGHT */}
        <div className="flex items-center gap-6">

          <Bell className="w-5 h-5 text-gray-600" />

          {principal && (
            <div className="flex items-center gap-3">
              <img
                src={principal.avatar || "/avatar.png"}
                className="w-9 h-9 rounded-full border"
                alt="profile"
              />

              <div className="text-sm leading-tight">
                <p className="font-medium">
                  {principal.name}
                </p>
                <p className="text-xs text-gray-500">
                  Principal
                </p>
              </div>
            </div>
          )}

          <button
            disabled={loading}
            onClick={handleLogout}
            className="text-red-600 flex items-center gap-2 text-sm"
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
      </div>

      {/* 🔔 WELCOME / MANAGING INFO */}
      {showNotice && campus && (
        <div className="bg-blue-50 border-b px-6 py-2 flex items-center justify-between text-sm text-blue-800">
          <span>
            You’re managing{" "}
            <strong>
              {campus.name} ({campus.code})
            </strong>
          </span>

          <button onClick={() => setShowNotice(false)}>
            <X className="w-4 h-4 text-blue-700" />
          </button>
        </div>
      )}
    </div>
  );
}
