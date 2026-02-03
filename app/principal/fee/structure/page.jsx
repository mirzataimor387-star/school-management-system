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

    /* ===============================
       LOAD CLASSES
    =============================== */
    useEffect(() => {
        fetch("/api/principal/classes")
            .then(res => res.json())
            .then(data => setClasses(data.classes || []))
            .catch(() => setError("Failed to load classes"));
    }, []);

    /* ===============================
       LOAD STRUCTURE ON CLASS CHANGE
    =============================== */
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

    /* ===============================
       SAVE STRUCTURE
    =============================== */
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

    /* ===============================
       UI
    =============================== */
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-2xl mx-auto">

                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Fee Structure
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Set or update monthly fee details for each class
                    </p>
                </div>

                {/* CARD */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">

                    {/* ALERTS */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    {/* CLASS */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Class
                        </label>
                        <select
                            value={classId}
                            onChange={e => setClassId(e.target.value)}
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="">-- Choose Class --</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.className}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* FEES GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        {/* MONTHLY */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Monthly Fee
                            </label>
                            <input
                                type="number"
                                value={monthlyFee}
                                onChange={e => setMonthlyFee(e.target.value)}
                                placeholder="e.g. 2500"
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* PAPER */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Paper Fee
                            </label>
                            <input
                                type="number"
                                value={paperFee}
                                onChange={e => setPaperFee(e.target.value)}
                                placeholder="Optional"
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* LATE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Late Fee
                            </label>
                            <input
                                type="number"
                                value={lateFee}
                                onChange={e => setLateFee(e.target.value)}
                                placeholder="Default 100"
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* ACTION */}
                    <button
                        onClick={saveStructure}
                        disabled={saving || loading}
                        className={`w-full mt-4 py-2.5 rounded-xl font-semibold text-white transition
              ${saving || loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
                            }`}
                    >
                        {saving
                            ? "Saving..."
                            : structureExists
                                ? "Update Fee Structure"
                                : "Save Fee Structure"}
                    </button>

                </div>
            </div>
        </div>
    );
}
