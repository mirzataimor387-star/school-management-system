"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/login");
        }, 2500);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl font-bold text-red-600">
                Access Denied
            </h1>

            <p className="mt-2 text-gray-600">
                You do not have permission to access this page.
            </p>

            <p className="mt-4 text-sm text-gray-500">
                Redirecting to login...
            </p>
        </div>
    );
}
