// file: app/api/init-db/route.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Tạo bảng Products với 3 trường: id, name, link
    await sql`
      CREATE TABLE IF NOT EXISTS Products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        link VARCHAR(255)
      );
    `;

    // 2. Xóa dữ liệu cũ (để làm mới mỗi khi chạy lại file này)
    await sql`TRUNCATE TABLE Products RESTART IDENTITY;`;

    // 3. Thêm sản phẩm mẫu (bạn có thể thay đổi tên và link tùy ý)
    await sql`
      INSERT INTO Products (name, link) 
      VALUES 
      ('Bàn phím cơ Logitech màu hồng cho nữ', 'https://shop.com/ban-phim-hong'),
      ('Gấu bông Capybara khổng lồ', 'https://shop.com/gau-bong-capybara'),
      ('Sách Lập trình Next.js cơ bản', 'https://shop.com/sach-nextjs');
    `;

    return NextResponse.json({ message: 'Tuyệt vời! Đã tạo CSDL thành công với 3 trường: id, name, link.' });
  } catch (error) {
    console.error("Lỗi khởi tạo CSDL:", error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi tạo CSDL' }, { status: 500 });
  }
}