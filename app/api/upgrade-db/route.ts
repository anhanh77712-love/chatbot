// file: app/api/upgrade-db/route.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Thêm cột is_visible vào bảng Products, mặc định là TRUE (Hiện)
    await sql`ALTER TABLE Products ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;`;
    return NextResponse.json({ message: '✨ Nâng cấp Database thêm cột Ẩn/Hiện thành công!' });
  } catch (error: any) {
    return NextResponse.json({ message: 'CSDL đã được nâng cấp hoặc có lỗi: ' + error.message });
  }
}