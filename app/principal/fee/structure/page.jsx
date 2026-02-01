"use client";

import { useEffect, useState } from "react";

export default function FeeStructurePage() {
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");

    const [monthlyFee, setMonthlyFee] = useState("");
    const [paperFee, setPaperFee] = useState("");
    const [lateFee, setLateFee] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [structureExists, setStructureExists] = useState(false);

    // ===============================
    // LOAD CLASSES
    // ===============================
    useEffect(() => {
        fetch("/api/principal/classes")
            .then(res => res.json())
            .then(data => setClasses(data.classes || []))
            .catch(() => setError("Failed to load classes"));
    }, []);

    // ===============================
    // LOAD STRUCTURE ON CLASS CHANGE
    // ===============================
    useEffect(() => {
        if (!classId) return;

        setError("");
        setSuccess("");
        setLoading(true);

        fetch(`/api/principal/fee/fee-structure?classId=${classId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMonthlyFee(data.structure.monthlyFee);
                    setPaperFee(data.structure.paperFee || 0);
                    setLateFee(data.structure.lateFee || 100);
                    setStructureExists(true);
                } else {
                    setMonthlyFee("");
                    setPaperFee("");
                    setLateFee("");
                    setStructureExists(false);
                }
            })
            .finally(() => setLoading(false));
    }, [classId]);

    // ===============================
    // SAVE STRUCTURE
    // ===============================
    const saveStructure = async () => {
        setError("");
        setSuccess("");

        if (!classId || monthlyFee === "") {
            setError("Class and monthly fee are required");
            return;
        }

        try {
            setSaving(true);

            const res = await fetch("/api/principal/fee/fee-structure", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classId,
                    monthlyFee: Number(monthlyFee),
                    paperFee: Number(paperFee || 0),
                    lateFee: Number(lateFee || 100),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to save structure");
            }

            setSuccess("Fee structure saved successfully");
            setStructureExists(true);

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ===============================
    // UI
    // ===============================
    return (
        <div className="max-w-xl mx-auto p-6">

            <h1 className="text-2xl font-bold mb-6">
                Fee Structure Setup
            </h1>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                    {success}
                </div>
            )}

            {/* CLASS */}
            <div className="mb-4">
                <label className="block mb-1 font-medium">Class</label>
                <select
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    className="border p-2 rounded w-full"
                >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                        <option key={c._id} value={c._id}>
                            {c.className}
                        </option>
                    ))}
                </select>
            </div>

            {/* MONTHLY */}
            <div className="mb-4">
                <label className="block mb-1 font-medium">
                    Monthly Fee
                </label>
                <input
                    type="number"
                    value={monthlyFee}
                    onChange={e => setMonthlyFee(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>

            {/* PAPER */}
            <div className="mb-4">
                <label className="block mb-1 font-medium">
                    Paper Fee (optional)
                </label>
                <input
                    type="number"
                    value={paperFee}
                    onChange={e => setPaperFee(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>

            {/* LATE */}
            <div className="mb-6">
                <label className="block mb-1 font-medium">
                    Late Fee (optional)
                </label>
                <input
                    type="number"
                    value={lateFee}
                    onChange={e => setLateFee(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>

            <button
                onClick={saveStructure}
                disabled={saving || loading}
                className={`w-full py-2 rounded text-white font-semibold
          ${saving
                        ? "bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"}`}
            >
                {structureExists ? "Update Fee Structure" : "Save Fee Structure"}
            </button>

        </div>
    );
}
