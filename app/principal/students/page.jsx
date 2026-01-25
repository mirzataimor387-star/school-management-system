"use client";

import { useEffect, useState } from "react";

export default function StudentsPage() {
    const [classes, setClasses] = useState([]);
    const [form, setForm] = useState({
        name: "",
        rollNumber: "",
        classId: "",
    });

    // ✅ YAHAN use hota hai
    useEffect(() => {
        fetch("/api/admin/classes/list")
            .then((r) => r.json())
            .then((d) => setClasses(d.classes));
    }, []);

    return (
        <div className="max-w-xl">
            <h1 className="text-xl font-bold mb-4">Add Student</h1>

            <form className="bg-white p-5 rounded shadow space-y-3">

                <input
                    placeholder="Student Name"
                    className="border p-2 w-full"
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                />

                <input
                    placeholder="Roll Number"
                    className="border p-2 w-full"
                    onChange={(e) =>
                        setForm({ ...form, rollNumber: e.target.value })
                    }
                />

                {/* ✅ CLASS DROPDOWN */}
                <select
                    className="border p-2 w-full"
                    onChange={(e) =>
                        setForm({ ...form, classId: e.target.value })
                    }
                >
                    <option value="">Select Class</option>

                    {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                            {cls.className} - {cls.section}
                        </option>
                    ))}
                </select>

                <button className="bg-purple-600 text-white px-4 py-2 rounded">
                    Add Student
                </button>
            </form>
        </div>
    );
}
