// file: app/api/products/route.ts
export const dynamic = 'force-dynamic';
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  try {
    const { rows } = await sql`SELECT * FROM Products WHERE name ILIKE ${'%' + search + '%'} ORDER BY id DESC;`;
    return NextResponse.json(rows);
  } catch (error) { return NextResponse.json({ error: 'Lỗi' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const { name, link } = await request.json();
    await sql`INSERT INTO Products (name, link, is_visible) VALUES (${name}, ${link}, TRUE)`;
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: 'Lỗi' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const { id, name, link, is_visible } = await request.json();
    // Cập nhật cả tên, link và trạng thái ẩn/hiện
    await sql`UPDATE Products SET name = ${name}, link = ${link}, is_visible = ${is_visible} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: 'Lỗi' }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await sql`DELETE FROM Products WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: 'Lỗi' }, { status: 500 }); }
}