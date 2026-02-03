export function calculateVoucherTotals(voucher, payments = []) {
  const base =
    (voucher.fees?.monthlyFee || 0) +
    (voucher.fees?.paperFee || 0) +
    (voucher.fees?.arrears || 0);

  const late =
    new Date() > new Date(voucher.dueDate)
      ? voucher.fees?.lateFee || 0
      : 0;

  const payable = base + late;

  const received = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const pending = Math.max(payable - received, 0);

  let status = "unpaid";
  if (received >= payable && payable > 0) status = "paid";
  else if (received > 0) status = "partial";

  return {
    payable,
    received,
    pending,
    status,
  };
}
