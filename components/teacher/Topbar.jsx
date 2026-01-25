"use client";

import { Bell, User } from "lucide-react";

export default function TeacherTopbar() {
  return (
    <div className="h-14 bg-white border-b px-6 flex items-center justify-between">

      {/* Left */}
      <h2 className="font-semibold text-gray-800">
        Teacher Panel
      </h2>

      {/* Right */}
      <div className="flex items-center gap-5">

        {/* Notifications */}
        <button className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <User className="w-6 h-6 text-gray-700" />
          <span className="text-sm font-medium">
            Teacher
          </span>
        </div>

      </div>
    </div>
  );
}
