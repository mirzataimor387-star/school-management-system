"use client";

import { useEffect, useState } from "react";

/*
=====================================================
VOUCHER LIST – FINAL (FULLY WORKING)

✔ Class / Month / Year filters
✔ Class summary (total / received / pending)
✔ Previous months pending (separate)
✔ Current month vouchers list
✔ FIFO receive supported
✔ Proper reload after payment
=====================================================
*/

const statusStyle = {
  paid: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  unpaid: "bg-red-100 text-red-700",
};

export default function VoucherListPage() {
  /* ================= STATE ================= */
  const [vouchers, setVouchers] = useState([]);
  const [pendingPrev, setPendingPrev] = useState([]);
  const [classes, setClasses] = useState([]);

  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ===== RECEIVE MODAL ===== */
  const [showModal, setShowModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [receivedAt, setReceivedAt] = useState("");

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    fetch("/api/principal/classes")
      .then(res => res.json())
      .then(data => {
        if (data.success) setClasses(data.classes || []);
      });
  }, []);

  /* ================= RELOAD ALL ================= */
  const reloadAll = async () => {
    if (!classId || !month || !year) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ classId, month, year });

      const [vRes, pRes] = await Promise.all([
        fetch(`/api/principal/fee/vouchers?${params}`),
        fetch(
          `/api/principal/fee/pending-last-month?classId=${classId}&month=${month}&year=${year}`
        ),
      ]);

      const vData = await vRes.json();
      const pData = await pRes.json();

      if (!vData.success) throw new Error();

      setVouchers(vData.vouchers || []);
      setPendingPrev(pData.pending || []);
    } catch {
      setError("Failed to load fee data");
    }

    setLoading(false);
  };

  useEffect(() => {
    reloadAll();
  }, [classId, month, year]);

  /* ================= RECEIVE ================= */
  const receiveFee = async () => {
    const res = await fetch("/api/principal/fee/receive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voucherId: selectedVoucher.voucherId || selectedVoucher._id,
        amount: Number(amount),
        method,
        receivedAt,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Receive failed");
      return;
    }

    setShowModal(false);
    setSelectedVoucher(null);
    setAmount("");
    setReceivedAt("");

    await reloadAll();
  };

  /* ================= CLASS SUMMARY ================= */
  const classTotalFee = vouchers.reduce(
    (sum, v) => sum + (v.totalPayable || 0),
    0
  );
  const classTotalReceived = vouchers.reduce(
    (sum, v) => sum + (v.received || 0),
    0
  );
  const classTotalPending = vouchers.reduce(
    (sum, v) => sum + (v.pending || 0),
    0
  );

  /* ================= RENDER ================= */
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Fee Collection</h1>
        <p className="text-sm text-gray-500">
          Class-wise fee management
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow grid sm:grid-cols-3 gap-3">
        <select value={classId} onChange={e => setClassId(e.target.value)}>
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.className}</option>
          ))}
        </select>

        <select value={month} onChange={e => setMonth(e.target.value)}>
          <option value="">Select Month</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("en", { month: "long" })}
            </option>
          ))}
        </select>

        <select value={year} onChange={e => setYear(e.target.value)}>
          {[year - 1, year, year + 1].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>



      {/* PREVIOUS MONTHS PENDING */}
      {pendingPrev.length > 0 && (
        <div className="bg-orange-50 p-4 rounded-xl border">
          <h2 className="font-semibold mb-2">Previous Months Pending</h2>
          <table className="w-full text-sm">
            <tbody>
              {pendingPrev.map(p => (
                <tr key={p.voucherId}>
                  <td>{p.studentName}</td>
                  <td>{p.month}/{p.year}</td>
                  <td className="text-red-600">{p.pending}</td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedVoucher(p);
                        setAmount(p.pending);
                        setReceivedAt(new Date().toISOString().split("T")[0]);
                        setShowModal(true);
                      }}
                      className="bg-orange-600 text-white px-3 py-1 rounded"
                    >
                      Receive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CURRENT MONTH VOUCHERS */}
      {loading ? (
        <p className="text-center">Loading…</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : vouchers.length === 0 ? (
        <p className="text-center text-gray-500">No vouchers found</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th>Total</th>
                <th>Received</th>
                <th>Pending</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v._id} className="border-t">
                  <td className="p-3">{v.studentId?.name}</td>
                  <td className="text-center">{v.totalPayable}</td>
                  <td className="text-center">{v.received}</td>
                  <td className="text-center text-red-600">{v.pending}</td>
                  <td className="text-center">
                    <span className={`px-3 py-1 rounded-full text-xs ${statusStyle[v.status]}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="text-center">
                    {v.pending > 0 && (
                      <button
                        onClick={() => {
                          setSelectedVoucher(v);
                          setAmount(v.pending);
                          setReceivedAt(new Date().toISOString().split("T")[0]);
                          setShowModal(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Receive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* CLASS SUMMARY */}
      {vouchers.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm">Total Fee</p>
            <p className="text-2xl font-bold">{classTotalFee}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-sm">Received</p>
            <p className="text-2xl font-bold">{classTotalReceived}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl">
            <p className="text-sm">Pending</p>
            <p className="text-2xl font-bold">{classTotalPending}</p>
          </div>
        </div>
      )}

      {/* RECEIVE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h2 className="font-bold text-lg">Receive Payment</h2>

            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <select value={method} onChange={e => setMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="online">Online</option>
            </select>

            <input
              type="date"
              value={receivedAt}
              onChange={e => setReceivedAt(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                onClick={receiveFee}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
