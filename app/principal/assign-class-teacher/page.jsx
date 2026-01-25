"use client";

import { useEffect, useState } from "react";

export default function AssignClassTeacherPage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selected, setSelected] = useState({});

  const loadData = async () => {
    // -------------------------
    // LOAD TEACHERS
    // -------------------------
    const teachersRes = await fetch("/api/principal/teachers", {
      credentials: "same-origin",
    });
    const teachersData = await teachersRes.json();
    setTeachers(teachersData.teachers || []);

    // -------------------------
    // LOAD CLASSES
    // -------------------------
    const classRes = await fetch("/api/principal/classes", {
      credentials: "same-origin",
    });
    const classData = await classRes.json();

    // ✅ FRONTEND NUMERIC SORT
    const sortedClasses = (classData.classes || []).sort((a, b) => {
      const aNum = parseInt(a.className);
      const bNum = parseInt(b.className);

      if (aNum === bNum) {
        return a.section.localeCompare(b.section);
      }

      return aNum - bNum;
    });

    setClasses(sortedClasses);
  };

  useEffect(() => {
    loadData();
  }, []);

  const assignTeacher = async (classId) => {
    if (!selected[classId]) {
      alert("Please select teacher first");
      return;
    }

    await fetch("/api/principal/assign-class-teacher", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        classId,
        teacherId: selected[classId],
      }),
    });

    // 🔥 refresh list
    await loadData();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">
        Assign Class Teacher
      </h1>

      <table className="w-full bg-white shadow rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Class</th>
            <th className="p-3 text-left">Section</th>
            <th className="p-3 text-left">Teacher</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {classes.map((cls) => (
            <tr key={cls._id} className="border-t">
              <td className="p-3">{cls.className}</td>
              <td className="p-3">{cls.section}</td>

              <td className="p-3">
                {cls.classTeacher ? (
                  <span className="font-semibold text-green-700">
                    {cls.classTeacher.name}
                  </span>
                ) : (
                  <select
                    className="border p-2 w-full bg-white rounded"
                    value={selected[cls._id] || ""}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        [cls._id]: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </td>

              <td className="p-3">
                {cls.classTeacher ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
                    Assigned
                  </span>
                ) : (
                  <button
                    onClick={() => assignTeacher(cls._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Assign
                  </button>
                )}
              </td>
            </tr>
          ))}

          {classes.length === 0 && (
            <tr>
              <td
                colSpan="4"
                className="p-6 text-center text-gray-500"
              >
                No classes found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
