"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export default function StudentsPage() {

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiMessage, setApiMessage] = useState("");

    /* =========================
       LOAD STUDENTS
    ======================== */
    const loadStudents = async () => {
        try {
            setLoading(true);
            setApiMessage("");

            const res = await fetch("/api/principal/students", {
                credentials: "same-origin",
            });

            const data = await res.json();

            if (!data.success) {
                setApiMessage(data.message || "Failed to load students");
                setStudents([]);
                return;
            }

            setStudents(data.students || []);

        } catch (err) {
            setApiMessage("Server not responding");
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    return (
        <div className="p-6">

            <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users size={22} />
                All Students
            </h1>

            <div className="overflow-x-auto">
                <table className="w-full bg-white shadow rounded-xl overflow-hidden">

                    <thead className="bg-gray-100 text-sm">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th>Roll No</th>
                            <th>Class</th>
                            <th>Section</th>
                            <th>Status</th>
                            <th>Session</th>
                        </tr>
                    </thead>

                    <tbody>

                        {/* 🔄 LOADING */}
                        {loading && (
                            <tr>
                                <td colSpan="6" className="p-6 text-center text-gray-500">
                                    Loading students...
                                </td>
                            </tr>
                        )}

                        {/* ❌ API ERROR */}
                        {!loading && apiMessage && (
                            <tr>
                                <td colSpan="6" className="p-6 text-center text-red-600">
                                    {apiMessage}
                                </td>
                            </tr>
                        )}

                        {/* ✅ DATA */}
                        {!loading && !apiMessage &&
                            students.map((s) => (
                                <tr key={s._id} className="border-t text-sm hover:bg-gray-50">

                                    <td className="p-3 font-medium">
                                        {s.name}
                                    </td>

                                    <td>
                                        {s.rollNumber}
                                    </td>

                                    <td>
                                        {s.classId?.className || "-"}
                                    </td>

                                    <td>
                                        {s.classId?.section || "-"}
                                    </td>

                                    <td>
                                        <span
                                            className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${s.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : s.status === "left"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-gray-100 text-gray-700"}
                      `}
                                        >
                                            {s.status}
                                        </span>
                                    </td>

                                    <td>
                                        {s.session}
                                    </td>
                                </tr>
                            ))}

                        {/* ⚠️ EMPTY */}
                        {!loading && !apiMessage && students.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-6 text-center text-gray-500">
                                    No students found
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>
        </div>
    );
}
