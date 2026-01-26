"use client";

export default function FloatingInput({
    label,
    value,
    onChange,
    type = "text",
}) {
    const hasValue = value && value.length > 0;

    return (
        <div className="relative mt-4">

            {/* INPUT */}
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="
          w-full
          border border-gray-300
          rounded-md
          px-3 pt-4 pb-2
          text-sm
          focus:outline-none
          focus:border-blue-600
        "
            />

            {/* LABEL (fieldset-style) */}
            <label
                className={`
          absolute left-2
          transition-all duration-200
          bg-white px-1
          pointer-events-none

          ${hasValue
                        ? "-top-2 text-xs text-blue-600"
                        : "top-3 text-sm text-gray-400"}
        `}
            >
                {label}
            </label>
        </div>
    );
}
