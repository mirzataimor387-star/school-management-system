"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function FeesHistoryPage() {
  const { campusId } = useParams();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  // load classes
  useEffect(() => {
    fetch(`/api/superadmin/classes?campusId=${campusId}`, {
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => setClasses(d.classes || []));
  }, [campusId]);

  // load fees summary
  useEffect(() => {
    if (!classId || !month) return;

    const load = async () => {
      setLoading(true);

      const params = new URLSearchParams({
        campusId,
        classId,
        month,
        year,
      });

      const res = await fetch(
        `/api/superadmin/fees/summary?${params}`,
        { credentials: "include" }
      );

      const data = await res.json();
      setSummary(data.summary || []);
      setLoading(false);
    };

    load();
  }, [classId, month, year, campusId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">

      <h1 className="text-xl font-bold">
        Campus Fees Summary
      </h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={classId}
          onChange={e => setClassId(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>
              {c.className}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Select Month</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("en", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {[year - 1, year, year + 1].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : summary.length === 0 ? (
        <p className="text-gray-500">No records</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Class</th>
                <th>Students</th>
                <th>Paid</th>
                <th>Unpaid</th>
                <th>Total</th>
                <th>Collected</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(row => (
                <tr key={row.classId} className="border-t text-center">
                  <td className="p-3 font-semibold">
                    {row.className}
                  </td>
                  <td>{row.totalStudents}</td>
                  <td className="text-green-600">{row.paidCount}</td>
                  <td className="text-red-600">{row.unpaidCount}</td>
                  <td>{row.totalAmount}</td>
                  <td className="text-green-700">{row.collected}</td>
                  <td className="text-red-700">{row.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
