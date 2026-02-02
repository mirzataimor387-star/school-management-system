"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function CampusLayout({ children }) {
    const { campusId } = useParams();
    const pathname = usePathname();


    return (
        <div className="space-y-6">
            {/* 🔥 THIS IS REQUIRED */}
            <div>{children}</div>
        </div>
    );
}
