"use client";

import { useEffect, useState } from "react";

export default function Fees({ campusId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campusId) return;

    const load = async () => {
      setLoading(true);

      const res = await fetch(
        `/api/superadmin/fees?campusId=${campusId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      setSummary(data.summary || null);
      setLoading(false);
    };

    load();
  }, [campusId]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded text-sm text-gray-500">
        Loading fees summary…
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white p-4 rounded text-sm text-gray-500">
        No fee data found for this campus.
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <h2 className="font-semibold text-lg">Fees Summary</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          label="Total Vouchers"
          value={summary.totalVouchers}
        />

        <StatCard
          label="Total Fee"
          value={`Rs ${summary.totalFee}`}
        />

        <StatCard
          label="Received"
          value={`Rs ${summary.totalReceived}`}
          color="text-green-600"
        />

        <StatCard
          label="Pending"
          value={`Rs ${summary.totalPending}`}
          color="text-red-600"
        />

      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white rounded p-4 border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}
