"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export default function StudentsPage() {

    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");

    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState("");

    /* =========================
       LOAD CLASSES
    ======================== */
    const loadClasses = async () => {
        try {
            const res = await fetch("/api/principal/classes", {
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setClasses(data.classes || []);
            }
        } catch (err) {
            console.log("CLASS LOAD ERROR");
        }
    };

    /* =========================
       LOAD STUDENTS (CLASS WISE)
    ======================== */
    const loadStudents = async (cid) => {
        if (!cid) return;

        try {
            setLoading(true);
            setApiMessage("");

            const res = await fetch(
                `/api/principal/students?classId=${cid}`,
                { credentials: "include" }
            );

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
        loadClasses();
    }, []);

    useEffect(() => {
        loadStudents(classId);
    }, [classId]);

    return (
        <div className="p-6 space-y-6">

            <h1 className="text-xl font-bold flex items-center gap-2">
                <Users size={22} />
                Students
            </h1>

            {/* ================= CLASS SELECT ================= */}
            <div className="bg-white p-4 rounded-lg shadow w-full md:w-80">
                <label className="block text-sm font-medium mb-1">
                    Select Class
                </label>

                <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                >
                    <option value="">-- Select Class --</option>

                    {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.className}
                        </option>
                    ))}
                </select>
            </div>

            {/* ================= TABLE ================= */}
            <div className="overflow-x-auto">
                <table className="w-full bg-white shadow rounded-xl overflow-hidden">

                    <thead className="bg-gray-100 text-sm">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th>Roll No</th>
                            <th>Class</th>
                            <th>Status</th>
                            <th>Session</th>
                        </tr>
                    </thead>

                    <tbody>

                        {/* ⏳ NO CLASS */}
                        {!classId && (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">
                                    Please select a class
                                </td>
                            </tr>
                        )}

                        {/* 🔄 LOADING */}
                        {loading && (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">
                                    Loading students...
                                </td>
                            </tr>
                        )}

                        {/* ❌ ERROR */}
                        {!loading && apiMessage && (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-red-600">
                                    {apiMessage}
                                </td>
                            </tr>
                        )}

                        {/* ✅ DATA */}
                        {!loading && !apiMessage &&
                            students.map((s) => (
                                <tr key={s._id} className="border-t text-sm hover:bg-gray-50">

                                    <td className="p-3 font-medium">{s.name}</td>

                                    <td>{s.rollNumber}</td>

                                    <td>{s.classId?.className}</td>

                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium
                        ${s.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"}`}
                                        >
                                            {s.status}
                                        </span>
                                    </td>

                                    <td>{s.session}</td>
                                </tr>
                            ))}

                        {/* ⚠️ EMPTY */}
                        {!loading && !apiMessage && classId && students.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">
                                    No students found in this class
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>
        </div>
    );
}
