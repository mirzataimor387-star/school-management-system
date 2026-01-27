"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    /* =============================
       LOAD STUDENTS (teacher based)
    ============================== */
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
        <div className="relative bg-white rounded-xl shadow p-6 min-h-[80vh]">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold">Students</h1>

                <button
                    onClick={() => router.push("/teacher/students/add")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Student
                </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 border">Roll</th>
                            <th className="p-3 border">Name</th>
                            <th className="p-3 border">Father Name</th>
                            <th className="p-3 border">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* LOADING */}
                        {loading && (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-gray-500">
                                    Loading students...
                                </td>
                            </tr>
                        )}

                        {/* EMPTY */}
                        {!loading && students.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-gray-500">
                                    No students found
                                </td>
                            </tr>
                        )}

                        {/* DATA */}
                        {!loading &&
                            students.map((s) => (
                                <tr key={s._id} className="text-center hover:bg-gray-50">
                                    <td className="p-3 border">{s.rollNumber}</td>
                                    <td className="p-3 border font-medium">{s.name}</td>
                                    <td className="p-3 border">{s.fatherName}</td>
                                    <td className="p-3 border capitalize">{s.status}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
