"use client";

import { useEffect, useState } from "react";

export default function TeacherMonthlyAttendance() {
    const [report, setReport] = useState([]);
    const [classInfo, setClassInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const session = "2024-2025";
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM

    useEffect(() => {
        async function loadData() {
            const classRes = await fetch("/api/teacher/classes");
            const classes = await classRes.json();

            if (!classes.length) return;

            const cls = classes[0];
            setClassInfo(cls);

            const res = await fetch(
                `/api/teacher/attendance/monthly?classId=${cls._id}&session=${session}&month=${month}`
            );

            const json = await res.json();
            setReport(json.report || []);
            setLoading(false);
        }

        loadData();
    }, []);

    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <div className="p-6 bg-white rounded-xl shadow">

            <h1 className="text-xl font-bold mb-4">
                Monthly Attendance ({month})
            </h1>

            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2">Roll</th>
                        <th className="border p-2">Student</th>
                        <th className="border p-2">Present</th>
                        <th className="border p-2">Late</th>
                        <th className="border p-2">Absent</th>
                        <th className="border p-2">Leave</th>
                        <th className="border p-2">%</th>
                    </tr>
                </thead>

                <tbody>
                    {report.map(r => (
                        <tr key={r.studentId} className="text-center">
                            <td className="border p-2">{r.rollNumber}</td>
                            <td className="border p-2">{r.name}</td>
                            <td className="border p-2 text-green-700">{r.present}</td>
                            <td className="border p-2 text-orange-600">{r.late}</td>
                            <td className="border p-2 text-red-600">{r.absent}</td>
                            <td className="border p-2 text-blue-600">{r.leave}</td>
                            <td className="border p-2 font-semibold">
                                {r.percentage}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}
