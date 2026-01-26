"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Save,
  X,
  UserCheck
} from "lucide-react";

export default function AssignClassTeacherPage() {

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selected, setSelected] = useState({});
  const [editRow, setEditRow] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [apiMessage, setApiMessage] = useState("");

  /* =============================
     LOAD DATA
  ============================= */
  const loadData = async () => {
    try {
      setLoading(true);
      setApiMessage("");

      // teachers
      const tRes = await fetch("/api/principal/teachers", {
        credentials: "same-origin",
      });
      const tData = await tRes.json();

      if (!tData.success) {
        setApiMessage("Failed to load teachers");
        setTeachers([]);
        setClasses([]);
        return;
      }

      setTeachers(tData.teachers || []);

      // classes
      const cRes = await fetch("/api/principal/assign-class-teacher", {
        credentials: "same-origin",
      });

      const cData = await cRes.json();

      if (!cData.success) {
        setApiMessage(cData.message || "Failed to load classes");
        setClasses([]);
        return;
      }

      const sorted = (cData.classes || []).sort((a, b) => {
        const aNum = parseInt(a.className);
        const bNum = parseInt(b.className);
        if (aNum === bNum) return a.section.localeCompare(b.section);
        return aNum - bNum;
      });

      setClasses(sorted);

    } catch (err) {
      setApiMessage("Server not responding");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =============================
     ASSIGN / UPDATE
  ============================= */
  const saveTeacher = async (classId) => {
    if (!selected[classId]) {
      alert("Please select teacher");
      return;
    }

    setLoadingId(classId);

    await fetch("/api/principal/assign-class-teacher", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        teacherId: selected[classId],
      }),
    });

    setEditRow(null);
    setLoadingId(null);
    loadData();
  };

  /* =============================
     REMOVE
  ============================= */
  const removeTeacher = async (classId) => {
    if (!confirm("Remove class teacher?")) return;

    setLoadingId(classId);

    await fetch("/api/principal/assign-class-teacher", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId }),
    });

    setLoadingId(null);
    loadData();
  };

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <UserCheck size={22} />
        Assign / Change Class Teacher
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded-xl overflow-hidden">

          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-left">Section</th>
              <th className="p-3 text-left">Class Teacher</th>
              <th className="p-3 text-left w-[220px]">Actions</th>
            </tr>
          </thead>

          <tbody>

            {/* 🔄 LOADING */}
            {loading && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  Loading classes...
                </td>
              </tr>
            )}

            {/* ❌ API ERROR */}
            {!loading && apiMessage && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-red-600">
                  {apiMessage}
                </td>
              </tr>
            )}

            {/* ✅ DATA */}
            {!loading && !apiMessage &&
              classes.map((cls) => (
                <tr key={cls._id} className="border-t text-sm">

                  <td className="p-3">{cls.className}</td>
                  <td className="p-3">{cls.section}</td>

                  <td className="p-3">
                    {editRow === cls._id ? (
                      <select
                        className="border p-2 w-full rounded"
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
                    ) : cls.classTeacher ? (
                      <span className="font-semibold text-green-700">
                        {cls.classTeacher.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">
                        Not assigned
                      </span>
                    )}
                  </td>

                  <td className="p-3 flex flex-wrap gap-2">
                    {editRow === cls._id ? (
                      <>
                        <button
                          onClick={() => saveTeacher(cls._id)}
                          disabled={loadingId === cls._id}
                          className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                        >
                          <Save size={16} />
                          Save
                        </button>

                        <button
                          onClick={() => setEditRow(null)}
                          className="bg-gray-200 px-3 py-1 rounded flex items-center gap-1 text-sm"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditRow(cls._id);
                            setSelected({
                              ...selected,
                              [cls._id]:
                                cls.classTeacher?._id || "",
                            });
                          }}
                          className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          <Pencil size={16} />
                          Change
                        </button>

                        {cls.classTeacher && (
                          <button
                            onClick={() => removeTeacher(cls._id)}
                            disabled={loadingId === cls._id}
                            className="text-red-600 hover:underline flex items-center gap-1 text-sm"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}

            {/* ⚠️ EMPTY DATA */}
            {!loading && !apiMessage && classes.length === 0 && (
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
