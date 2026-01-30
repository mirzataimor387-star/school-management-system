"use client";

import { useEffect, useState } from "react";

export default function SuperAdminAttendancePage() {
    const [campuses, setCampuses] = useState([]);
    const [classes, setClasses] = useState([]);

    const [campusId, setCampusId] = useState("");
    const [classId, setClassId] = useState("");
    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    const session = "2024-2025";

    /* =============================
       LOAD CAMPUSES
    ============================== */
    useEffect(() => {
        fetch("/api/super-admin/campuses")
            .then((res) => res.json())
            .then((data) => setCampuses(data || []));
    }, []);

    /* =============================
       LOAD CLASSES BY CAMPUS
    ============================== */
    useEffect(() => {
        if (!campusId) return;

        fetch(`/api/super-admin/classes?campusId=${campusId}`)
            .then((res) => res.json())
            .then((data) => setClasses(data || []));
    }, [campusId]);

    /* =============================
       VIEW ATTENDANCE
    ============================== */
    const loadAttendance = async () => {
        if (!campusId || !classId || !date) {
            alert("Please select campus, class and date");
            return;
        }

        setLoading(true);

        const res = await fetch(
            `/api/super-admin/attendance/class?campusId=${campusId}&classId=${classId}&session=${session}&date=${date}`
        );

        const json = await res.json();
        setData(json);
        setLoading(false);
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">

            {/* ================= HEADER ================= */}
            <h1 className="text-xl sm:text-2xl font-bold">
                Class Attendance (View Only)
            </h1>

            {/* ================= FILTERS ================= */}
            <div className="bg-white p-4 rounded-xl shadow grid grid-cols-1 md:grid-cols-4 gap-4">

                <select
                    value={campusId}
                    onChange={(e) => {
                        setCampusId(e.target.value);
                        setClassId("");
                        setData(null);
                    }}
                    className="border p-2 rounded"
                >
                    <option value="">Select Campus</option>
                    {campuses.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <select
                    value={classId}
                    onChange={(e) => {
                        setClassId(e.target.value);
                        setData(null);
                    }}
                    className="border p-2 rounded"
                >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.className} - {c.section}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border p-2 rounded"
                />

                <button
                    onClick={loadAttendance}
                    className="bg-blue-600 text-white rounded px-4 py-2"
                >
                    View Attendance
                </button>
            </div>

            {/* ================= RESULT ================= */}
            {loading && (
                <p className="text-center text-gray-500">
                    Loading attendance...
                </p>
            )}

            {/* ================= SUMMARY ================= */}
            {data?.marked && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

                    <Summary label="Total" value={data.summary.total} />
                    <Summary label="Present" value={data.summary.present} color="text-green-600" />
                    <Summary label="Late" value={data.summary.late} color="text-yellow-600" />
                    <Summary label="Absent" value={data.summary.absent} color="text-red-600" />
                    <Summary label="Leave" value={data.summary.leave} color="text-blue-600" />

                </div>
            )}

            {/* ================= TABLE ================= */}
            {data?.marked && (
                <div className="bg-white rounded-xl shadow overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border">Roll</th>
                                <th className="p-3 border">Student</th>
                                <th className="p-3 border">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.students.map((s) => (
                                <tr key={s.studentId} className="text-center">
                                    <td className="p-3 border">{s.rollNumber}</td>
                                    <td className="p-3 border">{s.name}</td>
                                    <td className="p-3 border capitalize font-semibold">
                                        {s.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ================= NOT MARKED ================= */}
            {data && !data.marked && (
                <div className="bg-yellow-100 border border-yellow-300 p-4 rounded">
                    Attendance not marked for this date.
                </div>
            )}

        </div>
    );
}

/* =============================
   SUMMARY CARD
============================== */
function Summary({ label, value, color = "text-gray-800" }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-xl font-bold ${color}`}>
                {value}
            </p>
        </div>
    );
}
