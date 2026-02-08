"use client";

import { useEffect, useState } from "react";

/* ===============================
   HELPERS (PK TIME – SAFE)
=============================== */
const fmtDateTime = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function Fees({ campusId }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     FETCH CLASSES
  =============================== */
  useEffect(() => {
    if (!campusId) return;

    const loadClasses = async () => {
      try {
        const res = await fetch(
          `/api/superadmin/classes?campusId=${campusId}`,
          { credentials: "include" }
        );
        const json = await res.json();
        if (json.success) setClasses(json.classes || []);
      } catch (err) {
        console.error("Classes load error:", err);
      }
    };

    loadClasses();
  }, [campusId]);

  /* ===============================
     FETCH SUMMARY + DETAILS
  =============================== */
  useEffect(() => {
    if (!campusId || !selectedClass || !selectedMonth) return;

    const loadAll = async () => {
      setLoading(true);
      setSummary(null);
      setDetails([]);

      try {
        /* ---- SUMMARY ---- */
        const summaryRes = await fetch(
          `/api/superadmin/fees?campusId=${campusId}&classId=${selectedClass}&month=${selectedMonth}`,
          { credentials: "include" }
        );
        const summaryJson = await summaryRes.json();
        if (summaryJson.success) setSummary(summaryJson.summary);

        /* ---- DETAILS ---- */
        const detailsRes = await fetch(
          `/api/superadmin/fees/details?campusId=${campusId}&classId=${selectedClass}&month=${selectedMonth}`,
          { credentials: "include" }
        );
        const detailsJson = await detailsRes.json();
        if (detailsJson.success) setDetails(detailsJson.rows || []);
      } catch (err) {
        console.error("Fees load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [campusId, selectedClass, selectedMonth]);

  return (
    <div className="space-y-6">

      {/* ===============================
         FILTERS
      =============================== */}
      <div className="bg-white p-4 border rounded md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
        <div>
          <label className="text-sm font-medium block mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border rounded px-3 py-3 text-sm w-full"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className} {cls.section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded px-3 py-3 text-sm w-full"
          >
            <option value="">Select Month</option>
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December",
            ].map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ===============================
         STATES
      =============================== */}
      {(!selectedClass || !selectedMonth) && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-center text-sm">
          Please select <b>Class</b> and <b>Month</b>
        </div>
      )}

      {loading && (
        <div className="bg-white p-4 rounded text-sm">
          Loading fee data…
        </div>
      )}

      {/* ===============================
         SUMMARY
      =============================== */}
      {!loading && summary && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Vouchers" value={summary.totalVouchers} />
          <Stat label="Total Fee" value={`Rs ${summary.totalFee}`} />
          <Stat
            label="Received"
            value={`Rs ${summary.totalReceived}`}
            color="text-green-600"
          />
          <Stat
            label="Pending"
            value={`Rs ${summary.totalPending}`}
            color="text-red-600"
          />
        </div>
      )}

      {/* ===============================
         DETAILS TABLE
      =============================== */}
      {!loading && details.length > 0 && (
        <div className="bg-white border rounded p-4 overflow-x-auto">
          <h3 className="font-semibold mb-3">Fee Details</h3>

          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Voucher</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Received At</th>
                <th className="border p-2">Method</th>
              </tr>
            </thead>
            <tbody>
              {details.map((row) =>
                row.payments.map((p) => (
                  <tr key={p._id}>
                    <td className="border p-2">{row.voucherNo}</td>
                    <td className="border p-2">Rs {p.amount}</td>
                    <td className="border p-2 capitalize">{row.status}</td>
                    <td className="border p-2">
                      {fmtDateTime(p.receivedAt)}
                    </td>
                    <td className="border p-2 capitalize">{p.method}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ===============================
   STAT CARD
=============================== */
function Stat({ label, value, color = "" }) {
  return (
    <div className="bg-white border rounded p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
