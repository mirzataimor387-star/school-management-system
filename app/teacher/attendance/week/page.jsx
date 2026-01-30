"use client";

import { useEffect, useState } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyAttendance() {
    const [data, setData] = useState(null);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        fetch("/api/teacher/attendance/weekly")
            .then(r => r.json())
            .then(d => setData(d));
    }, []);

    if (!data) return <p className="p-6">Loading register...</p>;

    return (
        <div className="p-6 space-y-4">

            {/* HEADER */}
            <div className="border p-4 rounded-xl bg-white">
                <h1 className="text-xl font-bold">
                    Weekly Attendance Register
                </h1>

                <div className="text-sm text-gray-600 mt-2 flex flex-wrap gap-4">
                    <span>🏫 Campus: {data.campus}</span>
                    <span>👨‍🏫 Teacher: {data.teacher}</span>
                    <span>🏷 Class: {data.class}</span>
                    <span>📅 Month: {data.month}</span>
                    <span>📆 Week: {data.week}</span>
                    <span>
                        ⏰ Time:{" "}
                        {now.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </span>
                </div>
            </div>

            {/* REGISTER */}
            <div className="overflow-x-auto bg-white rounded-xl shadow">
                <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Roll</th>
                            <th className="border p-2">Student</th>
                            {days.map(d => (
                                <th key={d} className="border p-2 text-center">
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data.students.map((s) => (
                            <tr key={s._id}>
                                <td className="border p-2">{s.roll}</td>
                                <td className="border p-2">{s.name}</td>

                                {days.map((d) => (
                                    <td
                                        key={d}
                                        className="border p-2 text-center font-semibold"
                                    >
                                        {s.attendance[d] || "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
