"use client";

import { useEffect, useState } from "react";

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
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">

      {/* 👤 HEADER */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
        <img
          src={data.avatar || "/avatar.png"}
          className="w-16 h-16 rounded-full border"
        />

        <div>
          <h2 className="text-xl font-semibold">
            {data.teacherName}
          </h2>
          <p className="text-sm text-gray-500">
            Teacher Dashboard
          </p>
        </div>
      </div>

      {/* ❌ NO CLASS */}
      {!data.assigned && (
        <div className="bg-yellow-100 border border-yellow-300 p-4 rounded">
          ⚠ No class assigned yet
        </div>
      )}

      {/* ✅ MULTIPLE CLASSES */}
      {data.assigned && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.classes.map((cls) => (
            <div
              key={cls.assignmentId}
              className="bg-blue-50 border border-blue-200 p-5 rounded-xl"
            >
              <h3 className="font-semibold text-blue-900">
                {cls.className}
              </h3>

              <ul className="mt-2 text-sm text-blue-900 space-y-1">
                <li><strong>Session:</strong> {cls.session}</li>
                <li><strong>Total Students:</strong> {cls.totalStudents}</li>
              </ul>

              <div className="mt-4 flex gap-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                  Attendance
                </button>

                <button className="bg-white border px-3 py-1 rounded text-sm">
                  Students
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
