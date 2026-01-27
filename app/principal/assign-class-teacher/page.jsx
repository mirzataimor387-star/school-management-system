"use client";

import { useEffect, useState } from "react";
import {
  UserCheck,
  Pencil,
  Trash2,
  CheckCircle,
} from "lucide-react";

export default function AssignClassTeacherPage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const tRes = await fetch("/api/principal/teachers", {
        credentials: "include",
      });
      const tData = await tRes.json();

      const cRes = await fetch("/api/principal/class-assignments", {
        credentials: "include",
      });
      const cData = await cRes.json();

      if (!tData.success || !cData.success) {
        setMessage("Failed to load data");
        return;
      }

      setTeachers(tData.teachers || []);
      setClasses(cData.classes || []);

      const map = {};
      cData.classes.forEach((cls) => {
        map[cls._id] = cls.classTeacher?._id || "";
      });
      setSelected(map);

    } catch {
      setMessage("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =====================
     ASSIGN / CHANGE
  ===================== */
  const assignTeacher = async (classId) => {
    await fetch("/api/principal/class-assignments", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        teacherId: selected[classId],
      }),
    });

    setEditRow(null);
    loadData();
  };

  /* =====================
     REMOVE
  ===================== */
  const removeTeacher = async (classId) => {
    if (!confirm("Remove class teacher?")) return;

    await fetch("/api/principal/class-assignments", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId }),
    });

    loadData();
  };

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <UserCheck size={22} />
        Class Teacher Management
      </h1>

      {message && (
        <div className="mb-4 text-red-600 font-medium">
          {message}
        </div>
      )}

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-left">Section</th>
              <th className="p-3 text-left">Teacher</th>
              <th className="p-3 text-left w-48">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              classes.map((cls) => {
                const assigned = cls.classTeacher;

                return (
                  <tr key={cls._id} className="border-t">

                    <td className="p-3">{cls.className}</td>
                    <td className="p-3">{cls.section}</td>

                    {/* ================= TEACHER COLUMN ================= */}
                    <td className="p-3">

                      {/* ASSIGNED (VIEW MODE) */}
                      {assigned && editRow !== cls._id && (
                        <div className="flex items-center gap-2 text-green-700 font-medium">
                          <CheckCircle size={16} />
                          {assigned.name}
                        </div>
                      )}

                      {/* ASSIGN / CHANGE MODE */}
                      {(!assigned || editRow === cls._id) && (
                        <select
                          className="border p-2 rounded w-full"
                          value={selected[cls._id] || ""}
                          onChange={(e) =>
                            setSelected({
                              ...selected,
                              [cls._id]: e.target.value,
                            })
                          }
                        >
                          <option value="">Select teacher</option>
                          {teachers.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* ================= ACTIONS ================= */}
                    <td className="p-3 flex gap-2">

                      {/* ASSIGN */}
                      {!assigned && (
                        <button
                          onClick={() => assignTeacher(cls._id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Assign
                        </button>
                      )}

                      {/* CHANGE */}
                      {assigned && editRow !== cls._id && (
                        <>
                          <button
                            onClick={() => setEditRow(cls._id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                          >
                            <Pencil size={14} />
                            Change
                          </button>

                          <button
                            onClick={() => removeTeacher(cls._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </>
                      )}

                      {/* SAVE AFTER CHANGE */}
                      {editRow === cls._id && (
                        <button
                          onClick={() => assignTeacher(cls._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Update
                        </button>
                      )}

                    </td>
                  </tr>
                );
              })}

            {!loading && classes.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No classes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
