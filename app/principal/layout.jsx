"use client";

import { useState } from "react";
import PrincipalSidebar from "@/components/principal/Sidebar";
import PrincipalTopbar from "@/components/principal/Topbar";

export default function PrincipalLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">

            <PrincipalSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex flex-col flex-1 overflow-hidden">

                <PrincipalTopbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
                    {children}
                </main>

            </div>
        </div>
    );
}
