// file: app/api/aivip/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return NextResponse.json({ message: "Lỗi: Chưa có API Key." }, { status: 500 });

  try {
    const body = await request.json();
    const { situation } = body;

    // 1. TỰ ĐỘNG LẤY TOÀN BỘ SẢN PHẨM TỪ DATABASE
    const { rows } = await sql`SELECT * FROM Products;`;
    const productInfo = JSON.stringify(rows);

    // 2. GIAO VIỆC CHO AI VIP
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    
    const prompt = `
      Bạn là người bán hàng thời trang (bán áo nữ) và có nhiệm vụ đóng vai 1 người khách đã mua hàng đưa ra gợi ý mua hàng.
      Tình huống của khách hàng là: "${situation}".
      Danh sách TẤT CẢ sản phẩm cửa hàng đang có (gồm tên và link): ${productInfo}.
      
      Nhiệm vụ của bạn:
      1.TỰ ĐỘNG phân tích tình huống và CHỌN RA 1 sản phẩm phù hợp nhất trong danh sách.
      2. Viết comment cho khách hàng 1 đoạn ngắn 200-250 ký tự, thu hút khách mua chiếc áo này hợp với họ.lưu ý bám sát vào cách dùng từ ngữ của tình huống để đưa ra comment
      3. BẮT BUỘC chèn link của sản phẩm đó vào câu trả lời nhé!
    `;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ message: result.response.text() });

  } catch (error) {
    console.error("Lỗi AI VIP:", error);
    return NextResponse.json({ message: 'Lỗi hệ thống khi gọi AI VIP.' }, { status: 500 });
  }
}