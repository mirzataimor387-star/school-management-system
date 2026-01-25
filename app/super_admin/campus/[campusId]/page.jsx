"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CampusOverviewPage() {
    const { campusId } = useParams();

    const [campus, setCampus] = useState(null);
    const [principal, setPrincipal] = useState(null);

    const [notification, setNotification] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        const loadCampus = async () => {
            try {
                const res = await fetch(
                    `/api/super_admin/campus/${campusId}`,
                    { credentials: "include" }
                );

                if (!res.ok) {
                    const text = await res.text();
                    console.log("SERVER ERROR:", text);
                    return;
                }

                const data = await res.json();

                if (data.success) {
                    setCampus(data.campus);
                    setPrincipal(data.principal);
                }

            } catch (err) {
                console.log("FETCH ERROR:", err.message);
            }
        };

        loadCampus();
    }, [campusId]);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const createPrincipal = async () => {
        setLoading(true);
        setNotification("");

        const res = await fetch("/api/super_admin/principal/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                ...form,
                campusId,
            }),
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            setPrincipal(data.principal);
            setNotification("Principal created & assigned successfully ✅");
            setForm({
                name: "",
                email: "",
                password: "",
                phone: "",
                address: "",
            });
        } else {
            setNotification(data.message || "Something went wrong");
        }
    };

    if (!campus) return <p>Loading...</p>;

    return (
        <div>
            {/* 🔔 Notification */}
            {notification && (
                <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded">
                    {notification}
                </div>
            )}

            <h1 className="text-xl font-bold mb-6">
                {campus.name} — Overview
            </h1>

            {/* 🔗 LINKS */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Link href="#" className="bg-white p-4 shadow rounded">Teachers</Link>
                <Link href="#" className="bg-white p-4 shadow rounded">Students</Link>
                <Link href="#" className="bg-white p-4 shadow rounded">Attendance</Link>
                <Link href="#" className="bg-white p-4 shadow rounded">Fees</Link>
                <Link href="#" className="bg-white p-4 shadow rounded">Reports</Link>
            </div>

            {/* ================= PRINCIPAL CARD ================= */}
            {principal && (
                <div className="bg-white p-6 rounded shadow max-w-xl">

                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src={principal.avatar || "/avatar.png"}
                            className="w-16 h-16 rounded-full border"
                            alt="principal"
                        />

                        <div>
                            <h2 className="font-semibold text-lg">
                                {principal.name}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {principal.email}
                            </p>
                        </div>
                    </div>

                    <p className="text-sm mb-1">📞 {principal.phone || "Not added"}</p>
                    <p className="text-sm mb-4">📍 {principal.address || "Not added"}</p>

                    <div className="flex gap-3">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded">
                            Edit
                        </button>

                        <button className="bg-yellow-500 text-white px-4 py-2 rounded">
                            Change
                        </button>

                        <button
                            onClick={() => setShowConfirm(true)}
                            className="bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}

            {/* ================= ADD PRINCIPAL FORM ================= */}
            {!principal && (
                <div className="bg-white p-6 rounded shadow max-w-xl">

                    <h2 className="font-semibold mb-4">
                        Add Principal
                    </h2>

                    <input
                        name="name"
                        placeholder="Full Name"
                        className="border p-2 w-full mb-3"
                        value={form.name}
                        onChange={handleChange}
                    />

                    <input
                        name="email"
                        placeholder="Email"
                        className="border p-2 w-full mb-3"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        name="password"
                        placeholder="Temporary Password"
                        type="password"
                        className="border p-2 w-full mb-3"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <input
                        name="phone"
                        placeholder="Contact Number"
                        className="border p-2 w-full mb-3"
                        value={form.phone}
                        onChange={handleChange}
                    />

                    <textarea
                        name="address"
                        placeholder="Address"
                        className="border p-2 w-full mb-4"
                        value={form.address}
                        onChange={handleChange}
                    />

                    <button
                        disabled={loading}
                        onClick={createPrincipal}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        {loading ? "Creating..." : "Create Principal"}
                    </button>
                </div>
            )}

            {/* ================= CONFIRM REMOVE ================= */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow w-full max-w-md">

                        <h2 className="font-semibold mb-2">
                            Confirm Removal
                        </h2>

                        <p className="text-sm mb-6">
                            Are you sure you want to remove principal from
                            <strong> {campus.name}</strong>?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="border px-4 py-2 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    setLoading(true);

                                    const res = await fetch(
                                        "/api/super_admin/campus/remove-principal",
                                        {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            credentials: "include",
                                            body: JSON.stringify({ campusId }),
                                        }
                                    );

                                    const data = await res.json();

                                    setLoading(false);
                                    setShowConfirm(false);

                                    if (data.success) {
                                        setPrincipal(null);
                                        setNotification("Principal removed successfully ✅");
                                    } else {
                                        setNotification(data.message || "Failed");
                                    }
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Remove
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
