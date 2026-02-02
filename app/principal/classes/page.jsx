"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

export default function ClassesPage() {

    const [classes, setClasses] = useState([]);
    const [open, setOpen] = useState(false);

    // ✅ NEW
    const [loading, setLoading] = useState(true);
    const [apiMessage, setApiMessage] = useState("");

    const [form, setForm] = useState({
        className: "",
        section: "",
        session: "",
    });

    /* =========================
       LOAD CLASSES
    ======================== */
    const loadClasses = async () => {
        try {
            setLoading(true);
            setApiMessage("");

            const res = await fetch("/api/principal/classes", {
                credentials: "same-origin",
            });

            const data = await res.json();

            if (!data.success) {
                setApiMessage(data.message || "Failed to load classes");
                setClasses([]);
                return;
            }

            setClasses(data.classes || []);

        } catch (err) {
            setApiMessage("Server not responding");
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClasses();
    }, []);

    // ESC close
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    /* =========================
       CREATE CLASS
    ======================== */
    const createClass = async () => {
        try {
            const res = await fetch("/api/principal/classes", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!data.success) {
                setApiMessage(data.message || "Failed to create class");
                return;
            }

            // ✅ SUCCESS
            setForm({
                className: "",
                section: "",
                session: "",
            });

            setOpen(false);
            loadClasses();

        } catch (err) {
            setApiMessage("Server not responding");
        }
    };


    return (
        <>
            {/* ================= PAGE ================= */}
            <div className="p-6 space-y-6">

                <table className="w-full bg-white shadow rounded-xl overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Class</th>
                            <th>Section</th>
                            <th>Session</th>
                        </tr>
                    </thead>

                    <tbody>

                        {/* 🔄 LOADING */}
                        {loading && (
                            <tr>
                                <td colSpan="3" className="p-6 text-center text-gray-500">
                                    Loading classes...
                                </td>
                            </tr>
                        )}

                        {/* ❌ API ERROR */}
                        {!loading && apiMessage && (
                            <tr>
                                <td colSpan="3" className="p-6 text-center text-red-600">
                                    {apiMessage}
                                </td>
                            </tr>
                        )}

                        {/* ✅ DATA */}
                        {!loading && !apiMessage &&
                            classes.map((c) => (
                                <tr key={c._id} className="border-t">
                                    <td className="p-3">{c.className}</td>
                                    <td>{c.section}</td>
                                    <td>{c.session}</td>
                                </tr>
                            ))}

                        {/* ⚠️ EMPTY */}
                        {!loading && !apiMessage && classes.length === 0 && (
                            <tr>
                                <td colSpan="3" className="p-6 text-center text-gray-500">
                                    No classes found
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>

                {/* PLUS BUTTON */}
                <button
                    onClick={() => setOpen(true)}
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
                                    Create Class
                                </h2>

                                <button onClick={() => setOpen(false)}>
                                    <X />
                                </button>
                            </div>

                            <div className="space-y-3">

                                <input
                                    className="border p-2 w-full rounded"
                                    placeholder="Class (8th, 9th)"
                                    value={form.className}
                                    onChange={(e) =>
                                        setForm({ ...form, className: e.target.value })
                                    }
                                />

                                <input
                                    className="border p-2 w-full rounded"
                                    placeholder="Section (A, B)"
                                    value={form.section}
                                    onChange={(e) =>
                                        setForm({ ...form, section: e.target.value })
                                    }
                                />

                                <input
                                    className="border p-2 w-full rounded"
                                    placeholder="Session (2024–2025)"
                                    value={form.session}
                                    onChange={(e) =>
                                        setForm({ ...form, session: e.target.value })
                                    }
                                />

                                <button
                                    onClick={createClass}
                                    className="bg-green-600 text-white w-full py-2 rounded font-medium"
                                >
                                    Create Class
                                </button>

                            </div>
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
        .animate-modal {
          animation: zoomIn 0.25s ease-out;
        }

        @keyframes zoomIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
        </>
    );
}
