"use client";

import { useEffect, useState } from "react";

export default function Teachers({ campusId }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campusId) return;

    const load = async () => {
      setLoading(true);

      const res = await fetch(
        `/api/superadmin/teachers?campusId=${campusId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      setTeachers(data.teachers || []);
      setLoading(false);
    };

    load();
  }, [campusId]);

  // ================= STATES =================
  if (loading) {
    return (
      <div className="bg-white rounded p-4 text-sm text-gray-500">
        Loading teachers…
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded p-4 text-sm text-gray-500">
        No teachers found for this campus.
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="bg-white rounded p-4">
      <h2 className="font-semibold mb-4">
        Teachers ({teachers.length})
      </h2>

      <ul className="divide-y">
        {teachers.map((t) => (
          <li
            key={t._id}
            className="flex items-center gap-3 py-3"
          >
            <img
              src={t.avatar || "/avatar.png"}
              alt={t.name}
              className="w-10 h-10 rounded-full object-cover border"
            />

            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-gray-500">
                {t.email}
              </p>
              <p className="text-xs text-gray-500">
                {t.phone}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
