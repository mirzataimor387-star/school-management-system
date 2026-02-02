"use client";

import { useEffect, useState } from "react";

export default function AssignPrincipalPage() {
    const [campuses, setCampuses] = useState([]);
    const [principals, setPrincipals] = useState([]);
    const [campusId, setCampusId] = useState("");
    const [principalId, setPrincipalId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const c = await fetch("/api/superadmin/campus/list").then(r => r.json());
        const p = await fetch("/api/superadmin/principal/list").then(r => r.json());

        setCampuses(c.campuses || []);
        setPrincipals(p.principals || []);
    };

    const assignPrincipal = async () => {
        if (!campusId || !principalId) {
            alert("Select campus and principal");
            return;
        }

        setLoading(true);

        const res = await fetch("/api/superadmin/principal/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ campusId, principalId }),
        });

        const data = await res.json();
        alert(data.message);

        setCampusId("");
        setPrincipalId("");
        setLoading(false);
        loadData();
    };

    return (
        <div className="max-w-xl bg-white p-6 rounded-xl shadow">
            <h1 className="text-xl font-bold mb-6">
                Assign Principal
            </h1>

            <div className="space-y-4">
                <select
                    className="border p-2 w-full"
                    value={campusId}
                    onChange={(e) => setCampusId(e.target.value)}
                >
                    <option value="">Select Campus</option>
                    {campuses.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <select
                    className="border p-2 w-full"
                    value={principalId}
                    onChange={(e) => setPrincipalId(e.target.value)}
                >
                    <option value="">Select Principal</option>
                    {principals.map((p) => (
                        <option key={p._id} value={p._id}>
                            {p.name} ({p.email})
                        </option>
                    ))}
                </select>

                <button
                    onClick={assignPrincipal}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Assigning..." : "Assign Principal"}
                </button>
            </div>
        </div>
    );
}
