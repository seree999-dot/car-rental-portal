interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const branchId = url.searchParams.get('branch_id');
  const category = url.searchParams.get('category');

  try {
    let query = "SELECT * FROM vehicles WHERE is_active = 1";
    const params: string[] = [];

    if (branchId) {
      query += " AND branch_id = ?";
      params.push(branchId);
    }
    if (category && category !== 'all') {
      query += " AND category = ?";
      params.push(category);
    }

    query += " ORDER BY daily_rate ASC";

    const stmt = params.length > 0 
      ? context.env.DB.prepare(query).bind(...params)
      : context.env.DB.prepare(query);

    const { results } = await stmt.all();

    // Parse JSON string fields
    const formatted = results.map((r: any) => ({
      ...r,
      features: JSON.parse(r.features || '[]'),
    }));

    return new Response(JSON.stringify({ data: formatted, total: formatted.length }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
