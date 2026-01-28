"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const res = await fetch("/api/teacher/students", {
                    credentials: "include",
                });

                const data = await res.json();
                setStudents(data.students || []);
            } catch {
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        loadStudents();
    }, []);

    return (
        <div className="relative bg-white rounded-xl shadow p-4 sm:p-6 min-h-[80vh]">

            {/* ================= HEADER ================= */}
            <div className="mb-6">
                <h1 className="text-lg sm:text-xl font-bold">
                    Students
                </h1>
            </div>

            {/* ================= DESKTOP TABLE ================= */}
            <div className="hidden md:block overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="p-3 border text-left">Roll</th>
                            <th className="p-3 border text-left">Name</th>
                            <th className="p-3 border text-left">Father Name</th>
                            <th className="p-3 border text-left">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-gray-500">
                                    Loading students...
                                </td>
                            </tr>
                        )}

                        {!loading && students.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-gray-500">
                                    No students found
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            students.map((s) => (
                                <tr
                                    key={s._id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="p-3 border">{s.rollNumber}</td>
                                    <td className="p-3 border font-medium">{s.name}</td>
                                    <td className="p-3 border">{s.fatherName}</td>
                                    <td className="p-3 border capitalize">{s.status}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* ================= MOBILE CARDS ================= */}
            <div className="md:hidden space-y-3">
                {loading && (
                    <p className="text-center text-gray-500 py-10">
                        Loading students...
                    </p>
                )}

                {!loading && students.length === 0 && (
                    <p className="text-center text-gray-500 py-10">
                        No students found
                    </p>
                )}

                {!loading &&
                    students.map((s) => (
                        <div
                            key={s._id}
                            className="border rounded-lg p-4 shadow-sm"
                        >
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-semibold">
                                    Roll #{s.rollNumber}
                                </span>

                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 capitalize">
                                    {s.status}
                                </span>
                            </div>

                            <p className="font-medium text-gray-900">
                                {s.name}
                            </p>

                            <p className="text-sm text-gray-600 mt-1">
                                Father: {s.fatherName}
                            </p>
                        </div>
                    ))}
            </div>

            {/* ================= FLOATING ADD BUTTON ================= */}
            <button
                onClick={() => router.push("/teacher/students/add")}
                title="Add Student"
                className="
          fixed bottom-6 right-6
          bg-green-600 hover:bg-green-700
          text-white rounded-full
          w-14 h-14
          flex items-center justify-center
          shadow-lg
          transition
          z-50
        "
            >
                <Plus size={26} />
            </button>

        </div>
    );
}
