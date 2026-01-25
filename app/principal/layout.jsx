import PrincipalTopbar from "@/components/principal/Topbar";
import PrincipalSidebar from "@/components/principal/Sidebar";

export default function PrincipalLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            <PrincipalSidebar />

            <div className="flex-1">
                <PrincipalTopbar />
                <main className="p-6 bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}
