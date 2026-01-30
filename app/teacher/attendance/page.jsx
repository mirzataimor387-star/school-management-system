"use client";

import { useEffect, useState } from "react";

export default function TeacherAttendance() {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [classInfo, setClassInfo] = useState(null);
    const [attendanceId, setAttendanceId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    const session = "2024-2025";
    const date = new Date().toISOString().split("T")[0];

    /* =============================
       ATTENDANCE TIME WINDOW
       06:00 AM → 10:00 AM
    ============================== */
    const START = 6;
    const END = 10;

    const currentHour =
        now.getHours() + now.getMinutes() / 60;

    const windowOpen =
        currentHour >= START && currentHour <= END;

    /* =============================
       LIVE CLOCK (12-HOUR FORMAT)
    ============================== */
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const time12 = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    /* =============================
       LOAD DAILY ATTENDANCE
    ============================== */
    useEffect(() => {
        async function load() {
            setLoading(true);

            // 1️⃣ teacher class
            const classRes = await fetch("/api/teacher/classes");
            const classData = await classRes.json();

            if (!classData.length) {
                setLoading(false);
                return;
            }

            const cls = classData[0];
            setClassInfo(cls);

            // 2️⃣ check today's attendance
            const check = await fetch(
                `/api/teacher/attendance/students?classId=${cls._id}&date=${date}&session=${session}`
            );

            const data = await check.json();

            // already marked today
            if (data.attendance) {
                setAttendanceId(data.attendance._id);

                const temp = {};
                data.attendance.records.forEach((r) => {
                    temp[r.studentId] = r.status;
                });

                setAttendance(temp);
                setStudents(data.attendance.students || []);
                setLoading(false);
                return;
            }

            // 3️⃣ load students for fresh day
            const stuRes = await fetch(
                `/api/teacher/students?classId=${cls._id}&session=${session}`
            );

            const stuData = await stuRes.json();
            const list = stuData.students ?? stuData;

            // smart default
            const temp = {};
            list.forEach((s) => {
                temp[s._id] =
                    currentHour > 8.5 ? "late" : "present";
            });

            setStudents(list);
            setAttendance(temp);
            setLoading(false);
        }

        load();
    }, []);

    /* =============================
       UPDATE STATUS (PATCH)
    ============================== */
    const setStatus = async (studentId, status) => {
        setAttendance((prev) => ({
            ...prev,
            [studentId]: status,
        }));

        if (!attendanceId) return;

        await fetch("/api/teacher/attendance/update", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                attendanceId,
                studentId,
                status,
            }),
        });
    };

    /* =============================
       SAVE FIRST TIME (POST)
    ============================== */
    const saveAttendance = async () => {
        const records = Object.entries(attendance).map(
            ([studentId, status]) => ({
                studentId,
                status,
            })
        );

        const res = await fetch("/api/teacher/attendance/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                classId: classInfo._id,
                session,
                date,
                records,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            setAttendanceId(data.attendanceId || true);
            alert("Attendance saved successfully");
        } else {
            alert(data.message);
        }
    };

    /* =============================
       SUMMARY
    ============================== */
    const summary = {
        present: Object.values(attendance).filter(s => s === "present").length,
        late: Object.values(attendance).filter(s => s === "late").length,
        absent: Object.values(attendance).filter(s => s === "absent").length,
        leave: Object.values(attendance).filter(s => s === "leave").length,
    };

    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <div className="p-4 max-w-5xl mx-auto space-y-4">

            {/* HEADER */}
            <div className="bg-white p-4 rounded-xl shadow">
                <h1 className="text-xl font-bold">
                    {classInfo.className} - {classInfo.section}
                </h1>

                <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4">

                    <span>📅 {date}</span>

                    <span>
                        ⏰ Current Time:{" "}
                        <strong>
                            {now.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </strong>
                    </span>

                    <span className="text-blue-700 font-semibold">
                        🕘 Attendance Allowed: 06:00 AM – 10:00 AM
                    </span>

                    <span
                        className={`font-semibold ${windowOpen ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {windowOpen ? "Status: OPEN" : "Status: CLOSED"}
                    </span>

                </div>
            </div>


            {/* STUDENTS */}
            <div className="bg-white rounded-xl shadow divide-y">
                {students.map((s) => {
                    const status = attendance[s._id];

                    return (
                        <div
                            key={s._id}
                            className="flex items-center justify-between p-3"
                        >
                            <div className="font-medium">
                                {s.rollNumber}. {s.name}
                            </div>

                            <div className="flex gap-1">
                                {["present", "late", "absent", "leave"].map((st) => (
                                    <button
                                        key={st}
                                        disabled={!windowOpen && !attendanceId}
                                        onClick={() => setStatus(s._id, st)}
                                        className={`px-3 py-1 text-xs rounded border ${status === st
                                            ? st === "present"
                                                ? "bg-green-600 text-white"
                                                : st === "late"
                                                    ? "bg-yellow-500 text-white"
                                                    : st === "absent"
                                                        ? "bg-red-600 text-white"
                                                        : "bg-blue-600 text-white"
                                            : "bg-white"
                                            }`}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* SUMMARY */}
            <div className="bg-gray-50 border p-4 rounded-xl text-sm flex flex-wrap gap-4 justify-between">
                <span>✅ Present: {summary.present}</span>
                <span>⏰ Late: {summary.late}</span>
                <span>❌ Absent: {summary.absent}</span>
                <span>🟦 Leave: {summary.leave}</span>
            </div>

            {/* SAVE */}
            {!attendanceId && windowOpen && (
                <button
                    onClick={saveAttendance}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
                >
                    Save Attendance
                </button>
            )}

            {!windowOpen && !attendanceId && (
                <p className="text-center text-red-600 font-medium">
                    Attendance time is over (after 10:00 AM)
                </p>
            )}

            {attendanceId && (
                <p className="text-center text-green-600 font-medium">
                    Attendance saved — changes auto-updated
                </p>
            )}

        </div>
    );
}
