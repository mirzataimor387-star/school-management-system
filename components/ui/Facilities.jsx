const facilities = [
  "Qualified Teachers",
  "Science & Computer Labs",
  "Smart Classrooms",
  "Regular Assessments",
  "Safe Environment",
  "Co-Curricular Activities",
];

export default function Facilities() {
  return (
    <section className="bg-blue-50 py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-700 mb-10">
          Our Facilities
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {facilities.map((f, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition"
            >
              {f}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
