import Link from "next/link";

const menu = [
    { name: "Dashboard", href: "/admin" },
    { name: "Students", href: "/admin/students" },
    { name: "Teachers", href: "/admin/teachers" },
    { name: "Attendance", href: "/admin/attendance" },
    { name: "Fees", href: "/admin/fees" },
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r hidden md:block">
            <div className="p-6 font-bold text-blue-700 text-lg">
                School Admin
            </div>

            <nav className="px-4 space-y-2">
                {menu.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 rounded hover:bg-blue-50"
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
