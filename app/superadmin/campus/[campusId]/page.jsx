"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CampusLayout({ children }) {
    const { campusId } = useParams();
    const pathname = usePathname();
    const router = useRouter();

    const [campusName, setCampusName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!campusId) return;

        const fetchCampus = async () => {
            try {
                const res = await fetch(
                    `/api/superadmin/campus/${campusId}`,
                    {
                        credentials: "include",
                    }
                );

                const data = await res.json();

                // ❌ AUTH ERROR
                if (res.status === 401 || res.status === 403) {
                    console.error("AUTH ERROR:", data);
                    setError("You are not authorized to access this campus");
                    router.replace("/login");
                    return;
                }

                // ❌ NOT FOUND
                if (res.status === 404) {
                    setError("Campus not found");
                    return;
                }

                // ❌ SERVER ERROR
                if (!res.ok) {
                    setError("Server error while loading campus");
                    return;
                }

                // ✅ SUCCESS
                setCampusName(data.campus?.name || "");
                setLoading(false);

            } catch (err) {
                console.error("FETCH ERROR:", err);
                setError("Network error");
            }
        };

        fetchCampus();

    }, [campusId, router]);

    const nav = [
        { name: "Overview", href: `/superadmin/campus/${campusId}` },
        { name: "Teachers", href: `/superadmin/campus/${campusId}/teachers` },
        { name: "Students", href: `/superadmin/campus/${campusId}/students` },
        { name: "Attendance", href: `/superadmin/campus/${campusId}/attendance` },
        { name: "Fees", href: `/superadmin/campus/${campusId}/fees` },
        { name: "Reports", href: `/superadmin/campus/${campusId}/reports` },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading campus...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4">
                <p className="text-red-600 font-semibold">{error}</p>

                <Link
                    href="/superadmin/campus"
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

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold">
                                {campusName || "Campus Dashboard"}
                            </h1>
                            <p className="text-xs text-gray-500">
                                Super Admin Panel
                            </p>
                        </div>

                        <Link
                            href="/superadmin/campuses"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            ← All Campuses
                        </Link>
                    </div>

                    {/* ================= NAV ================= */}
                    <div className="overflow-x-auto">
                        <div className="flex gap-2 min-w-max">
                            {nav.map((link) => {
                                const active =
                                    pathname === link.href ||
                                    pathname.startsWith(link.href + "/");

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                      ${active
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-gray-700 hover:bg-slate-200"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>

            {/* ================= BODY ================= */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                {children}
            </main>

        </div>
    );
}
