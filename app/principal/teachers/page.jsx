"use client";

import { useEffect, useState } from "react";
import FloatingInput from "@/components/ui/FloatingInput";

import {
    Plus,
    X,
    Pencil,
    Trash2,
    Save,
    User
} from "lucide-react";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [loadingList, setLoadingList] = useState(true);
    const [apiMessage, setApiMessage] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
    });

    /* =========================
       LOAD TEACHERS
    ======================== */
    const loadTeachers = async () => {
        try {
            setLoadingList(true);
            setApiMessage("");

            const res = await fetch("/api/principal/teachers");
            const data = await res.json();

            if (!data.success) {
                setApiMessage(data.message || "Failed to load teachers");
                setTeachers([]);
            } else {
                setTeachers(data.teachers || []);
            }
        } catch {
            setApiMessage("Server not responding");
            setTeachers([]);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        loadTeachers();
    }, []);

    /* =========================
       SAVE
    ======================== */
    const saveTeacher = async () => {
        if (!form.name || !form.email) {
            alert("Name and email required");
            return;
        }

        setLoading(true);

        await fetch("/api/principal/teachers", {
            method: editId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                teacherId: editId,
            }),
        });

        setForm({
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
        });

        setEditId(null);
        setOpen(false);
        setLoading(false);
        loadTeachers();
    };

    /* =========================
       DELETE
    ======================== */
    const deleteTeacher = async (id) => {
        if (!confirm("Remove teacher?")) return;

        await fetch("/api/principal/teachers", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teacherId: id }),
        });

        loadTeachers();
    };

    return (
        <>
            {/* ================= PAGE ================= */}
            <div className="p-6 space-y-6">

                <h1 className="text-xl font-bold flex items-center gap-2">
                    <User size={22} />
                    Teachers
                </h1>

                <table className="w-full bg-white shadow rounded-xl overflow-hidden">
                    <thead className="bg-gray-100 text-sm">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th className="p-3 text-left w-[200px]">Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {loadingList && (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-gray-500">
                                    Loading teachers...
                                </td>
                            </tr>
                        )}

                        {!loadingList && apiMessage && (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-red-500">
                                    {apiMessage}
                                </td>
                            </tr>
                        )}

                        {!loadingList && !apiMessage &&
                            teachers.map((t) => (
                                <tr key={t._id} className="border-t text-sm">
                                    <td className="p-3 font-medium">{t.name}</td>
                                    <td>{t.email}</td>
                                    <td>{t.phone || "-"}</td>

                                    <td className="p-3 flex gap-3">
                                        <button
                                            onClick={() => {
                                                setEditId(t._id);
                                                setForm({
                                                    name: t.name,
                                                    email: t.email,
                                                    password: "",
                                                    phone: t.phone || "",
                                                    address: t.address || "",
                                                });
                                                setOpen(true);
                                            }}
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <Pencil size={16} />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => deleteTeacher(t._id)}
                                            className="text-red-600 hover:underline flex items-center gap-1"
                                        >
                                            <Trash2 size={16} />
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}

                        {!loadingList && !apiMessage && teachers.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-gray-500">
                                    No teachers found
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>

                {/* PLUS BUTTON */}
                <button
                    onClick={() => {
                        setEditId(null);
                        setForm({
                            name: "",
                            email: "",
                            password: "",
                            phone: "",
                            address: "",
                        });
                        setOpen(true);
                    }}
                    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40"
                >
                    <Plus size={26} />
                </button>
            </div>

            {/* ================= MODAL ================= */}
            {open && (
                <>
                    <div
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl animate-modal">

                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold">
                                    {editId ? "Edit Teacher" : "Add Teacher"}
                                </h2>
                                <button onClick={() => setOpen(false)}>
                                    <X />
                                </button>
                            </div>

                            <div className="space-y-4">

                                <FloatingInput
                                    label="Full Name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />

                                <FloatingInput
                                    label="Email Address"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                />

                                {!editId && (
                                    <FloatingInput
                                        type="password"
                                        label="Password"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                    />
                                )}

                                <FloatingInput
                                    label="Phone Number"
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({ ...form, phone: e.target.value })
                                    }
                                />

                                <FloatingInput
                                    label="Address"
                                    value={form.address}
                                    onChange={(e) =>
                                        setForm({ ...form, address: e.target.value })
                                    }
                                />

                                <button
                                    disabled={loading}
                                    onClick={saveTeacher}
                                    className="bg-green-600 text-white w-full py-2 rounded font-medium flex items-center justify-center gap-2"
                                >
                                    <Save size={16} />
                                    {editId ? "Update Teacher" : "Add Teacher"}
                                </button>

                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
