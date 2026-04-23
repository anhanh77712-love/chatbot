// file: app/api/products/route.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Lấy danh sách sản phẩm (có hỗ trợ tìm kiếm)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  try {
    const { rows } = await sql`
      SELECT * FROM Products 
      WHERE name ILIKE ${'%' + search + '%'} 
      ORDER BY id DESC;
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy dữ liệu' }, { status: 500 });
  }
}

// Thêm sản phẩm mới
export async function POST(request: Request) {
  try {
    const { name, link } = await request.json();
    await sql`INSERT INTO Products (name, link) VALUES (${name}, ${link})`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi thêm sản phẩm' }, { status: 500 });
  }
}

// Sửa sản phẩm
export async function PUT(request: Request) {
  try {
    const { id, name, link } = await request.json();
    await sql`UPDATE Products SET name = ${name}, link = ${link} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi sửa sản phẩm' }, { status: 500 });
  }
}

// Xóa sản phẩm
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await sql`DELETE FROM Products WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi xóa sản phẩm' }, { status: 500 });
  }
}