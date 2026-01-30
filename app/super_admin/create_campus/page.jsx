"use client";

import { useEffect, useState } from "react";

export default function CreateCampusPage() {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [currentSession, setCurrentSession] = useState("");
    const [campuses, setCampuses] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCampuses = async () => {
        const res = await fetch("/api/super_admin/campus/list");
        const data = await res.json();
        if (data.success) setCampuses(data.campuses);
    };

    const createCampus = async () => {
        if (!name || !code || !currentSession) {
            setMessage("All fields are required");
            return;
        }

        setLoading(true);
        setMessage("");

        const res = await fetch("/api/super_admin/campus/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                code: code.toUpperCase(),
                currentSession,
            }),
        });

        const data = await res.json();

        if (!data.success) {
            setMessage(data.message);
        } else {
            setName("");
            setCode("");
            setCurrentSession("");
            setMessage("Campus created successfully");
            fetchCampuses();
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchCampuses();
    }, []);

    return (
        <div className="p-6 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">
                Super Admin – Campus Management
            </h1>

            <div className="border p-5 rounded mb-8">
                <h2 className="font-semibold mb-4">Create New Campus</h2>

                {message && (
                    <p className="mb-3 text-sm text-red-600">{message}</p>
                )}

                <input
                    className="border p-2 w-full mb-3"
                    placeholder="Campus Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="border p-2 w-full mb-3 uppercase"
                    placeholder="Campus Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                <input
                    className="border p-2 w-full mb-4"
                    placeholder="Current Session (2025-2026)"
                    value={currentSession}
                    onChange={(e) => setCurrentSession(e.target.value)}
                />

                <button
                    onClick={createCampus}
                    disabled={loading}
                    className="bg-black text-white px-6 py-2"
                >
                    {loading ? "Creating..." : "Create Campus"}
                </button>
            </div>

            <h2 className="font-semibold mb-4">All Campuses</h2>

            <div className="space-y-3">
                {campuses.map((c) => (
                    <div
                        key={c._id}
                        className="border p-4 rounded flex justify-between"
                    >
                        <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-sm text-gray-500">{c.code}</p>
                            <p className="text-xs text-gray-400">
                                Session: {c.currentSession}
                            </p>
                        </div>

                        <span className="text-sm text-green-600">
                            Active
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
