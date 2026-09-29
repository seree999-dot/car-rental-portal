interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT b.*, v.plate_number, v.brand, v.model, c.full_name as customer_name, c.phone as customer_phone
       FROM bookings b
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       LEFT JOIN customers c ON b.customer_id = c.id
       ORDER BY b.created_at DESC LIMIT 50`
    ).all();

    return new Response(JSON.stringify({ data: results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const {
      vehicle_id,
      customer,
      pickup_branch_id,
      return_branch_id,
      start_time,
      end_time,
      total_days,
      daily_rate,
      rental_fee,
      insurance_fee,
      deposit_amount,
      total_amount,
    } = body;

    const customerId = `cust-${Date.now()}`;
    const bookingId = `bk-${Date.now()}`;
    const bookingCode = `DE-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // 1. Insert or ignore customer
    await context.env.DB.prepare(
      `INSERT OR IGNORE INTO customers (id, national_id, full_name, email, phone, date_of_birth, driver_license_number, driver_license_expiry)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      customerId,
      customer.national_id,
      customer.full_name,
      customer.email,
      customer.phone,
      customer.date_of_birth || '1995-01-01',
      customer.driver_license_number,
      customer.driver_license_expiry || '2030-12-31'
    ).run();

    // 2. Insert booking (Protected by Trigger against Overbooking!)
    await context.env.DB.prepare(
      `INSERT INTO bookings (
        id, booking_code, customer_id, vehicle_id, pickup_branch_id, return_branch_id,
        start_time, end_time, total_days, daily_rate, rental_fee, insurance_fee,
        deposit_amount, total_amount, status, hold_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)`
    ).bind(
      bookingId,
      bookingCode,
      customerId,
      vehicle_id,
      pickup_branch_id || 'b0000001-0000-0000-0000-000000000001',
      return_branch_id || 'b0000001-0000-0000-0000-000000000001',
      start_time,
      end_time,
      total_days || 1,
      daily_rate || 990,
      rental_fee || 990,
      insurance_fee || 0,
      deposit_amount || 5000,
      total_amount || 5990,
      holdExpiresAt
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: bookingId,
          booking_code: bookingCode,
          status: 'confirmed',
          total_amount,
          hold_expires_at: holdExpiresAt,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        code: error.message.includes('OVERBOOKING') ? 'VEHICLE_TIME_CONFLICT' : 'INTERNAL_ERROR',
        message: error.message,
      }),
      {
        status: error.message.includes('OVERBOOKING') ? 409 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
