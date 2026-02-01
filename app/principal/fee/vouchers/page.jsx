"use client";

import { useEffect, useState } from "react";

export default function VoucherListPage() {
  const [vouchers, setVouchers] = useState([]);
  const [classes, setClasses] = useState([]);

  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [receiveModal, setReceiveModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const [receivedAmount, setReceivedAmount] = useState("");
  const [receivedDate, setReceivedDate] = useState("");

  /* ===============================
     LOAD CLASSES
  =============================== */
  useEffect(() => {
    fetch("/api/principal/classes", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setClasses(data.classes || []);
      });
  }, []);

  /* ===============================
     LOAD VOUCHERS
  =============================== */
  useEffect(() => {
    if (!classId || !month) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          classId,
          month,
          year,
        });

        const res = await fetch(
          `/api/principal/fee/vouchers?${params.toString()}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (!data.success) {
          setError(data.message || "Failed to load vouchers");
          setVouchers([]);
          return;
        }

        setVouchers(data.vouchers || []);
      } catch {
        setError("Server error");
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [classId, month, year]);

  /* ===============================
     RECEIVE FEE
  =============================== */
  const receiveFee = async () => {
    if (!receivedAmount || !receivedDate) return;

    const res = await fetch("/api/principal/fee/receive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voucherId: selectedVoucher._id,
        receivedAmount: Number(receivedAmount),
        receivedDate,
      }),
    });

    const data = await res.json();
    if (!data.success) return;

    setVouchers(prev =>
      prev.map(v => {
        if (v._id !== selectedVoucher._id) return v;
        const total = (v.receivedAmount || 0) + Number(receivedAmount);
        return {
          ...v,
          receivedAmount: total,
          status: total >= v.payableWithinDueDate ? "paid" : "unpaid",
        };
      })
    );

    setReceiveModal(false);
    setReceivedAmount("");
    setReceivedDate("");
  };

  /* ===============================
     SUMMARY
  =============================== */
  const totalFee = vouchers.reduce((a, v) => a + v.payableWithinDueDate, 0);
  const totalReceived = vouchers.reduce((a, v) => a + (v.receivedAmount || 0), 0);
  const totalPending = totalFee - totalReceived;

  return (
    <div className="px-2 sm:px-5 md:px-6 lg:px-8 py-5 max-w-7xl mx-auto space-y-6">


      <h1 className="text-xl md:text-2xl font-bold">
        Fee Vouchers
      </h1>

      {/* ================= FILTERS ================= */}
      <div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <select
          value={classId}
          onChange={e => setClassId(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.className}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border rounded-md px-3 py-2"
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
          className="border rounded-md px-3 py-2"
        >
          {[year - 1, year, year + 1].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* ================= DATA VIEW ================= */}
      {!classId || !month ? (
        <div className="bg-white p-10 text-center rounded-xl shadow text-gray-500">
          Please select class and month
        </div>
      ) : loading ? (
        <div className="text-center py-10">Loading vouchers…</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : (
        <>
          {/* ================= MOBILE VIEW ================= */}
          <div className="md:hidden space-y-4">
            {vouchers.map(v => {
              const received = v.receivedAmount || 0;
              const pending = v.payableWithinDueDate - received;

              return (
                <div key={v._id} className="bg-white rounded-xl shadow p-4 space-y-2">
                  <div className="font-semibold text-lg">
                    {v.studentId?.name}
                  </div>

                  <div className="text-sm text-gray-600">
                    Class: {v.classId?.className}
                  </div>

                  <div className="text-sm">
                    {new Date(0, v.month - 1).toLocaleString("en", { month: "long" })} {v.year}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-semibold">{v.payableWithinDueDate}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Received</p>
                      <p className="font-semibold text-green-700">{received}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Pending</p>
                      <p className="font-semibold text-red-600">{pending}</p>
                    </div>
                  </div>

                  {pending > 0 ? (
                    <button
                      onClick={() => {
                        setSelectedVoucher(v);
                        setReceiveModal(true);
                      }}
                      className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg font-semibold"
                    >
                      Receive Fee
                    </button>
                  ) : (
                    <div className="text-center text-green-600 font-semibold mt-2">
                      Paid
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Student</th>
                  <th>Class</th>
                  <th>Month</th>
                  <th>Total</th>
                  <th>Received</th>
                  <th>Pending</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {vouchers.map(v => {
                  const received = v.receivedAmount || 0;
                  const pending = v.payableWithinDueDate - received;

                  return (
                    <tr key={v._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{v.studentId?.name}</td>
                      <td>{v.classId?.className}</td>
                      <td className="text-center">
                        {new Date(0, v.month - 1).toLocaleString("en", { month: "long" })} {v.year}
                      </td>
                      <td className="text-center font-semibold">{v.payableWithinDueDate}</td>
                      <td className="text-center text-green-700">{received}</td>
                      <td className="text-center text-red-600">{pending}</td>
                      <td className="text-center">
                        {pending === 0 ? (
                          <span className="text-green-600 font-semibold">Paid</span>
                        ) : (
                          <span className="text-orange-600 font-semibold">Pending</span>
                        )}
                      </td>
                      <td className="text-center">
                        {pending > 0 && (
                          <button
                            onClick={() => {
                              setSelectedVoucher(v);
                              setReceiveModal(true);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                          >
                            Receive
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row justify-end gap-4 text-sm font-semibold">
            <div>Total: <span className="text-blue-700">{totalFee}</span></div>
            <div>Received: <span className="text-green-700">{totalReceived}</span></div>
            <div>Pending: <span className="text-red-700">{totalPending}</span></div>
          </div>
        </>
      )}

      {/* ================= RECEIVE MODAL ================= */}
      {receiveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Receive Fee</h2>

            <input
              type="number"
              placeholder="Received Amount"
              value={receivedAmount}
              onChange={e => setReceivedAmount(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <input
              type="date"
              value={receivedDate}
              onChange={e => setReceivedDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReceiveModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={receiveFee}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Receive
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
