import SuperAdminTopbar from "@/components/super_admin/Topbar";
import SuperAdminSidebar from "@/components/super_admin/Sidebar";

export default function SuperAdminLayout({ children }) {
    return (
        <div className="flex min-h-screen">

            {/* Sidebar */}
            <SuperAdminSidebar />

            {/* Main */}
            <div className="flex-1">
                <SuperAdminTopbar />
                <main className="p-6 bg-gray-50 min-h-screen">
                    {children}
                </main>
            </div>

        </div>
    );
}
