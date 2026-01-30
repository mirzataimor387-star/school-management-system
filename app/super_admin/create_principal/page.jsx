"use client";

import { useState } from "react";

export default function CreatePrincipalPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const createPrincipal = async () => {
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch(
                "/api/super_admin/principal/create",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                }
            );

            const data = await res.json();
            setMessage(data.message);

            if (res.ok) {
                setForm({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    address: "",
                });
            }
        } catch (err) {
            setMessage("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl bg-white p-6 rounded-xl shadow">
            <h1 className="text-xl font-bold mb-6">
                Create Principal
            </h1>

            <div className="space-y-4">
                <input
                    name="name"
                    placeholder="Full Name"
                    className="border p-2 w-full"
                    value={form.name}
                    onChange={handleChange}
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="border p-2 w-full"
                    value={form.email}
                    onChange={handleChange}
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="border p-2 w-full"
                    value={form.password}
                    onChange={handleChange}
                />

                <input
                    name="phone"
                    placeholder="Phone"
                    className="border p-2 w-full"
                    value={form.phone}
                    onChange={handleChange}
                />

                <textarea
                    name="address"
                    placeholder="Address"
                    className="border p-2 w-full"
                    value={form.address}
                    onChange={handleChange}
                />

                {message && (
                    <p className="text-sm text-blue-700">
                        {message}
                    </p>
                )}

                <button
                    onClick={createPrincipal}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Principal"}
                </button>
            </div>
        </div>
    );
}
