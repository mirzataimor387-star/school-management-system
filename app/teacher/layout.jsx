"use client";

import { useState } from "react";
import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";

export default function TeacherLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <TeacherSidebar open={open} setOpen={setOpen} />

      {/* Main */}
      <div className="flex-1 flex flex-col">

        <TeacherTopbar setOpen={setOpen} />

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
