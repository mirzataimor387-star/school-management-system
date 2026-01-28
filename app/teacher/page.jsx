"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/teacher/my-class", {
        credentials: "include",
      });

      const result = await res.json();
      setData(result);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <p className="text-gray-500 p-4">
        Loading dashboard...
      </p>
    );
  }

  const firstClass = data.classes?.[0];

  return (
    <div className="space-y-6 p-2 sm:p-4">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white p-4 rounded-xl shadow">
        <img
          src={data.avatar || "/avatar.png"}
          className="w-20 h-20 rounded-full border"
        />

        <div className="text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-semibold">
            {data.teacherName}
          </h2>

          <p className="text-sm text-gray-500">
            Teacher Dashboard
          </p>

          {data.campusCode && (
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Campus Code:{" "}
              <span className="font-semibold text-gray-800">
                {data.campusCode}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* ================= NOTIFICATION ================= */}
      {data.assigned && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 sm:p-4 rounded-lg text-sm sm:text-base flex flex-wrap items-center gap-2">
          🔔
          {data.classes.length === 1 ? (
            <span>
              You are managing{" "}
              <strong>{firstClass.className}</strong>{" "}
              ({firstClass.session})
            </span>
          ) : (
            <span>
              You are managing{" "}
              <strong>{data.classes.length}</strong> classes
            </span>
          )}
        </div>
      )}

      {/* ================= QUICK ACTIONS ================= */}
      {data.assigned && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            href="/teacher/attendance"
            className="flex-1 sm:flex-none text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            📋 Attendance
          </Link>

          <Link
            href="/teacher/students"
            className="flex-1 sm:flex-none text-center bg-white border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            👥 Students
          </Link>

          <Link
            href="/teacher/attendance/monthly"
            className="flex-1 sm:flex-none text-center bg-white border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            📊 Monthly Report
          </Link>
        </div>
      )}

      {/* ================= NO CLASS ================= */}
      {!data.assigned && (
        <div className="bg-yellow-100 border border-yellow-300 p-4 rounded text-sm">
          ⚠ No class assigned yet
        </div>
      )}

      {/* ================= CLASS CARDS ================= */}
      {data.assigned && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* unique key for react */}
          {data.classes.map((cls) => (
            <div
              key={cls.classId}
              className="bg-blue-50 border border-blue-200 p-4 sm:p-5 rounded-xl"
            >
              <h3 className="font-semibold text-blue-900 text-sm sm:text-base">
                {cls.className}
              </h3>

              <ul className="mt-2 text-xs sm:text-sm text-blue-900 space-y-1">
                <li>
                  <strong>Session:</strong> {cls.session}
                </li>
                <li>
                  <strong>Total Students:</strong>{" "}
                  {cls.totalStudents}
                </li>
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/teacher/attendance"
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs sm:text-sm"
                >
                  Attendance
                </Link>

                <Link
                  href="/teacher/students"
                  className="bg-white border px-3 py-1 rounded text-xs sm:text-sm"
                >
                  Students
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
