"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddStudentPage() {
  const router = useRouter();

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    gender: "male",
    dateOfBirth: "",
    admissionNumber: "",
    rollNumber: "",
    bForm: "",
    guardianName: "",
    guardianPhone: "",
    address: "",
  });

  // ✅ load assigned class info (cookie based)
  useEffect(() => {
    fetch("/api/teacher/my-class", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setInfo(data));
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async () => {
    setLoading(true);

    const res = await fetch("/api/teacher/students/add", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);

    setLoading(false);

    if (res.ok) {
      router.push("/teacher/students");
    }
  };

  if (!info) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading class information...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">

      {/* HEADER */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">Add New Student</h1>
        <p className="text-sm text-gray-500">
          Class wise student registration
        </p>
      </div>

      {/* CLASS INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <InfoBox label="Class" value={info.className} />
        <InfoBox label="Session" value={info.session} />
        <InfoBox label="Campus" value={info.campusName || "Assigned Campus"} />
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <Input name="name" placeholder="Student Name" onChange={handleChange} />
        <Input name="fatherName" placeholder="Father Name" onChange={handleChange} />

        <select
          name="gender"
          className="border p-3 rounded"
          onChange={handleChange}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <Input
          type="date"
          name="dateOfBirth"
          onChange={handleChange}
        />

        <Input
          name="admissionNumber"
          placeholder="Admission Number"
          onChange={handleChange}
        />

        <Input
          type="number"
          name="rollNumber"
          placeholder="Roll Number"
          onChange={handleChange}
        />

        <Input
          name="bForm"
          placeholder="B-Form / CNIC"
          onChange={handleChange}
        />

        <Input
          name="guardianName"
          placeholder="Guardian Name"
          onChange={handleChange}
        />

        <Input
          name="guardianPhone"
          placeholder="Guardian Phone"
          onChange={handleChange}
        />

        <Input
          name="address"
          placeholder="Home Address"
          onChange={handleChange}
          className="md:col-span-2"
        />
      </div>

      {/* ACTION */}
      <div className="flex justify-end mt-8 gap-3">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          onClick={submit}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Student"}
        </button>
      </div>
    </div>
  );
}

/* ---------- reusable components ---------- */

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`border p-3 rounded w-full ${className}`}
    />
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-gray-50 border rounded p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}
