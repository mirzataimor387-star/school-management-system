"use client";

import { useEffect, useState } from "react";

export default function GenerateFeePage() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  const [preview, setPreview] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [alreadyGenerated, setAlreadyGenerated] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    fetch("/api/principal/classes")
      .then(res => res.json())
      .then(data => setClasses(data.classes || []));
  }, []);

  /* ================= LOAD PREVIEW ================= */
  const loadPreview = async () => {
    setError("");
    setSuccess("");
    setAlreadyGenerated(false);

    if (!classId || !month || !year) {
      setError("Class, month and year are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/principal/fee/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          month: Number(month),
          year: Number(year),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Preview failed");
      }

      /* ---- ALREADY GENERATED ---- */
      if (data.alreadyGenerated) {
        setAlreadyGenerated(true);
        setSuccess("Fee already generated. You can download vouchers.");
        return;
      }

      setPreview(data.preview);
      setShowModal(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE PREVIEW ================= */
  const updateValue = (index, key, value) => {
    const updated = [...preview];
    updated[index][key] = Number(value);

    updated[index].payable =
      (updated[index].baseFee || 0) +
      (updated[index].arrears || 0) +
      (updated[index].extraFee || 0) -
      (updated[index].discount || 0);

    setPreview(updated);
  };

  /* ================= GENERATE FINAL ================= */
  const generateFinal = async () => {
    if (!confirm("Generate vouchers for this month?")) return;

    try {
      setGenerating(true);

      const res = await fetch("/api/principal/fee/generate-final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          month: Number(month),
          year: Number(year),
          students: preview.map(s => ({
            studentId: s.studentId,
            discount: s.discount,
            extraFee: s.extraFee,
          })),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess("Fee vouchers generated successfully");
      setShowModal(false);
      setAlreadyGenerated(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  /* ================= FAST PDF DOWNLOAD ================= */

  const downloadVouchers = async () => {
    try {
      const res = await fetch(
        `/api/principal/fee/vouchers-pdf?classId=${classId}&month=${month}&year=${year}`
      );

      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `fee-vouchers-${month}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      alert(err.message);
    }
  };


  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">

      <h1 className="text-2xl font-bold">Monthly Fee Vouchers</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded">{success}</div>}

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap items-center">
        <select className="border p-2 rounded" onChange={e => setClassId(e.target.value)}>
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.className}</option>
          ))}
        </select>

        <select className="border p-2 rounded" onChange={e => setMonth(e.target.value)}>
          <option value="">Select Month</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString("en", { month: "long" })}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="border p-2 rounded w-28"
          value={year}
          onChange={e => setYear(e.target.value)}
        />

        {/* GENERATE */}
        {!alreadyGenerated && (
          <button
            onClick={loadPreview}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            {loading ? "Loading..." : "Preview & Generate"}
          </button>
        )}

        {/* DOWNLOAD */}
        {alreadyGenerated && classId && month && year && (
          <button
            onClick={downloadVouchers}
            className="bg-purple-600 text-white px-5 py-2 rounded"
          >
            Download PDF
          </button>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-5xl rounded p-6">

            <h2 className="text-xl font-bold mb-4">Fee Preview</h2>

            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Roll</th>
                  <th className="border p-2">Student</th>
                  <th className="border p-2">Base</th>
                  <th className="border p-2">Arrears</th>
                  <th className="border p-2">Discount</th>
                  <th className="border p-2">Extra</th>
                  <th className="border p-2">Payable</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((s, i) => (
                  <tr key={s.studentId}>
                    <td className="border p-2">{s.rollNumber}</td>
                    <td className="border p-2">{s.name}</td>
                    <td className="border p-2">{s.baseFee}</td>
                    <td className="border p-2 text-red-600">
                      {s.arrears}
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        className="border p-1 w-20"
                        value={s.discount}
                        onChange={e => updateValue(i, "discount", e.target.value)}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        className="border p-1 w-20"
                        value={s.extraFee}
                        onChange={e => updateValue(i, "extraFee", e.target.value)}
                      />
                    </td>
                    <td className="border p-2 font-semibold">{s.payable}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="border px-5 py-2 rounded">
                Cancel
              </button>
              <button
                onClick={generateFinal}
                disabled={generating}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                {generating ? "Generating..." : "Confirm & Generate"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
