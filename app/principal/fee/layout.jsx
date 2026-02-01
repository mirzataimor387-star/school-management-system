export default function FeeLayout({ children }) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Fee Management
      </h1>

      <div className="mb-6 flex gap-6 border-b pb-3">
        <a
          href="/principal/fee/generate"
          className="font-semibold text-blue-600"
        >
          Generate Fee
        </a>

        <a
          href="/principal/fee/vouchers"
          className="font-semibold text-blue-600"
        >
          Fee Vouchers
        </a>
      </div>

      {children}
    </div>
  );
}
