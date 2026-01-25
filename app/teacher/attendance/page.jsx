"use client";

import { useState } from "react";

export default function TeacherAttendance() {
    const [date, setDate] = useState("");

    const students = [
        { id: 1, name: "Ali", roll: 1 },
        { id: 2, name: "Ahmed", roll: 2 },
        { id: 3, name: "Sara", roll: 3 },
    ];

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
                Mark Attendance
            </h1>

            <input
                type="date"
                className="border p-2 rounded mb-6"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            <table className="w-full bg-white shadow rounded-xl">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3">Roll</th>
                        <th>Name</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Leave</th>
                    </tr>
                </thead>

                <tbody>
                    {students.map((s) => (
                        <tr key={s.id} className="border-t text-center">
                            <td className="p-3">{s.roll}</td>
                            <td>{s.name}</td>
                            <td><input type="radio" name={`att-${s.id}`} /></td>
                            <td><input type="radio" name={`att-${s.id}`} /></td>
                            <td><input type="radio" name={`att-${s.id}`} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className="mt-6 bg-green-600 text-white px-6 py-2 rounded">
                Save Attendance
            </button>
        </div>
    );
}
