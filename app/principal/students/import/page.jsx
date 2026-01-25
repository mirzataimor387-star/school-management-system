"use client";

import { useEffect, useState } from "react";

export default function ImportStudents() {
    const [classes, setClasses] = useState([]);
    const [file, setFile] = useState(null);
    const [classId, setClassId] = useState("");

    useEffect(() => {
        fetch("/api/admin/classes/list")
            .then((r) => r.json())
            .then((d) => setClasses(d.classes));
    }, []);

    async function submit(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("classId", classId);

        const res = await fetch("/api/admin/students/import", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        alert(
            `Inserted: ${data.inserted}\nSkipped: ${data.skipped}`
        );
    }

    return (
        <div className="max-w-xl">
            <h1 className="text-xl font-bold mb-4">
                Import Students (Excel)
            </h1>

            <form
                onSubmit={submit}
                className="bg-white p-5 rounded shadow space-y-4"
            >
                <select
                    className="border p-2 w-full"
                    onChange={(e) => setClassId(e.target.value)}
                >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.className} - {c.section}
                        </option>
                    ))}
                </select>

                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <button className="bg-green-600 text-white px-4 py-2 rounded">
                    Import Students
                </button>
            </form>
        </div>
    );
}
