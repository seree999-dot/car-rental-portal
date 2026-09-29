interface Env {
  DB: D1Database;
}

// GET: List all active vehicles with optional filtering
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
      features: typeof r.features === 'string' ? JSON.parse(r.features || '[]') : r.features,
    }));

    return new Response(JSON.stringify({ data: formatted, total: formatted.length }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// POST: Admin creates a new vehicle (Insert)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const id = body.id || `veh-${Date.now()}`;
    const plateNumber = body.plateNumber || body.plate_number;
    const brand = body.brand;
    const model = body.model;
    const year = Number(body.year || body.year_manufactured || 2024);
    const category = body.category || 'sedan';
    const transmission = body.transmission || 'auto';
    const seats = Number(body.seats || 5);
    const fuelType = body.fuelType || body.fuel_type || 'gasoline';
    const dailyRate = Number(body.dailyRate || body.daily_rate || 990);
    const status = body.status || 'available';
    const mileage = Number(body.mileage || body.current_mileage || 0);
    const fuelLevel = Number(body.fuelLevel || body.fuel_level || 100);
    const branchId = body.branchId || body.branch_id || 'b0000001-0000-0000-0000-000000000001';
    const imageUrl = body.imageUrl || body.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
    const features = JSON.stringify(body.features || []);

    await context.env.DB.prepare(
      `INSERT INTO vehicles (
        id, plate_number, brand, model, year_manufactured, category, transmission,
        seats, fuel_type, daily_rate, status, current_mileage, fuel_level,
        branch_id, image_url, features, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
    ).bind(
      id, plateNumber, brand, model, year, category, transmission,
      seats, fuelType, dailyRate, status, mileage, fuelLevel,
      branchId, imageUrl, features
    ).run();

    return new Response(JSON.stringify({ success: true, message: "Vehicle created successfully", id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// PUT: Admin updates an existing vehicle (Update)
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const id = body.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing vehicle id" }), { status: 400 });
    }

    const toNull = (v: any) => (v === undefined ? null : v);

    const plateNumber = toNull(body.plateNumber || body.plate_number);
    const brand = toNull(body.brand);
    const model = toNull(body.model);
    const year = body.year !== undefined ? Number(body.year) : (body.year_manufactured !== undefined ? Number(body.year_manufactured) : null);
    const category = toNull(body.category);
    const transmission = toNull(body.transmission);
    const seats = body.seats !== undefined ? Number(body.seats) : null;
    const fuelType = toNull(body.fuelType || body.fuel_type);
    const dailyRate = body.dailyRate !== undefined ? Number(body.dailyRate) : (body.daily_rate !== undefined ? Number(body.daily_rate) : null);
    const status = toNull(body.status);
    const mileage = body.mileage !== undefined ? Number(body.mileage) : (body.current_mileage !== undefined ? Number(body.current_mileage) : null);
    const fuelLevel = body.fuelLevel !== undefined ? Number(body.fuelLevel) : (body.fuel_level !== undefined ? Number(body.fuel_level) : null);
    const branchId = toNull(body.branchId || body.branch_id);
    const imageUrl = toNull(body.imageUrl || body.image_url);
    const features = body.features ? JSON.stringify(body.features) : null;

    await context.env.DB.prepare(
      `UPDATE vehicles SET
        plate_number = COALESCE(?, plate_number),
        brand = COALESCE(?, brand),
        model = COALESCE(?, model),
        year_manufactured = COALESCE(?, year_manufactured),
        category = COALESCE(?, category),
        transmission = COALESCE(?, transmission),
        seats = COALESCE(?, seats),
        fuel_type = COALESCE(?, fuel_type),
        daily_rate = COALESCE(?, daily_rate),
        status = COALESCE(?, status),
        current_mileage = COALESCE(?, current_mileage),
        fuel_level = COALESCE(?, fuel_level),
        branch_id = COALESCE(?, branch_id),
        image_url = COALESCE(?, image_url),
        features = COALESCE(?, features)
      WHERE id = ?`
    ).bind(
      plateNumber, brand, model, year, category, transmission,
      seats, fuelType, dailyRate, status, mileage, fuelLevel,
      branchId, imageUrl, features, id
    ).run();

    return new Response(JSON.stringify({ success: true, message: "Vehicle updated successfully" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// DELETE: Admin removes a vehicle (Delete / Soft Delete)
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id query parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Soft delete: mark is_active = 0
    await context.env.DB.prepare("UPDATE vehicles SET is_active = 0 WHERE id = ?").bind(id).run();

    return new Response(JSON.stringify({ success: true, message: "Vehicle deleted successfully", id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
