"use client";

import { useEffect, useState } from "react";

export default function PrincipalDashboard() {
  const [principal, setPrincipal] = useState(null);
  const [campus, setCampus] = useState(null);

  useEffect(() => {
    fetch("/api/principal/me", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrincipal(data.principal);
          setCampus(data.campus);
        }
      });
  }, []);

  if (!principal) return null;

  return (
    <div className="space-y-6">

      {/* WELCOME CARD */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">

        <h2 className="text-xl font-semibold text-blue-800">
          Welcome back, {principal.name} 👋
        </h2>

        <p className="text-sm text-blue-700 mt-1">
          You are managing <strong>{campus?.name}</strong>
        </p>

        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <p>🏫 Campus ID: {campus?.code}</p>
          <p>📍 Address: {principal.address}</p>
          <p>📞 Contact: {principal.phone}</p>
        </div>

      </div>

    </div>
  );
}
