"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateFeePage() {
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  const [preview, setPreview] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [alreadyGenerated, setAlreadyGenerated] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    fetch("/api/principal/classes")
      .then(res => res.json())
      .then(data => {
        if (data?.classes) setClasses(data.classes);
      });
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

      /* ===============================
         🔥 ALREADY GENERATED CASE
         =============================== */
      if (data.alreadyGenerated) {
        setAlreadyGenerated(true);
        setPreview([]);
        setShowModal(false);
        setSuccess("Fee already generated. You can download vouchers.");
        return;
      }

      if (!Array.isArray(data.preview) || data.preview.length === 0) {
        setError("No students found");
        return;
      }

      setPreview(data.preview);
      setShowModal(true);

    } catch (err) {
      setError(err.message || "Preview error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE VALUES ================= */
  const updateValue = (index, key, value) => {
    const updated = [...preview];
    updated[index][key] = Number(value);

    updated[index].payable = Math.max(
      0,
      updated[index].baseFee +
      (updated[index].arrears || 0) +   // 🔴 arrears missing thi
      (updated[index].extraFee || 0) -
      (updated[index].discount || 0)
    );

    setPreview(updated);
  };


  /* ================= GENERATE FINAL ================= */
  const generateFinal = async () => {
    if (alreadyGenerated) return;
    if (!confirm("Generate fee vouchers for this month?")) return;

    try {
      setGenerating(true);
      setError("");
      setSuccess("");

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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Generation failed");
      }

      setSuccess("Fee vouchers generated successfully");
      setShowModal(false);
      setAlreadyGenerated(true);

    } catch (err) {
      setError(err.message || "Generation error");
    } finally {
      setGenerating(false);
    }
  };

  /* ================= DOWNLOAD VOUCHERS ================= */
  const downloadVouchers = async () => {
    try {
      setDownloading(true);
      setError("");

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
      setError(err.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">

      <h1 className="text-2xl font-bold">Generate Monthly Fee</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          {success}
        </div>
      )}

      {/* FILTERS */}
      <div className="flex gap-4 flex-wrap items-center">
        <select
          className="border p-2 rounded"
          value={classId}
          onChange={e => setClassId(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>
              {c.className}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={month}
          onChange={e => setMonth(e.target.value)}
        >
          <option value="">Select Month</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
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

        <button
          onClick={loadPreview}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Generate"}
        </button>

        {/* ✅ DOWNLOAD BUTTON (ONLY WHEN ALREADY GENERATED) */}
        {alreadyGenerated && (
          <button
            onClick={downloadVouchers}
            disabled={downloading}
            className={`px-5 py-2 rounded text-white font-semibold
              ${downloading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
          >
            {downloading ? "Preparing PDF..." : "Download Vouchers PDF"}
          </button>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {showModal && !alreadyGenerated && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-5xl rounded p-6 shadow">

            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Students Fee Preview</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-red-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="border p-2">Roll</th>
                    <th className="border p-2">Student</th>
                    <th className="border p-2">Base</th>
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
                      <td className="border p-2">
                        <input
                          type="number"
                          value={s.discount}
                          className="border p-1 w-20"
                          onChange={e => updateValue(i, "discount", e.target.value)}
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          value={s.extraFee}
                          className="border p-1 w-20"
                          onChange={e => updateValue(i, "extraFee", e.target.value)}
                        />
                      </td>
                      <td className="border p-2 font-semibold">{s.payable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                disabled={generating}
                onClick={generateFinal}
                className={`px-6 py-2 rounded text-white font-semibold
                  ${generating ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
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
