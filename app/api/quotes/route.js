export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const res = await fetch(
            "https://zenquotes.io/api/random?ts=" + Date.now(),
            { cache: "no-store" }
        );

        const data = await res.json();

        return Response.json({
            quote: data[0]?.q || "Stay consistent. Results follow.",
            author: data[0]?.a || "Unknown",
        });
    } catch (error) {
        return Response.json({
            quote: "Stay consistent. Results follow.",
            author: "Unknown",
        });
    }
}
