"use client";

import { useEffect, useState } from "react";

export default function Classes({ campusId }) {
    const [classes, setClasses] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    // ================= FETCH CLASSES =================
    useEffect(() => {
        if (!campusId) return;

        const load = async () => {
            setLoading(true);
            const res = await fetch(
                `/api/superadmin/classes?campusId=${campusId}`,
                { credentials: "include" }
            );
            const json = await res.json();
            setClasses(json.classes || []);
            setLoading(false);
        };

        load();
    }, [campusId]);

    // ================= FETCH CLASS DETAIL =================
    const loadClassDetail = async (classId) => {
        // toggle on mobile
        if (classId === selectedId) {
            setSelectedId(null);
            setSelectedClass(null);
            return;
        }

        setSelectedId(classId);
        setDetailLoading(true);

        const res = await fetch(
            `/api/superadmin/classes/${classId}`,
            { credentials: "include" }
        );
        const json = await res.json();
        setSelectedClass(json.class || null);
        setDetailLoading(false);
    };

    if (loading) return <div>Loading classes…</div>;

    return (
        <div className="space-y-4">

            {/* ================= MOBILE VIEW ================= */}
            <div className="sm:hidden bg-white rounded divide-y">
                {classes.map((cls) => (
                    <div key={cls._id}>
                        {/* CLASS ROW */}
                        <button
                            onClick={() => loadClassDetail(cls._id)}
                            className="w-full text-left p-4 flex justify-between items-center"
                        >
                            <div>
                                <div className="font-medium">
                                    {cls.className} 
                                </div>
                                <div className="text-xs text-gray-500">
                                    Session: {cls.session || "N/A"}
                                </div>
                            </div>

                            <span className="text-gray-400">
                                {selectedId === cls._id ? "▲" : "▼"}
                            </span>
                        </button>

                        {/* EXPANDED DETAIL */}
                        {selectedId === cls._id && (
                            <div className="px-4 pb-4">
                                {detailLoading && (
                                    <p className="text-sm text-gray-500">
                                        Loading class details…
                                    </p>
                                )}

                                {selectedClass && (
                                    <ClassDetail selectedClass={selectedClass} />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ================= DESKTOP VIEW ================= */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-4">

                {/* LEFT: LIST */}
                <div className="bg-white rounded p-4">
                    <h2 className="font-semibold mb-3">Classes</h2>

                    <div className="space-y-2">
                        {classes.map((cls) => (
                            <button
                                key={cls._id}
                                onClick={() => loadClassDetail(cls._id)}
                                className={`w-full text-left p-3 rounded border transition
                  ${selectedId === cls._id
                                        ? "bg-blue-50 border-blue-500"
                                        : "hover:bg-slate-50"
                                    }`}
                            >
                                <div className="font-medium">
                                    {cls.className}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Session: {cls.session || "N/A"}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT: DETAIL */}
                <div className="sm:col-span-2 bg-white rounded p-4">
                    {!selectedClass && !detailLoading && (
                        <p className="text-sm text-gray-500">
                            Select a class to view details
                        </p>
                    )}

                    {detailLoading && (
                        <p className="text-sm text-gray-500">
                            Loading class details…
                        </p>
                    )}

                    {selectedClass && (
                        <ClassDetail selectedClass={selectedClass} />
                    )}
                </div>
            </div>

        </div>
    );
}

/* ================= DETAIL COMPONENT ================= */
function ClassDetail({ selectedClass }) {
    return (
        <>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-500">Session</p>
                    <p className="font-medium">
                        {selectedClass.session || "N/A"}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500">Created At</p>
                    <p className="font-medium">
                        {new Date(selectedClass.createdAt).toLocaleDateString()}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500">Total Students</p>
                    <p className="font-medium">
                        {selectedClass.studentsCount || 0}
                    </p>
                </div>
            </div>

            {/* <div className="mt-6">
                <h4 className="font-semibold mb-2">Students</h4>

                {selectedClass.students?.length === 0 && (
                    <p className="text-sm text-gray-500">
                        No students enrolled
                    </p>
                )}

                <ul className="divide-y text-sm">
                    {selectedClass.students?.map((st) => (
                        <li key={st._id} className="py-2">
                            {st.name}
                            <span className="text-xs text-gray-500">
                                {" "}
                                (Roll: {st.rollNo})
                            </span>
                        </li>
                    ))}
                </ul>
            </div> */}
        </>
    );
}
