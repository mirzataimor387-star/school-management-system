"use client";

import { Bell, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { delay } from "@/utils/delay";

export default function PrincipalTopbar({ onMenuClick }) {
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
      delay(1500),
    ]);

    router.replace("/");
  };

  return (
    <div className="bg-white border-b">

      {/* top bar */}
      <div className="h-14 px-4 flex items-center justify-between">

        {/* left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu />
          </button>

          <h2 className="font-semibold text-gray-800">
            Principal Panel
          </h2>
        </div>

        {/* right */}
        <div className="flex items-center gap-5">

          <Bell className="w-5 h-5 text-gray-600" />

          {principal && (
            <div className="flex items-center gap-3">
              <img
                src={principal.avatar || "/avatar.png"}
                className="w-9 h-9 rounded-full border"
                alt="profile"
              />

              <div className="text-sm leading-tight hidden sm:block">
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
                <span className="hidden sm:block">
                  Logout
                </span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* notice bar */}
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
