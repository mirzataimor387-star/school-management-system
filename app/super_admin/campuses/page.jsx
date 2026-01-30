"use client";

import { useEffect, useState } from "react";

export default function SuperAdminCampuses() {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampuses();
  }, []);

  const loadCampuses = async () => {
    const res = await fetch("/api/super_admin/campus/list");
    const data = await res.json();
    setCampuses(data.campuses || []);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-bold mb-6">Campuses</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : campuses.length === 0 ? (
        <p className="text-red-600">No campuses found</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Campus</th>
              <th className="p-3 border">Principal</th>
            </tr>
          </thead>

          <tbody>
            {campuses.map((c) => (
              <tr key={c._id}>
                <td className="p-3 border">{c.name}</td>
                <td className="p-3 border">
                  {c.principal ? (
                    <span className="text-green-700 font-semibold">
                      {c.principal.name}
                    </span>
                  ) : (
                    <span className="text-red-600">Not Assigned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
