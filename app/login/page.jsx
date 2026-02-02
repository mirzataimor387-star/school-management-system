"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      let data = {};

      try {
        data = await res.json();
      } catch {
        setError("Invalid server response");
        setLoading(false);
        return;
      }

      // ❌ API-level error
      if (!res.ok) {
        const errorCode = data.error || "UNKNOWN_ERROR";
        const errorMsg = data.message || "Login failed";

        setError(`${errorCode} : ${errorMsg}`);
        setLoading(false);
        return;
      }

      // ✅ SUCCESS — role routing
      switch (data.role) {
        case "superadmin":
          router.replace("/superadmin");
          break;

        case "principal":
          router.replace("/principal");
          break;

        case "teacher":
          router.replace("/teacher");
          break;

        default:
          setError(
            `INVALID_ROLE : '${data.role}' not allowed`
          );
      }

    } catch (err) {
      setError("NETWORK_ERROR : Server not reachable");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          School Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          className="border p-3 w-full mb-4 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="border p-3 w-full mb-6 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className={`w-full py-3 rounded text-white transition
            ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
        >
          {loading ? (
            <Loader text="Signing in..." />
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
