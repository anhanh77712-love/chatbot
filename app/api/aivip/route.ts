// file: app/api/aivip/route.ts
export const dynamic = 'force-dynamic'; // Dòng lệnh "chống kẹt" cực kỳ quan trọng trên Vercel!

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
        const { rows } = await sql`SELECT * FROM Products WHERE is_visible = TRUE;`;
        const productInfo = JSON.stringify(rows);

        // 2. GIAO VIỆC CHO AI VIP
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Bạn là một nữ nhân viên bán hàng thời trang (bán áo nữ) bạn hãy đưa ra gợi ý để gắn link sản phẩm bằng từ ngữ các nói theo trend , theo kiểu phong cách bài viết.
      Tình huống của khách hàng là: "${situation}".
      Danh sách TẤT CẢ sản phẩm cửa hàng đang có (gồm tên và link): ${productInfo}.
      
      Nhiệm vụ của bạn:
      1.TỰ ĐỘNG phân tích tình huống và CHỌN RA 1 sản phẩm phù hợp nhất trong danh sách.
    2.hãy cho tôi 1 comment ngắn gọn(viết không xuống dòng) để thu hút họ với sản phẩm, và BẮT BUỘC chèn link sản phẩm vào câu trả lời nhé!`;


        const result = await model.generateContent(prompt);
        return NextResponse.json({ message: result.response.text() });

    } catch (error: any) {
    console.error("Lỗi AI VIP:", error);
    // Trả thẳng lỗi của Google về màn hình web
    return NextResponse.json({ message: `Lỗi từ Google: ${error.message || 'Không rõ nguyên nhân'}` }, { status: 500 });
  }
}