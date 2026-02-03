"use client";

import { useEffect, useState } from "react";

const statusStyle = {
  paid: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  unpaid: "bg-red-100 text-red-700",
};

export default function VoucherListPage() {
  const [vouchers, setVouchers] = useState([]);
  const [classes, setClasses] = useState([]);

  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // receive modal
  const [showModal, setShowModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [receivedAt, setReceivedAt] = useState("");

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    fetch("/api/principal/classes")
      .then(res => res.json())
      .then(data => data.success && setClasses(data.classes || []));
  }, []);

  /* ================= LOAD VOUCHERS ================= */
  useEffect(() => {
    if (!classId || !month) return;

    const load = async () => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({ classId, month, year });
      const res = await fetch(`/api/principal/fee/vouchers?${params}`);
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to load vouchers");
        setLoading(false);
        return;
      }

      setVouchers(data.vouchers || []);
      setLoading(false);
    };

    load();
  }, [classId, month, year]);

  /* ================= RECEIVE ================= */
  const receiveFee = async () => {
    const res = await fetch("/api/principal/fee/receive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voucherId: selectedVoucher._id,
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
    setAmount("");
    setReceivedAt("");

    const params = new URLSearchParams({ classId, month, year });
    const refresh = await fetch(`/api/principal/fee/vouchers?${params}`);
    const refreshed = await refresh.json();
    setVouchers(refreshed.vouchers || []);
  };

  /* ================= SUMMARY ================= */
  const totalFee = vouchers.reduce((a, v) => a + v.totalPayable, 0);
  const totalReceived = vouchers.reduce((a, v) => a + v.received, 0);
  const totalPending = vouchers.reduce((a, v) => a + v.pending, 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Fee Vouchers</h1>
        <p className="text-sm text-gray-500">
          Monthly fee collection & tracking
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={classId}
          onChange={e => setClassId(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.className}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select Month</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("en", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {[year - 1, year, year + 1].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>



      {/* STATES */}
      {loading ? (
        <div className="text-center">Loading…</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : vouchers.length === 0 ? (
        <div className="text-center text-gray-500">No vouchers found</div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
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
                  <tr key={v._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      {v.studentId?.name}
                    </td>
                    <td className="text-center">{v.totalPayable}</td>
                    <td className="text-center text-green-700">{v.received}</td>
                    <td className="text-center text-red-600">{v.pending}</td>
                    <td className="text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[v.status]}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="text-center">
                      {v.status !== "paid" && (
                        <button
                          onClick={() => {
                            setSelectedVoucher(v);
                            setShowModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
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

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-3">
            {vouchers.map(v => (
              <div key={v._id} className="bg-white rounded-xl shadow p-4 space-y-1">
                <div className="font-semibold">{v.studentId?.name}</div>
                <div className="text-sm">Total: {v.totalPayable}</div>
                <div className="text-sm text-green-700">Received: {v.received}</div>
                <div className="text-sm text-red-600">Pending: {v.pending}</div>

                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[v.status]}`}>
                  {v.status}
                </span>

                {v.status !== "paid" && (
                  <button
                    onClick={() => {
                      setSelectedVoucher(v);
                      setShowModal(true);
                    }}
                    className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg"
                  >
                    Receive Fee
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}


      {/* SUMMARY */}
      {vouchers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-semibold">
          <div className="bg-white rounded-xl shadow p-4">
            Total<br /><span className="text-blue-700">{totalFee}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            Received<br /><span className="text-green-700">{totalReceived}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            Pending<br /><span className="text-red-600">{totalPending}</span>
          </div>
        </div>
      )}

      {/* RECEIVE MODAL */}
      {showModal && selectedVoucher && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">

            <h2 className="text-lg font-bold">Receive Fee</h2>

            <p className="text-sm text-gray-600">
              Student: <strong>{selectedVoucher.studentId?.name}</strong>
            </p>

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />

            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="online">Online</option>
            </select>

            <input
              type="date"
              value={receivedAt}
              onChange={e => setReceivedAt(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="border px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={receiveFee}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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
