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
        const summaryRes = await fetch(
          `/api/superadmin/fees?campusId=${campusId}&classId=${selectedClass}&month=${selectedMonth}`,
          { credentials: "include" }
        );
        const summaryJson = await summaryRes.json();
        if (summaryJson.success) setSummary(summaryJson.summary);

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
      <div className="bg-white p-4 border rounded grid gap-4 md:grid-cols-2">
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
              "January","February","March","April","May","June",
              "July","August","September","October","November","December",
            ].map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
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
         DETAILS (RESPONSIVE)
      =============================== */}
      {!loading && details.length > 0 && (
        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold mb-4">Fee Details</h3>

          {/* ===== MOBILE (CARDS) ===== */}
          <div className="space-y-3 md:hidden">
            {details.map((row) =>
              row.payments.map((p) => (
                <div
                  key={p._id}
                  className="border rounded-lg p-4 space-y-2 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">
                      Voucher #{row.voucherNo}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${
                        row.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : row.status === "partial"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>

                  <Info label="Amount" value={`Rs ${p.amount}`} bold />
                  <Info label="Received" value={fmtDateTime(p.receivedAt)} />
                  <Info label="Method" value={p.method} capitalize />
                </div>
              ))
            )}
          </div>

          {/* ===== DESKTOP (TABLE) ===== */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Voucher</th>
                  <th className="border p-2 text-left">Amount</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Received At</th>
                  <th className="border p-2 text-left">Method</th>
                </tr>
              </thead>
              <tbody>
                {details.map((row) =>
                  row.payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="border p-2">{row.voucherNo}</td>
                      <td className="border p-2 font-medium">
                        Rs {p.amount}
                      </td>
                      <td className="border p-2 capitalize">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            row.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : row.status === "partial"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="border p-2">
                        {fmtDateTime(p.receivedAt)}
                      </td>
                      <td className="border p-2 capitalize">
                        {p.method}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===============================
   UI COMPONENTS
=============================== */
function Stat({ label, value, color = "" }) {
  return (
    <div className="bg-white border rounded p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Info({ label, value, bold, capitalize }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span
        className={`${bold ? "font-medium" : ""} ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
