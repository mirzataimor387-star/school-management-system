"use client";

export default function Loader({
    text = "Loading...",
    fullScreen = false,
}) {
    return (
        <div
            className={`flex items-center justify-center gap-3
      ${fullScreen ? "fixed inset-0 bg-white z-50" : ""}`}
        >
            <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>

            <span className="text-sm text-gray-700">
                {text}
            </span>
        </div>
    );
}
