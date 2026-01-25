"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AllCampusesPage() {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/super_admin/campus/list", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCampuses(data.campuses);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading campuses...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">
        All Campuses
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campuses.map((campus) => (
          <div
            key={campus._id}
            onClick={() =>
              router.push(
                `/super_admin/campus/${campus._id}`
              )
            }
            className="cursor-pointer bg-white p-5 rounded shadow hover:border-blue-500 border"
          >
            <h2 className="font-semibold text-lg">
              {campus.name}
            </h2>

            <p className="text-sm text-gray-500">
              Code: {campus.code}
            </p>

            {/* ✅ YAHAN USE HOTA HAI */}
            <p className="mt-2 text-sm font-medium">
              Principal:{" "}
              <span
                className={
                  campus.principal
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                {campus.principal
                  ? "Assigned"
                  : "Not Assigned"}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
