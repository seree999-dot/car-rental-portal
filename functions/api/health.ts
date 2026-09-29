interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const start = Date.now();
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT count(*) as total_vehicles FROM vehicles"
    ).all();

    const latency = Date.now() - start;

    return new Response(
      JSON.stringify({
        status: "HEALTHY",
        database: "Cloudflare D1 (Serverless SQLite)",
        region: "APAC",
        connected: true,
        latency_ms: latency,
        stats: results[0],
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: "UNHEALTHY",
        error: error.message,
        connected: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
