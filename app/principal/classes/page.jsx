"use client";

import { useEffect, useState } from "react";

export default function ClassesPage() {
    const [classes, setClasses] = useState([]);
    const [form, setForm] = useState({
        className: "",
        section: "",
        session: "",
    });

    const loadClasses = async () => {
        const res = await fetch("/api/principal/classes", {
            credentials: "same-origin",
        });
        const data = await res.json();
        setClasses(data.classes || []);
    };

    useEffect(() => {
        loadClasses();
    }, []);

    const createClass = async () => {
        await fetch("/api/principal/classes", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        setForm({ className: "", section: "", session: "" });
        loadClasses();
    };

    return (
        <div className="p-6 max-w-xl space-y-6">
            <h1 className="text-xl font-bold">Create Class</h1>

            <input
                className="border p-2 w-full"
                placeholder="Class (8th, 9th)"
                value={form.className}
                onChange={(e) =>
                    setForm({ ...form, className: e.target.value })
                }
            />

            <input
                className="border p-2 w-full"
                placeholder="Section (A, B)"
                value={form.section}
                onChange={(e) =>
                    setForm({ ...form, section: e.target.value })
                }
            />

            <input
                className="border p-2 w-full"
                placeholder="Session (2024-2025)"
                value={form.session}
                onChange={(e) =>
                    setForm({ ...form, session: e.target.value })
                }
            />

            <button
                onClick={createClass}
                className="bg-green-600 text-white px-4 py-2 rounded"
            >
                Create Class
            </button>

            <table className="w-full bg-white shadow rounded-xl">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">Class</th>
                        <th>Section</th>
                        <th>Session</th>
                    </tr>
                </thead>

                <tbody>
                    {classes.map((c) => (
                        <tr key={c._id} className="border-t">
                            <td className="p-3">{c.className}</td>
                            <td>{c.section}</td>
                            <td>{c.session}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
