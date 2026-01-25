"use client";

import { useEffect, useState } from "react";

export default function ClassAssignmentsPage() {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        fetch("/api/principal/class-assignments", {
            credentials: "same-origin",
        })
            .then((r) => r.json())
            .then((d) => setClasses(d.classes || []));
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-6">
                Class Teacher Assignments
            </h1>

            <table className="w-full bg-white shadow rounded-xl">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">Class</th>
                        <th>Section</th>
                        <th>Session</th>
                        <th>Class Teacher</th>
                        <th>Contact</th>
                    </tr>
                </thead>

                <tbody>
                    {classes.map((c) => (
                        <tr key={c._id} className="border-t">
                            <td className="p-3">{c.className}</td>
                            <td>{c.section}</td>
                            <td>{c.session}</td>

                            <td className="font-medium">
                                {c.classTeacher
                                    ? c.classTeacher.name
                                    : "Not Assigned"}
                            </td>

                            <td>
                                {c.classTeacher
                                    ? c.classTeacher.phone || "-"
                                    : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
