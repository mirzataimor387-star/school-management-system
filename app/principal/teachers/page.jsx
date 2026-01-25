"use client";
import { useEffect, useState } from "react";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
    });

    const loadTeachers = async () => {
        const res = await fetch("/api/principal/teachers");
        const data = await res.json();
        if (data.success) setTeachers(data.teachers);
    };

    useEffect(() => {
        loadTeachers();
    }, []);

    const addTeacher = async () => {
        await fetch("/api/principal/teachers", {
            method: "POST",
            body: JSON.stringify(form),
        });

        setForm({
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
        });

        loadTeachers();
    };

    return (
        <div className="p-6 space-y-6">

            <div className="bg-white p-5 rounded-xl shadow max-w-lg space-y-3">
                <h1 className="text-xl font-bold">Add Teacher</h1>

                <input
                    className="border p-2 w-full"
                    placeholder="Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />

                <input
                    className="border p-2 w-full"
                    placeholder="Email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                />

                <input
                    className="border p-2 w-full"
                    placeholder="Password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                />

                <input
                    className="border p-2 w-full"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                />

                <input
                    className="border p-2 w-full"
                    placeholder="Address"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                />

                <button
                    onClick={addTeacher}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Add Teacher
                </button>
            </div>

            <table className="w-full bg-white shadow rounded-xl">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                    </tr>
                </thead>

                <tbody>
                    {teachers.map(t => (
                        <tr key={t._id} className="border-t">
                            <td className="p-3">{t.name}</td>
                            <td>{t.email}</td>
                            <td>{t.phone || "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}
