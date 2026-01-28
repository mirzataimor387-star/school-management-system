"use client";

import { useEffect, useState } from "react";

export default function TeacherAttendanceHistory() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatPakDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-GB");

    const formatTime12 = (dateStr) =>
        new Date(dateStr).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    useEffect(() => {
        async function loadHistory() {
            const res = await fetch("/api/teacher/attendance/history");
            const json = await res.json();
            setData(json.attendance || []);
            setLoading(false);
        }

        loadHistory();
    }, []);

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow">

            <h1 className="text-lg sm:text-xl font-bold mb-4">
                Attendance History
            </h1>

            {/* ================= DESKTOP ================= */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Class</th>
                            <th className="border p-2">Total</th>
                            <th className="border p-2">Present</th>
                            <th className="border p-2">Absent</th>
                            <th className="border p-2">Leave</th>
                            <th className="border p-2">Late</th>
                            <th className="border p-2">Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="8" className="p-4 text-center">
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {!loading && data.length === 0 && (
                            <tr>
                                <td colSpan="8" className="p-4 text-center text-gray-500">
                                    No attendance record found
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            data.map((a) => (
                                <tr key={a._id} className="text-center">
                                    <td className="border p-2">
                                        {formatPakDate(a.date)}
                                    </td>

                                    <td className="border p-2">
                                        {a.classId?.className} - {a.classId?.section}
                                    </td>

                                    <td className="border p-2 font-semibold">
                                        {a.summary.total}
                                    </td>

                                    <td className="border p-2 text-green-700 font-semibold">
                                        {a.summary.present}
                                    </td>

                                    <td className="border p-2 text-red-600 font-semibold">
                                        {a.summary.absent}
                                    </td>

                                    <td className="border p-2 text-blue-600 font-semibold">
                                        {a.summary.leave}
                                    </td>

                                    <td className="border p-2 text-orange-600 font-semibold">
                                        {a.summary.late}
                                    </td>

                                    <td className="border p-2">
                                        {formatTime12(a.createdAt)}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* ================= MOBILE ================= */}
            <div className="md:hidden space-y-4">
                {!loading &&
                    data.map((a) => (
                        <div
                            key={a._id}
                            className="border rounded-lg p-4 shadow-sm"
                        >
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold">
                                    {formatPakDate(a.date)}
                                </span>
                                <span className="text-gray-500">
                                    {formatTime12(a.createdAt)}
                                </span>
                            </div>

                            <p className="font-medium">
                                {a.classId?.className} - {a.classId?.section}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                <p>👥 Total: {a.summary.total}</p>
                                <p className="text-green-700">
                                    ✅ Present: {a.summary.present}
                                </p>
                                <p className="text-red-600">
                                    ❌ Absent: {a.summary.absent}
                                </p>
                                <p className="text-blue-600">
                                    🟦 Leave: {a.summary.leave}
                                </p>
                                <p className="text-orange-600">
                                    ⏰ Late: {a.summary.late}
                                </p>
                            </div>
                        </div>
                    ))}
            </div>

        </div>
    );
}
