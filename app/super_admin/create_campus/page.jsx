"use client";

import { useEffect, useState } from "react";

export default function CreateCampusPage() {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    /* ======================
       FETCH CAMPUSES
    ====================== */
    const fetchCampuses = async () => {
        try {
            const res = await fetch("/api/super_admin/campus/create");

            let data = null;
            try {
                data = await res.json();
            } catch {
                return;
            }

            if (!res.ok || !data.success) return;

            setCampuses(data.campuses);
        } catch (err) {
            console.error("Fetch error");
        }
    };

    /* ======================
       CREATE CAMPUS
    ====================== */
    const createCampus = async () => {
        setMessage("");

        if (!name || !code) {
            setMessage("All fields are required");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/super_admin/campus/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    code: code.toUpperCase(),
                }),
            });

            let data = null;
            try {
                data = await res.json();
            } catch {
                setMessage("Invalid server response");
                setLoading(false);
                return;
            }

            if (!res.ok || !data.success) {
                setMessage(data?.message || "Failed");
                setLoading(false);
                return;
            }

            setName("");
            setCode("");
            setMessage("Campus created successfully");
            fetchCampuses();
        } catch (err) {
            setMessage("Network error");
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

            {/* FORM */}
            <div className="border p-5 rounded mb-8">
                <h2 className="font-semibold mb-4">Create New Campus</h2>

                {message && (
                    <p className="mb-3 text-sm text-red-600">{message}</p>
                )}

                <input
                    type="text"
                    placeholder="Campus Name"
                    className="border p-2 w-full mb-3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Campus Code (CAMP001)"
                    className="border p-2 w-full mb-4 uppercase"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                <button
                    onClick={createCampus}
                    disabled={loading}
                    className="bg-black text-white px-6 py-2 disabled:opacity-60"
                >
                    {loading ? "Creating..." : "Create Campus"}
                </button>
            </div>

            {/* LIST */}
            <div>
                <h2 className="font-semibold mb-4">All Campuses</h2>

                <div className="space-y-3">
                    {campuses.map((campus) => (
                        <div
                            key={campus._id}
                            className="border p-4 rounded flex justify-between"
                        >
                            <div>
                                <p className="font-medium">{campus.name}</p>
                                <p className="text-sm text-gray-500">
                                    {campus.code}
                                </p>
                            </div>

                            <span
                                className={`text-sm ${campus.isActive
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                            >
                                {campus.isActive ? "Active" : "Disabled"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
