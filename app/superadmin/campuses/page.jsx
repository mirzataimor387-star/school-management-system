"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminCampuses() {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    loadCampuses();
  }, []);

  const loadCampuses = async () => {
    try {
      const res = await fetch("/api/superadmin/campus/list", {
        cache: "no-store",
      });
      const data = await res.json();
      setCampuses(data.campuses || []);
    } catch (err) {
      setCampuses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 md:px-6 py-6 bg-white rounded-xl shadow">

      <h1 className="text-xl md:text-2xl font-bold mb-6">
        Campuses
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading campuses...</p>
      ) : campuses.length === 0 ? (
        <p className="text-red-600">No campuses found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-left">Campus</th>
                <th className="p-3 border text-left">Principal</th>
              </tr>
            </thead>

            <tbody>
              {campuses.map((c) => (
                <tr
                  key={c._id}
                  onClick={() =>
                    router.push(`/superadmin/campus/${c._id}`)
                  }
                  className="
                    cursor-pointer
                    hover:bg-blue-50
                    transition
                  "
                >
                  <td className="p-3 border font-semibold text-blue-700">
                    {c.name}
                  </td>

                  <td className="p-3 border">
                    {c.principal ? (
                      <span className="text-green-700 font-semibold">
                        {c.principal.name}
                      </span>
                    ) : (
                      <span className="text-red-600">
                        Not Assigned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
