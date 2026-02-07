"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Classes from "./tabs/Classes";
import Teachers from "./tabs/Teachers";
import Attendance from "./tabs/Attendance";
import Fees from "./tabs/Fees";

export default function CampusLayout({ children }) {
  const { campusId } = useParams();
  const router = useRouter();

  const [campusName, setCampusName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("classes");

  // ================= FETCH CAMPUS =================
  useEffect(() => {
    if (!campusId) return;

    const fetchCampus = async () => {
      try {
        const res = await fetch(`/api/superadmin/campus/${campusId}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return;
        }

        if (!res.ok) {
          setError("Campus not found");
          return;
        }

        setCampusName(data.campus?.name || "Campus");
        setLoading(false);
      } catch {
        setError("Network error");
      }
    };

    fetchCampus();
  }, [campusId, router]);

  const tabs = [
    { key: "classes", label: "Classes" },
    { key: "teachers", label: "Teachers" },
    { key: "attendance", label: "Attendance" },
    { key: "fees", label: "Fees" },
  ];

  // ================= STATES =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading campus…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-semibold">{error}</p>
        <Link
          href="/superadmin/campuses"
          className="text-blue-600 underline text-sm"
        >
          ← Back to campuses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ================= HEADER ================= */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 space-y-4">

          {/* TITLE */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{campusName}</h1>
              <p className="text-xs text-gray-500">Super Admin Panel</p>
            </div>

            <Link
              href="/superadmin/campuses"
              className="text-sm text-blue-600 hover:underline"
            >
              ← All Campuses
            </Link>
          </div>

          {/* ================= TABS NAV ================= */}
          <div>

            {/* 📱 MOBILE: DROPDOWN */}
            <div className="sm:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                {tabs.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 💻 DESKTOP: HORIZONTAL TABS */}
            <div className="hidden sm:flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition
                    ${
                      activeTab === tab.key
                        ? "bg-blue-600 text-white shadow"
                        : "bg-slate-100 text-gray-700 hover:bg-slate-200"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* ================= BODY ================= */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {activeTab === "classes" && <Classes campusId={campusId} />}
        {activeTab === "teachers" && <Teachers campusId={campusId} />}
        {activeTab === "attendance" && <Attendance campusId={campusId} />}
        {activeTab === "fees" && <Fees campusId={campusId} />}
      </main>

    </div>
  );
}
